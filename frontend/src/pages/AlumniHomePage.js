import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';

export default function AlumniHomePage() {
  const { logout } = useAuth();
  const { toggle, label } = useTheme();
  const navigate = useNavigate();

  const actions = [
    { label: 'Dashboard', onClick: () => navigate('/alumni/dashboard') },
    { label: 'Onboarding', onClick: () => navigate('/alumni/onboarding') },
    { label: 'Recent Chats', onClick: () => navigate('/recent-chats') },
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  return (
    <>
      <Header title="🎓 Alumni Home" actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <section className="post-form">
          <h2>Welcome Alumni Mentor</h2>
          <p>Review mentorship requests, update your profile, and continue chats with students.</p>
          <div className="feature-grid">
            <button type="button" className="feature-card" onClick={() => navigate('/alumni/dashboard')}>
              <h3>Requests</h3>
              <p>Approve or reject mentorship requests.</p>
            </button>
            <button type="button" className="feature-card" onClick={() => navigate('/alumni/onboarding')}>
              <h3>Profile</h3>
              <p>Update your mentor profile details.</p>
            </button>
            <button type="button" className="feature-card" onClick={() => navigate('/recent-chats')}>
              <h3>Chats</h3>
              <p>Return to your mentorship conversations.</p>
            </button>
          </div>
        </section>
      </main>
      <Footer text="© 2025 Campus Connect | Alumni" />
    </>
  );
}
