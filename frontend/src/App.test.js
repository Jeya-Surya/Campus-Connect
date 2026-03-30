import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login screen by default when no session exists', () => {
  render(<App />);
  expect(screen.getByText(/Login to Continue/i)).toBeInTheDocument();
});
