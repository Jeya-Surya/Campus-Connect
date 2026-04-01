import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { getApiBase } from '../utils/api';

export default function RecentChatsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggle, label } = useTheme();
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const role = localStorage.getItem('mentorshipRole');
    fetch(`${getApiBase()}/chat/recent?userId=${user.id}&role=${role || ''}`)
      .then((res) => res.json())
      .then((data) => setChats(Array.isArray(data) ? data : []))
      .catch(() => setChats([]));
  }, [user, navigate]);

  const actions = [
    { label: '🏠 Home', onClick: () => navigate('/') },
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  return (
    <>
      <Header title="💬 Recent Chats" actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <section className="card">
          <h3>Accepted Mentorship Chats</h3>
          {chats.length === 0 && <p>No chats yet.</p>}
          <div className="home-grid">
            {chats.map((c) => (
              <div key={c.mentorshipRequestId} className="home-card">
                <h4>{c.peerName}</h4>
                <p>{c.lastMessagePreview}</p>
                <button type="button" className="header-btn" onClick={() => navigate(`/chat/${c.mentorshipRequestId}`)}>
                  Open Chat
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer text="© 2025 Campus Connect | Mentorship" />
    </>
  );
}
