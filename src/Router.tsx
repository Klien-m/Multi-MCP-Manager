import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { MCPManager } from './pages/MCPManager';
import { ToolConfig } from './pages/ToolConfig';
import { Migration } from './pages/Migration';
import { SettingsPage as Settings } from './pages/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Dashboard /></Layout>,
  },
  {
    path: '/mcp',
    element: <Layout><MCPManager /></Layout>,
  },
  {
    path: '/tools',
    element: <Layout><ToolConfig /></Layout>,
  },
  {
    path: '/migration',
    element: <Layout><Migration /></Layout>,
  },
  {
    path: '/settings',
    element: <Layout><Settings /></Layout>,
  },
]);

export const Router: React.FC = () => {
  return <RouterProvider router={router} />;
};