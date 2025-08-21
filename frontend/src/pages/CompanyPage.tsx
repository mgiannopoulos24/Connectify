import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanyById, followCompany, unfollowCompany } from '@/services/companyService';
import { Company } from '@/types/company';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  Building,
  Rss,
  UserPlus,
  UserCheck,
  Briefcase,
  MapPin,
  ChevronRight,
  Users as FollowersIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const CompanyPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { user, setUser } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!companyId) return;

    const fetchCompany = async () => {
      setIsLoading(true);
      try {
        const companyData = await getCompanyById(companyId);
        setCompany(companyData);
      } catch (error) {
        console.error('Failed to fetch company:', error);
        toast.error('Could not load company profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  useEffect(() => {
    if (user && company) {
      const isUserFollowing = user.followed_companies.some((c) => c.id === company.id);
      setIsFollowing(isUserFollowing);
    }
  }, [user, company]);

  const handleFollowToggle = async () => {
    if (!companyId || !user || !setUser || !company) return;

    setIsFollowLoading(true);
    const originalFollowingState = isFollowing;
    setIsFollowing(!originalFollowingState); // Optimistic UI update

    try {
      if (originalFollowingState) {
        await unfollowCompany(companyId);
        setUser((prevUser) => ({
          ...prevUser!,
          followed_companies: prevUser!.followed_companies.filter((c) => c.id !== companyId),
        }));
        toast.success(`You unfollowed ${company?.name}.`);
      } else {
        const { description, job_postings, ...companySummary } = company;
        await followCompany(companyId);
        setUser((prevUser) => ({
          ...prevUser!,
          followed_companies: [...prevUser!.followed_companies, companySummary],
        }));
        toast.success(`You are now following ${company?.name}.`);
      }
    } catch (error) {
      console.error('Failed to toggle follow state:', error);
      toast.error('An error occurred.');
      setIsFollowing(originalFollowingState);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!company) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Not Found</CardTitle>
          <CardDescription>We couldn't find the company you were looking for.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center gap-6">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="h-24 w-24 rounded-lg object-contain bg-white border"
            />
          ) : (
            <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center">
              <Building className="h-12 w-12 text-gray-500" />
            </div>
          )}
          <div className="text-center md:text-left">
            <CardTitle className="text-3xl font-bold">{company.name}</CardTitle>
            <CardDescription className="text-md mt-1">Company profile and updates.</CardDescription>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-600">
              <FollowersIcon className="h-4 w-4" />
              <span>{company.followers_count} followers</span>
            </div>
            <div className="mt-4">
              <Button onClick={handleFollowToggle} disabled={isFollowLoading}>
                {isFollowLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isFollowing ? (
                  <UserCheck className="mr-2 h-4 w-4" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {company.description && (
            <div>
              <h3 className="font-semibold text-lg mb-2">About</h3>
              <p className="whitespace-pre-wrap text-gray-700">{company.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Job Openings Section --- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" /> Job Openings at {company.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {company.job_postings && company.job_postings.length > 0 ? (
            <div className="space-y-3">
              {company.job_postings.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-lg">{job.title}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {job.location || 'Remote'}
                      </span>
                      <Badge variant="secondary">{job.job_type}</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              There are currently no open positions at {company.name}.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rss className="h-5 w-5 text-blue-600" /> Latest Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            Updates and posts from {company.name} will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyPage;