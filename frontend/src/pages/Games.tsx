import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Updated game data
const games = [
  {
    title: 'Zip',
    description:
      'Connect the numbers in order while filling the entire grid. A true test of foresight!',
    image: 'https://i.imgur.com/2nLwS3d.png',
    link: '/games/zip',
  },
  {
    title: 'Memory Match',
    description: 'Test your short-term memory by finding all the matching pairs of icons.',
    image: 'https://i.imgur.com/8aV3U9x.png',
    link: '/games/memory-match',
  },
  {
    title: 'Sudoku',
    description: 'A classic logic puzzle. Fill the grid with numbers from 1 to 9.',
    image: 'https://i.imgur.com/bZ3v5gH.png', // A placeholder image for Sudoku
    link: '/games/sudoku',
  },
];

const Games: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Our Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {games.map((game, index) => (
                <Card
                  key={index}
                  className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow flex flex-col"
                >
                  <img src={game.image} alt={game.title} className="w-full h-40 object-cover" />
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold mb-2">{game.title}</h3>
                    <p className="text-gray-600 mb-4 flex-grow">{game.description}</p>
                    <Link to={game.link}>
                      <Button className="w-full" disabled={game.link === '#'}>
                        {game.link === '#' ? 'Coming Soon' : 'Play Now'}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Games;
