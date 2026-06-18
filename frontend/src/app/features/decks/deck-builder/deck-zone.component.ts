import { Component, input, output } from '@angular/core';
import { Card } from '../../../core/models/card.model';

export interface CardDragStartEvent {
  event: DragEvent;
  card: Card;
  index: number;
}

@Component({
  selector: 'app-deck-zone',
  standalone: true,
  templateUrl: './deck-zone.component.html',
})
export class DeckZoneComponent {
  title      = input.required<string>();
  cards      = input.required<Card[]>();
  count      = input.required<number>();
  maxLabel   = input.required<string>();
  badgeClass = input.required<string>();
  emptyText  = input.required<string>();
  isDragOver = input(false);
  large      = input(false);

  zoneDragOver  = output<DragEvent>();
  zoneDragLeave = output<DragEvent>();
  zoneDrop      = output<DragEvent>();
  cardDragStart = output<CardDragStartEvent>();
  cardDragEnd   = output<void>();
}
