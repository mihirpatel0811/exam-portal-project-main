const express = require('express');
const router = express.Router();
const { startAttempt, submitAttempt, getAttempt } = require('../controllers/attemptController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/start', authorize('student'), startAttempt);
router.post('/submit', authorize('student'), submitAttempt);
router.get('/:id', getAttempt);

module.exports = router;
