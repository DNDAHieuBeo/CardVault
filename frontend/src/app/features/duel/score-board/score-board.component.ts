import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DuelService } from '../../../core/services/duel.service';
import { Duel, LPLogEntry } from '../../../core/models/duel.model';

interface LocalLPLog {
  playerNumber: 1 | 2;
  delta: number;
  newValue: number;
  timestamp: string;
}

@Component({
  selector: 'app-score-board',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './score-board.component.html',
})
export class ScoreBoardComponent {
  private readonly duelService = inject(DuelService);

  // Setup phase
  player1Name = signal('Player 1');
  player2Name = signal('Player 2');
  creating = signal(false);

  // Active duel
  duel = signal<Duel | null>(null);
  history = signal<LocalLPLog[]>([]);

  // Custom LP inputs
  customLP1 = signal('');
  customLP2 = signal('');

  // Dice / coin
  diceResult = signal<number | null>(null);
  coinResult = signal<string | null>(null);
  rollingDice = signal(false);
  flippingCoin = signal(false);

  // End duel
  ending = signal(false);

  p1Pct = computed(() => {
    const d = this.duel();
    return d ? Math.max(0, Math.round((d.player1LP / 8000) * 100)) : 100;
  });

  p2Pct = computed(() => {
    const d = this.duel();
    return d ? Math.max(0, Math.round((d.player2LP / 8000) * 100)) : 100;
  });

  lpColor(pct: number): string {
    if (pct > 50) return 'var(--color-primary)';
    if (pct > 25) return '#f59e0b';
    return '#ef4444';
  }

  createDuel(): void {
    if (!this.player1Name().trim() || !this.player2Name().trim()) return;
    this.creating.set(true);
    this.duelService.createDuel({
      player1Name: this.player1Name().trim(),
      player2Name: this.player2Name().trim()
    }).subscribe({
      next: d => { this.duel.set(d); this.creating.set(false); },
      error: () => this.creating.set(false)
    });
  }

  adjustLP(player: 1 | 2, delta: number): void {
    const d = this.duel();
    if (!d) return;
    this.duelService.updateLP(d.id, { playerNumber: player, delta }).subscribe({
      next: updated => {
        const newValue = player === 1 ? updated.player1LP : updated.player2LP;
        this.history.update(h => [{
          playerNumber: player, delta, newValue,
          timestamp: new Date().toISOString()
        }, ...h]);
        this.duel.set(updated);
      }
    });
  }

  applyCustomLP(player: 1 | 2): void {
    const raw = player === 1 ? this.customLP1() : this.customLP2();
    const val = parseInt(raw, 10);
    if (isNaN(val)) return;
    const d = this.duel();
    if (!d) return;
    const current = player === 1 ? d.player1LP : d.player2LP;
    const delta = val - current;
    this.adjustLP(player, delta);
    if (player === 1) this.customLP1.set('');
    else this.customLP2.set('');
  }

  rollDice(): void {
    this.rollingDice.set(true);
    this.diceResult.set(null);
    setTimeout(() => {
      this.diceResult.set(Math.floor(Math.random() * 6) + 1);
      this.rollingDice.set(false);
    }, 600);
  }

  flipCoin(): void {
    this.flippingCoin.set(true);
    this.coinResult.set(null);
    setTimeout(() => {
      this.coinResult.set(Math.random() > 0.5 ? 'Heads' : 'Tails');
      this.flippingCoin.set(false);
    }, 600);
  }

  endDuel(): void {
    const d = this.duel();
    if (!d) return;
    this.ending.set(true);
    this.duelService.endDuel(d.id).subscribe({
      next: updated => { this.duel.set(updated); this.ending.set(false); },
      error: () => this.ending.set(false)
    });
  }

  newDuel(): void {
    this.duel.set(null);
    this.history.set([]);
    this.diceResult.set(null);
    this.coinResult.set(null);
  }

  formatDelta(delta: number): string {
    return delta >= 0 ? `+${delta}` : `${delta}`;
  }
}
