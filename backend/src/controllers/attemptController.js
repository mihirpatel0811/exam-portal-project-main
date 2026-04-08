const Attempt = require('../models/Attempt');
const Exam = require('../models/Exam');
const Question = require('../models/Question');

// POST /api/attempts/start
const startAttempt = async (req, res, next) => {
  try {
    const { examId } = req.body;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    if (!exam.isPublished) return res.status(400).json({ message: 'Exam is not published' });

    // Check if already has active attempt
    const existing = await Attempt.findOne({ userId: req.user._id, examId, status: 'started' });
    if (existing) return res.json({ attempt: existing });

    const attempt = await Attempt.create({ userId: req.user._id, examId, totalMarks: exam.totalMarks });
    res.status(201).json({ attempt });
  } catch (err) { next(err); }
};

// POST /api/attempts/submit
const submitAttempt = async (req, res, next) => {
  try {
    const { attemptId, answers } = req.body;
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (attempt.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (attempt.status === 'submitted') return res.status(400).json({ message: 'Already submitted' });

    // Auto-grade MCQ and True/False
    const questions = await Question.find({ examId: attempt.examId });
    let score = 0;
    const gradedAnswers = answers.map(ans => {
      const q = questions.find(q => q._id.toString() === ans.questionId);
      if (q && (q.type === 'mcq' || q.type === 'true_false')) {
        if (q.correctAnswer.toLowerCase() === (ans.answer || '').toLowerCase()) {
          score += q.marks;
        }
      }
      return ans;
    });

    const percentage = attempt.totalMarks > 0 ? Math.round((score / attempt.totalMarks) * 100) : 0;
    const timeTaken = Math.round((Date.now() - attempt.startedAt.getTime()) / 1000);

    attempt.answers = gradedAnswers;
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    attempt.timeTaken = timeTaken;
    await attempt.save();

    res.json({ attempt });
  } catch (err) { next(err); }
};

// GET /api/attempts/:id
const getAttempt = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('examId', 'title duration totalMarks')
      .populate('userId', 'name email');
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    res.json({ attempt });
  } catch (err) { next(err); }
};

// GET /api/results  (all results for teacher/admin)
const getAllResults = async (req, res, next) => {
  try {
    const filter = { status: 'submitted' };
    const results = await Attempt.find(filter)
      .populate('userId', 'name email')
      .populate('examId', 'title category')
      .sort({ submittedAt: -1 });
    res.json({ results });
  } catch (err) { next(err); }
};

// GET /api/results/:userId
const getUserResults = async (req, res, next) => {
  try {
    const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;
    const results = await Attempt.find({ userId, status: 'submitted' })
      .populate('examId', 'title category totalMarks passingMarks')
      .sort({ submittedAt: -1 });
    res.json({ results });
  } catch (err) { next(err); }
};

module.exports = { startAttempt, submitAttempt, getAttempt, getAllResults, getUserResults };
