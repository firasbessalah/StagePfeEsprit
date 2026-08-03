import { Component, OnInit, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/core/auth/auth.service';
import { StatsService, DashboardAnalytics, MonthlyCount, DailyCount } from 'src/app/admin-features/stats.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { TranslatePipe } from 'src/app/core/pipes/translate.pipe';
import { AvisService, AvisDTO } from 'src/app/demo/avis/avis.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, SharedModule, NgApexchartsModule, TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private stats = inject(StatsService);
  private auth = inject(AuthService);
  private translationService = inject(TranslationService);
  private avisService = inject(AvisService);

  loading = signal(true);
  error = signal('');
  data = signal<DashboardAnalytics | null>(null);
  user = computed(() => this.auth.user());

  // Chart configurations
  monthlyUsersChart = signal<any>(null);
  peakHoursChart = signal<any>(null);
  activityChart = signal<any>(null);
  reservationsChart = signal<any>(null);
  annoncesChart = signal<any>(null);
  usersWithReservationsChart = signal<any>(null);
  comparisonChart = signal<any>(null);
  activeUsersChart = signal<any>(null);
  sentimentChart = signal<any>(null);

  activityPeriod = signal<'7d' | '30d' | '12m'>('30d');

  // Reviews with AI sentiment
  allReviews = signal<AvisDTO[]>([]);
  reviewsLoading = signal(false);
  sentimentFilter = signal<'ALL' | 'POSITIF' | 'NEGATIF' | 'NEUTRE'>('ALL');
  filteredReviews = computed(() => {
    const f = this.sentimentFilter();
    if (f === 'ALL') return this.allReviews();
    return this.allReviews().filter(r => r.sentiment === f);
  });
  sentimentCounts = computed(() => {
    const all = this.allReviews();
    return {
      positif: all.filter(r => r.sentiment === 'POSITIF').length,
      negatif: all.filter(r => r.sentiment === 'NEGATIF').length,
      neutre: all.filter(r => r.sentiment === 'NEUTRE').length,
      total: all.length
    };
  });

  constructor() {
    // Re-build charts automatically when language changes
    effect(() => {
      this.translationService.currentLang(); // track signal dependency
      const d = this.data();
      if (d) {
        this.buildCharts(d);
      }
    });
  }

  ngOnInit(): void {
    this.stats.getDashboardAnalytics().subscribe({
      next: (d) => {
        this.data.set(d);
        this.buildCharts(d);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.errMsg(err));
        this.loading.set(false);
      }
    });

    // Load all reviews with sentiment for admin
    this.reviewsLoading.set(true);
    this.avisService.getAllAvis().subscribe({
      next: (reviews) => {
        this.allReviews.set(reviews);
        this.buildSentimentChart(reviews);
        this.reviewsLoading.set(false);
      },
      error: () => this.reviewsLoading.set(false)
    });
  }

  setActivityPeriod(period: '7d' | '30d' | '12m'): void {
    this.activityPeriod.set(period);
    const d = this.data();
    if (d) this.buildActivityChart(d);
  }

  private buildCharts(d: DashboardAnalytics): void {
    this.buildMonthlyUsersChart(d.monthlyNewUsers);
    this.buildPeakHoursChart(d.peakUsageHours);
    this.buildActivityChart(d);
    this.buildReservationsChart(d.monthlyReservations);
    this.buildAnnoncesChart(d.monthlyAnnonces);
    this.buildUsersWithReservationsChart(d);
    this.buildComparisonChart(d);
    this.buildActiveUsersChart(d);
  }

  // ─── Chart Builders ───────────────────────────────────

  private buildMonthlyUsersChart(data: MonthlyCount[]): void {
    this.monthlyUsersChart.set({
      series: [{ name: this.translationService.translate('MONTHLY_NEW_USERS'), data: data.map(d => d.count) }],
      chart: { type: 'bar', height: 300, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
      dataLabels: { enabled: false },
      xaxis: { categories: data.map(d => d.label), labels: { style: { colors: '#64748b' } } },
      yaxis: { labels: { style: { colors: '#64748b' } } },
      colors: ['#0a1045'],
      grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
      tooltip: { theme: 'light' }
    });
  }

  private buildPeakHoursChart(hours: number[]): void {
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    this.peakHoursChart.set({
      series: [{ name: this.translationService.translate('PEAK_USAGE_TIME'), data: hours }],
      chart: { type: 'bar', height: 300, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
      plotOptions: { bar: { borderRadius: 4, columnWidth: '65%' } },
      dataLabels: { enabled: false },
      xaxis: { categories: labels, labels: { style: { colors: '#64748b', fontSize: '10px' }, rotate: -45 } },
      yaxis: { labels: { style: { colors: '#64748b' } } },
      colors: ['#f4b400'],
      grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
      tooltip: { theme: 'light' }
    });
  }

  private buildActivityChart(d: DashboardAnalytics): void {
    const period = this.activityPeriod();
    let labels: string[];
    let values: number[];

    if (period === '7d') {
      labels = d.userActivity7d.map(x => x.label);
      values = d.userActivity7d.map(x => x.count);
    } else if (period === '30d') {
      labels = d.userActivity30d.map(x => x.label);
      values = d.userActivity30d.map(x => x.count);
    } else {
      labels = d.userActivity12m.map(x => x.label);
      values = d.userActivity12m.map(x => x.count);
    }

    this.activityChart.set({
      series: [{ name: this.translationService.translate('ACTIVE_USERS'), data: values }],
      chart: { type: 'area', height: 300, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2.5 },
      xaxis: { categories: labels, labels: { style: { colors: '#64748b', fontSize: '10px' }, rotate: -45 } },
      yaxis: { labels: { style: { colors: '#64748b' } } },
      colors: ['#0a1045'],
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05 } },
      grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
      tooltip: { theme: 'light' }
    });
  }

  private buildReservationsChart(data: MonthlyCount[]): void {
    this.reservationsChart.set({
      series: [{ name: this.translationService.translate('RESERVATIONS'), data: data.map(d => d.count) }],
      chart: { type: 'bar', height: 300, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
      dataLabels: { enabled: false },
      xaxis: { categories: data.map(d => d.label), labels: { style: { colors: '#64748b' } } },
      yaxis: { labels: { style: { colors: '#64748b' } } },
      colors: ['#f4b400'],
      grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
      tooltip: { theme: 'light' }
    });
  }

  private buildAnnoncesChart(data: MonthlyCount[]): void {
    this.annoncesChart.set({
      series: [{ name: this.translationService.translate('ANNONCES'), data: data.map(d => d.count) }],
      chart: { type: 'bar', height: 300, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
      dataLabels: { enabled: false },
      xaxis: { categories: data.map(d => d.label), labels: { style: { colors: '#64748b' } } },
      yaxis: { labels: { style: { colors: '#64748b' } } },
      colors: ['#0a1045'],
      grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
      tooltip: { theme: 'light' }
    });
  }

  private buildUsersWithReservationsChart(d: DashboardAnalytics): void {
    const withRes = d.usersWithReservations;
    const withoutRes = d.totalUsers - withRes;
    this.usersWithReservationsChart.set({
      series: [withRes, withoutRes],
      chart: { type: 'donut', height: 300, fontFamily: 'Inter, sans-serif' },
      labels: [
        this.translationService.translate('WITH_RESERVATIONS'),
        this.translationService.translate('WITHOUT_RESERVATIONS')
      ],
      colors: ['#0a1045', '#f4b400'],
      legend: { position: 'bottom', labels: { colors: '#64748b' } },
      dataLabels: { enabled: true, style: { fontSize: '14px' } },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: { show: true, label: 'Total', color: '#64748b' }
            }
          }
        }
      },
      tooltip: { theme: 'light' }
    });
  }

  private buildComparisonChart(d: DashboardAnalytics): void {
    this.comparisonChart.set({
      series: [
        { name: this.translationService.translate('PREVIOUS_MONTH'), data: [d.userComparison.previousMonth, d.reservationComparison.previousMonth, d.annonceComparison.previousMonth] },
        { name: this.translationService.translate('CURRENT_MONTH'), data: [d.userComparison.currentMonth, d.reservationComparison.currentMonth, d.annonceComparison.currentMonth] }
      ],
      chart: { type: 'bar', height: 300, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: [
          this.translationService.translate('USERS'),
          this.translationService.translate('RESERVATIONS'),
          this.translationService.translate('ANNONCES')
        ],
        labels: { style: { colors: '#64748b' } }
      },
      yaxis: { labels: { style: { colors: '#64748b' } } },
      colors: ['#0a1045', '#f4b400'],
      grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
      legend: { position: 'top', labels: { colors: '#64748b' } },
      tooltip: { theme: 'light' }
    });
  }

  private buildActiveUsersChart(d: DashboardAnalytics): void {
    const maxVal = Math.max(d.activeUsersToday, d.activeUsersWeek, d.activeUsersMonth, 1);
    this.activeUsersChart.set({
      series: [
        Math.round((d.activeUsersToday / maxVal) * 100),
        Math.round((d.activeUsersWeek / maxVal) * 100),
        Math.round((d.activeUsersMonth / maxVal) * 100)
      ],
      chart: { type: 'radialBar', height: 300, fontFamily: 'Inter, sans-serif' },
      plotOptions: {
        radialBar: {
          hollow: { size: '30%' },
          dataLabels: {
            name: { fontSize: '14px', color: '#64748b' },
            value: { fontSize: '16px', color: '#0f172a', formatter: (val: number) => `${val}%` },
            total: { show: true, label: 'MAU', color: '#64748b',
              formatter: () => String(d.activeUsersMonth) }
          },
          track: { background: '#f1f5f9' }
        }
      },
      labels: ['DAU', 'WAU', 'MAU'],
      colors: ['#0a1045', '#f4b400', '#3b82f6'],
      legend: { show: true, position: 'bottom', labels: { colors: '#64748b' } }
    });
  }

  private errMsg(err: unknown): string {
    const e = err as { error?: unknown; message?: string };
    if (typeof e?.error === 'string') return e.error;
    if (e?.error && typeof (e.error as { message?: string }).message === 'string') {
      return (e.error as { message: string }).message;
    }
    return e?.message || 'Request failed';
  }

  buildSentimentChart(reviews: AvisDTO[]): void {
    const pos = reviews.filter(r => r.sentiment === 'POSITIF').length;
    const neg = reviews.filter(r => r.sentiment === 'NEGATIF').length;
    const neu = reviews.filter(r => r.sentiment === 'NEUTRE').length;
    this.sentimentChart.set({
      series: [pos, neg, neu],
      chart: { type: 'donut', height: 220, background: 'transparent' },
      labels: ['Positif', 'Négatif', 'Neutre'],
      colors: ['#22c55e', '#ef4444', '#94a3b8'],
      legend: { position: 'bottom', labels: { colors: '#64748b' } },
      dataLabels: { enabled: true, style: { fontSize: '12px' } },
      plotOptions: { pie: { donut: { size: '65%' } } },
      tooltip: { theme: 'light' }
    });
  }

  exportExcel(): void {
    this.stats.exportDashboardExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dashboard_analytics.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.error.set(this.errMsg(err));
      }
    });
  }
}

