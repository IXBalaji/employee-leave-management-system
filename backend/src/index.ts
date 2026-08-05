import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { authRouter } from './routes/auth';
import { departmentsRouter } from './routes/departments';
import { employeesRouter } from './routes/employees';
import { holidaysRouter } from './routes/holidays';
import { leavePoliciesRouter } from './routes/leavePolicies';
import { leaveRequestsRouter } from './routes/leaveRequests';
import { leaveTypesRouter } from './routes/leaveTypes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/leave-types', leaveTypesRouter);
app.use('/api/leave-policies', leavePoliciesRouter);
app.use('/api/holidays', holidaysRouter);
app.use('/api/leave-requests', leaveRequestsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our end. Try again.' });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
