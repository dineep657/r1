// frontend/src/components/Signup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2 } from 'lucide-react';

const Signup = ({ setUser }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (name && email && password) {
      setUser({ name, email });
      navigate('/');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #312e81, #7c3aed, #db2777)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 1.5rem',
    },
    card: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(16px)',
      borderRadius: '1rem',
      padding: '2rem',
      maxWidth: '28rem',
      width: '100%',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    iconContainer: {
      margin: '0 auto 1rem',
      width: '4rem',
      height: '4rem',
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: '#e9d5ff',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      display: 'block',
      color: 'white',
      marginBottom: '0.5rem',
      fontWeight: '500',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      borderRadius: '0.5rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      fontSize: '1rem',
      transition: 'all 0.3s',
    },
    button: {
      width: '100%',
      padding: '0.75rem 1.5rem',
      background: '#9333ea',
      color: 'white',
      fontWeight: '600',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'all 0.3s',
    },
    footer: {
      marginTop: '1.5rem',
      textAlign: 'center',
    },
    footerText: {
      color: '#e9d5ff',
    },
    link: {
      color: '#a78bfa',
      fontWeight: '600',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'none',
      fontSize: '1rem',
    },
    backLink: {
      marginTop: '1rem',
      color: '#c4b5fd',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
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

        <div style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              style={styles.input}
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
              onFocus={(e) => e.target.style.borderColor = '#a78bfa'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
            />
          </div>

          <button
            onClick={handleSubmit}
            style={styles.button}
            onMouseEnter={(e) => {
              e.target.style.background = '#7c3aed';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#9333ea';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Sign Up
          </button>
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              style={styles.link}
              onMouseEnter={(e) => e.target.style.color = '#c4b5fd'}
              onMouseLeave={(e) => e.target.style.color = '#a78bfa'}
            >
              Login
            </button>
          </p>
          <button
            onClick={() => navigate('/')}
            style={styles.backLink}
            onMouseEnter={(e) => e.target.style.color = '#e9d5ff'}
            onMouseLeave={(e) => e.target.style.color = '#c4b5fd'}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;