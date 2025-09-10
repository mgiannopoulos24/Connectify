import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RotateCw,
  Trophy,
  XCircle,
  Undo,
  Lightbulb,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';
import GameLobby from '@/components/games/GameLobby';

const GRID_SIZE = 6;
const CELL_PIXEL_SIZE = 64;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const TOTAL_NUMBERS = 12;
const PATH_COLOR = '#E11D74';
const PATH_STROKE_WIDTH = 24;

interface Cell {
  value: number;
  isPath: boolean;
  isEndpoint: boolean;
  isActivated: boolean;
}
interface Position {
  row: number;
  col: number;
}
interface Hint {
  pos: Position;
  dir: 'up' | 'down' | 'left' | 'right';
}

const PathRenderer: React.FC<{ path: Position[] }> = ({ path }) => {
  if (path.length < 1) return null;

  const center = (n: number) => n * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
  const radius = PATH_STROKE_WIDTH / 2;

  const generatePathData = () => {
    if (path.length === 1) {
      const x = center(path[0].col);
      const y = center(path[0].row);
      return `M ${x},${y} L ${x},${y}`;
    }

    let d = `M ${center(path[0].col)} ${center(path[0].row)}`;

    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      const next = path[i + 1];

      if (!next) {
        d += ` L ${center(curr.col)} ${center(curr.row)}`;
      } else {
        const vec1 = { x: curr.col - prev.col, y: curr.row - prev.row };
        const vec2 = { x: next.col - curr.col, y: next.row - curr.row };
        if (vec1.x === vec2.x && vec1.y === vec2.y) {
          d += ` L ${center(curr.col)} ${center(curr.row)}`;
        } else {
          const p1x = center(curr.col) - vec1.x * radius;
          const p1y = center(curr.row) - vec1.y * radius;
          const p2x = center(curr.col) + vec2.x * radius;
          const p2y = center(curr.row) + vec2.y * radius;
          const sweepFlag = vec1.x * vec2.y - vec1.y * vec2.x > 0 ? 1 : 0;
          d += ` L ${p1x} ${p1y}`;
          d += ` A ${radius} ${radius} 0 0 ${sweepFlag} ${p2x} ${p2y}`;
        }
      }
    }
    return d;
  };

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full z-0"
      viewBox={`0 0 ${GRID_SIZE * CELL_PIXEL_SIZE} ${GRID_SIZE * CELL_PIXEL_SIZE}`}
    >
      <path
        d={generatePathData()}
        fill="none"
        stroke={PATH_COLOR}
        strokeWidth={PATH_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const generateSolvableGrid = (): { grid: number[][]; startPos: Position; solution: Position[] } => {
  let path: Position[] = [];
  while (path.length !== TOTAL_CELLS) {
    path = [];
    const visited: boolean[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(false));
    const startCell: Position = {
      row: Math.floor(Math.random() * GRID_SIZE),
      col: Math.floor(Math.random() * GRID_SIZE),
    };
    const build = (p: Position): boolean => {
      visited[p.row][p.col] = true;
      path.push(p);
      if (path.length === TOTAL_CELLS) return true;
      const neighbors = [
        { r: p.row - 1, c: p.col },
        { r: p.row + 1, c: p.col },
        { r: p.row, c: p.col - 1 },
        { r: p.row, c: p.col + 1 },
      ].sort(() => Math.random() - 0.5);
      for (const n of neighbors) {
        if (n.r >= 0 && n.r < GRID_SIZE && n.c >= 0 && n.c < GRID_SIZE && !visited[n.r][n.c]) {
          if (build({ row: n.r, col: n.c })) return true;
        }
      }
      path.pop();
      return false;
    };
    build(startCell);
  }
  const finalStartPos = path[0];
  const newGrid: number[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(0));
  newGrid[finalStartPos.row][finalStartPos.col] = 1;
  const otherPathPoints = path.slice(1);
  const numberIndices = new Set<number>();
  while (numberIndices.size < TOTAL_NUMBERS - 1) {
    const index = Math.floor(Math.random() * otherPathPoints.length);
    if (index > 0) numberIndices.add(index);
  }
  const sortedIndices = Array.from(numberIndices).sort((a, b) => a - b);
  sortedIndices.forEach((pathIndex, i) => {
    newGrid[otherPathPoints[pathIndex].row][otherPathPoints[pathIndex].col] = i + 2;
  });
  return { grid: newGrid, startPos: finalStartPos, solution: path };
};

const Zip: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [currentPos, setCurrentPos] = useState<Position>({ row: 0, col: 0 });
  const [path, setPath] = useState<Position[]>([]);
  const [nextExpectedNumber, setNextExpectedNumber] = useState(2);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [solutionPath, setSolutionPath] = useState<Position[]>([]);
  const [animatedCell, setAnimatedCell] = useState<Position | null>(null);
  const [hintArrow, setHintArrow] = useState<Hint | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const resetGame = useCallback(() => {
    const { grid: levelLayout, startPos, solution } = generateSolvableGrid();
    const newGrid = levelLayout.map((row) =>
      row.map((value) => ({
        value,
        isPath: false,
        isEndpoint: value > 0,
        isActivated: value === 1,
      })),
    );
    newGrid[startPos.row][startPos.col].isPath = true;
    setGrid(newGrid);
    setCurrentPos(startPos);
    setPath([startPos]);
    setNextExpectedNumber(2);
    setGameState('playing');
    setSolutionPath(solution);
    setHintArrow(null);
  }, []);

  const handlePlayGame = () => {
    resetGame();
    setGameStarted(true);
  };

  const move = useCallback(
    (newPos: Position) => {
      if (
        newPos.row < 0 ||
        newPos.row >= GRID_SIZE ||
        newPos.col < 0 ||
        newPos.col >= GRID_SIZE ||
        grid[newPos.row][newPos.col].isPath
      )
        return false;
      const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
      newGrid[newPos.row][newPos.col].isPath = true;
      const newPath = [...path, newPos];
      const cellValue = newGrid[newPos.row][newPos.col].value;
      let newNextExpected = nextExpectedNumber;
      if (cellValue !== 0) {
        if (cellValue !== nextExpectedNumber) {
          setGameState('lost');
        } else {
          newNextExpected++;
          setNextExpectedNumber(newNextExpected);
          setAnimatedCell({ row: newPos.row, col: newPos.col });
          newGrid[newPos.row][newPos.col].isActivated = true;
          setTimeout(() => setAnimatedCell(null), 400);
        }
      }
      setGrid(newGrid);
      setPath(newPath);
      setCurrentPos(newPos);
      if (newPath.length === TOTAL_CELLS)
        setGameState(newNextExpected > TOTAL_NUMBERS ? 'won' : 'lost');
      return true;
    },
    [grid, path, nextExpectedNumber],
  );

  const undoLastMove = useCallback(() => {
    if (path.length <= 1 || gameState !== 'playing') return;
    const lastPos = path[path.length - 1];
    const prevPos = path[path.length - 2];
    const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
    const cellAtLastPos = newGrid[lastPos.row][lastPos.col];
    if (cellAtLastPos.isEndpoint) {
      cellAtLastPos.isActivated = false;
      if (cellAtLastPos.value === nextExpectedNumber - 1)
        setNextExpectedNumber(nextExpectedNumber - 1);
    }
    cellAtLastPos.isPath = false;
    setGrid(newGrid);
    setPath(path.slice(0, -1));
    setCurrentPos(prevPos);
    setHintArrow(null);
  }, [path, gameState, grid, nextExpectedNumber]);

  const handleHint = () => {
    if (gameState !== 'playing' || path.length >= solutionPath.length) return;
    const nextStep = solutionPath[path.length];
    const prevStep = currentPos;
    let dir: Hint['dir'] = 'right';
    if (nextStep.row < prevStep.row) dir = 'up';
    else if (nextStep.row > prevStep.row) dir = 'down';
    else if (nextStep.col < prevStep.col) dir = 'left';
    if (move(nextStep)) {
      showToast('We extended your path!');
      setHintArrow({ pos: nextStep, dir });
      setTimeout(() => setHintArrow(null), 1500);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameState !== 'playing' || !gameStarted) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undoLastMove();
        return;
      }
      const newPos = { ...currentPos };
      switch (e.key) {
        case 'ArrowUp':
          newPos.row--;
          break;
        case 'ArrowDown':
          newPos.row++;
          break;
        case 'ArrowLeft':
          newPos.col--;
          break;
        case 'ArrowRight':
          newPos.col++;
          break;
        default:
          return;
      }
      e.preventDefault();
      move(newPos);
    },
    [currentPos, gameState, gameStarted, move, undoLastMove],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        {!gameStarted ? (
          <GameLobby
            gameTitle="Zip"
            gameDescription="Connect the numbers in ascending order while filling the entire grid. A true test of planning and foresight!"
            onPlay={handlePlayGame}
          />
        ) : (
          <Card className="w-full max-w-xl mx-auto shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">Zip</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <div className="bg-gray-200 p-2 rounded-lg border-2 border-white shadow-inner">
                <div className="relative">
                  {gameState !== 'playing' && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 rounded-lg">
                      {gameState === 'won' ? (
                        <Trophy className="w-24 h-24 text-yellow-400" />
                      ) : (
                        <XCircle className="w-24 h-24 text-red-500" />
                      )}
                      <h2 className="text-4xl font-bold text-white mt-4">
                        {gameState === 'won' ? 'You Win!' : 'Game Over'}
                      </h2>
                      <Button onClick={resetGame} className="mt-6">
                        <RotateCw className="mr-2 h-4 w-4" />
                        {gameState === 'won' ? 'Play Again' : 'Try Again'}
                      </Button>
                    </div>
                  )}
                  {toastMessage && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-30">
                      {toastMessage}
                    </div>
                  )}
                  <PathRenderer path={path} />
                  <div
                    className="grid relative z-10"
                    style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
                  >
                    {grid.length > 0 &&
                      grid.map((row, r) =>
                        row.map((cell, c) => (
                          <div
                            key={`${r}-${c}`}
                            className="w-16 h-16 flex items-center justify-center border border-gray-400/30"
                          >
                            {cell.isEndpoint && (
                              <div
                                className={cn(
                                  'w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 bg-black text-white shadow-md',
                                  {
                                    'animate-pop':
                                      animatedCell?.row === r && animatedCell?.col === c,
                                  },
                                  { 'border-4': cell.isActivated },
                                )}
                                style={{
                                  borderColor: cell.isActivated ? PATH_COLOR : 'transparent',
                                }}
                              >
                                {cell.value}
                              </div>
                            )}
                            {hintArrow?.pos.row === r && hintArrow?.pos.col === c && (
                              <div className="absolute z-20 text-white">
                                {hintArrow.dir === 'up' && (
                                  <ChevronUp size={48} className="animate-pulse-arrow-vertical" />
                                )}
                                {hintArrow.dir === 'down' && (
                                  <ChevronDown size={48} className="animate-pulse-arrow-vertical" />
                                )}
                                {hintArrow.dir === 'left' && (
                                  <ChevronLeft
                                    size={48}
                                    className="animate-pulse-arrow-horizontal"
                                  />
                                )}
                                {hintArrow.dir === 'right' && (
                                  <ChevronRight
                                    size={48}
                                    className="animate-pulse-arrow-horizontal"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        )),
                      )}
                  </div>
                </div>
              </div>
              <div className="text-center w-full">
                <p className="text-lg">
                  Connect numbers from 1 to {TOTAL_NUMBERS} using your arrow keys.
                </p>
                <p className="text-md text-gray-600">
                  You must fill the entire grid! (Ctrl+Z to Undo)
                </p>
                <div className="mt-4 flex justify-center gap-4">
                  <Button variant="outline" onClick={undoLastMove} disabled={path.length <= 1}>
                    <Undo className="mr-2 h-4 w-4" />
                    Undo
                  </Button>
                  <Button variant="outline" onClick={handleHint} disabled={gameState !== 'playing'}>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Hint
                  </Button>
                  <Button onClick={resetGame}>
                    <RotateCw className="mr-2 h-4 w-4" />
                    New Puzzle
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Zip;
