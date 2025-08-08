import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Define the shape of a user object
interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  phone_number: string;
  photo_url: string;
}

// Define the shape of the context value
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>; // Adjust 'any' to a specific type for registration form data
  logout: () => void;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Define the props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}


export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // The cookie is sent automatically by the browser.
        const response = await axios.get<{ data: User }>('/api/users/me');
        if (response.data && response.data.data) {
          setUser(response.data.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
        console.error("Not authenticated", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (identifier: string, password: string) => {
    const response = await axios.post('/api/login', { identifier, password });
    if (response.data && response.data.data) {
      setUser(response.data.data);
      // On successful login, you might navigate to a protected route
      navigate('/homepage');
    }
  };
  
  const register = async (userData: any) => {
    const response = await axios.post('/api/register', { user: userData });
    if (response.data && response.data.data) {
      setUser(response.data.data);
      // On successful registration, navigate to the homepage or login page
      navigate('/homepage');
    }
  };

  const logout = async () => {
    try {
      await axios.delete('/api/logout');
      setUser(null);
      // On logout, navigate to the login page or welcome page
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};