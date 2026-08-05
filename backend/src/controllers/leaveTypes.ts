import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { leaveTypeSchema } from '../validation/leave';

export async function listLeaveTypes(_req: Request, res: Response) {
  const leaveTypes = await prisma.leaveType.findMany({ orderBy: { name: 'asc' } });
  res.json(leaveTypes);
}

export async function createLeaveType(req: Request, res: Response) {
  const parsed = leaveTypeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Some fields need attention.', fieldErrors: parsed.error.flatten().fieldErrors });
    return;
  }
  const leaveType = await prisma.leaveType.create({ data: parsed.data });
  res.status(201).json(leaveType);
}

export async function updateLeaveType(req: Request, res: Response) {
  const parsed = leaveTypeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Some fields need attention.', fieldErrors: parsed.error.flatten().fieldErrors });
    return;
  }
  const leaveType = await prisma.leaveType.update({ where: { id: String(req.params.id) }, data: parsed.data });
  res.json(leaveType);
}

export async function deleteLeaveType(req: Request, res: Response) {
  await prisma.leaveType.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
}
