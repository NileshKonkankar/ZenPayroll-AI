import { Router } from 'express';
import { processPayroll, getPayrollHistory, processFullBatch } from '../controllers/payrollController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize(['ADMIN', 'HR']));

router.post('/process', processPayroll);
router.post('/process-batch', processFullBatch);
router.get('/history', getPayrollHistory);

export default router;
