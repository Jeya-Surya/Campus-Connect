import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { getApiBase } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function AlumniOnboardingPage() {
  const { user, logout } = useAuth();
  const { toggle, label } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    dept: '',
    gradYear: '',
    company: '',
    role: '',
    location: '',
    helpAreas: '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!user || !user.id) {
      alert('Please login first');
      navigate('/login');
      return;
    }
    if (Object.values(form).some((v) => !`${v}`.trim())) {
      alert('Please fill all fields');
      return;
    }
    setSaving(true);
    const payload = {
      userId: user.id,
      name: form.name.trim(),
      dept: form.dept.trim(),
      gradYear: Number(form.gradYear),
      company: form.company.trim(),
      role: form.role.trim(),
      location: form.location.trim(),
      helpAreas: form.helpAreas.trim(),
      email: user.email,
    };
    try {
      const res = await fetch(`${getApiBase()}/alumni`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      localStorage.setItem('alumniId', saved.id);
      alert('🎉 Alumni profile created!');
      navigate('/alumni/home');
    } catch (err) {
      alert('Failed to create alumni profile.');
    } finally {
      setSaving(false);
    }
  };

  const actions = [
    { label: '🏠 Home', onClick: () => navigate('/') },
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  return (
    <>
      <Header title="🎓 Become an Alumni Mentor" actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <section className="post-form" style={{ maxWidth: '600px', margin: 'auto' }}>
          <h2 style={{ marginBottom: '20px' }}>Create Alumni Profile</h2>
          {['name', 'dept', 'gradYear', 'company', 'role', 'location', 'helpAreas'].map((field) => (
            <input
              key={field}
              placeholder={field === 'helpAreas' ? 'Help Areas (Internships, Career, Referrals)' : field === 'dept' ? 'Field of Study' : field}
              type={field === 'gradYear' ? 'number' : 'text'}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          ))}
          <button type="button" onClick={submit} disabled={saving}>
            {saving ? 'Saving...' : 'Continue'}
          </button>
        </section>
      </main>
      <Footer text="© 2025 Campus Connect | Alumni Program" />
    </>
  );
}
