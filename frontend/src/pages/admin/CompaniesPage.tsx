import React, { useEffect, useState } from 'react';
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from '@/services/companyService';
import { Company } from '@/types/company';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle, Edit, Trash2, Building } from 'lucide-react';

const AdminCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', logo_url: '' });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (err) {
      setError('Failed to fetch companies.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (company: Company | null = null) => {
    setEditingCompany(company);
    setFormData(
      company
        ? {
            name: company.name,
            description: company.description || '',
            logo_url: company.logo_url || '',
          }
        : { name: '', description: '', logo_url: '' },
    );
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, formData);
      } else {
        await createCompany(formData);
      }
      fetchCompanies(); // Refetch the list
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save company:', error);
      alert('Could not save company. Please check the console for details.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      try {
        await deleteCompany(id);
        fetchCompanies();
      } catch (error) {
        console.error('Failed to delete company:', error);
        alert('Could not delete company.');
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
          <h1 className="text-3xl font-bold">Company Management</h1>
          <Button onClick={() => handleOpenModal()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Companies</CardTitle>
            <CardDescription>A list of all companies in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt={company.name}
                          className="h-10 w-10 rounded-full object-contain bg-white"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Building className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {company.description || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(company)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(company.id)}
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
              Showing <strong>{companies.length}</strong> companies
            </div>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Edit' : 'Add'} Company</DialogTitle>
            <DialogDescription>
              Fill in the details for the company below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
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

export default AdminCompaniesPage;
