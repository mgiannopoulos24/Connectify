import React from 'react';

const Homepage: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold">Your Feed</h2>
        <p className="mt-4">Posts will appear here...</p>
      </div>

      <aside className="lg:col-span-1">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Connectify News</h3>
          <p className="mt-2 text-sm">Stay tuned for updates!</p>
        </div>
      </aside>
    </div>
  );
};

export default Homepage;
