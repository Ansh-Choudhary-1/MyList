import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        🎌 MyList
      </Link>

      {user ? (
        <div style={styles.right}>
          <Link to="/" style={{ ...styles.link, fontWeight: pathname === '/' ? 700 : 400 }}>
            Search
          </Link>
          <Link
            to="/mylist"
            style={{ ...styles.link, fontWeight: pathname === '/mylist' ? 700 : 400 }}
          >
            My List
          </Link>
          <Link
            to="/community"
            style={{ ...styles.link, fontWeight: pathname === '/community' ? 700 : 400 }}
          >
            Community
          </Link>
          <Link
            to={`/user/${user.username}`}
            style={styles.usernameLink}
            title="View your profile"
          >
            @{user.username}
          </Link>
          <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '7px 14px' }}>
            Logout
          </button>
        </div>
      ) : (
        <div style={styles.right}>
          <Link to="/login" className="btn btn-ghost" style={{ padding: '7px 14px' }}>
            Login
          </Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '7px 14px' }}>
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: '60px',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--primary)',
    textDecoration: 'none',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  link: {
    color: 'var(--text)',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  username: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  usernameLink: {
    color: 'var(--primary)',
    fontSize: '0.9rem',
    textDecoration: 'none',
    fontWeight: 500,
  },
};
