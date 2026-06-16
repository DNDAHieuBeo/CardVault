import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CollectionService } from '../../../core/services/collection.service';
import { UserCard } from '../../../core/models/collection.model';
import { isMonsterCard } from '../../../core/utils/card.utils';

@Component({
  selector: 'app-my-collection',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './my-collection.component.html',
})
export class MyCollectionComponent implements OnInit {
  private readonly collectionService = inject(CollectionService);

  cards = signal<UserCard[]>([]);
  loading = signal(true);
  searchName = '';

  filtered = computed(() => {
    const q = this.searchName.toLowerCase();
    return q ? this.cards().filter(c => c.card.name.toLowerCase().includes(q)) : this.cards();
  });

  totalCards = computed(() => this.cards().reduce((s, c) => s + c.quantity, 0));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.collectionService.getCollection().subscribe({
      next: c => { this.cards.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  increment(item: UserCard): void {
    this.collectionService.updateQuantity(item.card.id, { quantity: item.quantity + 1 }).subscribe({
      next: updated => this.updateItem(updated)
    });
  }

  decrement(item: UserCard): void {
    if (item.quantity <= 1) {
      this.remove(item);
      return;
    }
    this.collectionService.updateQuantity(item.card.id, { quantity: item.quantity - 1 }).subscribe({
      next: updated => this.updateItem(updated)
    });
  }

  remove(item: UserCard): void {
    this.collectionService.removeCard(item.card.id).subscribe({
      next: () => this.cards.update(list => list.filter(c => c.id !== item.id))
    });
  }

  private updateItem(updated: UserCard): void {
    this.cards.update(list => list.map(c => c.id === updated.id ? updated : c));
  }

  isMonster(type: string): boolean {
    return isMonsterCard(type);
  }
}
