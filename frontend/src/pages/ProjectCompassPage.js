import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { getApiBase } from '../utils/api';

export default function ProjectCompassPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggle, label } = useTheme();
  const apiBase = useMemo(() => `${getApiBase()}/project-compass`, []);

  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [membersOwner, setMembersOwner] = useState('');
  const [form, setForm] = useState({ title: '', desc: '', roles: '', skills: '' });
  const [requests, setRequests] = useState([]);

  const myEmail = (user?.email || user?.username || '').trim().toLowerCase();
  const myName = user?.name || user?.username || 'Project Lead';

  const loadProjects = useCallback(async () => {
    const res = await fetch(apiBase);
    const data = await res.json();
    setProjects(Array.isArray(data) ? data.reverse() : []);
  }, [apiBase]);

  const createProject = async () => {
    if (!form.title || !form.desc || !form.roles || !form.skills) {
      alert('Fill all fields');
      return;
    }
    const payload = {
      projectTitle: form.title,
      projectDescription: form.desc,
      requiredSkills: form.skills,
      projectRoles: form.roles,
      createdBy: myEmail,
      ownerName: myName,
    };
    const res = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert('Failed to create project');
      return;
    }
    setModalOpen(false);
    setForm({ title: '', desc: '', roles: '', skills: '' });
    loadProjects();
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await fetch(`${apiBase}/${id}?email=${encodeURIComponent(myEmail)}`, { method: 'DELETE' });
    loadProjects();
  };

  const viewMembers = async (id, ownerName) => {
    const res = await fetch(`${apiBase}/${id}/members`);
    const data = await res.json();
    setMembers(data || []);
    setMembersOwner(ownerName);
    setMembersOpen(true);
  };

  const loadRequests = useCallback(async () => {
    if (!myEmail) return;
    const res = await fetch(`${apiBase}/requests?email=${encodeURIComponent(myEmail)}&t=${Date.now()}`);
    const data = await res.json();
    setRequests(Array.isArray(data) ? data : []);
  }, [apiBase, myEmail]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProjects();
    loadRequests();
    const interval = setInterval(loadRequests, 3000);
    return () => clearInterval(interval);
  }, [user, navigate, loadProjects, loadRequests]);

  const updateStatus = async (id, status) => {
    await fetch(`${apiBase}/requests/${id}/status?status=${status}`, { method: 'PUT' });
    loadRequests();
  };

  const actions = [
    { label: 'Requests', onClick: () => setRequestsOpen(true) },
    { label: '🏠 Home', onClick: () => navigate('/') },
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  return (
    <>
      <Header title="🧭 Project Compass" actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Projects</h2>
            <button className="header-btn" type="button" onClick={() => setModalOpen(true)}>
              ➕ Create Project
            </button>
          </div>

          <div id="projectList" className="home-grid">
            {projects.length === 0 && <p>No projects found.</p>}
            {projects.map((p) => {
              const ownerEmail = (p.createdBy || '').toLowerCase();
              const isOwner = ownerEmail === myEmail;
              return (
                <div key={p.id} className="project-card">
                  <h3>{p.projectTitle}</h3>
                  <p className="desc">{p.projectDescription}</p>
                  {p.projectRoles && (
                    <div className="roles-section">
                      <strong style={{ color: '#6c63ff' }}>🎯 Looking For:</strong> {p.projectRoles}
                    </div>
                  )}
                  <div style={{ margin: '10px 0' }}>
                    {p.requiredSkills
                      ?.split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((s) => (
                        <span key={s} className="skill-tag">
                          {s}
                        </span>
                      ))}
                  </div>
                  <div className="card-actions">
                    {isOwner ? (
                      <button className="action-btn btn-delete" type="button" onClick={() => deleteProject(p.id)}>
                        🗑 Delete
                      </button>
                    ) : (
                      <button className="action-btn btn-join" type="button" onClick={() => navigate(`/join-project/${p.id}`)}>
                        👋 Join Team
                      </button>
                    )}
                    <button
                      className="action-btn btn-members"
                      type="button"
                      onClick={() => viewMembers(p.id, p.ownerName || 'Project Lead')}
                    >
                      👥 Team
                    </button>
                    {isOwner && <span className="owner-badge">👑 Your Project</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {modalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <h3>Create Project</h3>
            <input
              id="modal-title"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              id="modal-desc"
              placeholder="Description"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
            />
            <input
              id="modal-roles"
              placeholder="Open Roles"
              value={form.roles}
              onChange={(e) => setForm({ ...form, roles: e.target.value })}
            />
            <input
              id="modal-skills"
              placeholder="Required Skills (comma separated)"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="button" onClick={createProject}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {requestsOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <h3>Join Requests</h3>
            {requests.length === 0 && <p>No pending requests.</p>}
            {requests.map((r) => (
              <div key={r.id} className="request-card">
                <p>
                  <b>Applicant:</b> {r.applicantName || r.applicantEmail}
                </p>
                <p>
                  <b>Proof:</b>{' '}
                  <a href={r.skillProof} target="_blank" rel="noreferrer" style={{ color: '#fff' }}>
                    View
                  </a>
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-accept" type="button" onClick={() => updateStatus(r.id, 'ACCEPTED')}>
                    Accept
                  </button>
                  <button className="btn-reject" type="button" onClick={() => updateStatus(r.id, 'REJECTED')}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
            <button type="button" style={{ marginTop: '12px' }} onClick={() => setRequestsOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {membersOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #bae6fd' }}>
              <small style={{ color: '#0284c7', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>Project Owner</small>
              <div style={{ fontWeight: 700, color: '#111', fontSize: '1.1rem', marginTop: '4px' }}>👑 {membersOwner}</div>
            </div>
            <h4 style={{ marginBottom: '12px', fontSize: '1rem', color: '#333', fontWeight: 700 }}>Team Members</h4>
            {members.length === 0 && <p style={{ color: '#666', fontWeight: 500 }}>No members yet.</p>}
            {members.map((m) => (
              <div key={m.id} className="member-item" style={{ borderBottom: '1px solid #e5e7eb' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#000', fontSize: '1rem' }}>{m.applicantName || m.applicantEmail.split('@')[0]}</div>
                  <div style={{ fontSize: '0.85rem', color: '#555', fontWeight: 500 }}>{m.applicantEmail}</div>
                </div>
                <a href={m.skillProof} target="_blank" rel="noreferrer" style={{ color: '#6c63ff', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                  View Profile
                </a>
              </div>
            ))}
            <button type="button" style={{ marginTop: '12px' }} onClick={() => setMembersOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
      <Footer text="© 2025 Campus Connect | Project Compass" />
    </>
  );
}
