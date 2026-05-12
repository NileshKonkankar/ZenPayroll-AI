import { Router } from 'express';
import { getEmployees, getEmployee, addEmployee, deleteEmployee } from '../controllers/employeeController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Both ADMIN and HR can manage employees
router.use(authenticate);
router.use(authorize(['ADMIN', 'HR']));

router.get('/', getEmployees);
router.get('/:id', getEmployee);
router.post('/', addEmployee);
router.delete('/:id', deleteEmployee);

export default router;
