import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { holidaySchema } from '../validation/leave';

export async function listHolidays(_req: Request, res: Response) {
  const holidays = await prisma.holiday.findMany({ orderBy: { date: 'asc' } });
  res.json(holidays);
}

export async function createHoliday(req: Request, res: Response) {
  const parsed = holidaySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Some fields need attention.', fieldErrors: parsed.error.flatten().fieldErrors });
    return;
  }
  const holiday = await prisma.holiday.create({ data: { ...parsed.data, date: new Date(parsed.data.date) } });
  res.status(201).json(holiday);
}

export async function deleteHoliday(req: Request, res: Response) {
  await prisma.holiday.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
}
