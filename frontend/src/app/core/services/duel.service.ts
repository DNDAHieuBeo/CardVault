import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Duel, CreateDuelRequest, UpdateLPRequest, LPLogEntry } from '../models/duel.model';

@Injectable({ providedIn: 'root' })
export class DuelService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/duels`;

  getDuels(): Observable<Duel[]> {
    return this.http.get<Duel[]>(this.api);
  }

  getDuel(id: number): Observable<Duel> {
    return this.http.get<Duel>(`${this.api}/${id}`);
  }

  createDuel(req: CreateDuelRequest): Observable<Duel> {
    return this.http.post<Duel>(this.api, req);
  }

  updateLP(id: number, req: UpdateLPRequest): Observable<Duel> {
    return this.http.post<Duel>(`${this.api}/${id}/lp`, req);
  }

  getHistory(id: number): Observable<LPLogEntry[]> {
    return this.http.get<LPLogEntry[]>(`${this.api}/${id}/history`);
  }

  endDuel(id: number): Observable<Duel> {
    return this.http.post<Duel>(`${this.api}/${id}/end`, {});
  }
}
