import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { comparePassword, signToken } from '../lib/auth';

const loginSchema = z.object({
  workEmail: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Enter your email and password.' });
    return;
  }
  const { workEmail, password } = parsed.data;

  const employee = await prisma.employee.findUnique({ where: { workEmail } });
  if (!employee || !(await comparePassword(password, employee.passwordHash))) {
    res.status(401).json({ error: 'That email and password don’t match our records.' });
    return;
  }

  const token = signToken({ sub: employee.id, role: employee.role });
  res.json({
    token,
    user: {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      workEmail: employee.workEmail,
      role: employee.role,
      photoUrl: employee.photoUrl,
    },
  });
}

export async function me(req: Request, res: Response) {
  const employee = await prisma.employee.findUnique({
    where: { id: req.user!.sub },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      workEmail: true,
      role: true,
      photoUrl: true,
      departmentId: true,
    },
  });
  if (!employee) {
    res.status(404).json({ error: 'Account not found.' });
    return;
  }
  res.json(employee);
}
