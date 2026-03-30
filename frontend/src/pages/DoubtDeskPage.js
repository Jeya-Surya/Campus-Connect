import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { getApiBase } from '../utils/api';

export default function DoubtDeskPage() {
  const { user, logout } = useAuth();
  const { toggle, label } = useTheme();
  const navigate = useNavigate();
  const api = useMemo(() => `${getApiBase()}/doubts`, []);

  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', author: '' });
  const [answerInputs, setAnswerInputs] = useState({});
  const [posting, setPosting] = useState(false);

  const fetchDoubts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(api);
      if (!res.ok) throw new Error('Failed to fetch doubts');
      const data = await res.json();
      setDoubts(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Error loading doubts.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDoubts();
  }, [user, navigate, fetchDoubts]);

  const handlePost = async () => {
    const title = form.title.trim();
    const description = form.description.trim();
    const author = form.author.trim() || 'Anonymous';
    if (!title || !description) {
      setError('Provide title and description');
      return;
    }

    setPosting(true);
    try {
      const res = await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, author }),
      });
      if (!res.ok) throw new Error('Post failed');
      setForm({ title: '', description: '', author: '' });
      await fetchDoubts();
    } catch (err) {
      setError('Failed to post doubt');
    } finally {
      setPosting(false);
    }
  };

  const handleAnswerInput = (id, field, value) => {
    setAnswerInputs((prev) => ({
      ...prev,
      [id]: {
        author: field === 'author' ? value : prev[id]?.author || '',
        text: field === 'text' ? value : prev[id]?.text || '',
      },
    }));
  };

  const submitAnswer = async (doubtId) => {
    const entry = answerInputs[doubtId] || {};
    const author = (entry.author || '').trim() || 'Anonymous';
    const text = (entry.text || '').trim();
    if (!text) {
      setError('Enter an answer');
      return;
    }

    try {
      const res = await fetch(`${api}/${doubtId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, text }),
      });
      if (!res.ok) throw new Error('Failed to submit answer');

      setDoubts((prev) =>
        prev.map((d) =>
          d.id === doubtId
            ? { ...d, answers: [...(d.answers || []), { author, text }] }
            : d,
        ),
      );
      setAnswerInputs((prev) => ({ ...prev, [doubtId]: { author: '', text: '' } }));
      setError('');
    } catch (err) {
      setError('Failed to submit answer');
    }
  };

  const actions = [
    { label: '🏠 Home', onClick: () => navigate('/') },
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  return (
    <>
      <Header title="📘 Campus Connect — Doubt Desk" actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <section className="post-form">
          <h2>Ask a Doubt</h2>
          <input
            id="title"
            placeholder="Title (e.g. Binary Tree traversal question)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            id="description"
            placeholder="Describe your doubt in detail"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            id="author"
            placeholder="Your name, course & year"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
          {error && <p style={{ color: 'var(--accent-color)' }}>{error}</p>}
          <button id="postBtn" type="button" onClick={handlePost} disabled={posting}>
            {posting ? 'Posting...' : '🚀 Post Doubt'}
          </button>
        </section>

        <section className="doubts-list">
          <h2>Recent Doubts</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div id="doubts" className="doubts-container">
              {doubts.length === 0 && <p>No doubts yet.</p>}
              {doubts.map((d) => (
                <article className="doubt-card" key={d.id}>
                  <div className="doubt-header">
                    <h3 className="doubt-title">{d.title}</h3>
                    <p className="doubt-meta">{d.author || 'Anonymous'}</p>
                  </div>
                  <p className="doubt-desc">{d.description}</p>

                  <div className="answers answers-list">
                    <h4>Answers</h4>
                    {d.answers && d.answers.length > 0 ? (
                      d.answers.map((a, idx) => (
                        <p key={idx} className="answer-item">
                          {a.author || 'Anon'}: {a.text}
                        </p>
                      ))
                    ) : (
                      <small>No answers yet — be the first!</small>
                    )}
                  </div>

                  <div className="answer-form">
                    <input
                      className="answer-author"
                      placeholder="Your name"
                      value={answerInputs[d.id]?.author || ''}
                      onChange={(e) => handleAnswerInput(d.id, 'author', e.target.value)}
                    />
                    <input
                      className="answer-text"
                      placeholder="Your answer"
                      value={answerInputs[d.id]?.text || ''}
                      onChange={(e) => handleAnswerInput(d.id, 'text', e.target.value)}
                    />
                    <button className="answer-submit" type="button" onClick={() => submitAnswer(d.id)}>
                      💬 Submit
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer text="© 2025 Campus Connect | Made with ❤️ for learners" />
    </>
  );
}
