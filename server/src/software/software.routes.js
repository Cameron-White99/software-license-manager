const express = require('express');
const SoftwareService = require('./SoftwareService');
const { protect } = require('../middleware/AuthMiddleware');
const { isAdmin } = require('../middleware/RoleMiddleware');

const router = express.Router();

router.post('/', protect, isAdmin, async (req, res) => {
  return res.json(await SoftwareService.create(req.body));
});

router.put('/:id', protect, isAdmin, async (req, res) => {
  return res.json(await SoftwareService.update(req.params.id, req.body));
});


export default router;
