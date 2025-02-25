import type { GameRole } from '@/components/game/views/GameView';

export interface GameState {
  id: string;
  status: 'waiting' | 'active' | 'completed';
  players: {
    id: string;
    name: string;
    isAlive: boolean;
    role?: GameRole;
  }[];
  settings: {
    mafiaCount: number;
    useDetectives: boolean;
  };
  aliveCount: number;
  totalPlayers: number;
} 