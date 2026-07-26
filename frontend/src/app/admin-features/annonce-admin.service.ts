import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AnnonceDTO {
  id?: number;
  titre?: string;
  description?: string;
  prix?: number;
  localisation?: string;
  latitude?: number;
  longitude?: number;
  disponibiliteDebut?: string;
  disponibiliteFin?: string;
  statut?: string;
  createdAt?: string;
  userId?: number;
  userNom?: string;
  userPrenom?: string;
  categorie?: string;
  duree?: number;
  flagged?: boolean;
  flagReason?: string;
  riskScore?: number;
  rawScore?: number;
  signalsJson?: string;
  images?: string[];
}

@Injectable({ providedIn: 'root' })
export class AnnonceAdminService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/annonces`;

  getAllAnnoncesAdmin(): Observable<AnnonceDTO[]> {
    return this.http.get<AnnonceDTO[]>(`${this.baseUrl}/admin/all`);
  }

  getAnnoncesByUser(userId: number): Observable<AnnonceDTO[]> {
    return this.http.get<AnnonceDTO[]>(`${this.baseUrl}/user/${userId}`);
  }

  createAnnonce(dto: AnnonceDTO, userId: number): Observable<AnnonceDTO> {
    return this.http.post<AnnonceDTO>(`${this.baseUrl}?userId=${userId}`, dto);
  }

  deleteAnnonce(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  updateAnnonce(id: number, dto: AnnonceDTO): Observable<AnnonceDTO> {
    return this.http.put<AnnonceDTO>(`${this.baseUrl}/${id}`, dto);
  }

  validerAnnonce(id: number): Observable<AnnonceDTO> {
    return this.http.put<AnnonceDTO>(`${this.baseUrl}/${id}/valider`, {});
  }

  rejeterAnnonce(id: number): Observable<AnnonceDTO> {
    return this.http.put<AnnonceDTO>(`${this.baseUrl}/${id}/rejeter`, {});
  }

  archiverAnnonce(id: number): Observable<AnnonceDTO> {
    return this.http.put<AnnonceDTO>(`${this.baseUrl}/${id}/archiver`, {});
  }

  rechercher(localisation?: string, prixMax?: number, categorie?: string, duree?: number): Observable<AnnonceDTO[]> {
    const params: Record<string, string> = {};
    if (localisation?.trim()) params['localisation'] = localisation.trim();
    if (prixMax != null) params['prixMax'] = String(prixMax);
    if (categorie?.trim()) params['categorie'] = categorie.trim();
    if (duree != null) params['duree'] = String(duree);
    return this.http.get<AnnonceDTO[]>(`${this.baseUrl}/recherche`, { params });
  }

  aiRechercher(query: string): Observable<{
    parsedLocalisation?: string;
    parsedPrixMax?: number;
    parsedCategorie?: string;
    parsedDuree?: number;
    results: AnnonceDTO[];
  }> {
    return this.http.get<any>(`${this.baseUrl}/ai-recherche?query=${encodeURIComponent(query)}`);
  }
}
