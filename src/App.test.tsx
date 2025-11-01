import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './providers/AppProvider';
import App from './App';

// Mock the components that aren't fully implemented yet
jest.mock('./Router', () => ({
  Router: () => <div data-testid="router">Router Component</div>,
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderApp = () => {
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <App />
      </AppProvider>
    </QueryClientProvider>
  );
};

describe('App Component', () => {
  test('renders without crashing', () => {
    renderApp();
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  test('has correct structure', () => {
    renderApp();
    const routerElement = screen.getByTestId('router');
    expect(routerElement).toHaveTextContent('Router Component');
  });
});