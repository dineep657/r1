import { useNavigate } from 'react-router-dom';
import { Code2, Users, Zap, Globe } from 'lucide-react';

const Home = ({ user, setUser }) => {
  const navigate = useNavigate();

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #312e81, #7c3aed, #db2777)',
      color: 'white',
    },
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem 2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
    navButtons: {
      display: 'flex',
      gap: '1rem',
    },
    loginButton: {
      padding: '0.75rem 1.5rem',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '0.5rem',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '1rem',
    },
    signupButton: {
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
      border: 'none',
      borderRadius: '0.5rem',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '1rem',
      fontWeight: '600',
    },
    hero: {
      textAlign: 'center',
      padding: '6rem 2rem 4rem',
      maxWidth: '1000px',
      margin: '0 auto',
    },
    title: {
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      lineHeight: '1.2',
      background: 'linear-gradient(to right, #ffffff, #e0e7ff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
      marginBottom: '3rem',
      opacity: '0.95',
      lineHeight: '1.7',
      maxWidth: '700px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    ctaButton: {
      padding: '1.125rem 2.75rem',
      background: 'white',
      color: '#7c3aed',
      border: 'none',
      borderRadius: '0.75rem',
      fontSize: '1.125rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    },
    features: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '5rem auto',
      padding: '0 2rem',
    },
    featureCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(16px)',
      padding: '2.5rem',
      borderRadius: '1.25rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s ease',
      cursor: 'default',
    },
    featureIcon: {
      width: '48px',
      height: '48px',
      marginBottom: '1rem',
    },
    featureTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '0.75rem',
    },
    featureDescription: {
      opacity: '0.9',
      lineHeight: '1.6',
    },
    section: {
      maxWidth: '1200px',
      margin: '5rem auto',
      padding: '0 2rem',
    },
    sectionTitle: {
      textAlign: 'center',
      fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
      fontWeight: '700',
      marginBottom: '3rem',
      background: 'linear-gradient(to right, #ffffff, #e0e7ff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    steps: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '1.5rem',
    },
    stepCard: {
      background: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '1rem',
      padding: '2rem',
      transition: 'all 0.3s ease',
      cursor: 'default',
    },
    stepNum: {
      display: 'inline-block',
      background: 'rgba(255, 255, 255, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      borderRadius: '999px',
      padding: '0.25rem 0.75rem',
      fontWeight: '700',
      marginBottom: '0.75rem',
    },
    testimonials: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
    },
    testimonialCard: {
      background: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '1.25rem',
      padding: '2rem',
      lineHeight: '1.7',
      transition: 'all 0.3s ease',
      cursor: 'default',
    },
    footer: {
      marginTop: '6rem',
      padding: '3rem 2rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'rgba(0, 0, 0, 0.2)',
    },
    footerInner: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '2rem',
    },
    footerLinks: {
      display: 'flex',
      gap: '1.5rem',
      opacity: 0.9,
      flexWrap: 'wrap',
    },
    footerLink: {
      color: 'rgba(255, 255, 255, 0.9)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      padding: '0.5rem 0',
      textDecoration: 'none',
    },
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <Code2 size={32} />
          <span>CodeCollab</span>
        </div>
        <div style={styles.navButtons}>
          {user ? (
            <>
              <span style={{ ...styles.loginButton, cursor: 'default' }}>
                Welcome, {user.name}
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  setUser(null);
                  navigate('/');
                }}
                style={{ ...styles.loginButton, cursor: 'pointer' }}
              >
                Logout
              </button>
              <button
                onClick={() => navigate('/editor')}
                style={styles.signupButton}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Open Editor
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                style={styles.loginButton}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                style={styles.signupButton}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      <div style={styles.hero}>
        <h1 style={styles.title}>Code Together, Build Better</h1>
        <p style={styles.subtitle}>
          Real-time collaborative coding platform with instant synchronization,
          live code execution, and seamless team communication.
        </p>

        {user ? (
          <button
            onClick={() => navigate('/editor')}
            style={styles.ctaButton}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Open Editor
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            style={styles.ctaButton}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Get Started
          </button>
        )}
      </div>

      <div style={styles.features}>
        <div 
          style={styles.featureCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Users style={styles.featureIcon} />
          <h3 style={styles.featureTitle}>Real-time Collaboration</h3>
          <p style={styles.featureDescription}>
            Code with your team in real-time. See changes instantly as they happen.
          </p>
        </div>

        <div 
          style={styles.featureCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Zap style={styles.featureIcon} />
          <h3 style={styles.featureTitle}>Live Code Execution</h3>
          <p style={styles.featureDescription}>
            Run your code instantly and see results without leaving the editor.
          </p>
        </div>

        <div 
          style={styles.featureCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Globe style={styles.featureIcon} />
          <h3 style={styles.featureTitle}>Multiple Languages</h3>
          <p style={styles.featureDescription}>
            Support for JavaScript, Python, Java, C++ and many more languages.
          </p>
        </div>
      </div>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>How it works</h2>
        <div style={styles.steps}>
          <div 
            style={styles.stepCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={styles.stepNum}>1</div>
            <h3 style={styles.featureTitle}>Create or Join a Room</h3>
            <p style={styles.featureDescription}>Spin up a new session or join your team's workspace in seconds.</p>
          </div>
          <div 
            style={styles.stepCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={styles.stepNum}>2</div>
            <h3 style={styles.featureTitle}>Collaborate in Real-time</h3>
            <p style={styles.featureDescription}>Code together with instant syncing, cursors, and presence indicators.</p>
          </div>
          <div 
            style={styles.stepCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={styles.stepNum}>3</div>
            <h3 style={styles.featureTitle}>Run & Share</h3>
            <p style={styles.featureDescription}>Run code, review outputs, and share links with one click.</p>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Loved by teams</h2>
        <div style={styles.testimonials}>
          <div 
            style={styles.testimonialCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            "CodeCollab helped us ship features 2x faster. The real-time editor is a game changer."
            <div style={{ marginTop: '0.75rem', opacity: 0.85, fontWeight: '500' }}>— dineep</div>
          </div>
          <div 
            style={styles.testimonialCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            "Pair programming feels natural and smooth. We use it daily for reviews."
            <div style={{ marginTop: '0.75rem', opacity: 0.85, fontWeight: '500' }}>— saiteja</div>
          </div>
          <div 
            style={styles.testimonialCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            "Perfect for bootcamps and workshops. Students love the instant feedback."
            <div style={{ marginTop: '0.75rem', opacity: 0.85, fontWeight: '500' }}>— saicharan</div>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.logo}>
            <Code2 size={24} />
            <span>CodeCollab</span>
          </div>
          <div style={styles.footerLinks}>
            <button 
              onClick={() => navigate('/editor')} 
              style={styles.footerLink}
              onMouseEnter={(e) => {
                e.target.style.color = '#ffffff';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Editor
            </button>
            {!user && (
              <button 
                onClick={() => navigate('/login')} 
                style={styles.footerLink}
                onMouseEnter={(e) => {
                  e.target.style.color = '#ffffff';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Login
              </button>
            )}
            {user && (
              <button 
                onClick={() => navigate('/editor')} 
                style={styles.footerLink}
                onMouseEnter={(e) => {
                  e.target.style.color = '#ffffff';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Dashboard
              </button>
            )}
          </div>
          <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>
            © {new Date().getFullYear()} CodeCollab. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;