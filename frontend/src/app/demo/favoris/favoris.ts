import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FavoriService, FavoriDTO } from '../../core/services/favori.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { AuthService } from '../../core/auth/auth.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService, Language } from '../../core/services/translation.service';
import { NotificationDropdownComponent } from '../shared/notification-dropdown/notification-dropdown.component';

@Component({
  selector: 'app-favoris',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, NgbDropdownModule, NotificationDropdownComponent],
  templateUrl: './favoris.html',
  styleUrl: './favoris.scss'
})
export class FavorisComponent implements OnInit {
  private favoriService = inject(FavoriService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  favoris = signal<FavoriDTO[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  user = computed(() => this.auth.user());
  isAuthenticated = computed(() => this.auth.isAuthenticated());
  currentLang = computed(() => this.translationService.currentLang());
  homeLink = computed(() => '/browse');

  ngOnInit() {
    this.loadFavoris();
  }

  loadFavoris() {
    this.loading.set(true);
    this.favoriService.loadMyFavoris().subscribe({
      next: (data) => {
        this.favoris.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading favoris', err);
        this.error.set('Failed to load favorites.');
        this.loading.set(false);
      }
    });
  }

  removeFavori(annonceId: number, event: Event) {
    event.stopPropagation();
    this.favoriService.removeFavori(annonceId).subscribe({
      next: () => {
        this.favoris.update(favs => favs.filter(f => f.annonceId !== annonceId));
      },
      error: (err) => {
        console.error('Error removing favorite', err);
      }
    });
  }

  setLang(lang: Language): void {
    this.translationService.setLanguage(lang);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
