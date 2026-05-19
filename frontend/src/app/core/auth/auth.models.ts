export type UserRole = 'ADMIN' | 'LOCATAIRE' | 'BAILLEUR';

export interface UserDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  photoProfil?: string | null;
  role: UserRole | string;
  createdAt?: string;
}

export interface AuthRequest {
  email: string;
  password: string;
  captchaToken?: string;
}

export interface AuthResponse {
  token: string;
  user: UserDTO;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string | null;
  photoProfil?: string | null;
  role?: UserRole | null;
}

