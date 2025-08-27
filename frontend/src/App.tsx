import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import routes from './routes/routes';
import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { PresenceProvider } from './contexts/PresenceContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { Toaster } from 'sonner';

const AppContent: React.FC = () => {
  const [isBackendDown, setIsBackendDown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // useEffect(() => {
  //   let isMounted = true;
  //   const healthCheck = async () => {
  //     if (location.pathname === '/maintenance') return;
  //     try {
  //       await axios.get('/api/health');
  //       if (isBackendDown) {
  //         navigate('/');
  //       }
  //     } catch (error) {
  //       console.error('Backend health check failed:', error);
  //       if (isMounted) {
  //         setIsBackendDown(true);
  //       }
  //     }
  //   };

  //   healthCheck();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, [location.pathname]);

  // useEffect(() => {
  //   if (isBackendDown) {
  //     navigate('/maintenance', { replace: true });
  //   }
  // }, [isBackendDown, navigate]);

  return (
    <Routes>
      {routes.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          element={
            route.protected ? (
              <ProtectedRoute allowedRoles={route.roles!}>{route.element}</ProtectedRoute>
            ) : (
              route.element
            )
          }
        />
      ))}
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PresenceProvider>
        <NotificationsProvider>
          <Toaster position="top-right" richColors />
          <AppContent />
        </NotificationsProvider>
      </PresenceProvider>
    </AuthProvider>
  );
};

export default App;
