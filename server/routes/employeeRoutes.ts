import { Router } from 'express';
import { getEmployees, addEmployee, deleteEmployee } from '../controllers/employeeController';

const router = Router();

router.get('/', getEmployees);
router.post('/', addEmployee);
router.delete('/:id', deleteEmployee);

export default router;
