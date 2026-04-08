import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { examAPI, resultAPI, userAPI } from '../services/api';
import Layout from '../components/Layout';

/* ---------- Student Dashboard ---------- */
const StudentDashboard = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    examAPI.getAll().then(r => setExams(r.data.exams)).catch(() => {});
    resultAPI.getMyResults().then(r => setResults(r.data.results)).catch(() => {});
  }, []);

  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
    : 0;
  const passed = results.filter(r => r.percentage >= 50).length;

  return (
    <>
      <div className="topbar">
        <div>
          <h2 className="topbar-title">👋 Welcome back, {user?.name?.split(' ')[0]}!</h2>
          <p className="topbar-subtitle">Ready to ace your next exam?</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Available Exams', value: exams.length, icon: '📝', color: 'var(--primary)', bg: 'rgba(99,102,241,0.15)' },
          { label: 'Exams Taken', value: results.length, icon: '✅', color: 'var(--success)', bg: 'rgba(16,185,129,0.15)' },
          { label: 'Average Score', value: `${avgScore}%`, icon: '📈', color: 'var(--secondary)', bg: 'rgba(6,182,212,0.15)' },
          { label: 'Passed', value: passed, icon: '🏆', color: 'var(--accent)', bg: 'rgba(245,158,11,0.15)' },
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

      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>📋 Recent Results</h3>
        {results.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-title">No exams taken yet</div></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Exam</th><th>Score</th><th>Percentage</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {results.slice(0, 5).map(r => (
                  <tr key={r._id}>
                    <td>{r.examId?.title || 'N/A'}</td>
                    <td>{r.score} / {r.totalMarks}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar-container" style={{ width: 80 }}>
                          <div className="progress-bar-fill" style={{ width: `${r.percentage}%` }} />
                        </div>
                        {r.percentage}%
                      </div>
                    </td>
                    <td><span className={`badge ${r.percentage >= 50 ? 'badge-success' : 'badge-danger'}`}>{r.percentage >= 50 ? 'Passed' : 'Failed'}</span></td>
                    <td>{new Date(r.submittedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

/* ---------- Teacher Dashboard ---------- */
const TeacherDashboard = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    examAPI.getAll().then(r => setExams(r.data.exams)).catch(() => {});
    resultAPI.getAll().then(r => setResults(r.data.results)).catch(() => {});
  }, []);

  const published = exams.filter(e => e.isPublished).length;

  return (
    <>
      <div className="topbar">
        <div>
          <h2 className="topbar-title">👩‍🏫 Teacher Dashboard</h2>
          <p className="topbar-subtitle">Manage your exams and track student performance</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Exams', value: exams.length, icon: '📚', color: 'var(--primary)', bg: 'rgba(99,102,241,0.15)' },
          { label: 'Published', value: published, icon: '✅', color: 'var(--success)', bg: 'rgba(16,185,129,0.15)' },
          { label: 'Drafts', value: exams.length - published, icon: '📝', color: 'var(--accent)', bg: 'rgba(245,158,11,0.15)' },
          { label: 'Submissions', value: results.length, icon: '📊', color: 'var(--secondary)', bg: 'rgba(6,182,212,0.15)' },
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

      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>📚 Your Exams</h3>
        {exams.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📚</div><div className="empty-title">No exams created yet</div></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Title</th><th>Category</th><th>Duration</th><th>Marks</th><th>Status</th></tr></thead>
              <tbody>
                {exams.map(e => (
                  <tr key={e._id}>
                    <td style={{ fontWeight: 600 }}>{e.title}</td>
                    <td><span className="badge badge-secondary">{e.category}</span></td>
                    <td>{e.duration} min</td>
                    <td>{e.totalMarks}</td>
                    <td><span className={`badge ${e.isPublished ? 'badge-success' : 'badge-warning'}`}>{e.isPublished ? 'Published' : 'Draft'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

/* ---------- Admin Dashboard ---------- */
const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    userAPI.getAll().then(r => setUsers(r.data.users)).catch(() => {});
    examAPI.getAll().then(r => setExams(r.data.exams)).catch(() => {});
    resultAPI.getAll().then(r => setResults(r.data.results)).catch(() => {});
  }, []);

  const students = users.filter(u => u.role === 'student').length;
  const teachers = users.filter(u => u.role === 'teacher').length;
  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
    : 0;

  return (
    <>
      <div className="topbar">
        <div>
          <h2 className="topbar-title">👨‍💼 Admin Dashboard</h2>
          <p className="topbar-subtitle">System overview and analytics</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Users', value: users.length, icon: '👥', color: 'var(--primary)', bg: 'rgba(99,102,241,0.15)' },
          { label: 'Students', value: students, icon: '🎓', color: 'var(--secondary)', bg: 'rgba(6,182,212,0.15)' },
          { label: 'Teachers', value: teachers, icon: '👩‍🏫', color: 'var(--accent)', bg: 'rgba(245,158,11,0.15)' },
          { label: 'Total Exams', value: exams.length, icon: '📚', color: 'var(--success)', bg: 'rgba(16,185,129,0.15)' },
          { label: 'Submissions', value: results.length, icon: '📝', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
          { label: 'Avg Score', value: `${avgScore}%`, icon: '📈', color: 'var(--danger)', bg: 'rgba(239,68,68,0.15)' },
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>👥 Recent Users</h3>
          <div className="table-container">
            <table>
              <thead><tr><th>Name</th><th>Role</th><th>Status</th></tr></thead>
              <tbody>
                {users.slice(0, 6).map(u => (
                  <tr key={u._id}>
                    <td><div style={{ fontWeight: 600 }}>{u.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div></td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-primary' : u.role === 'teacher' ? 'badge-warning' : 'badge-success'}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>📊 Recent Submissions</h3>
          <div className="table-container">
            <table>
              <thead><tr><th>Student</th><th>Exam</th><th>Score</th></tr></thead>
              <tbody>
                {results.slice(0, 6).map(r => (
                  <tr key={r._id}>
                    <td>{r.userId?.name || 'N/A'}</td>
                    <td>{r.examId?.title || 'N/A'}</td>
                    <td><span className={`badge ${r.percentage >= 50 ? 'badge-success' : 'badge-danger'}`}>{r.percentage}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

/* ---------- Main Dashboard (role router) ---------- */
const Dashboard = () => {
  const { user } = useAuth();
  return (
    <Layout>
      {user?.role === 'admin' && <AdminDashboard />}
      {user?.role === 'teacher' && <TeacherDashboard />}
      {user?.role === 'student' && <StudentDashboard />}
    </Layout>
  );
};

export default Dashboard;
