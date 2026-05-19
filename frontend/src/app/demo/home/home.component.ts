import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from 'src/app/core/auth/auth.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { StatsService } from 'src/app/admin-features/stats.service';
import { AnnonceAdminService } from 'src/app/admin-features/annonce-admin.service';


import { TranslatePipe } from 'src/app/core/pipes/translate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SharedModule, TranslatePipe],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private stats = inject(StatsService);
  private annonceAdmin = inject(AnnonceAdminService);

  user = computed(() => this.auth.user());
  isBailleur = computed(() => this.user()?.role === 'BAILLEUR');

  userCount = signal(0);
  annonceCount = signal(0);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    if (this.isBailleur()) {
      const userId = this.user()?.id;
      if (userId) {
        this.annonceAdmin.getAnnoncesByUser(userId).subscribe({
          next: (annonces) => {
            this.annonceCount.set(annonces?.length ?? 0);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(this.errMsg(err));
            this.loading.set(false);
          }
        });
      } else {
        this.loading.set(false);
      }
    } else {
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
