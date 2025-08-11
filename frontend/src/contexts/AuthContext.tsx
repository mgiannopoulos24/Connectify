import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  phone_number: string;
  photo_url: string;
  location: string | null;
  onboarding_completed: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>> | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get<{ data: User }>('/api/users/me');
        if (response.data && response.data.data) {
          setUser(response.data.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
        console.error('Not authenticated', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (identifier: string, password: string) => {
    const response = await axios.post('/api/login', { identifier, password });
    if (response.data && response.data.data) {
      const loggedInUser = response.data.data;
      setUser(loggedInUser);

      if (!loggedInUser.onboarding_completed) {
        navigate('/onboarding');
      } else if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedInUser.role === 'professional') {
        navigate('/homepage');
      } else {
        navigate('/login');
      }
    }
  };

  const register = async (userData: any) => {
    await axios.post('/api/register', { user: userData });
    navigate('/login');
  };

  const logout = async () => {
    try {
      await axios.delete('/api/logout');
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
    isLoading,
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
