const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: String, required: true, trim: true },
  duration: { type: Number, required: true }, // in minutes
  totalMarks: { type: Number, default: 0 },
  passingMarks: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: false },
  startDate: { type: Date },
  endDate: { type: Date },
  instructions: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
