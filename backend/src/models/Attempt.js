const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    answer: { type: String },
  }],
  score: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  status: { type: String, enum: ['started', 'submitted'], default: 'started' },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  timeTaken: { type: Number }, // seconds
}, { timestamps: true });

module.exports = mongoose.model('Attempt', attemptSchema);
