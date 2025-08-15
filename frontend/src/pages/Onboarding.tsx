import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, CheckCircle, Upload, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompanySummary } from '@/types/company';
import { searchCompanies } from '@/services/companyService';
import CompanyAutocomplete from '@/components/common/CompanyAutocomplete';
import debounce from 'lodash.debounce';

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

const topCompanies = [
  { id: 'google', name: 'Google', logo: 'https://logo.clearbit.com/google.com' },
  { id: 'meta', name: 'Meta', logo: 'https://logo.clearbit.com/meta.com' },
  { id: 'amazon', name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com' },
  { id: 'microsoft', name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com' },
  { id: 'apple', name: 'Apple', logo: 'https://logo.clearbit.com/apple.com' },
];

const Onboarding = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- State for each step ---
  const [location, setLocation] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [companySearch, setCompanySearch] = useState('');
  const [companyResults, setCompanyResults] = useState<CompanySummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLookingForJob, setIsLookingForJob] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [followedCompanies, setFollowedCompanies] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [verificationCode, setVerificationCode] = useState('');

  // --- Handlers ---
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term) {
        setIsSearching(true);
        const results = await searchCompanies(term);
        setCompanyResults(results);
        setIsSearching(false);
      } else {
        setCompanyResults([]);
      }
    }, 300),
    [],
  );

  useEffect(() => {
    debouncedSearch(companySearch);
    return () => debouncedSearch.cancel();
  }, [companySearch, debouncedSearch]);

  const handleCompanySelect = (company: CompanySummary | null, name: string) => {
    setCompanyName(name);
    setSelectedCompanyId(company ? company.id : null);
    setCompanySearch(''); // Clear search to hide dropdown
    setCompanyResults([]);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const toggleCompanyFollow = (companyName: string) => {
    const newSet = new Set(followedCompanies);
    if (newSet.has(companyName)) {
      newSet.delete(companyName);
    } else {
      newSet.add(companyName);
    }
    setFollowedCompanies(newSet);
  };

  const handleNext = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Step 1: Location
      if (step === 1) {
        if (!location) throw new Error('Location is required.');
        const response = await axios.put(`/api/users/${user?.id}`, { user: { location } });
        if (setUser) setUser(response.data.data);
      }

      // Step 2: Job Experience
      if (step === 2) {
        if (!jobTitle || !employmentType || !companyName)
          throw new Error('All job fields are required.');
        const jobExperiencePayload: any = {
          job_title: jobTitle,
          employment_type: employmentType,
        };
        if (selectedCompanyId) {
          jobExperiencePayload.company_id = selectedCompanyId;
        } else {
          jobExperiencePayload.company_name = companyName;
        }
        await axios.post('/api/job_experiences', {
          job_experience: jobExperiencePayload,
        });
        if (!selectedCompanyId) {
          await axios.post('/api/interests', { interest: { name: companyName, type: 'company' } });
        }
      }

      // Step 3: Email Confirmation
      if (step === 3) {
        if (!verificationCode || verificationCode.length !== 6) {
          throw new Error('Please enter a valid 6-digit verification code.');
        }
        await axios.post('/api/email/confirm', { token: verificationCode });
      }

      // Step 4: Looking for a job (This step is now removed but logic is kept in case you want to re-add)
      // Step 5 -> 4: Photo Upload
      if (step === 4 && photoFile) {
        // This is a placeholder as backend doesn't support photo uploads yet
        console.log('Photo would be uploaded here.');
      }

      // Step 6 -> 5: Follow Companies
      if (step === 5) {
        const followPromises = Array.from(followedCompanies).map((company) =>
          axios.post('/api/interests', { interest: { name: company, type: 'company' } }),
        );
        await Promise.all(followPromises);
      }

      // Step 7 -> 6: Complete Onboarding
      if (step === 6) {
        await axios.put(`/api/users/${user?.id}`, { user: { onboarding_completed: true } });
        navigate('/homepage'); // Go to homepage
        return;
      }

      if (step < 6) {
        setStep(step + 1);
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data.errors;
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => `${field} ${(messages as string[]).join(', ')}`)
          .join('; ');
        setError(errorMessages || 'An error occurred.');
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle>Welcome, {user?.name}! What's your location?</CardTitle>
              <CardDescription>This helps us connect you with local opportunities.</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g., Athens, Greece"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </CardContent>
          </>
        );
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle>Your Most Recent Role</CardTitle>
              <CardDescription>Tell us about your job experience.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label htmlFor="job-title">Job Title</Label>
                <Input
                  id="job-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="employment-type">Employment Type</Label>
                <Select onValueChange={setEmploymentType} value={employmentType}>
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
              <div className="relative">
                <Label htmlFor="company-name">Company Name</Label>
                <CompanyAutocomplete
                  searchTerm={companySearch}
                  onSearchChange={setCompanySearch}
                  onSelect={handleCompanySelect}
                  results={companyResults}
                  isLoading={isSearching}
                  placeholder={companyName || 'Search or type to create...'}
                />
              </div>
            </CardContent>
          </>
        );
      case 3:
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle>Confirm Your Email</CardTitle>
              <CardDescription>
                We've sent a 6-digit verification code to <strong>{user?.email}</strong>. Please
                enter it below to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <div className="w-full max-w-xs">
                <Label htmlFor="verification-code" className="sr-only">
                  Verification Code
                </Label>
                <Input
                  id="verification-code"
                  name="verification-code"
                  placeholder="_ _ _ _ _ _"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em]"
                />
              </div>
              <p className="text-sm text-gray-500">
                Didn't receive a code? Check your spam folder.
              </p>
            </CardContent>
          </>
        );
      case 4:
        return (
          <>
            <CardHeader>
              <CardTitle>Add a Profile Photo</CardTitle>
              <CardDescription>A photo helps people recognize you.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div
                className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-12 h-12 text-gray-500" />
                )}
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  className="hidden"
                  accept="image/png, image/jpeg"
                />
              </div>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                {photoFile ? 'Change Photo' : 'Upload a Photo'}
              </Button>
            </CardContent>
          </>
        );
      case 5:
        return (
          <>
            <CardHeader>
              <CardTitle>Follow Companies to Stay Updated</CardTitle>
              <CardDescription>
                Get the latest news and job openings from companies you care about.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              {topCompanies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => toggleCompanyFollow(company.name)}
                  className={cn(
                    'flex items-center gap-4 p-3 border rounded-lg transition-all',
                    followedCompanies.has(company.name)
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-300 hover:bg-gray-50',
                  )}
                >
                  <img
                    src={company.logo}
                    alt={`${company.name} Logo`}
                    className="w-10 h-10 rounded-full bg-white"
                  />
                  <span className="font-semibold">{company.name}</span>
                  {followedCompanies.has(company.name) && (
                    <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />
                  )}
                </button>
              ))}
            </CardContent>
          </>
        );
      case 6:
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle>You're All Set!</CardTitle>
              <CardDescription>Your profile is ready. Let's start connecting!</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Building className="w-24 h-24 text-blue-500" />
            </CardContent>
          </>
        );
      default:
        return <p>Loading...</p>;
    }
  };

  const buttonText = () => {
    if (step === 4 && !photoFile) return 'Skip and Continue';
    if (step === 5) return 'Finish';
    if (step === 6) return 'Go to Homepage';
    return 'Continue';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="mx-auto max-w-lg w-full">
        {renderStep()}
        <div className="p-6 pt-2">
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <Button onClick={handleNext} className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Saving...' : buttonText()}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;