import { Component, input, output } from '@angular/core';
import { Card } from '../../../core/models/card.model';

@Component({
  selector: 'app-card-thumbnail',
  standalone: true,
  template: `
    <button
      (click)="cardClick.emit(card())"
      class="rounded-lg overflow-hidden text-left transition-transform hover:scale-105 hover:shadow-lg focus:outline-none w-full"
      style="background-color: var(--color-surface)"
    >
      <div class="aspect-[59/86] relative overflow-hidden bg-gray-800">
        @if (card().imageUrlSmall) {
          <img [src]="card().imageUrlSmall" [alt]="card().name"
               class="w-full h-full object-cover" loading="lazy" />
        } @else {
          <div class="w-full h-full flex items-center justify-center text-4xl">🃏</div>
        }
      </div>
      @if (showLabel()) {
        <div class="p-2">
          <p class="text-xs font-medium leading-tight line-clamp-2" style="color: var(--color-text)">
            {{ card().name }}
          </p>
          <p class="text-xs mt-0.5 truncate" style="color: var(--color-text-muted)">
            {{ card().type }}
          </p>
        </div>
      }
    </button>
  `,
})
export class CardThumbnailComponent {
  readonly card = input.required<Card>();
  readonly showLabel = input(true);
  readonly cardClick = output<Card>();
}
