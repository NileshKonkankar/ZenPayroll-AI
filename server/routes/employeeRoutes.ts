import { Router } from 'express';
import { getEmployees, getEmployee, addEmployee, deleteEmployee } from '../controllers/employeeController';

const router = Router();

router.get('/', getEmployees);
router.get('/:id', getEmployee);
router.post('/', addEmployee);
router.delete('/:id', deleteEmployee);

export default router;
