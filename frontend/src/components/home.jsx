// frontend/src/components/Home.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Users, Zap, Shield } from 'lucide-react';

const Home = ({ user }) => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  const generateRoomId = () => {
    return 'room-' + Math.random().toString(36).substr(2, 9);
  };

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setShowJoinModal(true);
  };

  const handleJoinRoom = () => {
    if (roomId && userName) {
      sessionStorage.setItem('roomId', roomId);
      sessionStorage.setItem('userName', userName);
      navigate('/editor');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #312e81, #7c3aed, #db2777)',
    },
    nav: {
      background: 'rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    navContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '1rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'white',
    },
    navButtons: {
      display: 'flex',
      gap: '1rem',
    },
    loginButton: {
      padding: '0.5rem 1.5rem',
      color: 'white',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'color 0.3s',
    },
    signupButton: {
      padding: '0.5rem 1.5rem',
      background: '#9333ea',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'background 0.3s',
    },
    mainContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '5rem 1.5rem',
    },
    heroSection: {
      textAlign: 'center',
      marginBottom: '4rem',
    },
    heroTitle: {
      fontSize: '3.75rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1.5rem',
    },
    heroSubtitle: {
      fontSize: '1.25rem',
      color: '#e9d5ff',
      marginBottom: '2rem',
      maxWidth: '42rem',
      margin: '0 auto 2rem',
    },
    ctaContainer: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    createButton: {
      padding: '1rem 2rem',
      background: '#9333ea',
      color: 'white',
      fontSize: '1.125rem',
      fontWeight: '600',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    joinButton: {
      padding: '1rem 2rem',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      color: 'white',
      fontSize: '1.125rem',
      fontWeight: '600',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginTop: '5rem',
    },
    featureCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '0.75rem',
      padding: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    featureTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.75rem',
    },
    featureText: {
      color: '#e9d5ff',
      lineHeight: '1.6',
    },
    languagesSection: {
      marginTop: '5rem',
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '2rem',
    },
    languagesContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '1rem',
    },
    languageTag: {
      padding: '0.75rem 1.5rem',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '0.5rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white',
      fontWeight: '600',
    },
    modal: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
    },
    modalContent: {
      background: '#1f2937',
      borderRadius: '0.75rem',
      padding: '2rem',
      maxWidth: '28rem',
      width: '100%',
      margin: '0 1rem',
      border: '1px solid rgba(147, 51, 234, 0.3)',
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1.5rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      background: '#374151',
      color: 'white',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      border: '1px solid #4b5563',
      fontSize: '1rem',
    },
    modalButtons: {
      display: 'flex',
      gap: '0.75rem',
    },
    modalJoinButton: {
      flex: 1,
      padding: '0.75rem 1.5rem',
      background: '#9333ea',
      color: 'white',
      fontWeight: '600',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'background 0.3s',
    },
    modalCancelButton: {
      padding: '0.75rem 1.5rem',
      background: '#374151',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'background 0.3s',
    },
  };

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <Code2 style={{ width: '2rem', height: '2rem', color: '#a78bfa' }} />
            <span style={styles.logoText}>CodeCollab</span>
          </div>
          <div style={styles.navButtons}>
            {user ? (
              <span style={{ ...styles.loginButton, cursor: 'default' }}>
                Welcome, {user.name || user.email}
              </span>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  style={styles.loginButton}
                  onMouseEnter={(e) => e.target.style.color = '#c4b5fd'}
                  onMouseLeave={(e) => e.target.style.color = 'white'}
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  style={styles.signupButton}
                  onMouseEnter={(e) => e.target.style.background = '#7c3aed'}
                  onMouseLeave={(e) => e.target.style.background = '#9333ea'}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <h1 style={styles.heroTitle}>Code Together, Build Together</h1>
          <p style={styles.heroSubtitle}>
            Real-time collaborative coding platform. Write, execute, and debug code with your team in sync.
          </p>
          <div style={styles.ctaContainer}>
            <button
              onClick={handleCreateRoom}
              style={styles.createButton}
              onMouseEnter={(e) => {
                e.target.style.background = '#7c3aed';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#9333ea';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Create Room
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              style={styles.joinButton}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              Join Room
            </button>
          </div>
        </div>

        {/* Features */}
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <Users style={{ width: '3rem', height: '3rem', color: '#a78bfa', marginBottom: '1rem' }} />
            <h3 style={styles.featureTitle}>Real-time Collaboration</h3>
            <p style={styles.featureText}>
              See your team's changes instantly. Know who's typing and collaborate seamlessly.
            </p>
          </div>
          <div style={styles.featureCard}>
            <Zap style={{ width: '3rem', height: '3rem', color: '#a78bfa', marginBottom: '1rem' }} />
            <h3 style={styles.featureTitle}>Instant Execution</h3>
            <p style={styles.featureText}>
              Run JavaScript, Python, Java, and C++ code directly in your browser with live output.
            </p>
          </div>
          <div style={styles.featureCard}>
            <Shield style={{ width: '3rem', height: '3rem', color: '#a78bfa', marginBottom: '1rem' }} />
            <h3 style={styles.featureTitle}>Secure Rooms</h3>
            <p style={styles.featureText}>
              Private rooms with unique IDs. Share with your team and control who joins.
            </p>
          </div>
        </div>

        {/* Supported Languages */}
        <div style={styles.languagesSection}>
          <h2 style={styles.sectionTitle}>Supported Languages</h2>
          <div style={styles.languagesContainer}>
            {['JavaScript', 'Python', 'Java', 'C++'].map(lang => (
              <div key={lang} style={styles.languageTag}>
                {lang}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Join Room Modal */}
      {showJoinModal && (
        <div style={styles.modal} onClick={() => setShowJoinModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Join Coding Room</h2>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              style={styles.input}
            />
            <div style={styles.modalButtons}>
              <button
                onClick={handleJoinRoom}
                style={styles.modalJoinButton}
                onMouseEnter={(e) => e.target.style.background = '#7c3aed'}
                onMouseLeave={(e) => e.target.style.background = '#9333ea'}
              >
                Join Room
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                style={styles.modalCancelButton}
                onMouseEnter={(e) => e.target.style.background = '#4b5563'}
                onMouseLeave={(e) => e.target.style.background = '#374151'}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;