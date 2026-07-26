import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AnnonceDTO } from 'src/app/admin-features/annonce-admin.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReservationService, ReservationDTO } from 'src/app/demo/reservations/reservation.service';
import { AvisService, AvisDTO } from 'src/app/demo/avis/avis.service';
import { TranslationService, Language } from 'src/app/core/services/translation.service';
import { TranslatePipe } from 'src/app/core/pipes/translate.pipe';
import { PublicFooterComponent } from '../shared/public-footer/public-footer.component';
import { FavoriService } from '../../core/services/favori.service';
import { NotificationDropdownComponent } from '../shared/notification-dropdown/notification-dropdown.component';

@Component({
  selector: 'app-annonce-details',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, NgbDropdownModule, ReactiveFormsModule, TranslatePipe, PublicFooterComponent, NotificationDropdownComponent],
  templateUrl: './annonce-details.component.html',
  styleUrls: ['./annonce-details.component.scss']
})
export class AnnonceDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private avisService = inject(AvisService);
  private translationService = inject(TranslationService);
  public favoriService = inject(FavoriService);

  user = computed(() => this.auth.user());
  isAuthenticated = computed(() => this.auth.isAuthenticated());

  currentLang = computed(() => this.translationService.currentLang());

  setLang(lang: Language): void {
    this.translationService.setLanguage(lang);
  }

  annonce = signal<AnnonceDTO | null>(null);
  loading = signal(true);
  error = signal('');
  
  private modalService = inject(NgbModal);
  private fb = inject(FormBuilder);
  private reservationService = inject(ReservationService);

  reservationForm!: FormGroup;
  reservationSuccess = signal(false);
  reservationError = signal('');
  isSubmitting = signal(false);

  // Avis/Reviews state
  avisList = signal<AvisDTO[]>([]);
  averageRating = signal<number>(0);
  selectedNote = signal<number>(5);
  reviewComment = signal<string>('');
  submittingReview = signal<boolean>(false);
  reviewSuccessMessage = signal<string>('');
  reviewErrorMessage = signal<string>('');

  ngOnInit(): void {
    this.reservationForm = this.fb.group({
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      message: ['']
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchAnnonceDetails(id);
        this.loadReviews(+id);
        this.loadAverageRating(+id);
        this.incrementViews(+id);
      } else {
        this.error.set('Invalid announcement ID');
        this.loading.set(false);
      }
    });
  }

  incrementViews(id: number) {
    this.http.post(`${environment.apiBaseUrl}/api/annonces/${id}/view`, {}).subscribe({
      error: () => console.error('Failed to increment views')
    });
  }

  fetchAnnonceDetails(id: string) {
    this.loading.set(true);
    this.http.get<AnnonceDTO>(`${environment.apiBaseUrl}/api/annonces/${id}`).subscribe({
      next: (data) => {
        this.annonce.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load announcement details.');
        this.loading.set(false);
      }
    });

    if (this.isAuthenticated()) {
      this.favoriService.loadMyFavoris().subscribe();
    }
  }

  toggleFavori(annonceId: number) {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (this.favoriService.isFavori(annonceId)) {
      this.favoriService.removeFavori(annonceId).subscribe();
    } else {
      this.favoriService.addFavori(annonceId).subscribe();
    }
  }

  loadReviews(annonceId: number) {
    this.avisService.getAvisByAnnonce(annonceId).subscribe({
      next: (list) => {
        this.avisList.set(list.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()));
      }
    });
  }

  loadAverageRating(annonceId: number) {
    this.avisService.getNoteMoyenne(annonceId).subscribe({
      next: (avg) => {
        this.averageRating.set(avg || 0);
      }
    });
  }

  submitReview() {
    const u = this.user();
    const a = this.annonce();
    if (!u || !a || !a.id) {
      this.reviewErrorMessage.set('You must be logged in to submit a review.');
      return;
    }

    if (!this.reviewComment().trim()) {
      this.reviewErrorMessage.set('Please write a comment.');
      return;
    }

    this.submittingReview.set(true);
    this.reviewErrorMessage.set('');
    this.reviewSuccessMessage.set('');

    const newAvis: AvisDTO = {
      note: this.selectedNote(),
      commentaire: this.reviewComment()
    };

    this.avisService.publier(newAvis, u.id, a.id).subscribe({
      next: () => {
        this.submittingReview.set(false);
        this.reviewSuccessMessage.set('Review submitted successfully!');
        this.reviewComment.set('');
        this.selectedNote.set(5);
        this.loadReviews(a.id!);
        this.loadAverageRating(a.id!);
        setTimeout(() => this.reviewSuccessMessage.set(''), 3000);
      },
      error: (err) => {
        this.submittingReview.set(false);
        this.reviewErrorMessage.set(err.error?.message || 'Failed to submit review.');
      }
    });
  }

  onReserve(content: any) {
    if (this.isAuthenticated()) {
      if (this.user()?.id === this.annonce()?.userId) {
        alert("You cannot reserve your own property!");
        return;
      }
      this.reservationSuccess.set(false);
      this.reservationError.set('');
      this.reservationForm.reset();
      this.modalService.open(content, { centered: true });
    } else {
      this.router.navigate(['/login']);
    }
  }

  submitReservation(modal: any) {
    if (this.reservationForm.invalid) return;

    const u = this.user();
    const a = this.annonce();
    if (!u || !a) return;

    this.isSubmitting.set(true);
    const formValue = this.reservationForm.value;
    const dto: ReservationDTO = {
      dateDebut: formValue.dateDebut,
      dateFin: formValue.dateFin,
      message: formValue.message
    };

    this.reservationService.confirmer(dto, u.id, a.id!).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.reservationSuccess.set(true);
        setTimeout(() => {
          modal.close();
        }, 2000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.reservationError.set(err.error?.message || 'Error occurred while booking. Please check your dates.');
      }
    });
  }

  onAddAnnonce() {
    if (this.isAuthenticated()) {
      this.router.navigate(['/annonces']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
