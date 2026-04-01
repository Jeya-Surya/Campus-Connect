import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { getApiBase } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const { toggle, label } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) {
      setError('Enter email and password');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError('Invalid credentials');
      } else {
        const data = await res.json();
        login(data);
        navigate('/');
      }
    } catch (err) {
      setError('Server error. Try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header title="🎓 Campus Connect — Login" onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <section className="post-form">
          <h2>Login to Continue</h2>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={{ color: 'var(--accent-color)' }}>{error}</p>}
          <button id="loginBtn" type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Logging in...' : '🔑 Login'}
          </button>

          <p style={{ marginTop: '15px', textAlign: 'center' }}>
            Don’t have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>
              Register here
            </Link>
          </p>
        </section>
      </main>
      <Footer text="© 2025 Campus Connect | Secure Login" />
    </>
  );
}
