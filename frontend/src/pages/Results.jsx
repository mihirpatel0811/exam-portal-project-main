import { useState, useEffect } from 'react';
import { resultAPI } from '../services/api';
import Layout from '../components/Layout';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    resultAPI.getAll()
      .then(r => setResults(r.data.results))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = results.filter(r =>
    r.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.examId?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
    : 0;
  const passed = results.filter(r => r.percentage >= 50).length;

  if (loading) return <Layout><div className="loading-screen"><div className="spinner" /></div></Layout>;

  return (
    <Layout>
      <div className="topbar">
        <div>
          <h2 className="topbar-title">📊 Results & Analytics</h2>
          <p className="topbar-subtitle">{results.length} total submissions</p>
        </div>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search student or exam…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Submissions', value: results.length, icon: '📝', color: 'var(--primary)', bg: 'rgba(99,102,241,0.15)' },
          { label: 'Passed', value: passed, icon: '✅', color: 'var(--success)', bg: 'rgba(16,185,129,0.15)' },
          { label: 'Failed', value: results.length - passed, icon: '❌', color: 'var(--danger)', bg: 'rgba(239,68,68,0.15)' },
          { label: 'Avg Score', value: `${avgScore}%`, icon: '📈', color: 'var(--secondary)', bg: 'rgba(6,182,212,0.15)' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ '--stat-color': s.color, '--stat-bg': s.bg }}>
            <div className="stat-icon">{s.icon}</div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Results Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">No submissions yet</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Category</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Time Taken</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const mins = r.timeTaken ? Math.floor(r.timeTaken / 60) : 0;
                  const secs = r.timeTaken ? r.timeTaken % 60 : 0;
                  return (
                    <tr key={r._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.userId?.name || 'N/A'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.userId?.email}</div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{r.examId?.title || 'N/A'}</td>
                      <td>
                        <span className="badge badge-secondary">{r.examId?.category || '-'}</span>
                      </td>
                      <td>{r.score} / {r.totalMarks}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar-container" style={{ width: 70 }}>
                            <div className="progress-bar-fill" style={{ width: `${r.percentage}%` }} />
                          </div>
                          <span style={{ fontSize: 13 }}>{r.percentage}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${r.percentage >= 50 ? 'badge-success' : 'badge-danger'}`}>
                          {r.percentage >= 50 ? '✓ Passed' : '✗ Failed'}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{mins}m {secs}s</td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {new Date(r.submittedAt).toLocaleDateString()}<br />
                        <span style={{ fontSize: 11 }}>{new Date(r.submittedAt).toLocaleTimeString()}</span>
                      </td>
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

export default Results;
