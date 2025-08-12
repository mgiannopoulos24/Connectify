import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Type Definitions ---
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

// --- Updated User Interface ---
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

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
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
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      // If we have a token, we can try to fetch the user
      if (token) {
        try {
          const response = await axios.get<{ data: User }>('/api/users/me');
          if (response.data && response.data.data) {
            setUser(response.data.data);
          } else {
            // Token is invalid, clear it
            logout();
          }
        } catch (error) {
          console.error('Authentication check failed', error);
          logout();
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [token]);

  const login = async (identifier: string, password: string) => {
    // NOTE: This assumes the backend login response is modified to include the token.
    const response = await axios.post<{ data: User; token: string }>('/api/login', {
      identifier,
      password,
    });
    if (response.data && response.data.data) {
      const { data: loggedInUser, token: authToken } = response.data;
      setUser(loggedInUser);
      setToken(authToken);
      sessionStorage.setItem('auth_token', authToken); // Persist token in session storage

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
    // NOTE: This assumes the backend register response is modified to include the token.
    const response = await axios.post('/api/register', { user: userData });
    if (response.data && response.data.data) {
      await login(userData.email, userData.password);
    }
  };

  const logout = async () => {
    try {
      await axios.delete('/api/logout');
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      setUser(null);
      setToken(null);
      sessionStorage.removeItem('auth_token');
      navigate('/');
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
    token,
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
