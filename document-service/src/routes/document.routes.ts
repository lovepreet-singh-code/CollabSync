import { Router } from 'express';
import * as DocumentController from '../controllers/document.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Public or protected routes depending on use-case. Here we protect write ops.
router.get('/', DocumentController.list);
router.get('/:id', DocumentController.getById);
router.post('/', verifyToken, DocumentController.create);
router.put('/:id', verifyToken, DocumentController.update);
router.delete('/:id', verifyToken, DocumentController.remove);

export default router;