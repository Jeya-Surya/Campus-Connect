import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './styles.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoubtDeskPage from './pages/DoubtDeskPage';
import PlaceholderPage from './pages/PlaceholderPage';

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Protected>
            <HomePage />
          </Protected>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/doubtdesk"
        element={
          <Protected>
            <DoubtDeskPage />
          </Protected>
        }
      />
      <Route
        path="/projectcompass"
        element={
          <Protected>
            <PlaceholderPage title="🧭 Project Compass" />
          </Protected>
        }
      />
      <Route
        path="/resourcehub"
        element={
          <Protected>
            <PlaceholderPage title="📚 Resource Hub" />
          </Protected>
        }
      />
      <Route
        path="/studygroups"
        element={
          <Protected>
            <PlaceholderPage title="👥 Study Groups" />
          </Protected>
        }
      />
      <Route
        path="/mentorship"
        element={
          <Protected>
            <PlaceholderPage title="🎓 Mentorship" />
          </Protected>
        }
      />
      <Route
        path="/events"
        element={
          <Protected>
            <PlaceholderPage title="📅 Campus Events" />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
