import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById } from '@/services/userService';
import { User } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserCircle, Briefcase, GraduationCap, Sparkles, MapPin, Mail, MessageSquare, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { sendConnectionRequest } from '@/services/connectionService';

const UserProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const fetchUser = async () => {
            setIsLoading(true);
            try {
                const userData = await getUserById(userId);
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    const handleConnect = async () => {
        if (!userId) return;
        setIsConnecting(true);
        try {
            await sendConnectionRequest(userId);
            alert('Connection request sent!');
        } catch (error) {
            console.error("Failed to send connection request:", error);
            alert('Failed to send connection request.');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleMessage = () => {
        if (!userId) return;
        navigate(`/messaging/${userId}`);
    };

    if (isLoading) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;
    }

    if (!user) {
        return <div className="text-center py-10">User not found.</div>;
    }

    return (
        <div className="container mx-auto max-w-3xl space-y-8 px-4">
            <Card className="w-full shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
                        {user.photo_url ? (
                            <img src={user.photo_url} alt="User" className="h-full w-full rounded-full object-cover" />
                        ) : (
                            <UserCircle className="h-16 w-16 text-gray-500" />
                        )}
                    </div>
                    <CardTitle className="text-3xl font-bold">{`${user.name} ${user.surname}`}</CardTitle>
                    <CardDescription className="text-lg capitalize text-blue-600">
                        {user.job_experiences?.[0]?.job_title || 'Professional'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mx-auto max-w-sm space-y-4 text-center">
                        {user.location && (
                            <div className="flex items-center justify-center gap-4">
                                <MapPin className="h-5 w-5 text-gray-500" />
                                <span className="text-gray-700">{user.location}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-4">
                            <Mail className="h-5 w-5 text-gray-500" />
                            <span className="text-gray-700">{user.email}</span>
                        </div>
                    </div>
                    <div className="mt-8 flex gap-4 justify-center">
                        <Button onClick={handleConnect} disabled={isConnecting}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            {isConnecting ? 'Sending...' : 'Connect'}
                        </Button>
                        <Button onClick={handleMessage} variant="outline">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full shadow-lg">
                <CardHeader><CardTitle className="flex items-center gap-3"><Briefcase className="text-blue-600" />Experience</CardTitle></CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {user.job_experiences?.length > 0 ? (
                            user.job_experiences.map((exp) => (
                                <li key={exp.id} className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200"><Briefcase className="h-5 w-5 text-gray-600" /></div>
                                    <div>
                                        <h3 className="font-bold">{exp.job_title}</h3>
                                        <p className="text-sm text-gray-700">{exp.company_name}</p>
                                        <p className="text-xs text-gray-500">{exp.employment_type}</p>
                                    </div>
                                </li>
                            ))
                        ) : (<p className="text-gray-500">No experience information available.</p>)}
                    </ul>
                </CardContent>
            </Card>

            <Card className="w-full shadow-lg">
                <CardHeader><CardTitle className="flex items-center gap-3"><GraduationCap className="text-blue-600" />Education</CardTitle></CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {user.educations?.length > 0 ? (
                            user.educations.map((edu) => (
                                <li key={edu.id} className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200"><GraduationCap className="h-5 w-5 text-gray-600" /></div>
                                    <div>
                                        <h3 className="font-bold">{edu.school_name}</h3>
                                        <p className="text-sm text-gray-700">{edu.degree}, {edu.field_of_study}</p>
                                    </div>
                                </li>
                            ))
                        ) : (<p className="text-gray-500">No education information available.</p>)}
                    </ul>
                </CardContent>
            </Card>

            <Card className="w-full shadow-lg">
                <CardHeader><CardTitle className="flex items-center gap-3"><Sparkles className="text-blue-600" />Skills</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {user.skills?.length > 0 ? (
                            user.skills.map((skill) => <Badge key={skill.id} variant="secondary">{skill.name}</Badge>)
                        ) : (<p className="text-gray-500">No skills listed.</p>)}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserProfilePage;