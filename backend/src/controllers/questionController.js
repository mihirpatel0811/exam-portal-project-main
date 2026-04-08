const Question = require('../models/Question');
const Exam = require('../models/Exam');

// POST /api/questions
const createQuestion = async (req, res, next) => {
  try {
    const { examId } = req.body;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const question = await Question.create(req.body);
    // Update exam total marks
    await Exam.findByIdAndUpdate(examId, { $inc: { totalMarks: question.marks } });
    res.status(201).json({ question });
  } catch (err) { next(err); }
};

// PUT /api/questions/:id
const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    const marksDiff = (req.body.marks || question.marks) - question.marks;
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (marksDiff !== 0) await Exam.findByIdAndUpdate(question.examId, { $inc: { totalMarks: marksDiff } });
    res.json({ question: updated });
  } catch (err) { next(err); }
};

// DELETE /api/questions/:id
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    await Exam.findByIdAndUpdate(question.examId, { $inc: { totalMarks: -question.marks } });
    res.json({ message: 'Question deleted' });
  } catch (err) { next(err); }
};

module.exports = { createQuestion, updateQuestion, deleteQuestion };
