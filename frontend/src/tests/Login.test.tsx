import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { Login } from '@/pages/auth/Login';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithContext = (ui: React.ReactElement) => {
  return render(
    <AuthContext.Provider
      value={{
        login: mockLogin,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        register: vi.fn(),
        logout: vi.fn(),
        setUser: vi.fn(),
      }}
    >
      <Router>{ui}</Router>
    </AuthContext.Provider>,
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login form correctly', () => {
    renderWithContext(<Login />);

    expect(screen.getByText(/Enter your credentials to access your account/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();
  });

  it('allows the user to type into email and password fields', async () => {
    const user = userEvent.setup();
    renderWithContext(<Login />);
    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');
    const passwordInput = screen.getByLabelText(/Password/i);
    await user.type(passwordInput, 'password123');
    expect(passwordInput).toHaveValue('password123');
  });

  it('shows loading state and calls login function on successful submission', async () => {
    const user = userEvent.setup();

    let resolveLogin: (value?: unknown) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    mockLogin.mockImplementation(() => loginPromise);

    renderWithContext(<Login />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /^Sign In$/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Signing In.../i })).toBeDisabled();
    });

    resolveLogin!();

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays an error message on failed login', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials. Please try again.';

    const axiosError = {
      isAxiosError: true,
      response: { data: { errors: { detail: errorMessage } } },
    };
    mockLogin.mockRejectedValueOnce(axiosError);

    renderWithContext(<Login />);

    const submitButton = screen.getByRole('button', { name: /^Sign In$/i });
    await user.type(screen.getByLabelText(/Email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeEnabled();
  });

  it('toggles password visibility when the eye icon is clicked', async () => {
    const user = userEvent.setup();
    renderWithContext(<Login />);

    const passwordInput = screen.getByLabelText(/Password/i);
    const visibilityToggle = passwordInput.nextElementSibling;

    expect(passwordInput).toHaveAttribute('type', 'password');

    if (visibilityToggle) {
      await user.click(visibilityToggle);
    }
    expect(passwordInput).toHaveAttribute('type', 'text');

    if (visibilityToggle) {
      await user.click(visibilityToggle);
    }
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('disables the form while login is in progress', async () => {
    const user = userEvent.setup();
    let resolveLogin: (value?: unknown) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    mockLogin.mockImplementation(() => loginPromise);

    renderWithContext(<Login />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /^Sign In$/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Signing In.../i })).toBeDisabled();
    });
    expect(screen.getByLabelText(/Email/i)).toBeDisabled();
    expect(screen.getByLabelText(/Password/i)).toBeDisabled();

    const axiosError = {
      isAxiosError: true,
      response: { data: { errors: { detail: 'Error' } } },
    };
    mockLogin.mockRejectedValueOnce(axiosError);
    resolveLogin!();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeEnabled();
    });
  });
});
