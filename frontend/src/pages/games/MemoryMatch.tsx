import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw, Award, BrainCircuit } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Flashcard } from 'react-quizlet-flashcard'; // Will add it when he updates the package
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

// --- Game Configuration ---
const AllIcons = Object.keys(LucideIcons).filter(
  (key) =>
    key !== 'createReactComponent' && key !== 'LucideProvider' && key[0] === key[0].toUpperCase(),
);
const NUM_PAIRS = 8; // The number of pairs to create (e.g., 8 pairs = 16 cards)

interface MemoryCard {
  id: number;
  iconName: string;
  uniqueId: string; // To differentiate between two cards of the same icon
  isFlipped: boolean;
  isMatched: boolean;
}

// --- Game Component ---
const MemoryMatch: React.FC = () => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const flipRefs = useRef<(null | (() => void))[]>([]);

  // Function to create and shuffle the deck
  const generateDeck = () => {
    const selectedIcons = [...AllIcons].sort(() => 0.5 - Math.random()).slice(0, NUM_PAIRS);
    const gameCards: MemoryCard[] = [];

    selectedIcons.forEach((iconName, index) => {
      gameCards.push({
        id: index * 2,
        iconName,
        uniqueId: `${iconName}-a`,
        isFlipped: false,
        isMatched: false,
      });
      gameCards.push({
        id: index * 2 + 1,
        iconName,
        uniqueId: `${iconName}-b`,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle the cards
    gameCards.sort(() => Math.random() - 0.5);
    setCards(gameCards);
  };

  const resetGame = () => {
    generateDeck();
    setFlippedCards([]);
    setMoves(0);
    setGameOver(false);
    // Reset all cards to their front side
    flipRefs.current.forEach((flipFn, index) => {
      if (flipFn && cards[index]?.isFlipped) {
        flipFn();
      }
    });
  };

  useEffect(() => {
    generateDeck();
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstIndex, secondIndex] = flippedCards;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      // Check for a match
      if (firstCard.iconName === secondCard.iconName) {
        // It's a match!
        const newCards = [...cards];
        newCards[firstIndex].isMatched = true;
        newCards[secondIndex].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);

        // Check for game over
        if (newCards.every((card) => card.isMatched)) {
          setGameOver(true);
        }
      } else {
        // Not a match, flip them back after a delay
        setTimeout(() => {
          flipRefs.current[firstIndex]?.();
          flipRefs.current[secondIndex]?.();
          setFlippedCards([]);
        }, 1200);
      }
      setMoves(moves + 1);
    }
  }, [flippedCards, cards, moves]);

  const handleCardFlip = (index: number) => {
    if (flippedCards.length < 2 && !cards[index].isFlipped && !cards[index].isMatched) {
      setFlippedCards([...flippedCards, index]);
    }
  };

  const IconComponent = ({ name }: { name: string }) => {
    const Icon = (LucideIcons as any)[name];
    return Icon ? <Icon size={64} /> : null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-4xl mx-auto shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Memory Match</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="flex justify-around w-full p-4 bg-gray-100 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-semibold">Moves</p>
                <p className="text-2xl">{moves}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">Pairs Found</p>
                <p className="text-2xl">
                  {cards.filter((c) => c.isMatched).length / 2} / {NUM_PAIRS}
                </p>
              </div>
            </div>

            <div className={cn('grid gap-4', 'grid-cols-4')}>
              {cards.map((card, index) => (
                <div
                  key={card.uniqueId}
                  className={cn(card.isMatched && 'opacity-25 transition-opacity')}
                >
                  <Flashcard
                    manualFlipRef={(flip) => (flipRefs.current[index] = flip)}
                    onCardFlip={(isFlipped) => {
                      const newCards = [...cards];
                      newCards[index].isFlipped = isFlipped;
                      setCards(newCards);
                      if (isFlipped) handleCardFlip(index);
                    }}
                    style={{ width: '120px', height: '120px' }}
                    frontHTML={
                      <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white rounded-lg">
                        <BrainCircuit size={48} />
                      </div>
                    }
                    backHTML={
                      <div className="w-full h-full flex items-center justify-center bg-blue-400 text-white rounded-lg">
                        <IconComponent name={card.iconName} />
                      </div>
                    }
                  />
                </div>
              ))}
            </div>

            {gameOver && (
              <div className="text-center p-4 bg-green-100 border-2 border-green-500 rounded-lg">
                <Award size={48} className="mx-auto text-green-600" />
                <h3 className="text-2xl font-bold mt-2">Congratulations!</h3>
                <p>You completed the game in {moves} moves.</p>
                <Button onClick={resetGame} className="mt-4">
                  <RotateCw className="mr-2 h-4 w-4" />
                  Play Again
                </Button>
              </div>
            )}
            <Button onClick={resetGame}>
              {' '}
              <RotateCw className="mr-2 h-4 w-4" /> Reset Game{' '}
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default MemoryMatch;
