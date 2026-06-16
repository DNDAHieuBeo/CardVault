import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardService } from '../../../core/services/card.service';
import { CollectionService } from '../../../core/services/collection.service';
import { Card, CardFilter, PagedResult } from '../../../core/models/card.model';

const CARD_TYPES = [
  'Normal Monster', 'Effect Monster', 'Fusion Monster', 'Ritual Monster',
  'Synchro Monster', 'XYZ Monster', 'Link Monster', 'Spell Card', 'Trap Card',
  'Pendulum Effect Monster', 'Tuner Monster'
];

const ATTRIBUTES = ['DARK', 'LIGHT', 'EARTH', 'WATER', 'FIRE', 'WIND', 'DIVINE'];

@Component({
  selector: 'app-card-browser',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './card-browser.component.html',
})
export class CardBrowserComponent implements OnInit {
  private readonly cardService = inject(CardService);
  private readonly collectionService = inject(CollectionService);

  readonly cardTypes = CARD_TYPES;
  readonly attributes = ATTRIBUTES;

  searchName = '';
  selectedType = '';
  selectedAttribute = '';

  result = signal<PagedResult<Card> | null>(null);
  loading = signal(false);
  syncing = signal(false);
  syncMessage = signal('');

  selectedCard = signal<Card | null>(null);
  addingToCollection = signal(false);
  addSuccess = signal(false);

  currentPage = signal(1);

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards(page = 1): void {
    this.currentPage.set(page);
    this.loading.set(true);
    const filter: CardFilter = {
      page,
      pageSize: 20,
      name: this.searchName || undefined,
      type: this.selectedType || undefined,
      attribute: this.selectedAttribute || undefined,
    };
    this.cardService.getCards(filter).subscribe({
      next: r => { this.result.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  search(): void {
    this.loadCards(1);
  }

  openDetail(card: Card): void {
    this.selectedCard.set(card);
    this.addSuccess.set(false);
  }

  closeDetail(): void {
    this.selectedCard.set(null);
  }

  addToCollection(card: Card): void {
    this.addingToCollection.set(true);
    this.collectionService.addCard({ cardId: card.id, quantity: 1 }).subscribe({
      next: () => {
        this.addingToCollection.set(false);
        this.addSuccess.set(true);
      },
      error: () => this.addingToCollection.set(false)
    });
  }

  syncCards(): void {
    this.syncing.set(true);
    this.syncMessage.set('');
    this.cardService.syncCards().subscribe({
      next: res => {
        this.syncing.set(false);
        this.syncMessage.set(`Synced ${res.synced.toLocaleString()} cards!`);
        this.loadCards(1);
        setTimeout(() => this.syncMessage.set(''), 5000);
      },
      error: () => {
        this.syncing.set(false);
        this.syncMessage.set('Sync failed. Please try again.');
      }
    });
  }

  isMonster(card: Card): boolean {
    return card.type?.toLowerCase().includes('monster') ?? false;
  }

  typeColor(card: Card): string {
    const f = (card.frameType ?? '').toLowerCase();
    if (f.includes('spell')) return '#1d7a5a';
    if (f.includes('trap')) return '#8a1a7a';
    if (f.includes('fusion')) return '#7a4a9a';
    if (f.includes('synchro')) return '#888';
    if (f.includes('xyz')) return '#2a2a3a';
    if (f.includes('link')) return '#1a4a8a';
    if (f.includes('ritual')) return '#2255aa';
    if (f.includes('effect')) return '#b06020';
    return '#c8a428';
  }
}
