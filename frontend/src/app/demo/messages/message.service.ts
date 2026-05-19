import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface MessageDTO {
  id?: number;
  contenu: string;
  lu?: boolean;
  modere?: boolean;
  createdAt?: string;
  expediteurId?: number;
  expediteurNom?: string;
  destinataireId?: number;
  destinataireNom?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/api/messages`;

  envoyerMessage(contenu: string, expediteurId: number, destinataireId: number): Observable<MessageDTO> {
    const dto: MessageDTO = { contenu };
    return this.http.post<MessageDTO>(
      `${this.apiUrl}?expediteurId=${expediteurId}&destinataireId=${destinataireId}`,
      dto
    );
  }

  getConversation(userId1: number, userId2: number): Observable<MessageDTO[]> {
    return this.http.get<MessageDTO[]>(
      `${this.apiUrl}/conversation?userId1=${userId1}&userId2=${userId2}`
    );
  }

  marquerLu(messageId: number): Observable<MessageDTO> {
    return this.http.put<MessageDTO>(`${this.apiUrl}/${messageId}/lu`, {});
  }

  getNonLusCount(destinataireId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/non-lus?destinataireId=${destinataireId}`);
  }
}
