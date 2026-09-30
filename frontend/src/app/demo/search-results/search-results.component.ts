import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AnnonceAdminService, AnnonceDTO } from 'src/app/admin-features/annonce-admin.service';
import { AnnonceSearchService } from 'src/app/core/services/annonce-search.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { TranslatePipe } from 'src/app/core/pipes/translate.pipe';
import { NotificationDropdownComponent } from '../shared/notification-dropdown/notification-dropdown.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService, Language } from 'src/app/core/services/translation.service';
import { PublicFooterComponent } from '../shared/public-footer/public-footer.component';
import { SiteDescriptionComponent } from '../site-description/site-description.component';
import { FavoriService } from 'src/app/core/services/favori.service';
import { AlerteService } from 'src/app/core/services/alerte.service';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe, NgbDropdownModule, PublicFooterComponent, SiteDescriptionComponent, NotificationDropdownComponent],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private annonceService = inject(AnnonceAdminService);
  private searchService = inject(AnnonceSearchService);
  private auth = inject(AuthService);
  private translationService = inject(TranslationService);
  public favoriService = inject(FavoriService);
  private alerteService = inject(AlerteService);

  user = computed(() => this.auth.user());
  isAuthenticated = computed(() => this.auth.isAuthenticated());
  isBailleur = computed(() => this.user()?.role === 'BAILLEUR');
  isLocataire = computed(() => this.user()?.role === 'LOCATAIRE');
  currentLang = computed(() => this.translationService.currentLang());
  homeLink = computed(() => {
    const role = this.user()?.role;
    if (role === 'LOCATAIRE' || role === 'BAILLEUR') return '/browse';
    return '/';
  });

  localisation = '';
  checkIn = '';
  checkOut = '';
  guests = '';
  aiQuery = '';

  annonces = signal<AnnonceDTO[]>([]);
  loading = signal(true);
  error = signal('');
  creatingAlert = signal(false);
  alertError = signal('');

  // Interactive filters
  maxPrice = signal<number>(5000);
  maxDistance = signal<number>(1000);
  maxDuree = signal<number>(12);
  selectedCategorie = signal<string>('');
  userLocation = signal<{ latitude: number; longitude: number } | null>(null);

  aiFeedback = signal<{ localisation?: string; prixMax?: number; categorie?: string; duree?: number } | null>(null);

  displayedAnnonces = computed(() => {
    let list = this.annonces();
    
    // Filter by price
    const price = this.maxPrice();
    list = list.filter(a => a.prix !== undefined && a.prix <= price);
    
    // Filter by distance
    const dist = this.maxDistance();
    const loc = this.userLocation();
    if (loc && dist < 1000) {
      list = list.filter(a => {
        if (a.latitude === undefined || a.longitude === undefined) return true;
        const d = this.getDistance(loc.latitude, loc.longitude, a.latitude, a.longitude);
        return d <= dist;
      });
    }

    // Filter by category
    const cat = this.selectedCategorie();
    if (cat) {
      list = list.filter(a => a.categorie === cat);
    }

    // Filter by duration
    const dur = this.maxDuree();
    if (dur) {
      list = list.filter(a => a.duree === undefined || a.duree <= dur);
    }
    
    return list;
  });

  ngOnInit(): void {
    // Request user coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation.set({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          this.userLocation.set({
            latitude: 36.8065,
            longitude: 10.1815
          });
        }
      );
    } else {
      this.userLocation.set({
        latitude: 36.8065,
        longitude: 10.1815
      });
    }

    this.route.queryParamMap.subscribe((params) => {
      const criteria = this.searchService.fromQueryParams(params);
      this.localisation = criteria.localisation;
      this.checkIn = criteria.checkIn;
      this.checkOut = criteria.checkOut;
      this.guests = criteria.guests;
      this.searchService.criteria.set(criteria);

      this.aiQuery = params.get('aiQuery') || '';

      const passedCat = params.get('categorie') || '';
      if (passedCat) {
        this.selectedCategorie.set(passedCat);
      }

      this.fetchResults();
    });

    if (this.isAuthenticated()) {
      this.favoriService.loadMyFavoris().subscribe();
    }
  }

  toggleFavori(annonceId: number, event: Event) {
    event.stopPropagation();
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

  createAlertFromSearch(): void {
    if (!this.canCreateAlert() || this.creatingAlert()) return;

    this.creatingAlert.set(true);
    this.alertError.set('');

    this.alerteService.createAlert({
      localisation: this.localisation?.trim() || '',
      prixMax: this.maxPrice()
    }).subscribe({
      next: () => {
        this.creatingAlert.set(false);
        this.router.navigate(['/alertes']);
      },
      error: () => {
        this.creatingAlert.set(false);
        this.alertError.set('Impossible de créer l\'alerte. Réessayez.');
      }
    });
  }

  canCreateAlert(): boolean {
    if (!this.isLocataire()) return false;
    return !!(this.localisation?.trim() || this.maxPrice() < 5000);
  }

  fetchResults(): void {
    this.loading.set(true);
    this.error.set('');

    const user = this.user();
    if (user?.role === 'BAILLEUR' && user.id) {
      this.annonceService.getAnnoncesByUser(user.id).subscribe({
        next: (data) => {
          const filtered = this.applyFilters(data);
          this.annonces.set(filtered);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load search results.');
          this.loading.set(false);
        }
      });
      return;
    }

    if (this.aiQuery?.trim()) {
      this.annonceService.aiRechercher(this.aiQuery.trim()).subscribe({
        next: (res) => {
          this.aiFeedback.set({
            localisation: res.parsedLocalisation || undefined,
            prixMax: res.parsedPrixMax || undefined,
            categorie: res.parsedCategorie || undefined,
            duree: res.parsedDuree || undefined
          });

          // Sync local state filters with what the AI parsed
          if (res.parsedLocalisation) this.localisation = res.parsedLocalisation;
          if (res.parsedPrixMax) this.maxPrice.set(res.parsedPrixMax);
          if (res.parsedCategorie) this.selectedCategorie.set(res.parsedCategorie);
          if (res.parsedDuree) this.maxDuree.set(res.parsedDuree);

          const filtered = this.applyFilters(res.results);
          this.annonces.set(filtered);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load AI search results.');
          this.loading.set(false);
        }
      });
    } else {
      this.annonceService.rechercher(
        this.localisation || undefined,
        this.maxPrice() || undefined,
        this.selectedCategorie() || undefined,
        this.maxDuree() || undefined
      ).subscribe({
        next: (data) => {
          const filtered = this.applyFilters(data);
          this.annonces.set(filtered);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load search results.');
          this.loading.set(false);
        }
      });
    }
  }

  private applyFilters(data: AnnonceDTO[]): AnnonceDTO[] {
    let result = data;
    if (this.localisation?.trim()) {
      const term = this.localisation.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.localisation?.toLowerCase().includes(term) ||
          a.titre?.toLowerCase().includes(term)
      );
    }
    return this.searchService.filterByDates(result, this.checkIn, this.checkOut);
  }

  onSearch(): void {
    this.searchService.navigateToResults(this.router, {
      localisation: this.localisation,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      guests: this.guests
    });
  }

  viewDetails(id: number): void {
    this.router.navigate(['/annonce', id]);
  }

  hasActiveFilters(): boolean {
    return !!(this.localisation || this.checkIn || this.checkOut || this.guests);
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

  // Haversine Formula for Distance calculation
  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  getDistanceDisplay(annonce: AnnonceDTO): string {
    const loc = this.userLocation();
    if (loc && annonce.latitude !== undefined && annonce.longitude !== undefined) {
      const d = this.getDistance(loc.latitude, loc.longitude, annonce.latitude, annonce.longitude);
      return `${d.toFixed(1)} km`;
    }
    return '';
  }

  resetInteractiveFilters(): void {
    this.maxPrice.set(5000);
    this.maxDistance.set(100);
    this.maxDuree.set(12);
    this.selectedCategorie.set('');
    this.aiFeedback.set(null);
    this.aiQuery = '';
    this.fetchResults();
  }
}
