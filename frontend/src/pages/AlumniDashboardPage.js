import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { getApiBase } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function AlumniDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggle, label } = useTheme();

  const [requests, setRequests] = useState([]);
  const alumniId = user?.id;

  const loadRequests = useCallback(() => {
    fetch(`${getApiBase()}/mentorship/requests/${alumniId}`)
      .then((res) => res.json())
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]));
  }, [alumniId]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadRequests();
    fetch(`${getApiBase()}/notifications/${alumniId}/seen-by-type?type=REQUEST`, { method: 'PUT' }).catch(() => {});
  }, [user, navigate, alumniId, loadRequests]);

  const updateStatus = async (id, status) => {
    await fetch(`${getApiBase()}/mentorship/${id}/status?status=${status}`, { method: 'PUT' });
    loadRequests();
  };

  const openChat = (id) => {
    navigate(`/chat/${id}`);
  };

  const actions = [
    { label: 'Mentorship', onClick: () => navigate('/mentorship') },
    { label: 'Recent Chats', onClick: () => navigate('/recent-chats') },
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  const pending = requests.filter((r) => r.status === 'PENDING');
  const accepted = requests.filter((r) => r.status === 'ACCEPTED');

  return (
    <>
      <Header title="🎓 Alumni Dashboard" actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <section className="card">
          <h3>Pending Requests</h3>
          {pending.length === 0 && <p>No pending requests</p>}
          {pending.map((r) => (
            <div key={r.id} className="request-card">
              <h4>{r.studentName}</h4>
              <p><b>Email:</b> {r.studentEmail}</p>
              <p><b>Category:</b> {r.category}</p>
              <p><b>Message:</b> {r.message}</p>
              <div className="actions">
                <button className="btn accept" type="button" onClick={() => updateStatus(r.id, 'ACCEPTED')}>Accept</button>
                <button className="btn reject" type="button" onClick={() => updateStatus(r.id, 'REJECTED')}>Reject</button>
              </div>
            </div>
          ))}
        </section>

        <section className="card">
          <h3>Accepted Mentorships</h3>
          {accepted.length === 0 && <p>No accepted mentorships</p>}
          {accepted.map((r) => (
            <div key={r.id} className="request-card">
              <h4>{r.studentName}</h4>
              <p><b>Email:</b> {r.studentEmail}</p>
              <p><b>Category:</b> {r.category}</p>
              <p><b>Message:</b> {r.message}</p>
              <button className="btn chat" type="button" onClick={() => openChat(r.id)}>💬 Open Chat</button>
            </div>
          ))}
        </section>
      </main>
      <Footer text="© 2025 Campus Connect | Alumni" />
    </>
  );
}
