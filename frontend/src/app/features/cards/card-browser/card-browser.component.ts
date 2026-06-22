import { Component, inject, signal, OnInit } from '@angular/core';
import { CardService } from '../../../core/services/card.service';
import { Card, CardFilter, PagedResult } from '../../../core/models/card.model';
import { CardThumbnailComponent } from '../../../shared/components/card-thumbnail/card-thumbnail.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { CardDetailPanelComponent } from '../../../shared/components/card-detail-panel/card-detail-panel.component';
import { BtnComponent } from '../../../shared/components/common/button/btn.component';
import { CardFilterComponent, CardFilterState } from './card-filter.component';

@Component({
  selector: 'app-card-browser',
  standalone: true,
  imports: [CardThumbnailComponent, PaginationComponent, CardDetailPanelComponent, BtnComponent, CardFilterComponent],
  templateUrl: './card-browser.component.html',
})
export class CardBrowserComponent implements OnInit {
  private readonly cardService = inject(CardService);

  result      = signal<PagedResult<Card> | null>(null);
  loading     = signal(false);
  syncing     = signal(false);
  syncMessage = signal('');
  currentPage = signal(1);
  selectedCard = signal<Card | null>(null);

  private activeFilter: CardFilterState = {};

  ngOnInit(): void {
    this.loadCards();
  }

  onFilter(state: CardFilterState): void {
    this.activeFilter = state;
    this.loadCards(1);
  }

  onClear(): void {
    this.activeFilter = {};
    this.loadCards(1);
  }

  loadCards(page = 1): void {
    this.currentPage.set(page);
    this.loading.set(true);
    const f: CardFilter = { page, pageSize: 24, ...this.activeFilter };
    this.cardService.getCards(f).subscribe({
      next: r => { this.result.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
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
      error: () => { this.syncing.set(false); this.syncMessage.set('Sync failed.'); },
    });
  }
}
