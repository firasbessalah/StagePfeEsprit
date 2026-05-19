import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AvisDTO {
  id?: number;
  note: number;
  commentaire: string;
  isModere?: boolean;
  createdAt?: string;
  userId?: number;
  userNom?: string;
  userPrenom?: string;
  annonceId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AvisService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/avis`;

  // Submit a new review
  publier(dto: AvisDTO, userId: number, annonceId: number): Observable<AvisDTO> {
    return this.http.post<AvisDTO>(this.baseUrl, dto, {
      params: { userId: userId.toString(), annonceId: annonceId.toString() }
    });
  }

  // Get all reviews for a property
  getAvisByAnnonce(annonceId: number): Observable<AvisDTO[]> {
    return this.http.get<AvisDTO[]>(`${this.baseUrl}/annonce/${annonceId}`);
  }

  // Get average rating for a property
  getNoteMoyenne(annonceId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/annonce/${annonceId}/moyenne`);
  }

  // Delete a review
  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
