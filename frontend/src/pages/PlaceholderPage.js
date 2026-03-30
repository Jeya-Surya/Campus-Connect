import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';

export default function PlaceholderPage({ title }) {
  const { logout } = useAuth();
  const { toggle, label } = useTheme();
  const navigate = useNavigate();

  const actions = [
    { label: '🏠 Home', onClick: () => navigate('/') },
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  return (
    <>
      <Header title={title} actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <section className="post-form">
          <h2>{title}</h2>
          <p>This page has not been migrated to React yet. Existing functionality remains available in the legacy UI.</p>
        </section>
      </main>
      <Footer text="© 2025 Campus Connect" />
    </>
  );
}
