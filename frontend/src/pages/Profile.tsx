import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Mail,
  Phone,
  UserCircle,
  Briefcase,
  GraduationCap,
  Sparkles,
  MapPin,
  PlusCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { usePresence } from '@/contexts/PresenceContext';
import StatusIndicator from '@/components/common/StatusIndicator';

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
// --- End Type Definitions ---

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const { getUserStatus } = usePresence();
  const [editingItem, setEditingItem] = useState<JobExperience | Education | Skill | null>(null);
  const [itemType, setItemType] = useState<'experience' | 'education' | 'skill' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user || !setUser) {
    return <div>Loading user profile...</div>;
  }

  const userStatus = getUserStatus(user.id);

  const handleOpenModal = (
    type: 'experience' | 'education' | 'skill',
    item: JobExperience | Education | Skill | null = null,
  ) => {
    setItemType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemType(null);
    setEditingItem(null);
  };

  const handleDelete = async (type: 'experience' | 'education' | 'skill', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`/api/${type}s/${id}`);
      setUser((prevUser) => {
        if (!prevUser) return null;
        const key = `${type}s` as 'job_experiences' | 'educations' | 'skills';
        const updatedItems = prevUser[key].filter((item: any) => item.id !== id);
        return { ...prevUser, [key]: updatedItems };
      });
    } catch (error) {
      console.error(`Failed to delete ${type}`, error);
      alert(`Error: Could not delete ${type}.`);
    }
  };

  const handleSave = async (formData: any) => {
    if (!itemType) return;

    const key = `${itemType}s` as 'job_experiences' | 'educations' | 'skills';
    const single = itemType; // 'experience'
    const url = editingItem ? `/api/${key}/${editingItem.id}` : `/api/${key}`;
    const method = editingItem ? 'put' : 'post';

    try {
      const response = await axios[method](url, { [single]: formData });
      const savedItem = response.data.data;

      setUser((prevUser) => {
        if (!prevUser) return null;
        let updatedItems;
        if (editingItem) {
          updatedItems = prevUser[key].map((item: any) =>
            item.id === savedItem.id ? savedItem : item,
          );
        } else {
          updatedItems = [...prevUser[key], savedItem];
        }
        return { ...prevUser, [key]: updatedItems };
      });

      handleCloseModal();
    } catch (error) {
      console.error(`Failed to save ${itemType}`, error);
      alert(`Error: Could not save ${itemType}.`);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl space-y-8 px-4">
      {/* --- Main Profile Card --- */}
      <Card className="w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="relative mx-auto mb-4 h-24 w-24">
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt="User"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <UserCircle className="h-full w-full text-gray-500" />
            )}
            <StatusIndicator status={userStatus} className="h-6 w-6 right-1 bottom-1" />
          </div>
          <CardTitle className="text-3xl font-bold">{`${user.name} ${user.surname}`}</CardTitle>
          <CardDescription className="text-lg capitalize text-blue-600">
            {user.job_experiences?.[0]?.job_title || user.role}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mx-auto max-w-sm space-y-4 text-center">
            <div className="flex items-center justify-center gap-4">
              <Mail className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">{user.email}</span>
            </div>
            {user.phone_number && (
              <div className="flex items-center justify-center gap-4">
                <Phone className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{user.phone_number}</span>
              </div>
            )}
            {user.location && (
              <div className="flex items-center justify-center gap-4">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{user.location}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- Experience Card --- */}
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-3">
              <Briefcase className="text-blue-600" />
              Experience
            </span>
            <Button size="sm" variant="outline" onClick={() => handleOpenModal('experience')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {user.job_experiences?.length > 0 ? (
              user.job_experiences.map((exp) => (
                <li key={exp.id} className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                      <Briefcase className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-bold">{exp.job_title}</h3>
                      <p className="text-sm text-gray-700">{exp.company_name}</p>
                      <p className="text-xs text-gray-500">{exp.employment_type}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenModal('experience', exp)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete('experience', exp.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No experience added yet.</p>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* --- Education Card --- */}
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-3">
              <GraduationCap className="text-blue-600" />
              Education
            </span>
            <Button size="sm" variant="outline" onClick={() => handleOpenModal('education')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {user.educations?.length > 0 ? (
              user.educations.map((edu) => (
                <li key={edu.id} className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                      <GraduationCap className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-bold">{edu.school_name}</h3>
                      <p className="text-sm text-gray-700">
                        {edu.degree}, {edu.field_of_study}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenModal('education', edu)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete('education', edu.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No education added yet.</p>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* --- Skills Card --- */}
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-3">
              <Sparkles className="text-blue-600" />
              Skills
            </span>
            <Button size="sm" variant="outline" onClick={() => handleOpenModal('skill')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user.skills?.length > 0 ? (
              user.skills.map((skill) => (
                <div key={skill.id} className="flex items-center gap-1">
                  <Badge variant="secondary">{skill.name}</Badge>
                  <button
                    onClick={() => handleDelete('skill', skill.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No skills added yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- CUD Modal --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Add'} {itemType}
            </DialogTitle>
            <DialogDescription>
              {`Fill in the details for your ${itemType} below.`}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());
              handleSave(data);
            }}
          >
            {itemType === 'experience' && (
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    name="job_title"
                    defaultValue={(editingItem as JobExperience)?.job_title}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    defaultValue={(editingItem as JobExperience)?.company_name}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="employment_type">Employment Type</Label>
                  <Input
                    id="employment_type"
                    name="employment_type"
                    defaultValue={(editingItem as JobExperience)?.employment_type}
                    required
                  />
                </div>
              </div>
            )}
            {itemType === 'education' && (
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="school_name">School Name</Label>
                  <Input
                    id="school_name"
                    name="school_name"
                    defaultValue={(editingItem as Education)?.school_name}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    name="degree"
                    defaultValue={(editingItem as Education)?.degree}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="field_of_study">Field of Study</Label>
                  <Input
                    id="field_of_study"
                    name="field_of_study"
                    defaultValue={(editingItem as Education)?.field_of_study}
                    required
                  />
                </div>
              </div>
            )}
            {itemType === 'skill' && (
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Skill Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={(editingItem as Skill)?.name}
                    required
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;