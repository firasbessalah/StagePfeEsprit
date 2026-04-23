import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { UserDTO, UserRole } from 'src/app/core/auth/auth.models';

/** Body for Spring `POST /api/auth/register` (entity `User`). */
export interface RegisterUserBody {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string | null;
  photoProfil?: string | null;
  role?: UserRole | string | null;
}

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private readonly base = `${environment.apiBaseUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.base}/users`);
  }

  deleteUser(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/users/${id}`);
  }

  updateUser(id: number, dto: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.base}/users/${id}`, dto);
  }

  registerUser(body: RegisterUserBody): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.base}/register`, body);
  }

  changePassword(id: number, request: any): Observable<void> {
    return this.http.put<void>(`${this.base}/users/${id}/password`, request);
  }
}
