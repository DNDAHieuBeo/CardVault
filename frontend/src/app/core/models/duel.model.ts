export interface Duel {
  id: number;
  player1Name: string;
  player2Name: string;
  player1LP: number;
  player2LP: number;
  status: 'active' | 'ended';
  winnerId?: string;
  startedAt: string;
  endedAt?: string;
}

export interface CreateDuelRequest {
  player1Name: string;
  player2Name: string;
}

export interface UpdateLPRequest {
  playerNumber: 1 | 2;
  delta: number;
}

export interface LPLogEntry {
  id: number;
  playerNumber: 1 | 2;
  delta: number;
  newValue: number;
  timestamp: string;
}
