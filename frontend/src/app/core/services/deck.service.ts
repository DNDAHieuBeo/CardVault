import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Deck, DeckDetail, SaveDeckRequest, DeckValidationResult } from '../models/deck.model';

@Injectable({ providedIn: 'root' })
export class DeckService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/decks`;

  getDecks(): Observable<Deck[]> {
    return this.http.get<Deck[]>(this.api);
  }

  getDeck(id: number): Observable<DeckDetail> {
    return this.http.get<DeckDetail>(`${this.api}/${id}`);
  }

  createDeck(req: SaveDeckRequest): Observable<Deck> {
    return this.http.post<Deck>(this.api, req);
  }

  saveDeck(id: number, req: SaveDeckRequest): Observable<DeckDetail> {
    return this.http.put<DeckDetail>(`${this.api}/${id}`, req);
  }

  deleteDeck(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.api}/${id}`);
  }

  validateDeck(id: number): Observable<DeckValidationResult> {
    return this.http.get<DeckValidationResult>(`${this.api}/${id}/validate`);
  }
}
