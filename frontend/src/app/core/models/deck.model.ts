import { Card } from './card.model';

export interface Deck {
  id: number;
  name: string;
  description?: string;
  mainCount: number;
  extraCount: number;
  sideCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeckDetail {
  id: number;
  name: string;
  description?: string;
  mainDeck: Card[];
  extraDeck: Card[];
  sideDeck: Card[];
  createdAt: string;
  updatedAt: string;
}

export interface SaveDeckRequest {
  name: string;
  description?: string;
  mainDeck: number[];
  extraDeck: number[];
  sideDeck: number[];
}

export interface DeckValidationResult {
  isValid: boolean;
  errors: string[];
}
