import { Router } from 'express';
import * as DocumentController from '../controllers/document.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireDocumentAccess } from '../middlewares/acl.middleware';

const router = Router();

// Public or protected routes depending on use-case. Here we protect write ops.
// GET list: requires auth (owner-based listing)
router.get('/', verifyToken, DocumentController.list);

// GET by id: requires auth and read permission via ACL
router.get('/:id', verifyToken, requireDocumentAccess('read'), DocumentController.getById);

// Create: requires auth
router.post('/', verifyToken, DocumentController.create);

// Update: requires auth and write permission via ACL
router.put('/:id', verifyToken, requireDocumentAccess('write'), DocumentController.update);

// Delete: requires auth and write permission via ACL
router.delete('/:id', verifyToken, requireDocumentAccess('write'), DocumentController.remove);

export default router;