import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import { AppProvider } from './providers/AppProvider';
import { Router } from './Router';
import './styles/globals.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;