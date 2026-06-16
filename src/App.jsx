import React, { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [adminUser, setAdminUser] = useState(null);

  // Check session storage and local storage on mount for security isolation
  useEffect(() => {
    try {
      const isAuth = localStorage.getItem('isAdminAuthenticated') === 'true';
      const savedUser = sessionStorage.getItem('isolated_admin_user') || localStorage.getItem('isolated_admin_user');
      if (isAuth && savedUser) {
        setAdminUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("Error reading admin session:", err);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    try {
      sessionStorage.setItem('isolated_admin_user', JSON.stringify(userData));
      localStorage.setItem('isolated_admin_user', JSON.stringify(userData));
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('adminRole', userData.role ? userData.role.toLowerCase().trim() : 'super_admin');
      setAdminUser(userData);
    } catch (err) {
      console.error("Error saving admin session:", err);
      setAdminUser(userData);
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('isolated_admin_user');
      localStorage.removeItem('isolated_admin_user');
      localStorage.removeItem('isAdminAuthenticated');
      localStorage.removeItem('adminRole');
      setAdminUser(null);
    } catch (err) {
      console.error("Error clearing admin session:", err);
      setAdminUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#02100a] text-emerald-100 selection:bg-amber-500 selection:text-slate-900">
      {adminUser ? (
        <AdminDashboard adminUser={adminUser} onLogout={handleLogout} />
      ) : (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
