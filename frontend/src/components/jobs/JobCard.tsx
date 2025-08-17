import React from 'react';
import { Link } from 'react-router-dom';
import { JobPosting } from '@/types/job';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Briefcase, CheckCircle, XCircle, Clock, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: JobPosting;
  matchingSkillsCount?: number;
}

const ApplicationStatusIndicator: React.FC<{ status: JobPosting['application_status'] }> = ({
  status,
}) => {
  if (!status) return null;

  const statusMap = {
    accepted: {
      Icon: CheckCircle,
      className: 'text-green-600 bg-green-100',
      tooltip: 'Application Accepted',
    },
    rejected: {
      Icon: XCircle,
      className: 'text-red-600 bg-red-100',
      tooltip: 'Application Update',
    },
    submitted: {
      Icon: Clock,
      className: 'text-gray-600 bg-yellow-100',
      tooltip: 'Application Submitted',
    },
    reviewed: {
      Icon: Clock,
      className: 'text-gray-600 bg-yellow-100',
      tooltip: 'Application In Review',
    },
  };

  const currentStatus = statusMap[status];
  if (!currentStatus) return null;

  const { Icon, className, tooltip } = currentStatus;

  return (
    <div className={cn('absolute top-2 right-2 p-1.5 rounded-full', className)} title={tooltip}>
      <Icon className="h-5 w-5" />
    </div>
  );
};

const JobCard: React.FC<JobCardProps> = ({ job, matchingSkillsCount }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow relative flex flex-col">
      <ApplicationStatusIndicator status={job.application_status} />
      <Link to={`/jobs/${job.id}`} className="block flex-grow">
        <CardHeader>
          <div className="flex items-start gap-4">
            {job.company.logo_url ? (
              <img
                src={job.company.logo_url}
                alt={job.company.name}
                className="h-12 w-12 rounded-md object-contain bg-white"
              />
            ) : (
              <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                <Building className="h-6 w-6 text-gray-500" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg hover:underline">{job.title}</CardTitle>
              <CardDescription>{job.company.name}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {job.location || 'Remote'}
            </span>
            <span className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> {job.job_type}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.slice(0, 3).map((skill) => (
              <Badge key={skill.id} variant="secondary">
                {skill.name}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge variant="outline">+{job.skills.length - 3} more</Badge>
            )}
          </div>
          <div className="flex-grow" />
          {matchingSkillsCount && matchingSkillsCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold mb-3">
              <Sparkles className="h-4 w-4" />
              <span>
                {matchingSkillsCount} Matching Skill{matchingSkillsCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
          <p className="text-xs text-gray-400">
            Posted {formatDistanceToNow(new Date(job.inserted_at), { addSuffix: true })}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
};

export default JobCard;
