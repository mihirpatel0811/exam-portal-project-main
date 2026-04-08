import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { attemptAPI, examAPI } from '../services/api';
import Layout from '../components/Layout';

const ExamResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attemptAPI.getById(id)
      .then(async res => {
        const attempt = res.data.attempt;
        setResult(attempt);
        if (attempt.examId?._id) {
          const er = await examAPI.getById(attempt.examId._id);
          setExam(er.data.exam);
          setQuestions(er.data.questions);
        }
      })
      .catch(() => navigate('/my-results'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <Layout><div className="loading-screen"><div className="spinner" /></div></Layout>;
  if (!result) return null;

  const pct = result.percentage;
  const passed = pct >= 50;
  const deg = Math.round((pct / 100) * 360);
  const mins = result.timeTaken ? Math.floor(result.timeTaken / 60) : 0;
  const secs = result.timeTaken ? result.timeTaken % 60 : 0;

  return (
    <Layout>
      {/* Hero */}
      <div className="result-hero">
        <div className="score-circle" style={{ '--score-pct': `${deg}deg` }}>
          <div className="score-inner">
            <div className="score-pct" style={{ color: passed ? 'var(--success)' : 'var(--danger)' }}>{pct}%</div>
            <div className="score-label">Score</div>
          </div>
        </div>

        <div className="result-status" style={{ color: passed ? '#34d399' : '#f87171' }}>
          {passed ? '🏆 Congratulations! You Passed!' : '❌ Better luck next time'}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{result.examId?.title}</div>

        <div className="result-stats">
          <div className="result-stat-item">
            <div className="result-stat-value" style={{ color: 'var(--primary-light)' }}>{result.score}</div>
            <div className="result-stat-label">Score Obtained</div>
          </div>
          <div className="result-stat-item">
            <div className="result-stat-value">{result.totalMarks}</div>
            <div className="result-stat-label">Total Marks</div>
          </div>
          <div className="result-stat-item">
            <div className="result-stat-value">{mins}m {secs}s</div>
            <div className="result-stat-label">Time Taken</div>
          </div>
          <div className="result-stat-item">
            <div className="result-stat-value">{result.answers?.length || 0}</div>
            <div className="result-stat-label">Questions Attempted</div>
          </div>
        </div>
      </div>

      {/* Answer Review */}
      {questions.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>📋 Answer Review</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {questions.map((q, i) => {
              const studentAns = result.answers?.find(a => a.questionId === q._id)?.answer;
              const isCorrect = q.correctAnswer && studentAns?.toLowerCase() === q.correctAnswer?.toLowerCase();
              const isShort = q.type === 'short_answer';
              return (
                <div key={q._id} style={{
                  padding: 18, borderRadius: 12,
                  border: `1px solid ${isShort ? 'var(--border)' : isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  background: isShort ? 'var(--bg-card2)' : isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Q{i + 1} · {q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                    {!isShort && <span className={`badge ${isCorrect ? 'badge-success' : 'badge-danger'}`}>{isCorrect ? '✓ Correct' : '✗ Wrong'}</span>}
                    {isShort && <span className="badge badge-secondary">Manual Review</span>}
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: 10 }}>{q.questionText}</div>
                  {!isShort && (
                    <div style={{ fontSize: 13 }}>
                      <div style={{ color: 'var(--text-muted)' }}>Your answer: <span style={{ color: isCorrect ? '#34d399' : '#f87171' }}>{studentAns || 'Not answered'}</span></div>
                      {!isCorrect && <div style={{ color: '#34d399' }}>Correct answer: {q.correctAnswer}</div>}
                    </div>
                  )}
                  {isShort && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your answer: <span style={{ color: 'var(--text-primary)' }}>{studentAns || 'Not answered'}</span></div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Link to="/exams" className="btn btn-primary">📝 Take Another Exam</Link>
        <Link to="/my-results" className="btn btn-secondary">📊 View All Results</Link>
      </div>
    </Layout>
  );
};

export default ExamResult;
