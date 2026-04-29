import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import HomePage from './pages/HomePage';
import SimulationPage from './pages/SimulationPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailsPage from './pages/ArticleDetailsPage';
import AdminPage from './pages/AdminPage';
import CreateArticlePage from './pages/CreateArticlePage';


import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

/**
 * Root App component.
 * Sets up React Router with a shared Layout for all pages.
 */
const App = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="simulation" element={<SimulationPage />} />
              <Route path="learn" element={<ArticlesPage />} />
              <Route path="learn/:id" element={<ArticleDetailsPage />} />
              <Route path="learn/create" element={<CreateArticlePage />} />


              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
