import React from 'react';
import {
  ShieldCheck,
  Eye,
  Lock,
  Megaphone,
  Briefcase,
  Bell,
  HelpCircle,
  FileText,
  Accessibility,
  ChevronRight,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import packageJson from '../../package.json'; // Import the package.json file

const settingsOptions = [
  {
    category: 'Account Settings',
    items: [
      {
        icon: ShieldCheck,
        title: 'Preferences',
        description: 'Manage your account preferences.',
        to: '#',
      },
      {
        icon: Lock,
        title: 'Security',
        description: 'Change your password and secure your account.',
        to: '#',
      },
      {
        icon: Eye,
        title: 'Visibility',
        description: 'Control who sees your profile and activity.',
        to: '/settings/visibility',
      },
      {
        icon: FileText,
        title: 'Privacy',
        description: 'Manage your data and privacy settings.',
        to: '#',
      },
      {
        icon: Megaphone,
        title: 'Ads data',
        description: 'Control your advertising preferences.',
        to: '#',
      },
    ],
  },
  {
    category: 'Connectify Services',
    items: [
      {
        icon: Briefcase,
        title: 'Connectify Services',
        description: 'Manage services you use on Connectify.',
        to: '#',
      },
      { icon: Bell, title: 'Notifications', description: 'Control how you are notified.', to: '#' },
    ],
  },
  {
    category: 'Support',
    items: [
      { icon: HelpCircle, title: 'Help center', description: 'Find help and support.', to: '#' },
      { icon: FileText, title: 'Privacy policy', description: 'Read our privacy policy.', to: '#' },
      {
        icon: Accessibility,
        title: 'Accessibility',
        description: 'Manage your accessibility settings.',
        to: '#',
      },
    ],
  },
];

const SettingsPage: React.FC = () => {
  const appVersion = packageJson.version; // Get the version from the imported file

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <SettingsIcon className="w-8 h-8 mr-3" /> Settings
      </h1>
      <div className="space-y-8">
        {settingsOptions.map((group) => (
          <Card key={group.category}>
            <CardHeader>
              <CardTitle>{group.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-200">
                {group.items.map((item) => (
                  <Link
                    to={item.to}
                    key={item.title}
                    className="flex items-center py-4 px-2 hover:bg-gray-50 rounded-md"
                  >
                    <item.icon className="w-6 h-6 mr-4 text-gray-600" />
                    <div className="flex-grow">
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* App Version Display */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">Connectify Version: {appVersion}</p>
      </div>
    </div>
  );
};

export default SettingsPage;