import { Component, inject, input, output, signal, effect } from '@angular/core';
import { Card } from '../../../core/models/card.model';
import { CollectionService } from '../../../core/services/collection.service';
import { isMonsterCard } from '../../../core/utils/card.utils';

@Component({
  selector: 'app-card-detail-panel',
  standalone: true,
  templateUrl: './card-detail-panel.component.html',
})
export class CardDetailPanelComponent {
  private readonly collectionService = inject(CollectionService);

  readonly card = input<Card | null>(null);
  readonly close = output<void>();
  readonly added = output<Card>();

  addingToCollection = signal(false);
  addSuccess = signal(false);

  constructor() {
    effect(() => {
      if (!this.card()) {
        this.addSuccess.set(false);
        this.addingToCollection.set(false);
      }
    });
  }

  isMonster(card: Card): boolean {
    return isMonsterCard(card.type);
  }

  addToCollection(card: Card): void {
    this.addingToCollection.set(true);
    this.collectionService.addCard({ cardId: card.id, quantity: 1 }).subscribe({
      next: () => {
        this.addingToCollection.set(false);
        this.addSuccess.set(true);
        this.added.emit(card);
      },
      error: () => this.addingToCollection.set(false),
    });
  }
}
