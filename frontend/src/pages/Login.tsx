import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Network, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);

    try {
      await login(email, password);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.errors?.detail || 'Login failed. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex justify-center items-center gap-2 mb-4">
            <Network className="h-8 w-8 text-blue-600" />
            <span className="text-3xl font-bold">Connectify</span>
          </div>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoggingIn}
                  required
                />
              </div>
              <div className="grid gap-2 relative">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoggingIn}
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-3 top-8 text-gray-500"
                  disabled={isLoggingIn}
                >
                  {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoggingIn ? 'Signing In...' : 'Sign In'}
              </Button>
              <Button variant="outline" className="w-full" disabled={isLoggingIn}>
                Sign in with Google
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}