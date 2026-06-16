import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <div class="flex items-center justify-center gap-2">
      <button
        (click)="pageChange.emit(currentPage() - 1)"
        [disabled]="currentPage() === 1"
        class="px-3 py-1.5 rounded text-sm font-medium disabled:opacity-40 transition-colors"
        style="background-color: var(--color-surface); color: var(--color-text)"
      >
        ← Prev
      </button>
      <span class="text-sm px-2" style="color: var(--color-text-muted)">
        Page {{ currentPage() }} of {{ totalPages() }}
      </span>
      <button
        (click)="pageChange.emit(currentPage() + 1)"
        [disabled]="currentPage() === totalPages()"
        class="px-3 py-1.5 rounded text-sm font-medium disabled:opacity-40 transition-colors"
        style="background-color: var(--color-surface); color: var(--color-text)"
      >
        Next →
      </button>
    </div>
  `,
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();
}
