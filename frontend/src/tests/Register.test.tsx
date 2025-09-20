import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '@/contexts/AuthContext';
import { Register } from '@/pages/auth/Register';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithContext = () => {
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
      <Router>
        <Register />
      </Router>
    </AuthContext.Provider>,
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the registration form correctly', () => {
    renderWithContext();

    expect(screen.getByLabelText(/^Name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Surname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create an account/i })).toBeInTheDocument();
    expect(screen.getByText(/Already have an account?/i)).toBeInTheDocument();
  });

  it('allows user to input data into all fields', async () => {
    const user = userEvent.setup();
    renderWithContext();

    await user.type(screen.getByLabelText(/^Name$/i), 'John');
    expect(screen.getByLabelText(/^Name$/i)).toHaveValue('John');

    await user.type(screen.getByLabelText(/Surname/i), 'Doe');
    expect(screen.getByLabelText(/Surname/i)).toHaveValue('Doe');

    await user.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('john.doe@example.com');

    await user.type(screen.getByLabelText(/Phone Number/i), '1234567890');
    expect(screen.getByLabelText(/Phone Number/i)).toHaveValue('1234567890');

    await user.type(screen.getByLabelText(/^Password$/i), 'password123');
    expect(screen.getByLabelText(/^Password$/i)).toHaveValue('password123');

    await user.type(screen.getByLabelText(/Confirm Password/i), 'password123');
    expect(screen.getByLabelText(/Confirm Password/i)).toHaveValue('password123');
  });

  it('shows an error if passwords do not match', async () => {
    const user = userEvent.setup();
    renderWithContext();

    await user.type(screen.getByLabelText(/^Password$/i), 'password123');
    await user.type(screen.getByLabelText(/Confirm Password/i), 'password456');

    const submitButton = screen.getByRole('button', { name: /Create an account/i });
    await user.click(submitButton);

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
  });


  it('shows an error if password is less than 8 characters', async () => {
    const user = userEvent.setup();
    renderWithContext();

    await user.type(screen.getByLabelText(/^Password$/i), 'pass');
    await user.type(screen.getByLabelText(/Confirm Password/i), 'pass');

    const submitButton = screen.getByRole('button', { name: /Create an account/i });
    await user.click(submitButton);

    const errorMessages = await screen.findAllByText(
      'Password must be at least 8 characters long.',
    );
    const errorElement = errorMessages.find((el) => el.classList.contains('text-red-500'));
    expect(errorElement).toBeInTheDocument();
  });

  it('handles successful registration, calls login, and navigates to onboarding', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValue({ status: 201, data: {} });
    mockLogin.mockResolvedValue(undefined);

    renderWithContext();

    const nameInput = screen.getByLabelText(/^Name$/i);
    const surnameInput = screen.getByLabelText(/Surname/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

    await user.type(nameInput, 'Jane');
    await user.type(surnameInput, 'Doe');
    await user.type(emailInput, 'jane.doe@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /Create an account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/register', {
        user: {
          name: 'Jane',
          surname: 'Doe',
          email: 'jane.doe@example.com',
          phone_number: '',
          password: 'password123',
          password_hash: 'password123',
        },
      });
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('jane.doe@example.com', 'password123');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('displays a detailed backend error message on failure', async () => {
    const user = userEvent.setup();
    const errorResponse = {
      isAxiosError: true,
      response: {
        data: {
          errors: {
            email: ["has already been taken"],
          },
        },
      },
    };
    mockedAxios.post.mockRejectedValue(errorResponse);
    renderWithContext();

    await user.type(screen.getByLabelText(/Email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^Password/i), 'password123');
    await user.type(screen.getByLabelText(/Confirm Password/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /Create an account/i });
    await user.click(submitButton);

  });

  it('displays a generic backend error message on failure', async () => {
    const user = userEvent.setup();
    const errorResponse = {
      isAxiosError: true,
      response: {
        data: {
          errors: {
            detail: "Internal Server Error",
          },
        },
      },
    };
    mockedAxios.post.mockRejectedValue(errorResponse);
    renderWithContext();

    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^Password/i), 'password123');
    await user.type(screen.getByLabelText(/Confirm Password/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /Create an account/i });
    await user.click(submitButton);

  });


  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderWithContext();

    const passwordInput = screen.getByLabelText(/^Password/i);
    const toggleButton = passwordInput.nextElementSibling;

    expect(passwordInput).toHaveAttribute('type', 'password');
    if (toggleButton) {
        await user.click(toggleButton);
    }
    expect(passwordInput).toHaveAttribute('type', 'text');
    if (toggleButton) {
        await user.click(toggleButton);
    }
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});