import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import Layout from '../components/Layout';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const loadUsers = () => userAPI.getAll().then(r => setUsers(r.data.users)).catch(() => {});

  useEffect(() => { loadUsers().finally(() => setLoading(false)); }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openEdit = (u) => { setEditingUser(u); setEditForm({ name: u.name, role: u.role, isActive: u.isActive }); };

  const saveUser = async () => {
    setSaving(true);
    try {
      await userAPI.update(editingUser._id, editForm);
      await loadUsers();
      setEditingUser(null);
    } catch (err) { alert(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Permanently delete this user?')) return;
    await userAPI.delete(id);
    await loadUsers();
  };

  const toggleActive = async (u) => {
    await userAPI.update(u._id, { isActive: !u.isActive });
    await loadUsers();
  };

  if (loading) return <Layout><div className="loading-screen"><div className="spinner" /></div></Layout>;

  const counts = { all: users.length, student: users.filter(u => u.role === 'student').length, teacher: users.filter(u => u.role === 'teacher').length, admin: users.filter(u => u.role === 'admin').length };

  return (
    <Layout>
      <div className="topbar">
        <div>
          <h2 className="topbar-title">👥 Manage Users</h2>
          <p className="topbar-subtitle">{users.length} registered users</p>
        </div>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total', value: counts.all, icon: '👥', color: 'var(--primary)', bg: 'rgba(99,102,241,0.15)' },
          { label: 'Students', value: counts.student, icon: '🎓', color: 'var(--success)', bg: 'rgba(16,185,129,0.15)' },
          { label: 'Teachers', value: counts.teacher, icon: '👩‍🏫', color: 'var(--accent)', bg: 'rgba(245,158,11,0.15)' },
          { label: 'Admins', value: counts.admin, icon: '👨‍💼', color: 'var(--secondary)', bg: 'rgba(6,182,212,0.15)' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ '--stat-color': s.color, '--stat-bg': s.bg }}>
            <div className="stat-icon">{s.icon}</div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Role Filter */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        {['all', 'student', 'teacher', 'admin'].map(r => (
          <button key={r} className={`tab-btn ${roleFilter === r ? 'active' : ''}`} onClick={() => setRoleFilter(r)}>
            {r.charAt(0).toUpperCase() + r.slice(1)} ({counts[r]})
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                        {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-primary' : u.role === 'teacher' ? 'badge-warning' : 'badge-success'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {u.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(u)}>✏️ Edit</button>
                      <button className="btn btn-sm btn-secondary" onClick={() => toggleActive(u)}>
                        {u.isActive ? '🔒 Deactivate' : '🔓 Activate'}
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u._id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">No users found</div></div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">✏️ Edit User</span>
              <button className="modal-close" onClick={() => setEditingUser(null)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-control" value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })} />
                Account Active
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveUser} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ManageUsers;
