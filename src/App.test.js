import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

jest.mock('./ephemeris', () => ({
  calculateNatalChartFromLocal: jest.fn(async () => ({})),
}));

jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(async () => ({ data: { session: null } })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  },
}));

test('renders learn react link', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByRole('heading', { level: 1, name: /Natavium/i })).toBeInTheDocument();
  expect(screen.getByText(/Discover Your Chart/i)).toBeInTheDocument();
});
