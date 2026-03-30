import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';

export default function StudentHomePage() {
  const { logout } = useAuth();
  const { toggle, label } = useTheme();
  const navigate = useNavigate();

  const actions = [
    { label: 'Mentorship', onClick: () => navigate('/mentorship') },
    { label: 'Dashboard', onClick: () => navigate('/student/dashboard') },
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  return (
    <>
      <Header title="🎓 Student Home" actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <section className="post-form">
          <h2>Welcome Student</h2>
          <p>Access mentorship, study groups, and recent chats from here.</p>
          <div className="feature-grid">
            <button type="button" className="feature-card" onClick={() => navigate('/mentorship')}>
              <h3>Mentorship</h3>
              <p>Find alumni mentors and request guidance.</p>
            </button>
            <button type="button" className="feature-card" onClick={() => navigate('/recent-chats')}>
              <h3>Recent Chats</h3>
              <p>Jump back into mentorship conversations.</p>
            </button>
            <button type="button" className="feature-card" onClick={() => navigate('/studygroups')}>
              <h3>Study Groups</h3>
              <p>Join or create clubs for collaboration.</p>
            </button>
          </div>
        </section>
      </main>
      <Footer text="© 2025 Campus Connect | Students" />
    </>
  );
}
