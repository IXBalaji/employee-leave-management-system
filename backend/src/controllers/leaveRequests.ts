import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { leaveDecisionSchema, leaveRequestSchema } from '../validation/leave';

function countDays(startDate: Date, endDate: Date, isHalfDay: boolean) {
  if (isHalfDay) return 0.5;
  const ms = endDate.getTime() - startDate.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}

const include = {
  leaveType: true,
  employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
  approver: { select: { id: true, firstName: true, lastName: true } },
} as const;

export async function applyForLeave(req: Request, res: Response) {
  const parsed = leaveRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Some fields need attention.', fieldErrors: parsed.error.flatten().fieldErrors });
    return;
  }
  const { startDate, endDate, ...rest } = parsed.data;
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    res.status(400).json({ error: 'Some fields need attention.', fieldErrors: { endDate: ['End date must be on or after the start date.'] } });
    return;
  }

  const request = await prisma.leaveRequest.create({
    data: { ...rest, startDate: start, endDate: end, employeeId: req.user!.sub },
    include,
  });
  res.status(201).json(request);
}

export async function listMyLeaveRequests(req: Request, res: Response) {
  const requests = await prisma.leaveRequest.findMany({
    where: { employeeId: req.user!.sub },
    include,
    orderBy: { appliedAt: 'desc' },
  });
  res.json(requests);
}

export async function listApprovalQueue(req: Request, res: Response) {
  const role = req.user!.role;
  const where =
    role === 'HR' || role === 'ADMIN'
      ? { status: 'PENDING' as const }
      : { status: 'PENDING' as const, employee: { reportingManagerId: req.user!.sub } };

  const requests = await prisma.leaveRequest.findMany({ where, include, orderBy: { appliedAt: 'asc' } });
  res.json(requests);
}

export async function decideLeaveRequest(req: Request, res: Response) {
  const parsed = leaveDecisionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Some fields need attention.', fieldErrors: parsed.error.flatten().fieldErrors });
    return;
  }

  const existing = await prisma.leaveRequest.findUnique({ where: { id: String(req.params.id) }, include: { employee: true } });
  if (!existing) {
    res.status(404).json({ error: 'Leave request not found.' });
    return;
  }
  if (existing.status !== 'PENDING') {
    res.status(409).json({ error: 'This request has already been decided.' });
    return;
  }

  const role = req.user!.role;
  const isOwnManager = existing.employee.reportingManagerId === req.user!.sub;
  if (role !== 'HR' && role !== 'ADMIN' && !isOwnManager) {
    res.status(403).json({ error: "You don't have permission to decide this request." });
    return;
  }

  const { status, approverComments } = parsed.data;

  const request = await prisma.$transaction(async (tx) => {
    const updated = await tx.leaveRequest.update({
      where: { id: String(req.params.id) },
      data: { status, approverComments, approverId: req.user!.sub, decidedAt: new Date() },
      include,
    });

    if (status === 'APPROVED') {
      const days = countDays(existing.startDate, existing.endDate, existing.isHalfDay);
      const year = existing.startDate.getFullYear();
      await tx.leaveBalance.upsert({
        where: { employeeId_leaveTypeId_year: { employeeId: existing.employeeId, leaveTypeId: existing.leaveTypeId, year } },
        create: { employeeId: existing.employeeId, leaveTypeId: existing.leaveTypeId, year, allocated: 0, used: days },
        update: { used: { increment: days } },
      });
    }

    return updated;
  });

  res.json(request);
}

export async function cancelLeaveRequest(req: Request, res: Response) {
  const existing = await prisma.leaveRequest.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) {
    res.status(404).json({ error: 'Leave request not found.' });
    return;
  }
  if (existing.employeeId !== req.user!.sub) {
    res.status(403).json({ error: "You don't have permission to cancel this request." });
    return;
  }
  if (existing.status === 'CANCELLED') {
    res.status(409).json({ error: 'This request is already cancelled.' });
    return;
  }

  const request = await prisma.$transaction(async (tx) => {
    if (existing.status === 'APPROVED') {
      const days = countDays(existing.startDate, existing.endDate, existing.isHalfDay);
      const year = existing.startDate.getFullYear();
      await tx.leaveBalance.updateMany({
        where: { employeeId: existing.employeeId, leaveTypeId: existing.leaveTypeId, year },
        data: { used: { decrement: days } },
      });
    }
    return tx.leaveRequest.update({ where: { id: String(req.params.id) }, data: { status: 'CANCELLED' }, include });
  });

  res.json(request);
}

export async function listMyBalances(req: Request, res: Response) {
  const year = Number(req.query.year) || new Date().getFullYear();
  const balances = await prisma.leaveBalance.findMany({
    where: { employeeId: req.user!.sub, year },
    include: { leaveType: true },
  });
  res.json(balances);
}
