import React, { useState, useEffect, useCallback } from 'react';
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
  Building,
  Heart,
  Users as FollowersIcon,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axios from 'axios';
import { usePresence } from '@/contexts/PresenceContext';
import StatusIndicator from '@/components/common/StatusIndicator';
import CompanyAutocomplete from '@/components/common/CompanyAutocomplete';
import { CompanySummary } from '@/types/company';
import { searchCompanies, unfollowCompany } from '@/services/companyService';
import debounce from 'lodash.debounce';
import { Skill } from '@/types/skill';
import { searchSkills, addUserSkill } from '@/services/skillService';
import SkillAutocomplete from '@/components/common/SkillAutocomplete';
import { JobExperience, Education } from '@/types/user';
import { Link } from 'react-router-dom';
import { unfollowUser } from '@/services/userService';
import { toast } from 'sonner';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const { getUserStatus } = usePresence();
  const [editingItem, setEditingItem] = useState<JobExperience | Education | null>(null);
  const [itemType, setItemType] = useState<'experience' | 'education' | 'skill' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user || !setUser) {
    return <div>Loading user profile...</div>;
  }

  const userStatus = getUserStatus(user.id);

  const handleOpenModal = (
    type: 'experience' | 'education' | 'skill',
    item: JobExperience | Education | null = null,
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

    const endpointMap = {
      experience: 'job_experiences',
      education: 'educations',
      skill: 'skills',
    };
    const stateKeyMap = {
      experience: 'job_experiences',
      education: 'educations',
      skill: 'skills',
    } as const;

    try {
      await axios.delete(`/api/${endpointMap[type]}/${id}`);
      setUser((prevUser) => {
        if (!prevUser) return null;
        const key = stateKeyMap[type];
        const updatedItems = (prevUser[key] || []).filter((item: any) => item.id !== id);
        return { ...prevUser, [key]: updatedItems };
      });
    } catch (error) {
      console.error(`Failed to delete ${type}`, error);
      alert(`Error: Could not delete ${type}.`);
    }
  };

  const handleSaveExperienceOrEducation = async (formData: any) => {
    if (!itemType || itemType === 'skill') return;

    const endpointMap = {
      experience: 'job_experiences',
      education: 'educations',
    };

    const payloadKeyMap = {
      experience: 'job_experience',
      education: 'education',
    };

    const stateKeyMap = {
      experience: 'job_experiences',
      education: 'educations',
    } as const;

    const endpoint = endpointMap[itemType];
    const payloadKey = payloadKeyMap[itemType];

    const url = editingItem ? `/api/${endpoint}/${editingItem.id}` : `/api/${endpoint}`;
    const method = editingItem ? 'put' : 'post';

    try {
      const response = await axios[method](url, { [payloadKey]: formData });
      const savedItem = response.data.data;

      setUser((prevUser) => {
        if (!prevUser) return null;
        const key = stateKeyMap[itemType];
        let updatedItems;
        if (editingItem) {
          updatedItems = (prevUser[key] || []).map((item: any) =>
            item.id === savedItem.id ? savedItem : item,
          );
        } else {
          updatedItems = [...(prevUser[key] || []), savedItem];
        }
        return { ...prevUser, [key]: updatedItems };
      });

      handleCloseModal();
    } catch (error) {
      console.error(`Failed to save ${itemType}`, error);
      alert(`Error: Could not save ${itemType}.`);
    }
  };

  const handleSaveSkill = async (skillName: string) => {
    try {
      const savedSkill = await addUserSkill(skillName);
      setUser((prevUser) => {
        if (!prevUser) return null;
        const currentSkills = prevUser.skills || [];
        if (currentSkills.some((s) => s.id === savedSkill.id)) {
          return prevUser;
        }
        return {
          ...prevUser,
          skills: [...currentSkills, savedSkill],
        };
      });
      handleCloseModal();
    } catch (error) {
      console.error(`Failed to save skill`, error);
      alert(`Error: Could not save skill.`);
    }
  };

  const handleUnfollowCompany = async (companyId: string, companyName: string) => {
    try {
      await unfollowCompany(companyId);
      setUser((prev) => ({
        ...prev!,
        followed_companies: prev!.followed_companies.filter((c) => c.id !== companyId),
      }));
      toast.success(`You unfollowed ${companyName}.`);
    } catch (error) {
      toast.error('Failed to unfollow company.');
    }
  };

  const handleUnfollowUser = async (userId: string, userName: string) => {
    try {
      await unfollowUser(userId);
      setUser((prev) => ({
        ...prev!,
        followed_users: prev!.followed_users.filter((u) => u.id !== userId),
      }));
      toast.success(`You unfollowed ${userName}.`);
    } catch (error) {
      toast.error('Failed to unfollow user.');
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
            <div className="flex items-center justify-center gap-4">
              <FollowersIcon className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">{user.followers_count} followers</span>
            </div>
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
                      <p className="text-sm text-gray-700">{exp.company.name}</p>
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
                <Badge key={skill.id} variant="secondary" className="group relative pr-6">
                  {skill.name}
                  <button
                    onClick={() => handleDelete('skill', skill.id)}
                    className="absolute top-1/2 right-1 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-gray-500">No skills added yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- Interests (Following) Card --- */}
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Heart className="text-blue-600" />
            Interests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="companies" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="companies">Companies</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
            </TabsList>

            {/* Companies Tab */}
            <TabsContent value="companies" className="mt-4">
              {user.followed_companies && user.followed_companies.length > 0 ? (
                <Carousel
                  opts={{
                    align: 'start',
                    loop: user.followed_companies.length > 3,
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {user.followed_companies.map((company) => (
                      <CarouselItem
                        key={company.id}
                        className="basis-full md:basis-1/2 lg:basis-1/3"
                      >
                        <div className="p-1">
                          <Card className="h-full">
                            <CardContent className="flex flex-col items-center text-center p-6 aspect-square justify-between">
                              <Link
                                to={`/companies/${company.id}`}
                                className="flex-grow flex flex-col items-center"
                              >
                                {company.logo_url ? (
                                  <img
                                    src={company.logo_url}
                                    alt={company.name}
                                    className="h-20 w-20 rounded-lg object-contain bg-white mb-4"
                                  />
                                ) : (
                                  <Building className="h-20 w-20 text-gray-400 mb-4" />
                                )}
                                <p className="font-semibold">{company.name}</p>
                              </Link>
                              <Button
                                variant="outline"
                                className="w-full mt-4"
                                onClick={() => handleUnfollowCompany(company.id, company.name)}
                              >
                                Unfollow
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {user.followed_companies.length > 3 && (
                    <>
                      <CarouselPrevious />
                      <CarouselNext />
                    </>
                  )}
                </Carousel>
              ) : (
                <p className="text-gray-500 text-center pt-8">
                  Not following any companies yet.
                </p>
              )}
            </TabsContent>

            {/* People Tab */}
            <TabsContent value="people" className="mt-4">
              {user.followed_users && user.followed_users.length > 0 ? (
                <Carousel
                  opts={{
                    align: 'start',
                    loop: user.followed_users.length > 3,
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {user.followed_users.map((followedUser) => (
                      <CarouselItem
                        key={followedUser.id}
                        className="basis-full md:basis-1/2 lg:basis-1/3"
                      >
                        <div className="p-1">
                          <Card className="h-full">
                            <CardContent className="flex flex-col items-center text-center p-6 aspect-square justify-between">
                              <Link
                                to={`/profile/${followedUser.id}`}
                                className="flex-grow flex flex-col items-center"
                              >
                                {followedUser.photo_url ? (
                                  <img
                                    src={followedUser.photo_url}
                                    alt={followedUser.name}
                                    className="h-20 w-20 rounded-full object-cover mb-4"
                                  />
                                ) : (
                                  <UserCircle className="h-20 w-20 text-gray-400 mb-4" />
                                )}
                                <p className="font-semibold">
                                  {followedUser.name} {followedUser.surname}
                                </p>
                              </Link>
                              <Button
                                variant="outline"
                                className="w-full mt-4"
                                onClick={() =>
                                  handleUnfollowUser(
                                    followedUser.id,
                                    `${followedUser.name} ${followedUser.surname}`,
                                  )
                                }
                              >
                                Unfollow
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {user.followed_users.length > 3 && (
                    <>
                      <CarouselPrevious />
                      <CarouselNext />
                    </>
                  )}
                </Carousel>
              ) : (
                <p className="text-gray-500 text-center pt-8">Not following any people yet.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <EditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        itemType={itemType}
        editingItem={editingItem}
        onSave={handleSaveExperienceOrEducation}
        onSaveSkill={handleSaveSkill}
      />
    </div>
  );
};

// --- Modal Component ---
const EditModal = ({
  isOpen,
  onClose,
  itemType,
  editingItem,
  onSave,
  onSaveSkill,
}: {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'experience' | 'education' | 'skill' | null;
  editingItem: any;
  onSave: (data: any) => void;
  onSaveSkill: (name: string) => void;
}) => {
  const [formData, setFormData] = useState<any>({});
  const [companySearch, setCompanySearch] = useState('');
  const [companyResults, setCompanyResults] = useState<CompanySummary[]>([]);
  const [isSearchingCompanies, setIsSearchingCompanies] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<{
    id: string | null;
    name: string;
  } | null>(null);

  const [skillSearch, setSkillSearch] = useState('');
  const [skillResults, setSkillResults] = useState<Skill[]>([]);
  const [isSearchingSkills, setIsSearchingSkills] = useState(false);

  const employmentTypes = [
    'Full-time',
    'Part-time',
    'Self-employed',
    'Freelance',
    'Contract',
    'Internship',
    'Apprenticeship',
    'Seasonal',
  ];

  useEffect(() => {
    if (isOpen) {
      const initialData = editingItem
        ? { ...editingItem }
        : {
            job_title: '',
            employment_type: '',
            school_name: '',
            degree: '',
            field_of_study: '',
          };
      setFormData(initialData);

      if (itemType === 'experience' && editingItem?.company) {
        setSelectedCompany(editingItem.company);
      } else {
        setSelectedCompany(null);
      }
    }
  }, [isOpen, itemType, editingItem]);

  const debouncedCompanySearch = useCallback(
    debounce(async (term: string) => {
      if (term) {
        setIsSearchingCompanies(true);
        const results = await searchCompanies(term);
        setCompanyResults(results);
        setIsSearchingCompanies(false);
      } else {
        setCompanyResults([]);
      }
    }, 300),
    [],
  );

  const debouncedSkillSearch = useCallback(
    debounce(async (term: string) => {
      if (term) {
        setIsSearchingSkills(true);
        const results = await searchSkills(term);
        setSkillResults(results);
        setIsSearchingSkills(false);
      } else {
        setSkillResults([]);
      }
    }, 300),
    [],
  );

  useEffect(() => {
    debouncedCompanySearch(companySearch);
    return () => debouncedCompanySearch.cancel();
  }, [companySearch, debouncedCompanySearch]);

  useEffect(() => {
    debouncedSkillSearch(skillSearch);
    return () => debouncedSkillSearch.cancel();
  }, [skillSearch, debouncedSkillSearch]);

  const handleCompanySelect = (company: CompanySummary | null, name: string) => {
    setSelectedCompany({ id: company ? company.id : null, name });
    setCompanySearch('');
    setCompanyResults([]);
  };

  const handleSkillSelect = (skillName: string) => {
    onSaveSkill(skillName);
    setSkillSearch('');
    setSkillResults([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, employment_type: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let submissionData = { ...formData };

    if (itemType === 'experience') {
      submissionData.company_id = selectedCompany?.id || undefined;
      submissionData.company_name = selectedCompany?.name || undefined;
      if (!submissionData.company_id) delete submissionData.company_id;
      if (!submissionData.company_name) delete submissionData.company_name;
    }

    onSave(submissionData);
  };

  if (!isOpen || !itemType) return null;

  const isSkillModal = itemType === 'skill';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Edit' : 'Add'} {itemType}
          </DialogTitle>
          <DialogDescription>
            {isSkillModal
              ? 'Search for a skill or add a new one.'
              : `Fill in the details for your ${itemType} below.`}
          </DialogDescription>
        </DialogHeader>
        {isSkillModal ? (
          <div className="py-4 relative">
            <SkillAutocomplete
              searchTerm={skillSearch}
              onSearchChange={setSkillSearch}
              onSelect={handleSkillSelect}
              results={skillResults}
              isLoading={isSearchingSkills}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {itemType === 'experience' && (
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    name="job_title"
                    value={formData.job_title || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2 relative">
                  <Label htmlFor="company_name">Company Name</Label>
                  <CompanyAutocomplete
                    searchTerm={companySearch}
                    onSearchChange={setCompanySearch}
                    onSelect={handleCompanySelect}
                    results={companyResults}
                    isLoading={isSearchingCompanies}
                    placeholder={selectedCompany?.name || 'Search or type to create'}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="employment_type">Employment Type</Label>
                  <Select
                    value={formData.employment_type || ''}
                    onValueChange={handleSelectChange}
                    name="employment_type"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    value={formData.school_name || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    name="degree"
                    value={formData.degree || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="field_of_study">Field of Study</Label>
                  <Input
                    id="field_of_study"
                    name="field_of_study"
                    value={formData.field_of_study || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePage;