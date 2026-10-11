import express from 'express';
import * as SoftwareService from './SoftwareService.js';
import { protect } from '../middleware/AuthMiddleware.js';
import { isAdmin } from '../middleware/RoleMiddleware.js';

const router = express.Router();

// List active software for authenticated users
router.get('/', protect, async (req, res, next) => {
  try {
    const software = await SoftwareService.list();
    return res.json(software);
  } catch (error) {
    next(error);
  }
});


router.post('/', protect, isAdmin, async (req, res) => {
  return res.json(await SoftwareService.create(req.body));
});

router.put('/:id', protect, isAdmin, async (req, res) => {
  return res.json(await SoftwareService.update(req.params.id, req.body));
});


export default router;
