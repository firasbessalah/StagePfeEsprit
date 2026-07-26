import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { UserDTO } from 'src/app/core/auth/auth.models';
import { AnnonceDTO } from 'src/app/admin-features/annonce-admin.service';

/** Minimal shape for counting annonces from `GET /api/annonces`. */
export interface AnnonceListItem {
  id?: number;
}

// ─── Dashboard Analytics Interfaces ─────────────────────

export interface MonthlyCount {
  label: string;
  count: number;
}

export interface DailyCount {
  label: string;
  count: number;
}

export interface MonthlyComparison {
  currentMonth: number;
  previousMonth: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'flat';
}

export interface DashboardAnalytics {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  activeUsersMonth: number;
  totalReservations: number;
  usersWithReservations: number;
  reservationUserPercentage: number;
  totalAnnonces: number;
  newUsersThisMonth: number;
  reservationsThisMonth: number;
  annoncesThisMonth: number;
  monthlyNewUsers: MonthlyCount[];
  peakUsageHours: number[];
  userActivity7d: DailyCount[];
  userActivity30d: DailyCount[];
  userActivity12m: MonthlyCount[];
  monthlyReservations: MonthlyCount[];
  monthlyAnnonces: MonthlyCount[];
  usersWithAnnonces: number;
  userComparison: MonthlyComparison;
  reservationComparison: MonthlyComparison;
  annonceComparison: MonthlyComparison;
  totalRevenue: number;
  totalCommission: number;
  topAnnonces: AnnonceDTO[];
  peakDemandPeriods: MonthlyCount[];
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

  getDashboardAnalytics(): Observable<DashboardAnalytics> {
    return this.http.get<DashboardAnalytics>(`${environment.apiBaseUrl}/api/analytics/dashboard`);
  }

  exportDashboardExcel(): Observable<Blob> {
    return this.http.get(`${environment.apiBaseUrl}/api/analytics/export/excel`, {
      responseType: 'blob'
    });
  }
}

