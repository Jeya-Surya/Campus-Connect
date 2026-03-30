import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { getApiBase } from '../utils/api';

export default function StudyGroupsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggle, label } = useTheme();
  const apiBase = useMemo(() => `${getApiBase()}/study-groups`, []);

  const [clubs, setClubs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', desc: '', emoji: '🚀' });

  const myEmail = user?.email || user?.username || '';
  const myName = user?.name || user?.username || 'Student';

  const loadClubs = useCallback(async () => {
    try {
      const res = await fetch(apiBase);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setClubs(Array.isArray(data) ? data : []);
    } catch (err) {
      setClubs([]);
    }
  }, [apiBase]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadClubs();
  }, [user, navigate, loadClubs]);

  const createClub = async () => {
    if (!form.name || !form.desc) {
      alert('Please fill out all fields.');
      return;
    }
    const payload = { name: form.name, description: form.desc, emoji: form.emoji || '🚀', createdBy: myEmail };
    const res = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert('Failed to create club');
      return;
    }
    const data = await res.json();
    setModalOpen(false);
    setForm({ name: '', desc: '', emoji: '🚀' });
    await joinClub(data.id, true);
  };

  const joinClub = async (clubId, fromCreate = false) => {
    const payload = { userEmail: myEmail, userName: myName };
    const res = await fetch(`${apiBase}/${clubId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok || res.status === 400) {
      if (fromCreate) setModalOpen(false);
      navigate(`/group-room/${clubId}`);
    } else {
      alert('Could not enter club.');
    }
  };

  const actions = [
    { label: '🏠 Home', onClick: () => navigate('/') },
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  return (
    <>
      <Header title="👥 Study Groups" actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Clubs</h2>
            <button className="header-btn" type="button" onClick={() => setModalOpen(true)}>
              ➕ Create Club
            </button>
          </div>
          <div id="clubList" className="home-grid">
            {clubs.length === 0 && <p>No clubs yet. Be the first to start one!</p>}
            {clubs.map((club) => (
              <div key={club.id} className="club-card">
                <div className="club-emoji">{club.emoji || '🚀'}</div>
                <h3>{club.name}</h3>
                <p>{club.description}</p>
                <button className="btn-join-club" type="button" onClick={() => joinClub(club.id)}>
                  Enter Room
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {modalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <h3>Create Club</h3>
            <input placeholder="Club Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <textarea placeholder="Description" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
            <input placeholder="Emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="button" onClick={createClub}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer text="© 2025 Campus Connect | Study Groups" />
    </>
  );
}
