import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import routes from './routes/routes';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
};

export default App;