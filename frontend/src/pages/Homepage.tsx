import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getPosts, trackPostView } from '@/services/postService';
import { Post } from '@/types/post';
import { ChevronDown, Loader2 } from 'lucide-react';
import CreatePost from '@/components/posts/CreatePost';
import PostList from '@/components/posts/PostList';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const Homepage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevant' | 'recent'>('relevant');
  const location = useLocation();

  const observer = useRef<IntersectionObserver | null>(null);
  const viewedPosts = useRef<Set<string>>(new Set());

  const fetchPosts = useCallback(async (sort: 'relevant' | 'recent') => {
    setIsLoading(true);
    try {
      const postsData = await getPosts(sort);
      setPosts(postsData);
    } catch (err) {
      setError('Failed to load the feed. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(sortBy);
  }, [sortBy, fetchPosts]);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const postId = entry.target.id.replace('post-', '');
          if (!viewedPosts.current.has(postId)) {
            viewedPosts.current.add(postId);
            trackPostView(postId).catch((err) =>
              console.error(`Failed to track view for post ${postId}`, err),
            );
            observer.current?.unobserve(entry.target);
          }
        }
      });
    };

    observer.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    });

    posts.forEach((post) => {
      const element = document.getElementById(`post-${post.id}`);
      if (element && !viewedPosts.current.has(post.id)) {
        observer.current?.observe(element);
      }
    });

    return () => observer.current?.disconnect();
  }, [posts]);

  useEffect(() => {
    if (!isLoading && location.hash) {
      const postId = location.hash.substring(1);
      const postElement = document.getElementById(postId);
      if (postElement) {
        setTimeout(() => {
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          postElement.classList.add('post-highlight');
          setTimeout(() => {
            postElement.classList.remove('post-highlight');
          }, 2000);
        }, 100);
      }
    }
  }, [isLoading, location.hash, posts]);

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const handlePostDelete = (postId: string) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      );
    }
    if (error) {
      return <div className="text-center text-red-500">{error}</div>;
    }
    return <PostList posts={posts} onUpdate={handlePostUpdate} onDelete={handlePostDelete} />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <main className="lg:col-span-3">
        <CreatePost onPostCreated={handlePostCreated} />

        {/* --- NEW: Dropdown for sorting --- */}
        <div className="flex justify-end items-center mb-4 border-b pb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild className='border-none'>
              <Button variant="ghost" className="text-sm text-gray-600 border-none focus-visible:ring-0 focus-visible:ring-ring">
                Sort by:{' '}
                <span className="font-semibold ml-1">
                  {sortBy === 'relevant' ? 'Most relevant first' : 'Most recent first'}
                </span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(() => {
                const sortOptions = [
                  { value: 'relevant', label: 'Most relevant first' },
                  { value: 'recent', label: 'Most recent first' },
                ] as const;

                return sortOptions.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onSelect={() => setSortBy(opt.value)}
                    onClick={() => setSortBy(opt.value)}
                    className={`flex items-center px-3 py-2 transition-colors cursor-pointer ${
                      sortBy === opt.value
                        ? 'border-l-4 border-blue-500 bg-blue-50'
                        : 'border-l-4 border-transparent'
                    }`}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ));
              })()}
              <DropdownMenuSeparator />
              <p className="p-2 text-xs text-muted-foreground max-w-xs">
                This selection only affects your current feed view.
              </p>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* --- END NEW --- */}

        {renderContent()}
      </main>

      <aside className="lg:col-span-1">
        <div className="sticky top-20">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Connectify News</h3>
            <p className="mt-2 text-sm">Stay tuned for updates!</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Homepage;