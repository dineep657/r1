import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2 } from 'lucide-react';
import { authAPI } from '../services/api';

const Signup = ({ setUser }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    // Validate name - no numbers allowed
    if (/\d/.test(name)) {
      setError('Name cannot contain numbers');
      return;
    }

    // Validate name - should contain only letters and spaces
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      setError('Name can only contain letters and spaces');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.signup({ 
        name, 
        email, 
        password, 
        confirmPassword 
      });
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setUser(response.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #312e81, #7c3aed, #db2777)',
      padding: '2rem',
    },
    card: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(16px)',
      padding: '2.5rem',
      borderRadius: '16px',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      width: '100%',
      maxWidth: '450px',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    iconContainer: {
      width: '64px',
      height: '64px',
      margin: '0 auto 1rem',
      background: 'rgba(167, 139, 250, 0.1)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '1rem',
    },
    error: {
      color: '#ef4444',
      fontSize: '0.875rem',
      marginBottom: '1rem',
      padding: '0.75rem',
      background: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '0.5rem',
      border: '1px solid rgba(239, 68, 68, 0.3)',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    label: {
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    input: {
      width: '100%',
      padding: '0.875rem',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '1rem',
      color: 'white',
      transition: 'all 0.3s ease',
    },
    button: {
      width: '100%',
      padding: '0.875rem',
      background: '#9333ea',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    footer: {
      marginTop: '2rem',
      textAlign: 'center',
    },
    footerText: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '0.875rem',
      marginBottom: '1rem',
    },
    link: {
      color: '#a78bfa',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '600',
      textDecoration: 'underline',
    },
    backLink: {
      color: 'rgba(255, 255, 255, 0.6)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <Code2 style={{ width: '100%', height: '100%', color: '#a78bfa' }} />
          </div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join the collaborative coding revolution</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                // Prevent numbers from being entered
                const value = e.target.value.replace(/\d/g, '');
                setName(value);
              }}
              placeholder="John Doe"
              style={styles.input}
              disabled={loading}
              onFocus={(e) => e.target.style.borderColor = '#a78bfa'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
              disabled={loading}
              onFocus={(e) => e.target.style.borderColor = '#a78bfa'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              disabled={loading}
              onFocus={(e) => e.target.style.borderColor = '#a78bfa'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              style={styles.input}
              disabled={loading}
              onFocus={(e) => e.target.style.borderColor = '#a78bfa'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#7c3aed')}
            onMouseLeave={(e) => !loading && (e.target.style.background = '#9333ea')}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              style={styles.link}
              disabled={loading}
            >
              Login
            </button>
          </p>
          <button
            onClick={() => navigate('/')}
            style={styles.backLink}
            disabled={loading}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;