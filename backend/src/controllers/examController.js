const Exam = require('../models/Exam');
const Question = require('../models/Question');

// POST /api/exams
const createExam = async (req, res, next) => {
  try {
    const exam = await Exam.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ exam });
  } catch (err) { next(err); }
};

// GET /api/exams
const getAllExams = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'student') filter.isPublished = true;
    if (req.user.role === 'teacher') filter.createdBy = req.user._id;
    const exams = await Exam.find(filter).populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.json({ exams });
  } catch (err) { next(err); }
};

// GET /api/exams/:id
const getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('createdBy', 'name email');
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const questions = await Question.find({ examId: exam._id }).sort({ order: 1 });
    // Hide answers for students
    const safeQuestions = req.user.role === 'student'
      ? questions.map(q => { const o = q.toObject(); delete o.correctAnswer; return o; })
      : questions;
    res.json({ exam, questions: safeQuestions });
  } catch (err) { next(err); }
};

// PUT /api/exams/:id
const updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updated = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ exam: updated });
  } catch (err) { next(err); }
};

// DELETE /api/exams/:id
const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Question.deleteMany({ examId: exam._id });
    await exam.deleteOne();
    res.json({ message: 'Exam deleted' });
  } catch (err) { next(err); }
};

module.exports = { createExam, getAllExams, getExamById, updateExam, deleteExam };
