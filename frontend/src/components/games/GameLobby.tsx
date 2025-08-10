import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';

interface GameLobbyProps {
  gameTitle: string;
  gameDescription: string;
  onPlay: () => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({ gameTitle, gameDescription, onPlay }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <CardTitle className="text-5xl font-extrabold">{gameTitle}</CardTitle>
          <CardDescription className="text-lg text-gray-600 pt-2">
            {gameDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onPlay} size="lg" className="w-full text-xl py-8">
            <PlayCircle className="mr-4 h-8 w-8" />
            Play Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameLobby;
