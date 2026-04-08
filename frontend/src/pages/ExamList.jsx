import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examAPI } from '../services/api';
import Layout from '../components/Layout';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    examAPI.getAll()
      .then(r => setExams(r.data.exams))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = exams.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Layout><div className="loading-screen"><div className="spinner" /></div></Layout>;

  return (
    <Layout>
      <div className="topbar">
        <div>
          <h2 className="topbar-title">📝 Available Exams</h2>
          <p className="topbar-subtitle">{exams.length} exams available for you</p>
        </div>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            id="exam-search"
            type="text"
            placeholder="Search exams..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <div className="empty-title">No exams found</div>
        </div>
      ) : (
        <div className="exams-grid">
          {filtered.map(exam => (
            <div
              key={exam._id}
              className="exam-card"
              onClick={() => navigate(`/exam/${exam._id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span className="badge badge-primary">{exam.category}</span>
                <span className="badge badge-success">Available</span>
              </div>

              <div className="exam-title">{exam.title}</div>
              {exam.description && (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, lineClamp: 2 }}>
                  {exam.description}
                </p>
              )}

              <div className="exam-meta">
                <span className="exam-meta-item">⏱️ {exam.duration} min</span>
                <span className="exam-meta-item">📊 {exam.totalMarks} marks</span>
                <span className="exam-meta-item">🎯 Pass: {exam.passingMarks || Math.round(exam.totalMarks * 0.5)}</span>
              </div>

              <div className="exam-footer">
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  By {exam.createdBy?.name || 'Teacher'}
                </span>
                <button className="btn btn-primary btn-sm">Start Exam →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default ExamList;
