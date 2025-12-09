import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import JobCreator from './pages/JobCreator';
import InterviewDashboard from './pages/InterviewDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import CandidateInterview from './pages/CandidateInterview';
import CandidateFeedback from './pages/CandidateFeedback';
import InterviewReport from './pages/InterviewReport';
import AdminDashboard from './pages/AdminDashboard';
import HRAssistant from './pages/HRAssistant';
import EmployeeDashboard from './pages/EmployeeDashboard';
import theme from './theme';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
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
            path="/employee-dashboard" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hr-assistant" 
            element={
              <ProtectedRoute requiredRole={["interviewer", "employee"]}>
                <HRAssistant />
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
          <Route 
            path="/interview/:jobId" 
            element={<CandidateInterview />} 
          />
          <Route 
            path="/feedback/:interviewId" 
            element={<CandidateFeedback />} 
          />
          <Route 
            path="/report/:jobId" 
            element={
              <ProtectedRoute requiredRole="interviewer">
                <InterviewReport />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
