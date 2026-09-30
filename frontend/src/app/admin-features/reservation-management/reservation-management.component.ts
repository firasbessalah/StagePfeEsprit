import { Component, OnInit, inject, signal, computed } from '@angular/core'; 
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ReservationService, ReservationDTO } from 'src/app/demo/reservations/reservation.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { TranslatePipe } from 'src/app/core/pipes/translate.pipe';
import { NotificationDropdownComponent } from 'src/app/demo/shared/notification-dropdown/notification-dropdown.component';
import { NgbDropdownModule, NgbModalModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService, Language } from 'src/app/core/services/translation.service';
import { AvisService, AvisDTO } from 'src/app/demo/avis/avis.service';
import { PublicFooterComponent } from 'src/app/demo/shared/public-footer/public-footer.component';

@Component({
  selector: 'app-reservation-management',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, NgbDropdownModule, NgbModalModule, ReactiveFormsModule, TranslatePipe, PublicFooterComponent, NotificationDropdownComponent],
  templateUrl: './reservation-management.component.html',
  styleUrls: ['./reservation-management.component.scss']
})
export class ReservationManagementComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private modalService = inject(NgbModal);
  private avisService = inject(AvisService);
  private fb = inject(FormBuilder);

  reservations = signal<ReservationDTO[]>([]);
  loading = signal(true);
  error = signal('');
  
  reviewForm = this.fb.group({
    note: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    commentaire: ['', [Validators.required, Validators.minLength(5)]]
  });
  selectedReservation = signal<ReservationDTO | null>(null);
  submittingReview = signal(false);
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

  cancelReservation(id: number) {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      this.reservationService.annulerReservation(id).subscribe({
        next: () => this.loadReservations(),
        error: (err) => alert('Error canceling reservation.')
      });
    }
  }

  openReviewModal(res: ReservationDTO, modal: any) {
    this.selectedReservation.set(res);
    this.reviewForm.reset({ note: 5, commentaire: '' });
    this.modalService.open(modal, { centered: true });
  }

  submitReview(modal: any) {
    const res = this.selectedReservation();
    if (this.reviewForm.invalid || !res || !res.annonceId) return;
    
    this.submittingReview.set(true);
    const dto: any = this.reviewForm.value;
    const userId = this.user()!.id;
    
    this.avisService.publier(dto as AvisDTO, userId, res.annonceId).subscribe({
      next: () => {
        this.submittingReview.set(false);
        modal.close();
        // Optional: show a success message
        alert('Review submitted successfully!');
      },
      error: (err) => {
        this.submittingReview.set(false);
        alert('Error submitting review.');
      }
    });
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
