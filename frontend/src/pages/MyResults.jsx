import { useState, useEffect } from 'react';
import { resultAPI } from '../services/api';
import Layout from '../components/Layout';

const MyResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resultAPI.getMyResults()
      .then(r => setResults(r.data.results))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="loading-screen"><div className="spinner" /></div></Layout>;

  const avgScore = results.length ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length) : 0;
  const passed = results.filter(r => r.percentage >= 50).length;

  return (
    <Layout>
      <div className="topbar">
        <div>
          <h2 className="topbar-title">📊 My Results</h2>
          <p className="topbar-subtitle">Track your exam history</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Exams Taken', value: results.length, icon: '📝', color: 'var(--primary)', bg: 'rgba(99,102,241,0.15)' },
          { label: 'Passed', value: passed, icon: '✅', color: 'var(--success)', bg: 'rgba(16,185,129,0.15)' },
          { label: 'Failed', value: results.length - passed, icon: '❌', color: 'var(--danger)', bg: 'rgba(239,68,68,0.15)' },
          { label: 'Average Score', value: `${avgScore}%`, icon: '📈', color: 'var(--secondary)', bg: 'rgba(6,182,212,0.15)' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ '--stat-color': s.color, '--stat-bg': s.bg }}>
            <div className="stat-icon">{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">No results yet</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Take an exam to see your results here</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Exam</th><th>Category</th><th>Score</th><th>Percentage</th><th>Status</th><th>Time Taken</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => {
                  const mins = r.timeTaken ? Math.floor(r.timeTaken / 60) : 0;
                  const secs = r.timeTaken ? r.timeTaken % 60 : 0;
                  return (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 600 }}>{r.examId?.title || 'N/A'}</td>
                      <td><span className="badge badge-secondary">{r.examId?.category || '-'}</span></td>
                      <td>{r.score} / {r.totalMarks}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar-container" style={{ width: 70 }}>
                            <div className="progress-bar-fill" style={{ width: `${r.percentage}%` }} />
                          </div>
                          <span style={{ fontSize: 13 }}>{r.percentage}%</span>
                        </div>
                      </td>
                      <td><span className={`badge ${r.percentage >= 50 ? 'badge-success' : 'badge-danger'}`}>{r.percentage >= 50 ? '✓ Passed' : '✗ Failed'}</span></td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{mins}m {secs}s</td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(r.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MyResults;
