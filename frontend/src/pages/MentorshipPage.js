import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { getApiBase } from '../utils/api';

export default function MentorshipPage() {
  const { user, logout } = useAuth();
  const { toggle, label } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('student');
  const [alumni, setAlumni] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [form, setForm] = useState({
    studentName: '',
    studentEmail: '',
    message: '',
    category: 'CAREER',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setForm((prev) => ({ ...prev, studentName: user.name || '', studentEmail: user.email || '' }));
    fetch(`${getApiBase()}/alumni`)
      .then((res) => res.json())
      .then((data) => setAlumni(Array.isArray(data) ? data : []))
      .catch(() => setAlumni([]));
  }, [user, navigate]);

  const sendRequest = async () => {
    if (!selectedAlumni) return;
    const { studentName, studentEmail, message, category } = form;
    if (!studentName || !studentEmail || !message) {
      alert('Fill all fields');
      return;
    }
    const url = `${getApiBase()}/mentorship/send/${selectedAlumni.id}?studentName=${encodeURIComponent(
      studentName,
    )}&studentEmail=${encodeURIComponent(studentEmail)}&message=${encodeURIComponent(message)}&category=${encodeURIComponent(category)}`;
    try {
      await fetch(url, { method: 'POST' });
      alert('✅ Mentorship request sent');
      setModalOpen(false);
      setSelectedAlumni(null);
    } catch {
      alert('Failed to send request');
    }
  };

  const actions = [
    { label: 'Student Dashboard', onClick: () => navigate('/student/dashboard') },
    { label: 'Alumni Dashboard', onClick: () => navigate('/alumni/dashboard') },
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  return (
    <>
      <Header title="🎓 Mentorship" actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <div className="tab-switcher" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button className={`header-btn ${activeTab === 'student' ? '' : 'secondary'}`} type="button" onClick={() => setActiveTab('student')}>
            For Students
          </button>
          <button className={`header-btn ${activeTab === 'alumni' ? '' : 'secondary'}`} type="button" onClick={() => setActiveTab('alumni')}>
            For Alumni
          </button>
        </div>

        {activeTab === 'student' && (
          <section id="studentSection" className="card active">
            <h2>Find Alumni Mentors</h2>
            <div id="alumniList" className="home-grid">
              {alumni.length === 0 && <p>No alumni mentors yet.</p>}
              {alumni.map((a) => (
                <div key={a.id} className="mentor-card">
                  <h3>{a.name || 'Alumni Mentor'}</h3>
                  <p>🎓 {a.dept} ({a.gradYear})</p>
                  <p>💼 {a.company} - {a.role}</p>
                  <p>🏙️ {a.location || 'Not specified'}</p>
                  <p>🌟 {a.helpAreas}</p>
                  <button className="connectBtn" type="button" onClick={() => { setSelectedAlumni(a); setModalOpen(true); }}>
                    🤝 Connect
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'alumni' && (
          <section id="alumniSection" className="card active">
            <h2>Alumni Mentors</h2>
            <p>Already a mentor? Manage requests in your dashboard.</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="button" className="header-btn" onClick={() => navigate('/alumni/dashboard')}>Go to Alumni Dashboard</button>
              <button type="button" className="header-btn" onClick={() => navigate('/alumni/onboarding')}>Create Mentor Profile</button>
            </div>
          </section>
        )}
      </main>

      {modalOpen && selectedAlumni && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <h3>Request Mentorship with {selectedAlumni.name}</h3>
            <input
              id="studentName"
              placeholder="Your Name"
              value={form.studentName}
              onChange={(e) => setForm({ ...form, studentName: e.target.value })}
            />
            <input
              id="studentEmail"
              placeholder="Your Email"
              value={form.studentEmail}
              onChange={(e) => setForm({ ...form, studentEmail: e.target.value })}
            />
            <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="CAREER">Career</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="HIGHER_STUDIES">Higher Studies</option>
              <option value="REFERRAL">Referral</option>
            </select>
            <textarea
              id="message"
              placeholder="How can they help you?"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button type="button" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="button" onClick={sendRequest}>Send Request</button>
            </div>
          </div>
        </div>
      )}

      <Footer text="© 2025 Campus Connect | Mentorship" />
    </>
  );
}
