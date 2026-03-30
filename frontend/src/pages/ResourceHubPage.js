import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApiBase } from '../utils/api';

export default function ResourceHubPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggle, label } = useTheme();
  const apiBase = useMemo(() => `${getApiBase()}/resources`, []);

  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({ type: '', subject: '', college: '', semester: '' });
  const [uploading, setUploading] = useState(false);

  const loadResources = useCallback(async () => {
    const res = await fetch(apiBase);
    const data = await res.json();
    setResources(Array.isArray(data) ? data : []);
  }, [apiBase]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadResources();
  }, [user, navigate, loadResources]);

  const search = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    const res = await fetch(`${apiBase}/search?${params.toString()}`);
    const data = await res.json();
    setResources(Array.isArray(data) ? data : []);
  };

  const upload = async (evt) => {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    setUploading(true);
    try {
      const res = await fetch(`${apiBase}/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error();
      alert('Upload successful');
      evt.target.reset();
      loadResources();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const actions = [
    { label: '🏠 Home', onClick: () => navigate('/') },
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  return (
    <>
      <Header title="📚 Resource Hub" actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <section className="card">
          <h3>📤 Upload Resource</h3>
          <form id="uploadForm" onSubmit={upload} className="rh-form-grid">
            <select name="resourceType" className="modern-input" required>
              <option value="">Resource Type</option>
              <option value="NOTES">Notes</option>
              <option value="QUESTION_PAPER">Question Paper</option>
              <option value="BOOK">Book</option>
            </select>
            <input name="title" className="modern-input" placeholder="Title" required />
            <input name="college" className="modern-input" placeholder="College" required />
            <input name="course" className="modern-input" placeholder="Course" required />
            <input name="subject" className="modern-input" placeholder="Subject" required />
            <input name="semester" className="modern-input" placeholder="Semester" type="number" required />
            <input name="file" className="modern-input rh-full" type="file" accept="application/pdf" required />
            <div className="rh-full" style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-download" type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button className="rh-btn-muted" type="button" onClick={() => navigate('/')}>
                Cancel
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <h3>🔎 Search Resources</h3>
          <div className="rh-form-grid">
            <select
              className="modern-input"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">Any Type</option>
              <option value="NOTES">Notes</option>
              <option value="QUESTION_PAPER">Question Paper</option>
              <option value="BOOK">Book</option>
            </select>
            <input
              className="modern-input"
              placeholder="Subject"
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            />
            <input
              className="modern-input"
              placeholder="College"
              value={filters.college}
              onChange={(e) => setFilters({ ...filters, college: e.target.value })}
            />
            <input
              className="modern-input"
              placeholder="Semester"
              value={filters.semester}
              onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
            />
          </div>
          <button style={{ marginTop: '12px' }} type="button" onClick={search}>
            Apply Filters
          </button>
        </section>

        <section className="card">
          <h3>Resources</h3>
          <div className="resource-grid">
            {resources.length === 0 && <p>No resources yet.</p>}
            {resources.map((r) => (
              <div key={r.id} className="resource-card">
                <div className="resource-badge">{r.resourceType}</div>
                <h4>{r.title}</h4>
                <div className="resource-info">
                  <div>College: {r.college}</div>
                  <div>Course: {r.course}</div>
                  <div>Subject: {r.subject}</div>
                  <div>Semester: {r.semester}</div>
                </div>
                <a className="btn-download" href={`${apiBase}/download/${r.id}`}>
                  ⬇️ Download
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer text="© 2025 Campus Connect | Resource Hub" />
    </>
  );
}
