// Add this to the navigation buttons section
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setUser(null);
  navigate('/');
};

// Update the nav buttons section:
<div style={styles.navButtons}>
  {user ? (
    <>
      <span style={{ ...styles.loginButton, cursor: 'default' }}>
        Welcome, {user.name}
      </span>
      <button
        onClick={handleLogout}
        style={styles.signupButton}
        onMouseEnter={(e) => e.target.style.background = '#dc2626'}
        onMouseLeave={(e) => e.target.style.background = '#ef4444'}
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <button
        onClick={() => navigate('/login')}
        style={styles.loginButton}
      >
        Login
      </button>
      <button
        onClick={() => navigate('/signup')}
        style={styles.signupButton}
      >
        Sign Up
      </button>
    </>
  )}
</div>