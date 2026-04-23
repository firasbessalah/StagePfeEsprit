import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/core/auth/auth.service';
import { StatsService } from 'src/app/admin-features/stats.service';


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, SharedModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private stats = inject(StatsService);
  private auth = inject(AuthService);

  userCount = signal(0);
  annonceCount = signal(0);
  loading = signal(true);
  error = signal('');

  user = computed(() => this.auth.user());

  ngOnInit(): void {
    this.stats.getDashboardCounts().subscribe({
      next: (c) => {
        this.userCount.set(c.users);
        this.annonceCount.set(c.annonces);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.errMsg(err));
        this.loading.set(false);
      }
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
}
