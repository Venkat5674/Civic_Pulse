import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AuthProvider } from './context/AuthContext';
import { IssueProvider } from './context/IssueContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <IssueProvider>
          <NotificationProvider>
            <Toaster position="top-right" richColors closeButton />
            <AppRoutes />
          </NotificationProvider>
        </IssueProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
