import { Component, inject, signal, computed, OnInit, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeckService } from '../../../core/services/deck.service';
import { CardService } from '../../../core/services/card.service';
import { DeckDetail } from '../../../core/models/deck.model';
import { Card, PagedResult } from '../../../core/models/card.model';

const EXTRA_TYPES = ['fusion monster', 'synchro monster', 'xyz monster', 'link monster',
  'synchro tuner monster', 'pendulum effect fusion monster'];

@Component({
  selector: 'app-deck-builder',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './deck-builder.component.html',
})
export class DeckBuilderComponent implements OnInit {
  readonly id = input.required<string>();

  private readonly deckService = inject(DeckService);
  private readonly cardService = inject(CardService);
  private readonly router = inject(Router);

  deck = signal<DeckDetail | null>(null);
  loading = signal(true);
  saving = signal(false);
  saveSuccess = signal(false);
  validationErrors = signal<string[]>([]);

  // Card browser state
  searchName = '';
  browserCards = signal<PagedResult<Card> | null>(null);
  browserLoading = signal(false);
  browserPage = signal(1);

  // Editable deck name
  deckName = signal('');
  deckDesc = signal('');

  mainDeck = signal<Card[]>([]);
  extraDeck = signal<Card[]>([]);
  sideDeck = signal<Card[]>([]);

  mainCount = computed(() => this.mainDeck().length);
  extraCount = computed(() => this.extraDeck().length);
  sideCount = computed(() => this.sideDeck().length);

  ngOnInit(): void {
    this.loadDeck();
    this.searchCards();
  }

  loadDeck(): void {
    this.loading.set(true);
    this.deckService.getDeck(+this.id()).subscribe({
      next: d => {
        this.deck.set(d);
        this.deckName.set(d.name);
        this.deckDesc.set(d.description ?? '');
        this.mainDeck.set([...d.mainDeck]);
        this.extraDeck.set([...d.extraDeck]);
        this.sideDeck.set([...d.sideDeck]);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.router.navigate(['/decks']); }
    });
  }

  searchCards(page = 1): void {
    this.browserPage.set(page);
    this.browserLoading.set(true);
    this.cardService.getCards({ name: this.searchName || undefined, page, pageSize: 12 }).subscribe({
      next: r => { this.browserCards.set(r); this.browserLoading.set(false); },
      error: () => this.browserLoading.set(false)
    });
  }

  isExtraType(card: Card): boolean {
    return EXTRA_TYPES.some(t => card.type?.toLowerCase().includes(t));
  }

  countInDeck(card: Card): number {
    return [...this.mainDeck(), ...this.extraDeck(), ...this.sideDeck()]
      .filter(c => c.id === card.id).length;
  }

  addCard(card: Card): void {
    if (this.countInDeck(card) >= 3) return;
    if (this.isExtraType(card)) {
      if (this.extraCount() >= 15) return;
      this.extraDeck.update(d => [...d, card]);
    } else {
      if (this.mainCount() >= 60) return;
      this.mainDeck.update(d => [...d, card]);
    }
    this.validationErrors.set([]);
  }

  removeFromMain(index: number): void {
    this.mainDeck.update(d => d.filter((_, i) => i !== index));
  }

  removeFromExtra(index: number): void {
    this.extraDeck.update(d => d.filter((_, i) => i !== index));
  }

  removeFromSide(index: number): void {
    this.sideDeck.update(d => d.filter((_, i) => i !== index));
  }

  save(): void {
    this.saving.set(true);
    this.saveSuccess.set(false);
    this.deckService.saveDeck(+this.id(), {
      name: this.deckName(),
      description: this.deckDesc() || undefined,
      mainDeck: this.mainDeck().map(c => c.id),
      extraDeck: this.extraDeck().map(c => c.id),
      sideDeck: this.sideDeck().map(c => c.id),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: () => this.saving.set(false)
    });
  }

  validate(): void {
    this.deckService.validateDeck(+this.id()).subscribe({
      next: r => this.validationErrors.set(r.errors)
    });
  }
}
