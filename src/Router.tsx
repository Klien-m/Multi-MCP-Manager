import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { MCPManager } from './pages/MCPManager';
import { ToolConfig } from './pages/ToolConfig';
import { Migration } from './pages/Migration';
import { Settings } from './pages/Settings';

export const Router: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mcp" element={<MCPManager />} />
        <Route path="/tools" element={<ToolConfig />} />
        <Route path="/migration" element={<Migration />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
};