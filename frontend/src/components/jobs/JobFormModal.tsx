import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { JobPosting } from '@/types/job';
import { Skill } from '@/types/skill';
import { CompanySummary } from '@/types/company';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Building, Sparkles, CheckCircle } from 'lucide-react';
import CompanyAutocomplete from '../common/CompanyAutocomplete';
import SkillMultiSelect from '../common/SkillMultiSelect';
import { searchCompanies } from '@/services/companyService';
import debounce from 'lodash.debounce';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// --- Validation Schema ---
const jobFormSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters.'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters.'),
  location: z.string().optional(),
  job_type: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary']),
  company: z.object({
    id: z.string().nullable(),
    name: z.string().trim().min(1, 'Company is required.'),
  }),
  skills: z.array(z.object({ id: z.string(), name: z.string() })).min(1, 'At least one skill is required.'),
});
type JobFormValues = z.infer<typeof jobFormSchema>;

// --- Constants ---
const jobTypes: JobPosting['job_type'][] = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];
const steps = [
  { id: 1, name: 'Job Details', fields: ['title', 'company', 'description', 'location', 'job_type'] },
  { id: 2, name: 'Required Skills', fields: ['skills'] },
  { id: 3, name: 'Review & Post' },
];

// --- Stepper UI Component ---
const Stepper = ({ currentStep }: { currentStep: number }) => (
  <nav className="flex items-center justify-center py-4">
    {steps.map((step, index) => (
      <React.Fragment key={step.id}>
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all',
              currentStep > step.id ? 'bg-blue-600 text-white' : '',
              currentStep === step.id ? 'bg-blue-600 text-white ring-4 ring-blue-200' : '',
              currentStep < step.id ? 'bg-gray-200 text-gray-500' : ''
            )}
          >
            {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
          </div>
          <p className={cn('text-sm mt-2', currentStep >= step.id ? 'text-gray-800 font-semibold' : 'text-gray-500')}>
            {step.name}
          </p>
        </div>
        {index < steps.length - 1 && <div className="flex-1 h-1 bg-gray-200 mx-4" />}
      </React.Fragment>
    ))}
  </nav>
);

// --- Review Step UI Component ---
const ReviewStep = ({ formData }: { formData: JobFormValues }) => (
  <div className="space-y-6 text-sm">
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Building className="w-5 h-5 text-blue-600" /> Job Details</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <strong className="text-gray-600">Title:</strong>
        <span>{formData.title}</span>
        <strong className="text-gray-600">Company:</strong>
        <span>{formData.company.name}</span>
        <strong className="text-gray-600">Location:</strong>
        <span>{formData.location || 'Not specified'}</span>
        <strong className="text-gray-600">Job Type:</strong>
        <span>{formData.job_type}</span>
        <strong className="text-gray-600 col-span-2">Description:</strong>
        <p className="col-span-2 whitespace-pre-wrap">{formData.description}</p>
      </div>
    </div>
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5 text-blue-600" /> Required Skills</h3>
      <div className="flex flex-wrap gap-2">
        {formData.skills.map(skill => <Badge key={skill.id} variant="secondary">{skill.name}</Badge>)}
      </div>
    </div>
  </div>
);

// --- Main Modal Component ---
const JobFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: any) => Promise<void>;
  job?: JobPosting | null;
}> = ({ isOpen, onClose, onSave, job }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    mode: 'onChange',
  });
  
  // FIX: Separate state for the autocomplete's VISIBLE input value.
  const [companyInputValue, setCompanyInputValue] = useState('');
  const [companyResults, setCompanyResults] = useState<CompanySummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Get the actual form value for synchronization.
  const companyFormValue = form.watch('company');

  useEffect(() => {
    if (isOpen) {
      if (job) {
        form.reset({
          title: job.title, description: job.description, location: job.location || '', job_type: job.job_type,
          company: { id: job.company.id, name: job.company.name }, skills: job.skills,
        });
        setCompanyInputValue(job.company.name);
      } else {
        form.reset({
          title: '', description: '', location: '', job_type: 'Full-time',
          company: { id: null, name: '' }, skills: [],
        });
        setCompanyInputValue('');
      }
      setCurrentStep(1);
    }
  }, [job, isOpen, form]);
  
  // FIX: Syncs the local input state if the form state changes (e.g., on reset).
  useEffect(() => {
    setCompanyInputValue(companyFormValue?.name || '');
  }, [companyFormValue]);

  const debouncedSearch = useCallback(debounce(async (term: string) => {
    if (term) {
      setIsSearching(true);
      const results = await searchCompanies(term);
      setCompanyResults(results);
      setIsSearching(false);
    } else {
      setCompanyResults([]);
    }
  }, 300), []);

  useEffect(() => {
    debouncedSearch(companyInputValue);
    return () => debouncedSearch.cancel();
  }, [companyInputValue, debouncedSearch]);

  const handleCompanySelect = (company: CompanySummary | null, name: string) => {
    // This is the key: only update the form's official value upon selection.
    form.setValue('company', { id: company?.id ?? null, name: name }, { shouldValidate: true });
    setCompanyResults([]);
  };

  const handleNextStep = async () => {
    const fieldsToValidate = steps[currentStep - 1].fields as (keyof JobFormValues)[];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };
  
  const handlePrevStep = () => setCurrentStep((prev) => prev - 1);

  const onSubmit = async (data: JobFormValues) => {
    const { skills, company, ...rest } = data;
    const payload = {
      ...rest,
      skill_ids: skills.map((s) => s.id),
      ...(company.id ? { company_id: company.id } : { company_name: company.name }),
    };
    await onSave(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{job ? 'Edit' : 'Create'} Job Posting</DialogTitle>
          <DialogDescription>Follow the steps to post a new job opening.</DialogDescription>
        </DialogHeader>

        <Stepper currentStep={currentStep} />

        <div className="flex-grow overflow-y-auto px-1 pr-4 custom-scrollbar">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="py-4">
              <div className={cn('space-y-6', currentStep !== 1 && 'hidden')}>
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input placeholder="e.g., Senior Frontend Developer" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="company" render={() => ( // field is intentionally not used here to allow separate state
                  <FormItem className="relative"><FormLabel>Company</FormLabel><FormControl>
                    <CompanyAutocomplete searchTerm={companyInputValue} onSearchChange={setCompanyInputValue} onSelect={handleCompanySelect} results={companyResults} isLoading={isSearching} placeholder="Search or type to create..."/>
                  </FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the role..." {...field} rows={5} /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Athens, Greece" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="job_type" render={({ field }) => (
                    <FormItem><FormLabel>Job Type</FormLabel><Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>{jobTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                  )}/>
                </div>
              </div>

              <div className={cn(currentStep !== 2 && 'hidden')}>
                <FormField control={form.control} name="skills" render={({ field }) => (
                  <FormItem className="relative"><FormLabel>Required Skills</FormLabel><FormControl>
                    <SkillMultiSelect selectedSkills={field.value} onSelectionChange={field.onChange} />
                  </FormControl><FormMessage /></FormItem>
                )}/>
              </div>

              <div className={cn(currentStep !== 3 && 'hidden')}>
                <ReviewStep formData={form.watch()} />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="border-t pt-4 mt-4">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handlePrevStep}>
              Back
            </Button>
          )}
          {currentStep < 3 && (
            <Button type="button" onClick={handleNextStep} className="ml-auto">
              Next
            </Button>
          )}
          {currentStep === 3 && (
            <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitting} className="ml-auto">
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {form.formState.isSubmitting ? 'Posting...' : 'Post Job'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobFormModal;