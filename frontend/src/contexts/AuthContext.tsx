import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Type Definitions ---
// These interfaces describe the shape of your user and related data.
interface JobExperience {
  id: string;
  job_title: string;
  employment_type: string;
  company_name: string;
}

interface Education {
  id: string;
  school_name: string;
  degree: string;
  field_of_study: string;
}

interface Skill {
  id: string;
  name: string;
}

interface Interest {
  id: string;
  name: string;
  type: string;
}

interface ConnectionInfo {
  id: string;
  status: 'pending' | 'accepted';
  user_id: string;
  connected_user_id: string;
}

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  phone_number: string;
  photo_url: string;
  location: string | null;
  onboarding_completed: boolean;
  job_experiences: JobExperience[];
  educations: Education[];
  skills: Skill[];
  interests: Interest[];
  sent_connections: ConnectionInfo[];
  received_connections: ConnectionInfo[];
}

// This interface defines the contract for our authentication context.
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

  useEffect(() => {
    // This effect runs once when the app loads to check for an existing session.
    const checkAuthStatus = async () => {
      const storedToken = sessionStorage.getItem('auth_token');

      if (storedToken) {
        setToken(storedToken);
        // Set the Authorization header for all subsequent axios requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        try {
          // Fetch the user's data using the stored token
          const response = await axios.get<{ data: User }>('/api/users/me');
          setUser(response.data.data);
        } catch (error) {
          console.error('Session token is invalid. Logging out.', error);
          // If the token is invalid (e.g., expired), clear the session.
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []); // The empty dependency array ensures this runs only once on mount.

  const login = async (identifier: string, password: string) => {
    // The backend now responds with `{ data: User, token: string }`
    const response = await axios.post<{ data: User; token: string }>('/api/login', {
      identifier,
      password,
    });

    if (response.data && response.data.data && response.data.token) {
      const loggedInUser = response.data.data;
      const authToken = response.data.token;

      // Update state and session storage
      setUser(loggedInUser);
      setToken(authToken);
      sessionStorage.setItem('auth_token', authToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      // Navigate user to the correct page
      if (!loggedInUser.onboarding_completed) {
        navigate('/onboarding');
      } else if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/homepage');
      }
    }
  };

  const register = async (userData: any) => {
    // The backend registration endpoint also returns the new user and a token
    const response = await axios.post<{ data: User; token: string }>('/api/register', {
      user: userData,
    });

    if (response.data && response.data.data && response.data.token) {
      const newUser = response.data.data;
      const authToken = response.data.token;

      // Update state and session storage
      setUser(newUser);
      setToken(authToken);
      sessionStorage.setItem('auth_token', authToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      // A new user should always be sent to onboarding
      navigate('/onboarding');
    }
  };

  const logout = async () => {
    try {
      // Tell the backend to invalidate the cookie (best effort)
      await axios.delete('/api/logout');
    } catch (error) {
      console.error('Logout request failed. Clearing session locally.', error);
    } finally {
      // Clear all local session data regardless of API call success
      setUser(null);
      setToken(null);
      sessionStorage.removeItem('auth_token');
      delete axios.defaults.headers.common['Authorization'];
      navigate('/');
    }
  };

  // The value provided to consuming components
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

// Custom hook to easily use the auth context in other components.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
