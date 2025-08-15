import React, { useEffect, useState } from 'react';
import { getSkills, createSkill, updateSkill, deleteSkill } from '@/services/skillService';
import { Skill } from '@/types/skill';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';

const AdminSkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setIsLoading(true);
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (err) {
      setError('Failed to fetch skills.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (skill: Skill | null = null) => {
    setEditingSkill(skill);
    setFormData(skill ? { name: skill.name } : { name: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSkill(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSkill) {
        await updateSkill(editingSkill.id, formData);
      } else {
        await createSkill(formData);
      }
      fetchSkills();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save skill:', error);
      alert('Could not save skill.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      try {
        await deleteSkill(id);
        fetchSkills();
      } catch (error) {
        console.error('Failed to delete skill:', error);
        alert('Could not delete skill.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Skill Management</h1>
          <Button onClick={() => handleOpenModal()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Skill List</CardTitle>
            <CardDescription>A list of all skills in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Skill Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skills.map((skill) => (
                  <TableRow key={skill.id}>
                    <TableCell className="font-medium">{skill.name}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(skill)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(skill.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>{skills.length}</strong> skills
            </div>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSkill ? 'Edit' : 'Add'} Skill</DialogTitle>
            <DialogDescription>
              Enter the name for the skill below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Skill Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminSkillsPage;
