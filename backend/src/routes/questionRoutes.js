const express = require('express');
const router = express.Router();
const { createQuestion, updateQuestion, deleteQuestion } = require('../controllers/questionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('teacher', 'admin'));
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;
