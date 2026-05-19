import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ReservationService, ReservationDTO } from 'src/app/demo/reservations/reservation.service';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-reservation-management',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './reservation-management.component.html'
})
export class ReservationManagementComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private auth = inject(AuthService);

  reservations = signal<ReservationDTO[]>([]);
  loading = signal(true);
  error = signal('');
  isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations() {
    this.loading.set(true);
    
    const obs$ = this.isAdmin() 
      ? this.reservationService.getAllReservations() 
      : this.reservationService.getReservationsByBailleur(this.auth.user()?.id as number);

    obs$.subscribe({
      next: (data) => {
        // Show pending first, then others
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
}
