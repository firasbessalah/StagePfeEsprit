import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface FavoriDTO {
  id: number;
  userId: number;
  annonceId: number;
  annonceTitre: string;
  annonceLocalisation: string;
  annoncePrix: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriService {
  private http = inject(HttpClient);
  private apiUrl = '/api/favoris';

  // State holding favored annonce IDs
  private favorisSet = signal<Set<number>>(new Set());

  constructor() {}

  loadMyFavoris(): Observable<FavoriDTO[]> {
    return this.http.get<FavoriDTO[]>(this.apiUrl).pipe(
      tap((favoris) => {
        const set = new Set(favoris.map(f => f.annonceId));
        this.favorisSet.set(set);
      })
    );
  }

  addFavori(annonceId: number): Observable<FavoriDTO> {
    return this.http.post<FavoriDTO>(`${this.apiUrl}/${annonceId}`, {}).pipe(
      tap(() => {
        const set = new Set(this.favorisSet());
        set.add(annonceId);
        this.favorisSet.set(set);
      })
    );
  }

  removeFavori(annonceId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${annonceId}`).pipe(
      tap(() => {
        const set = new Set(this.favorisSet());
        set.delete(annonceId);
        this.favorisSet.set(set);
      })
    );
  }

  isFavori(annonceId: number): boolean {
    return this.favorisSet().has(annonceId);
  }
}
