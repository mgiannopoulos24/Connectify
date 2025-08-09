import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, Briefcase, LogOut, MessageSquare, Network as NetworkIcon, User } from 'lucide-react';

const Homepage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/homepage" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
                            <NetworkIcon />
                            <span>Connectify</span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link to="/homepage" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                                <NetworkIcon className="w-6 h-6" />
                                <span className="text-xs">Home</span>
                            </Link>
                            <Link to="/jobs" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                                <Briefcase className="w-6 h-6" />
                                <span className="text-xs">Jobs</span>
                            </Link>
                            <Link to="/messaging" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                                <MessageSquare className="w-6 h-6" />
                                <span className="text-xs">Messaging</span>
                            </Link>
                            <Link to="/notifications" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                                <Bell className="w-6 h-6" />
                                <span className="text-xs">Notifications</span>
                            </Link>
                            <Link to="/profile" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                               <User className="w-6 h-6" />
                               <span className="text-xs">Me</span>
                            </Link>
                             <Button onClick={logout} variant="destructive" size="sm">
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <aside className="md:col-span-1">
                        <div className="bg-white p-4 rounded-lg shadow">
                           {user && (
                             <>
                                <div className="text-center">
                                    <User className="mx-auto h-16 w-16 rounded-full text-gray-500" />
                                    <h3 className="mt-2 text-lg font-semibold">{user.name} {user.surname}</h3>
                                    <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                                </div>
                                <div className="mt-4">
                                     <Button className="w-full" variant="outline" onClick={() => navigate('/profile')}>View Profile</Button>
                                </div>
                             </>
                           )}
                        </div>
                    </aside>

                    <div className="md:col-span-2">
                         <div className="bg-white p-4 rounded-lg shadow">
                            <h2 className="text-xl font-bold">Your Feed</h2>
                            <p className="mt-4">Posts will appear here...</p>
                        </div>
                    </div>

                    <aside className="md:col-span-1">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="font-semibold">Connectify News</h3>
                            <p className="mt-2 text-sm">Stay tuned for updates!</p>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default Homepage;