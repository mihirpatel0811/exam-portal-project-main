import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="unauth-page">
    <h1>403</h1>
    <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Access Denied</p>
    <p style={{ color: 'var(--text-muted)', maxWidth: 380, textAlign: 'center', fontSize: 14 }}>
      You don't have permission to view this page. Please contact your administrator if you believe this is an error.
    </p>
    <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 8 }}>
      ← Back to Dashboard
    </Link>
  </div>
);

export default Unauthorized;
