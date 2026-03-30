import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

const features = [
  { title: '💬 Doubt Desk', description: 'Ask questions and get help from your peers.', path: '/doubtdesk' },
  { title: '🧭 Project Compass', description: 'Find teammates and collaborate on academic projects.', path: '/projectcompass' },
  { title: '📚 Resource Hub', description: 'Share and access study materials and resources.', path: '/resourcehub' },
  { title: '👥 Study Groups', description: 'Create or join groups for collective learning.', path: '/studygroups' },
  { title: '🎓 Mentorship', description: 'Connect with mentors and alumni for career guidance.', path: '/mentorship' },
  { title: '📅 Campus Events', description: 'Stay updated with university events and workshops.', path: '/events' },
];

export default function HomePage() {
  const { user, logout } = useAuth();
  const { toggle, label } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const actions = [
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  return (
    <>
      <Header title="🎓 Campus Connect — Home" actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <section className="post-form">
          <h2>Welcome to Campus Connect</h2>
          <p style={{ marginBottom: '20px' }}>
            Your one-stop student collaboration platform. Explore features that help you connect, learn, and grow!
          </p>

          <div className="feature-grid">
            {features.map((item) => (
              <Link key={item.title} to={item.path} className="feature-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer text="© 2025 Campus Connect | Made with ❤️ for learners" />
    </>
  );
}
