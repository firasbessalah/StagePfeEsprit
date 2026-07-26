import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AlerteLogementDTO {
  id?: number;
  userId?: number;
  localisation: string;
  prixMax: number;
  active?: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlerteService {
  private http = inject(HttpClient);
  private apiUrl = '/api/alertes';

  constructor() {}

  getMyAlerts(): Observable<AlerteLogementDTO[]> {
    return this.http.get<AlerteLogementDTO[]>(this.apiUrl);
  }

  createAlert(alerte: AlerteLogementDTO): Observable<AlerteLogementDTO> {
    return this.http.post<AlerteLogementDTO>(this.apiUrl, alerte);
  }

  deleteAlert(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleAlert(id: number): Observable<AlerteLogementDTO> {
    return this.http.put<AlerteLogementDTO>(`${this.apiUrl}/${id}/toggle`, {});
  }
}
