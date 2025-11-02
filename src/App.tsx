import React from 'react';
import { AppProvider } from './providers/AppProvider';
import {MainApp} from "@/MainApp.tsx";

function App() {
  return (
      <AppProvider>
          <MainApp />
      </AppProvider>
  );
}

export default App;