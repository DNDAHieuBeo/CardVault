import { Card } from './card.model';

export interface UserCard {
  id: number;
  quantity: number;
  card: Card;
}

export interface AddCardRequest {
  cardId: number;
  quantity: number;
}

export interface UpdateQuantityRequest {
  quantity: number;
}
