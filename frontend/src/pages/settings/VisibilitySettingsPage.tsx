import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUser } from '@/services/userService';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const VisibilitySettingsPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const [visibility, setVisibility] = useState(user?.profile_visibility || 'public');
  const [isSaving, setIsSaving] = useState(false);

  const handleVisibilityChange = async (value: 'public' | 'connections_only') => {
    if (!user || !setUser) return;

    setIsSaving(true);
    setVisibility(value); // Optimistic UI update

    try {
      const updatedUser = await updateUser(user.id, { profile_visibility: value });
      setUser(updatedUser); // Update user in global context
      toast.success('Visibility settings updated successfully!');
    } catch (error) {
      console.error('Failed to update visibility:', error);
      toast.error('Failed to update settings.');
      // Revert UI on failure
      setVisibility(user.profile_visibility || 'public');
    } finally {
      setIsSaving(false);
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
            <Eye className="w-6 h-6" />
            <CardTitle className="text-2xl">Profile Visibility</CardTitle>
          </div>
        </div>
        <CardDescription className="pl-14">
          Choose who can see your full profile details like your connections, job history, and
          education.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-14">
        <p className="text-sm text-gray-600 mb-6">
          Basic information (name, photo, and your current job title) is always public to help
          people find you.
        </p>
        <RadioGroup
          value={visibility}
          onValueChange={handleVisibilityChange}
          disabled={isSaving}
          className="space-y-4"
        >
          <Label
            htmlFor="public"
            className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400"
          >
            <RadioGroupItem value="public" id="public" />
            <div>
              <span className="font-semibold">Public</span>
              <p className="text-sm text-gray-500">
                Anyone on or off Connectify can view your full profile. This option maximizes your
                visibility.
              </p>
            </div>
          </Label>
          <Label
            htmlFor="connections_only"
            className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400"
          >
            <RadioGroupItem value="connections_only" id="connections_only" />
            <div>
              <span className="font-semibold">Connections Only</span>
              <p className="text-sm text-gray-500">
                Only your accepted connections can see your full profile details.
              </p>
            </div>
          </Label>
        </RadioGroup>
        {isSaving && (
          <div className="flex items-center text-sm text-gray-500 mt-4">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisibilitySettingsPage;