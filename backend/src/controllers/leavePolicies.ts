import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { leavePolicySchema } from '../validation/leave';

const include = {
  rules: { include: { leaveType: true } },
} as const;

export async function listLeavePolicies(_req: Request, res: Response) {
  const policies = await prisma.leavePolicy.findMany({ include, orderBy: { name: 'asc' } });
  res.json(policies);
}

export async function createLeavePolicy(req: Request, res: Response) {
  const parsed = leavePolicySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Some fields need attention.', fieldErrors: parsed.error.flatten().fieldErrors });
    return;
  }
  const { rules, ...rest } = parsed.data;
  const policy = await prisma.leavePolicy.create({
    data: { ...rest, rules: { create: rules } },
    include,
  });
  res.status(201).json(policy);
}

export async function updateLeavePolicy(req: Request, res: Response) {
  const parsed = leavePolicySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Some fields need attention.', fieldErrors: parsed.error.flatten().fieldErrors });
    return;
  }
  const { rules, ...rest } = parsed.data;

  const policy = await prisma.$transaction(async (tx) => {
    await tx.leavePolicyRule.deleteMany({ where: { leavePolicyId: String(req.params.id) } });
    return tx.leavePolicy.update({
      where: { id: String(req.params.id) },
      data: { ...rest, rules: { create: rules } },
      include,
    });
  });
  res.json(policy);
}

export async function deleteLeavePolicy(req: Request, res: Response) {
  await prisma.leavePolicy.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
}
