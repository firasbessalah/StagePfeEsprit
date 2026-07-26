import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface NotificationDTO {
  id?: number;
  titre: string;
  message: string;
  lu: boolean;
  type: string;
  createdAt: string;
  userId: number;
  relatedEntityId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/api/notifications`;

  getNotifications(userId: number): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.apiUrl}?userId=${userId}`);
  }

  getNonLuesCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/non-lues?userId=${userId}`);
  }

  marquerLue(id: number): Observable<NotificationDTO> {
    return this.http.put<NotificationDTO>(`${this.apiUrl}/${id}/lue`, {});
  }
}
