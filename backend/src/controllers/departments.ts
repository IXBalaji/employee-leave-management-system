import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { departmentSchema } from '../validation/leave';

export async function listDepartments(_req: Request, res: Response) {
  const departments = await prisma.department.findMany({
    select: { id: true, name: true, headEmployeeId: true, head: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(departments);
}

export async function createDepartment(req: Request, res: Response) {
  const parsed = departmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Some fields need attention.', fieldErrors: parsed.error.flatten().fieldErrors });
    return;
  }
  const { headEmployeeId, ...rest } = parsed.data;
  const department = await prisma.department.create({
    data: { ...rest, headEmployeeId: headEmployeeId || undefined },
  });
  res.status(201).json(department);
}

export async function updateDepartment(req: Request, res: Response) {
  const parsed = departmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Some fields need attention.', fieldErrors: parsed.error.flatten().fieldErrors });
    return;
  }
  const { headEmployeeId, ...rest } = parsed.data;
  const department = await prisma.department.update({
    where: { id: String(req.params.id) },
    data: { ...rest, headEmployeeId: headEmployeeId || null },
  });
  res.json(department);
}

export async function deleteDepartment(req: Request, res: Response) {
  await prisma.department.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
}
