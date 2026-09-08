import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import SamplesList from './pages/SamplesList';
import SampleDetail from './pages/SampleDetail';
import NewSample from './pages/NewSample';
import Movements from './pages/Movements';
import Users from './pages/Users';
import NotFound from './pages/NotFound';
import { Profile } from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Public Unauthenticated Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Navigate to="/register" replace />} />

          {/* 2. Protected Laboratory Shell Routes (Requires Login) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/samples" element={<SamplesList />} />
            <Route path="/samples/new" element={<NewSample />} />
            <Route path="/samples/:id" element={<SampleDetail />} />
            <Route path="/movements" element={<Movements />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 3. Admin Restricted Routes (Requires ADMIN Role) */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="/users" element={<Users />} />
          </Route>

          {/* 4. Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
