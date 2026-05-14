import { Router } from 'express';
import { getAdmins, updateAdminRole, removeAdmin } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize(['ADMIN'])); // Only ADMIN can manage roles

router.get('/', getAdmins);
router.post('/', updateAdminRole);
router.delete('/:id', removeAdmin);

export default router;
