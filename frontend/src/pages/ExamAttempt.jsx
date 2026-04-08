import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI, attemptAPI } from '../services/api';

const ExamAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [examRes, attemptRes] = await Promise.all([
          examAPI.getById(id),
          attemptAPI.start(id),
        ]);
        setExam(examRes.data.exam);
        setQuestions(examRes.data.questions);
        setAttempt(attemptRes.data.attempt);
        setTimeLeft(examRes.data.exam.duration * 60);
      } catch (err) {
        alert(err.response?.data?.message || 'Could not start exam');
        navigate('/exams');
      } finally { setLoading(false); }
    };
    init();
  }, [id, navigate]);

  const submitExam = useCallback(async () => {
    if (submitting || !attempt) return;
    setSubmitting(true);
    try {
      const formatted = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
      const res = await attemptAPI.submit({ attemptId: attempt._id, answers: formatted });
      navigate(`/result/${res.data.attempt._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Submit failed');
      setSubmitting(false);
    }
  }, [attempt, answers, navigate, submitting]);

  // Countdown timer
  useEffect(() => {
    if (!exam) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); submitExam(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [exam, submitExam]);

  if (loading) return (
    <div className="loading-screen">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading exam…</p>
      </div>
    </div>
  );

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const isWarning = timeLeft < 300; // < 5 min
  const answered = Object.keys(answers).length;
  const progress = questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0;
  const q = questions[currentQ];

  const handleAnswer = (val) => setAnswers(prev => ({ ...prev, [q._id]: val }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', padding: '24px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20 }}>{exam?.title}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{exam?.category}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{answered}/{questions.length} answered</div>
          <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)} disabled={submitting}>
            {submitting ? '⏳ Submitting…' : '📤 Submit Exam'}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar-container" style={{ marginBottom: 24, height: 4 }}>
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="exam-attempt-layout">
        {/* Question */}
        <div>
          {q && (
            <div className="question-card">
              <div className="question-number">Question {currentQ + 1} of {questions.length} · {q.marks} mark{q.marks !== 1 ? 's' : ''}</div>
              <div className="question-text">{q.questionText}</div>

              {(q.type === 'mcq') && (
                <div className="options-list">
                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`option-item ${answers[q._id] === opt ? 'selected' : ''}`}
                      onClick={() => handleAnswer(opt)}
                    >
                      <div className={`option-radio ${answers[q._id] === opt ? 'selected' : ''}`} />
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              )}

              {(q.type === 'true_false') && (
                <div className="options-list">
                  {['True', 'False'].map(opt => (
                    <div
                      key={opt}
                      className={`option-item ${answers[q._id] === opt ? 'selected' : ''}`}
                      onClick={() => handleAnswer(opt)}
                    >
                      <div className={`option-radio ${answers[q._id] === opt ? 'selected' : ''}`} />
                      <span>{opt === 'True' ? '✅' : '❌'} {opt}</span>
                    </div>
                  ))}
                </div>
              )}

              {(q.type === 'short_answer') && (
                <textarea
                  className="form-control short-answer-input"
                  placeholder="Type your answer here…"
                  rows={5}
                  value={answers[q._id] || ''}
                  onChange={e => handleAnswer(e.target.value)}
                />
              )}

              <div className="question-controls">
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentQ(c => c - 1)}
                  disabled={currentQ === 0}
                >
                  ← Previous
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentQ(c => c + 1)}
                  disabled={currentQ === questions.length - 1}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="exam-sidebar-panel">
          <div className={`timer-card ${isWarning ? 'timer-warning' : ''}`}>
            <div className="timer-label">Time Remaining</div>
            <div className="timer-display">{mins}:{secs}</div>
            {isWarning && <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 8 }}>⚠️ Less than 5 minutes!</p>}
          </div>

          <div className="card">
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Question Navigator</div>
            <div className="question-nav-grid">
              {questions.map((_, i) => (
                <button
                  key={i}
                  className={`q-nav-btn ${i === currentQ ? 'current' : answers[questions[i]._id] ? 'answered' : ''}`}
                  onClick={() => setCurrentQ(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary)', display: 'inline-block' }} /> Answered</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, border: '1px solid var(--border)', display: 'inline-block' }} /> Unanswered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">📤 Submit Exam?</span>
              <button className="modal-close" onClick={() => setShowConfirm(false)}>×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              You have answered <strong style={{ color: 'var(--primary-light)' }}>{answered}</strong> out of <strong>{questions.length}</strong> questions.
              {answered < questions.length && <><br /><span style={{ color: 'var(--warning)' }}>⚠️ {questions.length - answered} question(s) are unanswered.</span></>}
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setShowConfirm(false); submitExam(); }}>Confirm Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamAttempt;
