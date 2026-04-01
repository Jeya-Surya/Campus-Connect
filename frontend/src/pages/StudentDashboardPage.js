import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { getApiBase } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggle, label } = useTheme();

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const email = user.email;
    fetch(`${getApiBase()}/mentorship/student/requests?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]));
  }, [user, navigate]);

  const actions = [
    { label: 'Mentorship', onClick: () => navigate('/mentorship') },
    { label: 'Recent Chats', onClick: () => navigate('/recent-chats') },
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  return (
    <>
      <Header title="📚 Student Dashboard" actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <section className="card">
          <h3>Your Mentorship Requests</h3>
          {requests.length === 0 && <p>No mentorship requests yet</p>}
          {requests.map((r) => (
            <div key={r.id} className="resource-card">
              <h4>{r.category}</h4>
              <div className="resource-meta">
                <span>📅 {r.requestDate}</span>
                <span>Status: <b>{r.status}</b></span>
              </div>
              <p>{r.message}</p>
              {r.status === 'ACCEPTED' && (
                <button type="button" className="header-btn" onClick={() => navigate(`/chat/${r.id}`)}>
                  💬 Open Chat
                </button>
              )}
            </div>
          ))}
        </section>
      </main>
      <Footer text="© 2025 Campus Connect | Students" />
    </>
  );
}
