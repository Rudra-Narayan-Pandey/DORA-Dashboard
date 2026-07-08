const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// GET /api/auth/me
router.get('/me', authController.getProfile);

module.exports = router;
