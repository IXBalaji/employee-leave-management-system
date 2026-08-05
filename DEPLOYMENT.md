# Manual Deployment Guide — Azure

Step-by-step guide to deploy ELMS to Azure by hand (Azure Database for PostgreSQL you already have, a new App Service for the backend, and a new Static Web App for the frontend). Do this once manually to validate everything; after that, `.gitlab-ci.yml` automates the same steps on every push to your default branch.

Run all commands from the repo root unless a step says otherwise. Replace anything in `<angle brackets>`.

---

## 0. Prerequisites

- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) installed
- Logged in: `az login`
- Your subscription selected: `az account set --subscription "<subscription-name-or-id>"`
- A resource group to deploy into (create one if you don't have one):
  ```bash
  az group create --name elms-rg --location eastus
  ```
- `zip` available on your machine (Windows: use Git Bash, WSL, or 7-Zip; the commands below assume a `zip`-capable shell)

Pick names now — you'll reuse them throughout:

| Placeholder | Example | Notes |
|---|---|---|
| `<RESOURCE_GROUP>` | `elms-rg` | |
| `<WEBAPP_NAME>` | `elms-api` | Must be globally unique across Azure — this becomes `https://<WEBAPP_NAME>.azurewebsites.net` |
| `<APP_SERVICE_PLAN>` | `elms-plan` | |
| `<SWA_NAME>` | `elms-frontend` | Must be globally unique |
| `<LOCATION>` | `eastus` | Pick a region close to your users |

---

## 1. Database (already provisioned)

You already have an Azure Database for PostgreSQL server. You just need:

1. **The connection string.** Format:
   ```
   postgresql://<user>:<password>@<server-name>.postgres.database.azure.com:5432/<db-name>?sslmode=require
   ```
   Note the `?sslmode=require` — Azure Postgres requires TLS; without this Prisma will fail to connect.

2. **A database created for this app** (if you haven't already):
   ```bash
   az postgres flexible-server db create \
     --resource-group <RESOURCE_GROUP> \
     --server-name <your-postgres-server-name> \
     --database-name elms_prod
   ```

3. **Firewall access** so you (and later, App Service) can reach it:
   ```bash
   # Allow your current machine's IP (for running the migration from here)
   az postgres flexible-server firewall-rule create \
     --resource-group <RESOURCE_GROUP> \
     --name <your-postgres-server-name> \
     --rule-name allow-my-ip \
     --start-ip-address <your-public-ip> \
     --end-ip-address <your-public-ip>

   # Allow Azure services (needed so the Web App backend can reach it)
   az postgres flexible-server firewall-rule create \
     --resource-group <RESOURCE_GROUP> \
     --name <your-postgres-server-name> \
     --rule-name allow-azure-services \
     --start-ip-address 0.0.0.0 \
     --end-ip-address 0.0.0.0
   ```
   (Find your public IP with `curl ifconfig.me` if you don't know it.)

4. **Run migrations against it, from your machine**, using the real connection string:
   ```bash
   cd backend
   DATABASE_URL="<connection-string-from-step-1>" npx prisma migrate deploy
   ```
   On Windows PowerShell:
   ```powershell
   $env:DATABASE_URL="<connection-string-from-step-1>"; npx prisma migrate deploy
   ```

5. **(Optional) seed it** the same way, if you want the sample Admin/Manager/Employee accounts in production too:
   ```bash
   DATABASE_URL="<connection-string>" npm run prisma:seed
   ```
   Skip this for a real production database — seed data includes throwaway accounts with a shared password (`Passw0rd!`). Only run it against a database you're comfortable resetting.

---

## 2. Backend → Azure App Service

### 2.1 Create the App Service (Linux, Node 20)

```bash
az appservice plan create \
  --name <APP_SERVICE_PLAN> \
  --resource-group <RESOURCE_GROUP> \
  --location <LOCATION> \
  --is-linux \
  --sku B1

az webapp create \
  --resource-group <RESOURCE_GROUP> \
  --plan <APP_SERVICE_PLAN> \
  --name <WEBAPP_NAME> \
  --runtime "NODE:20-lts"
```

`B1` is the cheapest non-free tier that supports always-on; use `F1` (free) if you just want to smoke-test, but expect cold starts and no custom domain/SSL on the free tier.

### 2.2 Configure app settings

```bash
az webapp config appsettings set \
  --resource-group <RESOURCE_GROUP> \
  --name <WEBAPP_NAME> \
  --settings \
    DATABASE_URL="<connection-string-from-step-1>" \
    JWT_SECRET="<generate-a-long-random-string>" \
    PORT=8080 \
    SCM_DO_BUILD_DURING_DEPLOYMENT=false \
    WEBSITE_NODE_DEFAULT_VERSION=~20

az webapp config set \
  --resource-group <RESOURCE_GROUP> \
  --name <WEBAPP_NAME> \
  --startup-file "node dist/index.js"
```

Generate a JWT secret if you don't have one handy:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`SCM_DO_BUILD_DURING_DEPLOYMENT=false` matters: we're deploying a pre-built package (below) with `node_modules` already installed and the Prisma client already generated for Azure's OS, so we don't want Azure's Oryx build to run its own `npm install` on top of it.

### 2.3 Build and package the backend, from your machine

```bash
cd backend
npm ci
npx prisma generate
npm run build
zip -r ../backend-artifact.zip package.json package-lock.json dist prisma node_modules
cd ..
```

**Important**: the Prisma query engine binary must match Azure's OS (Debian-based), not whatever OS you're building on. If you're on Windows or Mac, the `binaryTargets` already set in `backend/prisma/schema.prisma` (`native`, `debian-openssl-1.1.x`, `debian-openssl-3.0.x`) mean `prisma generate` produces engines for all three, so this works regardless of your local OS — just don't remove those targets.

### 2.4 Deploy the zip

```bash
az webapp deploy \
  --resource-group <RESOURCE_GROUP> \
  --name <WEBAPP_NAME> \
  --src-path backend-artifact.zip \
  --type zip
```

### 2.5 Verify

```bash
curl https://<WEBAPP_NAME>.azurewebsites.net/api/health
# expect: {"ok":true}
```

If it doesn't respond, check logs:
```bash
az webapp log tail --resource-group <RESOURCE_GROUP> --name <WEBAPP_NAME>
```

---

## 3. Frontend → Azure Static Web App

### 3.1 Create the Static Web App

```bash
az staticwebapp create \
  --resource-group <RESOURCE_GROUP> \
  --name <SWA_NAME> \
  --location <LOCATION> \
  --sku Free
```

### 3.2 Get its deployment token

```bash
az staticwebapp secrets list \
  --resource-group <RESOURCE_GROUP> \
  --name <SWA_NAME> \
  --query "properties.apiKey" -o tsv
```
Save this — you'll pass it to the deploy command below (and it's the same value the GitLab pipeline's `AZURE_STATIC_WEB_APPS_API_TOKEN` variable expects).

### 3.3 Build the frontend against your live backend

```bash
cd frontend
npm ci
VITE_API_URL="https://<WEBAPP_NAME>.azurewebsites.net/api" npm run build
cd ..
```
On Windows PowerShell:
```powershell
cd frontend
npm ci
$env:VITE_API_URL="https://<WEBAPP_NAME>.azurewebsites.net/api"; npm run build
cd ..
```
This is the step people most often get wrong: `VITE_API_URL` is baked into the JS bundle at build time, not read at runtime. If you rebuild without it set, the frontend will silently fall back to `http://localhost:4000/api` and nothing will work in production.

### 3.4 Deploy

```bash
npm install -g @azure/static-web-apps-cli
swa deploy ./frontend/dist --deployment-token "<token-from-3.2>" --env production
```

### 3.5 Verify

Open `https://<SWA_NAME>.azurestaticwebapps.net` in a browser and sign in with one of the seeded accounts (if you seeded), or an account you created via the API.

---

## 4. Post-deploy checklist

- [ ] `https://<WEBAPP_NAME>.azurewebsites.net/api/health` returns `{"ok":true}`
- [ ] Frontend loads and login succeeds
- [ ] Creating/editing an employee works (exercises the DB write path end-to-end)
- [ ] Applying for leave and approving it works (exercises the transaction that updates leave balances)
- [ ] Backend CORS currently allows all origins (`cors()` with no config) — fine for this first deploy, but tighten it to your Static Web App's origin before treating this as internet-facing in any serious sense (see `PRD.md` §8)

---

## 5. Switching to automated deploys

Once this manual path works, `.gitlab-ci.yml` does the same three things (migrate, build+deploy backend, build+deploy frontend) automatically on every push to your default branch. Set the CI/CD variables listed in that file's comments (service principal credentials, `<WEBAPP_NAME>`, `<SWA_NAME>`, the DB connection string, JWT secret, and the production API URL) and you won't need to repeat these manual steps again.
