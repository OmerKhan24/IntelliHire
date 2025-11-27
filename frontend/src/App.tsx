import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import JobCreator from './pages/JobCreator';
import InterviewDashboard from './pages/InterviewDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/create-job" 
            element={
              <ProtectedRoute requiredRole="interviewer">
                <JobCreator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole="interviewer">
                <InterviewDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-interviews" 
            element={
              <ProtectedRoute requiredRole="candidate">
                <CandidateDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
