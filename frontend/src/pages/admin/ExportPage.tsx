import { useState, useEffect } from 'react';
import { exportUsers, getAllUsers } from '@/services/adminService';
import { User } from '@/types/user';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Download, FileJson, FileCode2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminExportPage = () => {
  const [format, setFormat] = useState<'json' | 'xml'>('json');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        toast.error('Failed to load user list for selection.');
      } finally {
        setIsFetchingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleToggleUser = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const handleSelectAll = () => {
    setSelectedUserIds(new Set(users.map((u) => u.id)));
  };

  const handleDeselectAll = () => {
    setSelectedUserIds(new Set());
  };

  const handleExport = async () => {
    setIsLoading(true);
    toast.info('Starting data export... This may take a moment.');

    // If no users are selected, it means "export all"
    const idsToExport = selectedUserIds.size > 0 ? Array.from(selectedUserIds) : null;

    try {
      const data = await exportUsers(idsToExport, format);
      const blob = new Blob([data], {
        type: format === 'json' ? 'application/json' : 'application/xml',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `connectify_users_export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Export completed successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Export User Data</h1>

      {/* User Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Select Users to Export</CardTitle>
          <CardDescription>
            Choose specific users or leave blank to export all users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetchingUsers ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-4">
                <Button variant="outline" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button variant="outline" onClick={handleDeselectAll}>
                  Deselect All
                </Button>
              </div>
              <ScrollArea className="h-64 w-full rounded-md border p-4">
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedUserIds.has(user.id)}
                        onCheckedChange={() => handleToggleUser(user.id)}
                      />
                      <label
                        htmlFor={`user-${user.id}`}
                        className="flex items-center gap-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {user.photo_url ? (
                          <img
                            src={user.photo_url}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircle className="h-8 w-8 text-gray-400" />
                        )}
                        <span>{`${user.name} ${user.surname} (${user.email})`}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            {selectedUserIds.size} of {users.length} users selected.
          </p>
        </CardFooter>
      </Card>

      {/* Export Options Card */}
      <Card>
        <CardHeader>
          <CardTitle>Export Configuration</CardTitle>
          <CardDescription>Select your desired format and start the export.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="w-full sm:w-1/2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={format} onValueChange={(value: 'json' | 'xml') => setFormat(value)}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" /> JSON
                  </div>
                </SelectItem>
                <SelectItem value="xml">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="h-4 w-4" /> XML
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleExport} disabled={isLoading || isFetchingUsers}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Exporting...' : `Export ${selectedUserIds.size || 'All'} Users`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExportPage;