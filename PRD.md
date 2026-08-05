# Employee Leave Management System (ELMS) — Product Requirements Document

**Status**: v1 implemented and verified · **Last updated**: 2026-08-05
**Owner**: Balaji Masal (Incubxperts)

This document describes what ELMS is, who it's for, what it does, and how it's built. It reflects the system as actually implemented and tested, not just as originally planned — use it as the reference for future feature work, onboarding, or scoping decisions.

---

## 1. Purpose & Background

Incubxperts needed an internal tool to replace ad-hoc leave tracking (spreadsheets/email) with a single system that manages both the **employee record of truth** and the **leave request lifecycle**, in the spirit of Zoho People but scoped to what a team of this size actually needs.

**Primary goals:**
- One system of record for employee data (personal, contact, job, statutory, emergency, leave policy).
- Self-service leave application with real-time balance visibility.
- A clear, auditable approval chain for managers and HR.
- HR/Admin control over departments, leave policies, and the holiday calendar.
- An internal tool that is accessible (WCAG AA) by default, not retrofitted.

**Non-goals (explicitly out of scope for v1):**
- Payroll processing or integration (bank/statutory fields are stored for reference only, not processed).
- Biometric attendance / time tracking.
- Multi-level (chained) approval workflows — v1 is single-level (direct manager, with HR/Admin override).
- Mobile native apps — the web app is responsive down to 320px but there is no dedicated mobile client.
- Multi-tenancy — this is a single-organization deployment.

---

## 2. Users & Roles

Four roles, enforced both in the UI (what renders) and the API (what's actually allowed — the UI is not the security boundary):

| Role | Who | Can do |
|---|---|---|
| **Employee** | Everyone by default | View/edit their own profile (limited fields), apply for leave, view their own leave history and balance, view the holiday calendar |
| **Manager** | Employees with direct reports | Everything an Employee can, plus: view (read-only) their direct reports' profiles, approve/reject their direct reports' leave requests |
| **HR** | People Ops staff | Full read/write on all employee records, all leave requests, departments, leave policies, holidays |
| **ADMIN** | System administrators | Same permissions as HR (distinct role for future privilege separation, e.g. system config) |

**Field-level permission detail** (this is enforced server-side, not just hidden in the UI): an employee editing their *own* profile may only change `phone`, `currentAddress`, `permanentAddress`, `emergencyContactName/Relationship/Phone`, `bankName`, `bankAccountNumber`, `bankIfsc`. Everything else on their own record (name, department, designation, date of joining, manager, role, status, leave policy) is read-only to them and only HR/Admin can change it.

---

## 3. Modules & Functional Requirements

### 3.1 Authentication
- Email (`workEmail`) + password login, JWT (8-hour expiry), bcrypt-hashed passwords.
- No self-registration — accounts are created by HR/Admin through Employee Management.
- No SSO/OAuth in v1 (evaluated, deferred — see §8).

### 3.2 Employee Management
- **List** (HR/Admin only): search by name/email/employee code, filter by department and status, sortable columns.
- **Add** (HR/Admin only): tabbed form — Basic Info, Contact, Job Details, Statutory & Payroll, Emergency Contact, Leave Policy. Live inline validation (errors appear as you type/select, not just on submit); a per-tab error-count badge shows which section needs attention. Employee code is auto-generated (`EMP-0001`, `EMP-0002`, …). Creating an employee requires setting a temporary password (min 8 characters).
- **Edit / Profile view**: same tabbed form, but which fields are editable depends on the viewer's relationship to the record (full / self-service / read-only, per §2).
- **My Team** (Manager/HR/Admin): list of the current user's direct reports.
- **My Profile**: shortcut that routes any signed-in user to their own record.

### 3.3 Leave Management
- **Apply for Leave**: pick leave type, date range (or a half-day + first/second half), give a reason. Shows the employee's current-year balance for every leave type before they submit.
- **My Leave History**: every request the employee has made, with status, and a **Cancel** action while a request is still Pending. Cancelling an already-approved request restores the balance.
- **Approvals** (Manager/HR/Admin): queue of Pending requests — Managers see only their direct reports' requests, HR/Admin see everything. Approve/Reject with an optional comment. Approving a request atomically increments the employee's `used` balance for that leave type/year; rejecting does not.
- **Holiday Calendar**: read-only list of company holidays, visible to everyone.

### 3.4 Admin Console (HR/Admin only)
- **Departments**: add, rename, delete, assign a department head (any employee).
- **Leave Policies**: name + description + a set of per-leave-type rules (annual day allocation, accrual frequency — Monthly/Annual/None — and max carry-forward). Rules are edited as a dynamic list on the same form (add/remove leave-type rows).
- **Holidays**: add/delete holidays with a name, date, and location.

### 3.5 Dashboard
Role-aware landing page:
- Everyone: their own leave balance ledger, upcoming holidays.
- Manager/HR/Admin: a "Pending approvals" count tile linking to the Approvals queue.
- HR/Admin: a "Total employees" count tile linking to the Employees list.

---

## 4. Data Model

Entities (PostgreSQL via Prisma):

- **Employee** — full HR profile: identity (`employeeCode`, name, photo, DOB, gender, blood group, marital status), contact (personal/work email, phone, current/permanent address), job (department, designation, employment type, work location, date of joining, reporting manager), statutory/payroll (government ID, bank name/account/IFSC), emergency contact, plus `role`, `status` (Active/On Leave/Inactive), `passwordHash`, and `leavePolicyId`.
- **Department** — name, optional head (an Employee).
- **LeaveType** — name, whether it's paid, whether it requires approval.
- **LeavePolicy** — name, description; has many **LeavePolicyRule**s.
- **LeavePolicyRule** — (policy, leave type) → annual day allocation, accrual frequency, max carry-forward.
- **LeaveBalance** — (employee, leave type, year) → allocated vs. used days.
- **LeaveRequest** — employee, leave type, date range, half-day flag/session, reason, status (Pending/Approved/Rejected/Cancelled), approver, approver comments, timestamps.
- **Holiday** — name, date, location.

Full field list and types: `backend/prisma/schema.prisma` is the source of truth — refer to the live file rather than duplicating every field here, since this document will go stale faster than the schema is reviewed.

---

## 5. Design System

Name: **"Ledger & Stamp."** Rationale: an HR record is a ledger of facts; a leave request is literally stamped approved/pending/rejected the way paper HR forms traditionally were.

- **Palette**: cool pale sage-grey paper background (not the generic cream/serif look), ink/muted-ink text, and four status colors — teal (approved/positive), amber (pending), rust (rejected/negative), slate (cancelled/neutral) — each with a distinct icon *and* border style (solid/dashed/dotted/double), so status is never conveyed by color alone.
- **Type**: Space Grotesk (display/UI), Public Sans (body), IBM Plex Mono (data — IDs, dates, balances).
- **Signature element**: `StatusStamp` — a rotated "ink stamp" badge, the one recurring visual motif across the app (used for both leave status and employee status).
- Full token reference: `frontend/src/styles/tokens.css`.

---

## 6. Non-Functional Requirements

### Accessibility (WCAG 2.1 AA) — verified, not assumed
- **Contrast**: every text/background pairing actually used in the app computes to ≥4.5:1 for normal text (verified programmatically, not eyeballed); UI components/icons ≥3:1. One real gap (a too-light "faint" text color used for employee codes, nav labels, and balance detail lines) was found during audit and fixed.
- **Color independence**: status is always icon + border-style + text, never color alone; this applies to both the `StatusStamp` component and toast notifications.
- **Reflow**: no horizontal scroll at 320px CSS width (≡ 400% zoom on a 1280px display) on any screen; tables scroll within their own container, never the page.
- **Non-text content**: decorative icons are `aria-hidden`; employee photos use `alt=""` (correct technique, since the person's name is always shown as adjacent text) — the app has no purely-informational images that would need descriptive alt text.
- **Semantic HTML**: native `<nav>`/`<main>`/`<header>`/`<button>`/`<table>` with `<th scope="col">` throughout.
- **ARIA**: tabs use the full `tablist`/`tab`/`tabpanel` pattern with keyboard support (arrow keys/Home/End); toasts use `role="alert"` (errors) vs `role="status"` (success/info); mobile nav toggle uses `aria-expanded`.
- **Forms**: every field uses `for`/`id`, `aria-describedby` (hint + error), `aria-invalid`, `aria-required` — via one shared `Field` component, so this is structural, not per-form discipline.
- **Caveat**: audited structurally (contrast math, ARIA tree inspection, keyboard simulation) — not yet run through a live screen reader (NVDA/VoiceOver). Do that pass before treating it as fully verified.

### Security
- Passwords bcrypt-hashed; JWT-based auth (8h expiry); every write endpoint enforces role/ownership checks server-side (the frontend hiding a field is not the security boundary).
- No rate limiting, audit logging, or password-reset flow yet (see §8).

### Performance / Scale
- Sized for a small org (<100 employees). No pagination on the Employees list or leave history yet — fine at current scale, would need addressing well before four-digit employee counts.

---

## 7. Technical Architecture

| Layer | Choice |
|---|---|
| Frontend | React + Vite + TypeScript, React Router, React Hook Form + Zod (live validation), CSS Modules |
| Backend | Node.js + Express + TypeScript, Zod validation, JWT + bcrypt |
| Database | PostgreSQL via Prisma ORM |
| Deployment | GitLab CI/CD → Azure App Service (backend), Azure Static Web Apps (frontend) — see `.gitlab-ci.yml` |

Repo layout: `frontend/` and `backend/` as independent npm packages (not a monorepo tool like Turborepo/Nx — deliberately kept simple for this size of project).

---

## 8. Known Gaps & Candidate Future Work

Not committed to a roadmap — a record of what was deliberately deferred so it doesn't get re-litigated from scratch:

- **Multi-level approval chains** (currently single-level: direct manager or HR/Admin).
- **SSO / Azure AD login** (currently email+password only; company domain is Microsoft-managed, so this is a natural fit if/when needed).
- **Password reset / forgot-password flow** (currently HR/Admin would need to manually reset via the database — no self-service flow exists).
- **Audit log** of who changed what on an employee record (currently `updatedAt` only, no change history).
- **Pagination** on Employees list / leave history (fine at current scale, not built).
- **Rate limiting** on the API.
- **Live screen-reader verification pass** (see §6 caveat).
- **CORS lockdown** — backend currently allows all origins (`cors()` with no config); should be restricted to the production frontend origin before this is internet-facing in a hostile-network sense.
- Seed data currently covers 3 employees with full profiles (Admin, Manager, Employee) — ad-hoc test data created during development (extra department, extra leave policy, extra employees) was not preserved as permanent seed data; decide if that's wanted before relying on `npm run prisma:seed` for demos.

---

## 9. Reference Files

- Data model: `backend/prisma/schema.prisma`
- API routes: `backend/src/routes/*`
- Design tokens: `frontend/src/styles/tokens.css`
- CI/CD pipeline: `.gitlab-ci.yml`
- Seed data: `backend/prisma/seed.ts`
