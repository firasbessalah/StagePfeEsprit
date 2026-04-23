import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { UserDTO } from 'src/app/core/auth/auth.models';

/** Minimal shape for counting annonces from `GET /api/annonces`. */
export interface AnnonceListItem {
  id?: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private http: HttpClient) {}

  getDashboardCounts(): Observable<{ users: number; annonces: number }> {
    return forkJoin({
      users: this.http.get<UserDTO[]>(`${environment.apiBaseUrl}/api/auth/users`),
      annonces: this.http.get<AnnonceListItem[]>(`${environment.apiBaseUrl}/api/annonces`)
    }).pipe(
      map(({ users, annonces }) => ({
        users: users?.length ?? 0,
        annonces: annonces?.length ?? 0
      }))
    );
  }
}
