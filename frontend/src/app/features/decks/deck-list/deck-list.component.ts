import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeckService } from '../../../core/services/deck.service';
import { Deck } from '../../../core/models/deck.model';

@Component({
  selector: 'app-deck-list',
  standalone: true,
  imports: [],
  templateUrl: './deck-list.component.html',
})
export class DeckListComponent implements OnInit {
  private readonly deckService = inject(DeckService);
  private readonly router = inject(Router);

  decks = signal<Deck[]>([]);
  loading = signal(true);
  creating = signal(false);
  deletingId = signal<number | null>(null);
  confirmDeleteId = signal<number | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.deckService.getDecks().subscribe({
      next: d => { this.decks.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  createDeck(): void {
    this.creating.set(true);
    this.deckService.createDeck({ name: 'New Deck', mainDeck: [], extraDeck: [], sideDeck: [] }).subscribe({
      next: deck => {
        this.creating.set(false);
        this.router.navigate(['/decks', deck.id]);
      },
      error: () => this.creating.set(false)
    });
  }

  editDeck(deck: Deck): void {
    this.router.navigate(['/decks', deck.id]);
  }

  askDelete(id: number): void {
    this.confirmDeleteId.set(id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(id: number): void {
    this.deletingId.set(id);
    this.deckService.deleteDeck(id).subscribe({
      next: () => {
        this.decks.update(list => list.filter(d => d.id !== id));
        this.deletingId.set(null);
        this.confirmDeleteId.set(null);
      },
      error: () => { this.deletingId.set(null); this.confirmDeleteId.set(null); }
    });
  }

  totalCards(deck: Deck): number {
    return deck.mainCount + deck.extraCount + deck.sideCount;
  }
}
