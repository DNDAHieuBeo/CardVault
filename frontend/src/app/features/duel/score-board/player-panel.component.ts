import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-player-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './player-panel.component.html',
})
export class PlayerPanelComponent {
  playerLabel = input.required<string>();
  playerName  = input.required<string>();
  lp          = input.required<number>();
  pct         = input.required<number>();
  isActive    = input.required<boolean>();
  customLp    = input.required<string>();

  adjust         = output<number>();
  apply          = output<void>();
  customLpChange = output<string>();

  readonly deltas = [-1000, -500, -100, 100, 500, 1000] as const;

  lpColor(pct: number): string {
    if (pct > 50) return 'var(--color-primary)';
    if (pct > 25) return '#f59e0b';
    return '#ef4444';
  }

  formatDelta(delta: number): string {
    return delta >= 0 ? `+${delta}` : `${delta}`;
  }

  deltaClass(delta: number): string {
    return delta < 0
      ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
      : 'bg-green-900/30 text-green-400 hover:bg-green-900/50';
  }
}
