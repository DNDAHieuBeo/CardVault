import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Card, CardFilter, PagedResult } from '../models/card.model';

@Injectable({ providedIn: 'root' })
export class CardService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/cards`;

  getCards(filter: CardFilter = {}): Observable<PagedResult<Card>> {
    let params = new HttpParams();
    if (filter.name) params = params.set('name', filter.name);
    if (filter.type) params = params.set('type', filter.type);
    if (filter.race) params = params.set('race', filter.race);
    if (filter.attribute) params = params.set('attribute', filter.attribute);
    if (filter.archetype) params = params.set('archetype', filter.archetype);
    if (filter.banTcg) params = params.set('banTcg', filter.banTcg);
    if (filter.page) params = params.set('page', filter.page.toString());
    if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    return this.http.get<PagedResult<Card>>(this.api, { params });
  }

  getCard(id: number): Observable<Card> {
    return this.http.get<Card>(`${this.api}/${id}`);
  }

  syncCards(): Observable<{ synced: number }> {
    return this.http.post<{ synced: number }>(`${this.api}/sync`, {});
  }
}
