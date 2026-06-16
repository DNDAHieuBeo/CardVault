import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserCard, AddCardRequest, UpdateQuantityRequest } from '../models/collection.model';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/collection`;

  getCollection(): Observable<UserCard[]> {
    return this.http.get<UserCard[]>(this.api);
  }

  addCard(req: AddCardRequest): Observable<UserCard> {
    return this.http.post<UserCard>(this.api, req);
  }

  updateQuantity(cardId: number, req: UpdateQuantityRequest): Observable<UserCard> {
    return this.http.patch<UserCard>(`${this.api}/${cardId}/quantity`, req);
  }

  removeCard(cardId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.api}/${cardId}`);
  }
}
