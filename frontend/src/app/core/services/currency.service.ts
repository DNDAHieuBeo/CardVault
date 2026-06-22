import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const EXCHANGE_URL = `${environment.apiUrl}/cards/exchange-rate`;

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly http = inject(HttpClient);

  readonly rate    = signal<number | null>(null);
  readonly loading = signal(false);
  readonly error   = signal(false);

  private fetched = false;

  fetchRate(): void {
    if (this.fetched) return;
    this.fetched = true;
    this.loading.set(true);
    this.http.get<{ rates: { VND: number } }>(EXCHANGE_URL)
      .subscribe({
        next: res => { this.rate.set(res.rates.VND); this.loading.set(false); },
        error: ()  => { this.error.set(true);         this.loading.set(false); },
      });
  }

  toVnd(usd: number): string {
    const r = this.rate();
    if (!r) return '—';
    const vnd = Math.round(usd * r);
    return '₫' + vnd.toLocaleString('vi-VN');
  }
}
