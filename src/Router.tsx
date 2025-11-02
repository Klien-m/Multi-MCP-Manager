import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
]);

export const Router: React.FC = () => {
  return <RouterProvider router={router} />;
};