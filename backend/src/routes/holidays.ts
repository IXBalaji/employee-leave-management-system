import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { createHoliday, deleteHoliday, listHolidays } from '../controllers/holidays';

export const holidaysRouter = Router();

holidaysRouter.use(requireAuth);

holidaysRouter.get('/', listHolidays);
holidaysRouter.post('/', requireRole('HR', 'ADMIN'), createHoliday);
holidaysRouter.delete('/:id', requireRole('HR', 'ADMIN'), deleteHoliday);
