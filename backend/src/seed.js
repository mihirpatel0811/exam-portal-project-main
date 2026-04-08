require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Inline models to avoid import issues
const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true },
  password: String, role: String, isActive: { type: Boolean, default: true },
}, { timestamps: true });

const examSchema = new mongoose.Schema({
  title: String, description: String, category: String,
  duration: Number, totalMarks: { type: Number, default: 0 },
  passingMarks: { type: Number, default: 0 },
  createdBy: mongoose.Schema.Types.ObjectId,
  isPublished: { type: Boolean, default: false },
  instructions: String,
}, { timestamps: true });

const questionSchema = new mongoose.Schema({
  examId: mongoose.Schema.Types.ObjectId,
  questionText: String, type: String,
  options: [String], correctAnswer: String,
  marks: { type: Number, default: 1 }, order: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Exam = mongoose.model('Exam', examSchema);
const Question = mongoose.model('Question', questionSchema);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Wipe existing data
    await Promise.all([User.deleteMany(), Exam.deleteMany(), Question.deleteMany()]);
    console.log('🗑️  Cleared existing data');

    // Create users
    const hashPwd = async (p) => bcrypt.hash(p, 12);
    const [adminPwd, teacherPwd, studentPwd] = await Promise.all([
      hashPwd('admin123'), hashPwd('teacher123'), hashPwd('student123'),
    ]);

    const [admin, teacher, student] = await User.insertMany([
      { name: 'Admin User', email: 'admin@exam.com', password: adminPwd, role: 'admin' },
      { name: 'John Teacher', email: 'teacher@exam.com', password: teacherPwd, role: 'teacher' },
      { name: 'Jane Student', email: 'student@exam.com', password: studentPwd, role: 'student' },
    ]);
    console.log('👥 Created 3 users (admin, teacher, student)');

    // Create Exams
    const mathExam = await Exam.create({
      title: 'Mathematics Fundamentals',
      description: 'Test your core mathematics skills including algebra, geometry and arithmetic.',
      category: 'Mathematics',
      duration: 30,
      passingMarks: 6,
      totalMarks: 10,
      createdBy: teacher._id,
      isPublished: true,
      instructions: 'Read each question carefully. You have 30 minutes. No calculators allowed.',
    });

    const scienceExam = await Exam.create({
      title: 'General Science Quiz',
      description: 'A comprehensive quiz covering Physics, Chemistry and Biology fundamentals.',
      category: 'Science',
      duration: 20,
      passingMarks: 5,
      totalMarks: 8,
      createdBy: teacher._id,
      isPublished: true,
      instructions: 'Select the best answer for each question.',
    });

    const historyExam = await Exam.create({
      title: 'World History — Draft',
      description: 'Draft exam — not published yet.',
      category: 'History',
      duration: 45,
      passingMarks: 10,
      totalMarks: 0,
      createdBy: teacher._id,
      isPublished: false,
    });

    console.log('📚 Created 3 exams (2 published, 1 draft)');

    // Math Questions
    await Question.insertMany([
      { examId: mathExam._id, questionText: 'What is 15 × 8?', type: 'mcq', options: ['100', '120', '125', '130'], correctAnswer: '120', marks: 1, order: 1 },
      { examId: mathExam._id, questionText: 'What is the square root of 144?', type: 'mcq', options: ['10', '11', '12', '13'], correctAnswer: '12', marks: 1, order: 2 },
      { examId: mathExam._id, questionText: 'π (pi) is approximately equal to 3.14159.', type: 'true_false', correctAnswer: 'True', marks: 1, order: 3 },
      { examId: mathExam._id, questionText: 'The area of a circle is πr². Is this correct?', type: 'true_false', correctAnswer: 'True', marks: 1, order: 4 },
      { examId: mathExam._id, questionText: 'What is 2³ (2 to the power of 3)?', type: 'mcq', options: ['4', '6', '8', '9'], correctAnswer: '8', marks: 1, order: 5 },
      { examId: mathExam._id, questionText: 'Solve for x: 3x + 6 = 21', type: 'mcq', options: ['3', '4', '5', '6'], correctAnswer: '5', marks: 1, order: 6 },
      { examId: mathExam._id, questionText: 'Is 0 considered a natural number?', type: 'true_false', correctAnswer: 'False', marks: 1, order: 7 },
      { examId: mathExam._id, questionText: 'What is the perimeter of a square with side 7?', type: 'mcq', options: ['21', '28', '35', '49'], correctAnswer: '28', marks: 1, order: 8 },
      { examId: mathExam._id, questionText: 'A right angle measures exactly 90 degrees.', type: 'true_false', correctAnswer: 'True', marks: 1, order: 9 },
      { examId: mathExam._id, questionText: 'Briefly explain the Pythagorean theorem.', type: 'short_answer', correctAnswer: 'In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides.', marks: 1, order: 10 },
    ]);

    // Science Questions
    await Question.insertMany([
      { examId: scienceExam._id, questionText: 'What is the chemical symbol for water?', type: 'mcq', options: ['HO', 'H2O', 'H2O2', 'OH'], correctAnswer: 'H2O', marks: 1, order: 1 },
      { examId: scienceExam._id, questionText: 'The Earth is the third planet from the Sun.', type: 'true_false', correctAnswer: 'True', marks: 1, order: 2 },
      { examId: scienceExam._id, questionText: 'What is the speed of light (approx.) in km/s?', type: 'mcq', options: ['150,000', '300,000', '450,000', '1,000,000'], correctAnswer: '300,000', marks: 1, order: 3 },
      { examId: scienceExam._id, questionText: 'Humans have 46 chromosomes in each cell.', type: 'true_false', correctAnswer: 'True', marks: 1, order: 4 },
      { examId: scienceExam._id, questionText: 'What gas do plants absorb during photosynthesis?', type: 'mcq', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctAnswer: 'Carbon Dioxide', marks: 1, order: 5 },
      { examId: scienceExam._id, questionText: 'Sound travels faster than light.', type: 'true_false', correctAnswer: 'False', marks: 1, order: 6 },
      { examId: scienceExam._id, questionText: 'Which planet is known as the Red Planet?', type: 'mcq', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Mars', marks: 1, order: 7 },
      { examId: scienceExam._id, questionText: 'Briefly explain what photosynthesis is.', type: 'short_answer', correctAnswer: 'Photosynthesis is the process by which plants use sunlight, water and CO2 to produce glucose and oxygen.', marks: 1, order: 8 },
    ]);

    console.log('❓ Created 18 questions across 2 exams');
    console.log('\n✨ Database seeded successfully!\n');
    console.log('Demo Accounts:');
    console.log('  Admin:   admin@exam.com   / admin123');
    console.log('  Teacher: teacher@exam.com / teacher123');
    console.log('  Student: student@exam.com / student123');
    console.log('');

  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
