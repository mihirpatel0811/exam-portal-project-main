import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navConfig = {
  student: [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/exams', icon: '📝', label: 'Available Exams' },
    { to: '/my-results', icon: '📊', label: 'My Results' },
  ],
  teacher: [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/manage-exams', icon: '📚', label: 'Manage Exams' },
    { to: '/results', icon: '📊', label: 'View Results' },
  ],
  admin: [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/manage-users', icon: '👥', label: 'Manage Users' },
    { to: '/manage-exams', icon: '📚', label: 'Manage Exams' },
    { to: '/results', icon: '📊', label: 'Results & Analytics' },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const links = navConfig[user?.role] || [];
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🎓</div>
        <h1>Exam<span>Portal</span></h1>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-title">Navigation</p>
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>🚪 Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;
