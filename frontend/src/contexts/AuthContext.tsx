import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@/types/user';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Create the context with an initial undefined value.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = async () => {
    try {
      await axios.delete('/api/logout');
    } catch (error) {
      console.error('Logout request failed. Clearing session locally.', error);
    } finally {
      setUser(null);
      setToken(null);
      sessionStorage.removeItem('auth_token');
      delete axios.defaults.headers.common['Authorization'];
      navigate('/');
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken = sessionStorage.getItem('auth_token');

      if (storedToken) {
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        try {
          const response = await axios.get<{ data: User }>('/api/users/me');
          setUser(response.data.data);
        } catch (error) {
          console.error('Session token is invalid. Logging out.', error);
          await logout();
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (identifier: string, password: string) => {
    const response = await axios.post<{ data: User; token: string }>('/api/login', {
      identifier,
      password,
    });

    if (response.data?.data && response.data.token) {
      const { data: loggedInUser, token: authToken } = response.data;
      setUser(loggedInUser);
      setToken(authToken);
      sessionStorage.setItem('auth_token', authToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      const from = location.state?.from?.pathname || null;

      if (loggedInUser.role === 'admin') {
        navigate(from && from.startsWith('/admin') ? from : '/admin/dashboard');
      } else if (!loggedInUser.onboarding_completed) {
        navigate('/onboarding');
      } else {
        navigate(from || '/homepage');
      }
    }
  };

  const register = async (userData: any) => {
    const response = await axios.post<{ data: User; token: string }>('/api/register', {
      user: userData,
    });

    if (response.data?.data && response.data.token) {
      const { data: newUser, token: authToken } = response.data;
      setUser(newUser);
      setToken(authToken);
      sessionStorage.setItem('auth_token', authToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      navigate('/onboarding');
    }
  };

  const value = {
    isAuthenticated: !isLoading && !!user,
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};