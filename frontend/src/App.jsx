import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { IssueProvider } from './context/IssueContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppRoutes } from './routes';

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <IssueProvider>
            <NotificationProvider>
              <Toaster position="top-right" richColors closeButton />
              <AppRoutes />
            </NotificationProvider>
          </IssueProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

