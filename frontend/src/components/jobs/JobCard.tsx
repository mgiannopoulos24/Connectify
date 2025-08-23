import React from 'react';
import { Link } from 'react-router-dom';
import { JobPosting } from '@/types/job';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building,
  MapPin,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    <div
      className={cn('absolute top-2 right-2 p-1.5 rounded-full z-10', className)}
      title={tooltip}
    >
      <Icon className="h-5 w-5" />
    </div>
  );
};

const JobCard: React.FC<JobCardProps> = ({ job, matchingSkillsCount }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow relative flex flex-col">
      {/* --- THIS LINE IS NOW RESTORED --- */}
      <ApplicationStatusIndicator status={job.application_status} />

      <div className="flex-grow flex flex-col">
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
        {job.relevant_connections && job.relevant_connections.length > 0 && (
          <div className="border-t mt-auto p-3 bg-gray-50">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              <div className="flex items-center gap-1">
                <TooltipProvider delayDuration={100}>
                  {job.relevant_connections.slice(0, 3).map((conn) => (
                    <Tooltip key={conn.id}>
                      <TooltipTrigger asChild>
                        <Link to={`/profile/${conn.id}`}>
                          <img
                            src={conn.photo_url || ''}
                            alt={`${conn.name} ${conn.surname}`}
                            className="h-6 w-6 rounded-full object-cover border-2 border-white -ml-2 first:ml-0"
                          />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {conn.name} {conn.surname}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
                <p className="text-xs text-gray-600 ml-2">
                  {job.relevant_connections[0].name.split(' ')[0]}
                  {job.relevant_connections.length > 1 &&
                    ` and ${job.relevant_connections.length - 1} other connection${
                      job.relevant_connections.length > 2 ? 's' : ''
                    }`}{' '}
                  works here
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default JobCard;