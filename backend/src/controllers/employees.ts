import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/auth';
import { employeeCreateSchema, employeeSchema, selfEditableSchema } from '../validation/employee';

const publicSelect = {
  id: true,
  employeeCode: true,
  firstName: true,
  lastName: true,
  photoUrl: true,
  dob: true,
  gender: true,
  bloodGroup: true,
  maritalStatus: true,
  personalEmail: true,
  workEmail: true,
  phone: true,
  currentAddress: true,
  permanentAddress: true,
  departmentId: true,
  department: { select: { id: true, name: true } },
  designation: true,
  employmentType: true,
  workLocation: true,
  dateOfJoining: true,
  reportingManagerId: true,
  reportingManager: { select: { id: true, firstName: true, lastName: true } },
  govIdNumber: true,
  bankName: true,
  bankAccountNumber: true,
  bankIfsc: true,
  emergencyContactName: true,
  emergencyContactRelationship: true,
  emergencyContactPhone: true,
  leavePolicyId: true,
  role: true,
  status: true,
  createdAt: true,
} as const;

async function nextEmployeeCode() {
  const count = await prisma.employee.count();
  return `EMP-${String(count + 1).padStart(4, '0')}`;
}

export async function listEmployees(req: Request, res: Response) {
  const { q, departmentId, status } = req.query as Record<string, string | undefined>;

  const where: Record<string, unknown> = {};
  if (departmentId) where.departmentId = departmentId;
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
      { workEmail: { contains: q, mode: 'insensitive' } },
      { employeeCode: { contains: q, mode: 'insensitive' } },
    ];
  }

  const employees = await prisma.employee.findMany({
    where,
    select: publicSelect,
    orderBy: { firstName: 'asc' },
  });
  res.json(employees);
}

export async function listMyTeam(req: Request, res: Response) {
  const employees = await prisma.employee.findMany({
    where: { reportingManagerId: req.user!.sub },
    select: publicSelect,
    orderBy: { firstName: 'asc' },
  });
  res.json(employees);
}

function canView(req: Request, targetId: string, targetManagerId: string | null) {
  const role = req.user!.role;
  if (role === 'HR' || role === 'ADMIN') return true;
  if (req.user!.sub === targetId) return true;
  if (role === 'MANAGER' && targetManagerId === req.user!.sub) return true;
  return false;
}

export async function getEmployee(req: Request, res: Response) {
  const employee = await prisma.employee.findUnique({
    where: { id: String(req.params.id) },
    select: publicSelect,
  });
  if (!employee) {
    res.status(404).json({ error: 'Employee not found.' });
    return;
  }
  if (!canView(req, employee.id, employee.reportingManagerId)) {
    res.status(403).json({ error: "You don't have permission to view this profile." });
    return;
  }
  res.json(employee);
}

export async function createEmployee(req: Request, res: Response) {
  const parsed = employeeCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Some fields need attention.', fieldErrors: parsed.error.flatten().fieldErrors });
    return;
  }
  const { password, dob, dateOfJoining, ...rest } = parsed.data;

  const existing = await prisma.employee.findUnique({ where: { workEmail: rest.workEmail } });
  if (existing) {
    res.status(409).json({ error: 'Some fields need attention.', fieldErrors: { workEmail: ['This work email is already in use.'] } });
    return;
  }

  const employeeCode = await nextEmployeeCode();
  const passwordHash = await hashPassword(password);

  const employee = await prisma.employee.create({
    data: {
      ...rest,
      employeeCode,
      passwordHash,
      dob: dob ? new Date(dob) : undefined,
      dateOfJoining: new Date(dateOfJoining),
      departmentId: rest.departmentId,
      reportingManagerId: rest.reportingManagerId || undefined,
      leavePolicyId: rest.leavePolicyId || undefined,
      gender: rest.gender || undefined,
      maritalStatus: rest.maritalStatus || undefined,
    },
    select: publicSelect,
  });
  res.status(201).json(employee);
}

export async function updateEmployee(req: Request, res: Response) {
  const target = await prisma.employee.findUnique({ where: { id: String(req.params.id) } });
  if (!target) {
    res.status(404).json({ error: 'Employee not found.' });
    return;
  }

  const role = req.user!.role;
  const isSelf = req.user!.sub === target.id;
  const isHr = role === 'HR' || role === 'ADMIN';

  if (!isHr && !isSelf) {
    res.status(403).json({ error: "You don't have permission to edit this profile." });
    return;
  }

  if (isHr) {
    const parsed = employeeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Some fields need attention.', fieldErrors: parsed.error.flatten().fieldErrors });
      return;
    }
    const { dob, dateOfJoining, ...rest } = parsed.data;

    if (rest.workEmail !== target.workEmail) {
      const clash = await prisma.employee.findUnique({ where: { workEmail: rest.workEmail } });
      if (clash) {
        res.status(409).json({ error: 'Some fields need attention.', fieldErrors: { workEmail: ['This work email is already in use.'] } });
        return;
      }
    }

    const employee = await prisma.employee.update({
      where: { id: target.id },
      data: {
        ...rest,
        dob: dob ? new Date(dob) : null,
        dateOfJoining: new Date(dateOfJoining),
        reportingManagerId: rest.reportingManagerId || null,
        leavePolicyId: rest.leavePolicyId || null,
        gender: rest.gender || null,
        maritalStatus: rest.maritalStatus || null,
      },
      select: publicSelect,
    });
    res.json(employee);
    return;
  }

  // Self-service edit: only the whitelisted fields, regardless of what else was sent.
  const parsed = selfEditableSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Some fields need attention.', fieldErrors: parsed.error.flatten().fieldErrors });
    return;
  }
  const employee = await prisma.employee.update({
    where: { id: target.id },
    data: parsed.data,
    select: publicSelect,
  });
  res.json(employee);
}
