import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './styles.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoubtDeskPage from './pages/DoubtDeskPage';
import ProjectCompassPage from './pages/ProjectCompassPage';
import JoinProjectPage from './pages/JoinProjectPage';
import StudyGroupsPage from './pages/StudyGroupsPage';
import GroupRoomPage from './pages/GroupRoomPage';
import EventsPage from './pages/EventsPage';
import ResourceHubPage from './pages/ResourceHubPage';

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
            <ProjectCompassPage />
          </Protected>
        }
      />
      <Route
        path="/join-project/:projectId"
        element={
          <Protected>
            <JoinProjectPage />
          </Protected>
        }
      />
      <Route
        path="/studygroups"
        element={
          <Protected>
            <StudyGroupsPage />
          </Protected>
        }
      />
      <Route
        path="/group-room/:id"
        element={
          <Protected>
            <GroupRoomPage />
          </Protected>
        }
      />
      <Route
        path="/events"
        element={
          <Protected>
            <EventsPage />
          </Protected>
        }
      />
      <Route
        path="/resourcehub"
        element={
          <Protected>
            <ResourceHubPage />
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
