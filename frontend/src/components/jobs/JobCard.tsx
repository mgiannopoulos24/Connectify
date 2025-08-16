import React from 'react';
import { Link } from 'react-router-dom';
import { JobPosting } from '@/types/job';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Briefcase } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: JobPosting;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <Link to={`/jobs/${job.id}`} className="block">
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
        <CardContent>
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
            {job.skills.length > 3 && <Badge variant="outline">+{job.skills.length - 3} more</Badge>}
          </div>
          <p className="text-xs text-gray-400">
            Posted {formatDistanceToNow(new Date(job.inserted_at), { addSuffix: true })}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
};

export default JobCard;