const express = require('express');
const router = express.Router();
const { createExam, getAllExams, getExamById, updateExam, deleteExam } = require('../controllers/examController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', authorize('teacher', 'admin'), createExam);
router.get('/', getAllExams);
router.get('/:id', getExamById);
router.put('/:id', authorize('teacher', 'admin'), updateExam);
router.delete('/:id', authorize('teacher', 'admin'), deleteExam);

module.exports = router;
