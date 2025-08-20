import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { updateSecuritySettings } from '@/services/userService';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Lock, ArrowLeft, Loader2, Mail, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// --- Zod Schemas for Validation ---
const passwordFormSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required.'),
    password: z.string().min(8, 'New password must be at least 8 characters.'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "New passwords don't match",
    path: ['password_confirmation'],
  });

const emailFormSchema = z.object({
  current_password: z.string().min(1, 'Password is required to change email.'),
  email: z.string().email('Invalid email address.'),
});

// --- Main Component ---
const SecuritySettingsPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const [passwordVisible, setPasswordVisible] = React.useState(false);

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  });

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { current_password: '', email: user?.email || '' },
  });

  const handlePasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    try {
      await updateSecuritySettings(values);
      toast.success('Password updated successfully!');
      passwordForm.reset();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data.errors) {
        const errors = err.response.data.errors;
        if (errors.current_password) {
          passwordForm.setError('current_password', { message: errors.current_password[0] });
        } else {
          toast.error('An unexpected error occurred.');
        }
      } else {
        toast.error('Failed to update password.');
      }
    }
  };

  const handleEmailSubmit = async (values: z.infer<typeof emailFormSchema>) => {
    if (!user || !setUser) return;
    try {
      const updatedUser = await updateSecuritySettings(values);
      setUser(updatedUser);
      toast.success('Email updated successfully!');
      emailForm.reset({ current_password: '', email: updatedUser.email || '' });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data.errors) {
        const errors = err.response.data.errors;
        if (errors.current_password) {
          emailForm.setError('current_password', { message: errors.current_password[0] });
        }
        if (errors.email) {
          emailForm.setError('email', { message: errors.email[0] });
        }
      } else {
        toast.error('Failed to update email.');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4 mb-2">
          <Link to="/settings">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6" />
            <CardTitle className="text-2xl">Security Settings</CardTitle>
          </div>
        </div>
        <CardDescription className="pl-14">
          Manage your email and password to keep your account secure.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-14">
        {/* --- Change Email Form --- */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-gray-600" />
            Change Email
          </h3>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="new.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={emailForm.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your current password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={emailForm.formState.isSubmitting}
                className="w-full sm:w-auto"
              >
                {emailForm.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Email
              </Button>
            </form>
          </Form>
        </div>

        <Separator />

        {/* --- Change Password Form --- */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-gray-600" />
            Change Password
          </h3>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={passwordVisible ? 'text' : 'password'} {...field} />
                        <button
                          type="button"
                          onClick={() => setPasswordVisible(!passwordVisible)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={passwordForm.formState.isSubmitting}
                className="w-full sm:w-auto"
              >
                {passwordForm.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Password
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettingsPage;
