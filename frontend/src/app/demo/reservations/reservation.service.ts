import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ReservationDTO {
  id?: number;
  dateDebut: string;
  dateFin: string;
  message?: string;
  prixTotal?: number;
  statut?: string;
  createdAt?: string;
  userId?: number;
  userNom?: string;
  userPrenom?: string;
  userEmail?: string;
  userTelephone?: string;
  annonceId?: number;
  annonceTitre?: string;
  annoncePrix?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiBaseUrl}/api/reservations`;

  constructor(private http: HttpClient) {}

  confirmer(dto: ReservationDTO, userId: number, annonceId: number): Observable<ReservationDTO> {
    return this.http.post<ReservationDTO>(`${this.apiUrl}?userId=${userId}&annonceId=${annonceId}`, dto);
  }

  getReservationsByUser(userId: number): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(`${this.apiUrl}/user/${userId}`);
  }

  getReservationsByAnnonce(annonceId: number): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(`${this.apiUrl}/annonce/${annonceId}`);
  }

  getReservationsByBailleur(bailleurId: number): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(`${this.apiUrl}/bailleur/${bailleurId}`);
  }

  getAllReservations(): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(this.apiUrl);
  }

  confirmerReservation(id: number): Observable<ReservationDTO> {
    return this.http.put<ReservationDTO>(`${this.apiUrl}/${id}/confirmer`, {});
  }

  annulerReservation(id: number): Observable<ReservationDTO> {
    return this.http.put<ReservationDTO>(`${this.apiUrl}/${id}/annuler`, {});
  }

  refuserReservation(id: number): Observable<ReservationDTO> {
    return this.http.put<ReservationDTO>(`${this.apiUrl}/${id}/refuser`, {});
  }

  terminerReservation(id: number): Observable<ReservationDTO> {
    return this.http.put<ReservationDTO>(`${this.apiUrl}/${id}/terminer`, {});
  }
}
