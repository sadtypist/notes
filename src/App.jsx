import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Profile from './pages/Profile';
import Trash from './pages/Trash';
import Settings from './pages/Settings';
import CreateFolder from './pages/CreateFolder';
import NetworkStatus from './components/NetworkStatus';
import Sidebar from './components/Sidebar';

import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';

import ErrorBoundary from './components/ErrorBoundary';

import { useUI } from './context/UIContext';

function App() {
  const { isFocusMode } = useUI();

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="app-layout" style={{
                display: 'flex',
                maxWidth: isFocusMode ? '900px' : '1400px', // Narrower max-width for focus reading
                margin: '0 auto',
                gap: isFocusMode ? '0' : '2rem',
                padding: '0 1rem',
                transition: 'all 0.3s ease'
              }}>
                <NetworkStatus />
                {!isFocusMode && (
                  <div style={{ width: '250px', flexShrink: 0 }} className="animate-slide-in">
                    <Sidebar />
                  </div>
                )}
                <main style={{ flex: 1, minWidth: 0, transition: 'all 0.3s ease' }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/favorites" element={<Home />} />
                    <Route path="/folder/new" element={<CreateFolder />} />
                    <Route path="/folder/:categoryId" element={<Home />} />
                    <Route path="/trash" element={<Trash />} />
                    <Route path="/note/:id" element={<Editor />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
