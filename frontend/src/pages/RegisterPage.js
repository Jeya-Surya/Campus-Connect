import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { getApiBase } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { user } = useAuth();
  const { toggle, label } = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleRegister = async () => {
    setMessage('');
    if (!name || !email || !password) {
      setMessage('Fill all fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        setMessage('Registration successful! Please login.');
        navigate('/login');
      } else {
        setMessage('Error creating account');
      }
    } catch (err) {
      setMessage('Server error. Try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header title="🎓 Campus Connect — Register" onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <section className="post-form">
          <h2>Create an Account</h2>
          <input id="name" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
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
          {message && <p style={{ color: 'var(--accent-color)' }}>{message}</p>}
          <button id="registerBtn" type="button" onClick={handleRegister} disabled={submitting}>
            {submitting ? 'Registering...' : '🚀 Register'}
          </button>

          <p style={{ marginTop: '15px', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>
              Login
            </Link>
          </p>
        </section>
      </main>
      <Footer text="© 2025 Campus Connect | Join the community" />
    </>
  );
}
