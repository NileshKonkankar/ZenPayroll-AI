import { Router } from 'express';
import { processPayroll, getPayrollHistory, processFullBatch } from '../controllers/payrollController';

const router = Router();

router.post('/process', processPayroll);
router.post('/process-batch', processFullBatch);
router.get('/history', getPayrollHistory);

export default router;
