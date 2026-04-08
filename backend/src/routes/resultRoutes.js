const express = require('express');
const router = express.Router();
const { getAllResults, getUserResults } = require('../controllers/attemptController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('admin', 'teacher'), getAllResults);
router.get('/:userId', getUserResults);

module.exports = router;
