import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExamList from './pages/ExamList';
import ExamAttempt from './pages/ExamAttempt';
import ExamResult from './pages/ExamResult';
import MyResults from './pages/MyResults';
import ManageExams from './pages/ManageExams';
import ManageUsers from './pages/ManageUsers';
import Results from './pages/Results';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* All authenticated */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          {/* Student only */}
          <Route path="/exams" element={
            <ProtectedRoute roles={['student']}><ExamList /></ProtectedRoute>
          } />
          <Route path="/exam/:id" element={
            <ProtectedRoute roles={['student']}><ExamAttempt /></ProtectedRoute>
          } />
          <Route path="/result/:id" element={
            <ProtectedRoute roles={['student']}><ExamResult /></ProtectedRoute>
          } />
          <Route path="/my-results" element={
            <ProtectedRoute roles={['student']}><MyResults /></ProtectedRoute>
          } />

          {/* Teacher + Admin */}
          <Route path="/manage-exams" element={
            <ProtectedRoute roles={['teacher', 'admin']}><ManageExams /></ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute roles={['teacher', 'admin']}><Results /></ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="/manage-users" element={
            <ProtectedRoute roles={['admin']}><ManageUsers /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
