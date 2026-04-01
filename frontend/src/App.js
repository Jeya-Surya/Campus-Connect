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
import MentorshipPage from './pages/MentorshipPage';
import AlumniOnboardingPage from './pages/AlumniOnboardingPage';
import AlumniDashboardPage from './pages/AlumniDashboardPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import RecentChatsPage from './pages/RecentChatsPage';
import ChatPage from './pages/ChatPage';
import StudentHomePage from './pages/StudentHomePage';
import AlumniHomePage from './pages/AlumniHomePage';

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
        path="/mentorship"
        element={
          <Protected>
            <MentorshipPage />
          </Protected>
        }
      />
      <Route
        path="/student/dashboard"
        element={
          <Protected>
            <StudentDashboardPage />
          </Protected>
        }
      />
      <Route
        path="/student/home"
        element={
          <Protected>
            <StudentHomePage />
          </Protected>
        }
      />
      <Route
        path="/alumni/onboarding"
        element={
          <Protected>
            <AlumniOnboardingPage />
          </Protected>
        }
      />
      <Route
        path="/alumni/dashboard"
        element={
          <Protected>
            <AlumniDashboardPage />
          </Protected>
        }
      />
      <Route
        path="/alumni/home"
        element={
          <Protected>
            <AlumniHomePage />
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
      <Route
        path="/recent-chats"
        element={
          <Protected>
            <RecentChatsPage />
          </Protected>
        }
      />
      <Route
        path="/chat/:requestId"
        element={
          <Protected>
            <ChatPage />
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
