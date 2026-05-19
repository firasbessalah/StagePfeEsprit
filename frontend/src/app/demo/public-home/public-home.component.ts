import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AnnonceAdminService, AnnonceDTO } from 'src/app/admin-features/annonce-admin.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService, Language } from 'src/app/core/services/translation.service';
import { TranslatePipe } from 'src/app/core/pipes/translate.pipe';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, NgbDropdownModule, TranslatePipe],
  templateUrl: './public-home.component.html',
  styleUrls: ['./public-home.component.scss']
})
export class PublicHomeComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private translationService = inject(TranslationService);

  user = computed(() => this.auth.user());
  isAuthenticated = computed(() => this.auth.isAuthenticated());

  currentLang = computed(() => this.translationService.currentLang());
  activeLangName = computed(() => {
    const l = this.currentLang();
    if (l === 'en') return 'English';
    if (l === 'fr') return 'Français';
    return 'العربية';
  });

  setLang(lang: Language): void {
    this.translationService.setLanguage(lang);
  }

  annonces = signal<AnnonceDTO[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.fetchAnnonces();
  }

  fetchAnnonces() {
    this.loading.set(true);
    // Fetch all annonces for public view
    this.http.get<AnnonceDTO[]>(`${environment.apiBaseUrl}/api/annonces`).subscribe({
      next: (data) => {
        // Filter out only VALIDEE annonces if statut exists, otherwise show all
        const validAnnonces = data.filter(a => !a.statut || a.statut === 'VALIDEE');
        this.annonces.set(validAnnonces);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load announcements.');
        this.loading.set(false);
      }
    });
  }

  onAddAnnonce() {
    if (this.isAuthenticated()) {
      this.router.navigate(['/home']); // Or wherever the user dashboard is to add annonce
    } else {
      this.router.navigate(['/login']);
    }
  }

  onReserve(annonce: AnnonceDTO) {
    if (annonce.id) {
      this.viewDetails(annonce.id);
    }
  }

  viewDetails(id: number) {
    this.router.navigate(['/annonce', id]);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
