import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { DepartmentProvider } from './context/DepartmentContext';
import { NotificationProvider } from './components/ui/NotificationSystem';
import AppRoutes from './routes';

const App = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <DepartmentProvider>
          <AppRoutes />
        </DepartmentProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
