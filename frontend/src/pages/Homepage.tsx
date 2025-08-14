import React, { useEffect, useState } from 'react';
import { getPosts } from '@/services/postService';
import { Post } from '@/types/post';
import { Loader2 } from 'lucide-react';
import CreatePost from '@/components/posts/CreatePost';
import PostList from '@/components/posts/PostList';

const Homepage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await getPosts();
        setPosts(postsData);
      } catch (err) {
        setError('Failed to load the feed. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

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
