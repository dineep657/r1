import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './components/home';
import Editor from './components/editor';
// Auth disabled: hide login/signup and allow guest access

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth disabled: create a guest user
    const existing = localStorage.getItem('guest_user');
    if (existing) {
      setUser(JSON.parse(existing));
      setLoading(false);
      return;
    }
    const guest = { id: 'guest', name: `Guest-${Math.floor(Math.random()*1000)}` };
    localStorage.setItem('guest_user', JSON.stringify(guest));
    setUser(guest);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(to bottom right, #312e81, #7c3aed, #db2777)',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} setUser={setUser} />} />
        <Route path="/editor" element={<Editor user={user || { name: 'Guest' }} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;