const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  questionText: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'true_false', 'short_answer'], required: true },
  options: [{ type: String }], // for MCQ
  correctAnswer: { type: String, required: true },
  marks: { type: Number, default: 1 },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
