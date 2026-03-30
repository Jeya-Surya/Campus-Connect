import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { getApiBase } from '../utils/api';

export default function JoinProjectPage() {
  const { projectId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggle, label } = useTheme();
  const apiBase = useMemo(() => `${getApiBase()}/project-compass/apply`, []);

  const [name, setName] = useState(user?.name || '');
  const [proof, setProof] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const submit = async () => {
    if (!projectId) {
      alert('No project selected.');
      navigate('/projectcompass');
      return;
    }
    if (!name.trim() || !proof.trim()) {
      alert('Please fill all fields.');
      return;
    }
    const payload = {
      projectId: parseInt(projectId, 10),
      applicantEmail: user.email,
      applicantName: name.trim(),
      skillProof: proof.trim(),
    };
    setSubmitting(true);
    try {
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      alert('✅ Application sent! The owner will review it.');
      navigate('/projectcompass');
    } catch (err) {
      alert('❌ Failed to send application.');
    } finally {
      setSubmitting(false);
    }
  };

  const actions = [
    { label: 'Back', onClick: () => navigate(-1) },
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  return (
    <>
      <Header title="Join Project" actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <section className="post-form">
          <h2>Submit Your Application</h2>
          <input id="applicantName" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <input id="proof" placeholder="Link to your work" value={proof} onChange={(e) => setProof(e.target.value)} />
          <button type="button" onClick={submit} disabled={submitting}>
            {submitting ? 'Sending...' : 'Submit Application'}
          </button>
        </section>
      </main>
      <Footer text="© 2025 Campus Connect | Project Compass" />
    </>
  );
}
