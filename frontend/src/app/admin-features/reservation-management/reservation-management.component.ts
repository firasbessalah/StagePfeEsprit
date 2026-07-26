import { Component, OnInit, inject, signal, computed } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ReservationService, ReservationDTO } from 'src/app/demo/reservations/reservation.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { TranslatePipe } from 'src/app/core/pipes/translate.pipe';
import { NotificationDropdownComponent } from 'src/app/demo/shared/notification-dropdown/notification-dropdown.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService, Language } from 'src/app/core/services/translation.service';
import { PublicFooterComponent } from 'src/app/demo/shared/public-footer/public-footer.component';

@Component({
  selector: 'app-reservation-management',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, NgbDropdownModule, TranslatePipe, PublicFooterComponent, NotificationDropdownComponent],
  templateUrl: './reservation-management.component.html',
  styleUrls: ['./reservation-management.component.scss']
})
export class ReservationManagementComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  reservations = signal<ReservationDTO[]>([]);
  loading = signal(true);
  error = signal('');
  user = computed(() => this.auth.user());
  isAdmin = computed(() => this.user()?.role === 'ADMIN');
  isAuthenticated = computed(() => this.auth.isAuthenticated());
  isBailleur = computed(() => this.user()?.role === 'BAILLEUR');
  currentLang = computed(() => this.translationService.currentLang());
  homeLink = computed(() => {
    const role = this.user()?.role;
    if (role === 'LOCATAIRE' || role === 'BAILLEUR') return '/browse';
    return '/';
  });

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations() {
    this.loading.set(true);
    const u = this.user();
    if (!u || !u.id) {
      this.loading.set(false);
      return;
    }

    let obs$;
    if (u.role === 'ADMIN') {
      obs$ = this.reservationService.getAllReservations();
    } else if (u.role === 'BAILLEUR') {
      obs$ = this.reservationService.getReservationsByBailleur(u.id);
    } else {
      obs$ = this.reservationService.getReservationsByUser(u.id);
    }

    obs$.subscribe({
      next: (data) => {
        // Show pending first, then others sorted by creation date
        data.sort((a, b) => {
          if (a.statut === 'EN_ATTENTE' && b.statut !== 'EN_ATTENTE') return -1;
          if (a.statut !== 'EN_ATTENTE' && b.statut === 'EN_ATTENTE') return 1;
          return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
        });
        this.reservations.set(data);
        setTimeout(() => this.loading.set(false), 0);
      },
      error: (err) => {
        this.error.set('Failed to load reservations.');
        setTimeout(() => this.loading.set(false), 0);
      }
    });
  }

  acceptReservation(id: number) {
    if (confirm('Are you sure you want to approve this reservation?')) {
      this.reservationService.confirmerReservation(id).subscribe({
        next: () => this.loadReservations(),
        error: (err) => alert('Error accepting reservation.')
      });
    }
  }

  refuseReservation(id: number) {
    if (confirm('Are you sure you want to refuse this reservation?')) {
      this.reservationService.annulerReservation(id).subscribe({
        next: () => this.loadReservations(),
        error: (err) => alert('Error refusing reservation.')
      });
    }
  }

  setLang(lang: Language): void {
    this.translationService.setLanguage(lang);
  }

  onAddAnnonce(): void {
    if (this.isAuthenticated()) {
      this.router.navigate(['/annonces']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
