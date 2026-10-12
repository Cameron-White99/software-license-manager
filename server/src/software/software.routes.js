import express from 'express';
import * as SoftwareService from './SoftwareService.js';
import { protect } from '../middleware/AuthMiddleware.js';
import { isAdmin } from '../middleware/RoleMiddleware.js';

const router = express.Router();

router.post('/', protect, isAdmin, async (req, res) => {
  return res.json(await SoftwareService.create(req.body));
});

router.put('/:id', protect, isAdmin, async (req, res) => {
  return res.json(await SoftwareService.update(req.params.id, req.body));
});


export default router;
