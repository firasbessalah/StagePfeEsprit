import { Component, inject, computed, signal, AfterViewInit, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService, Language } from 'src/app/core/services/translation.service';
import { TranslatePipe } from 'src/app/core/pipes/translate.pipe';
import { AnnonceSearchService } from 'src/app/core/services/annonce-search.service';
import { PublicFooterComponent } from '../shared/public-footer/public-footer.component';
import { NotificationDropdownComponent } from '../shared/notification-dropdown/notification-dropdown.component';

@Component({
  selector: 'app-user-browse',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SharedModule, NgbDropdownModule, TranslatePipe, PublicFooterComponent, NotificationDropdownComponent],
  templateUrl: './user-browse.component.html',
  styleUrls: ['./user-browse.component.scss']
})
export class UserBrowseComponent implements OnInit, AfterViewInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private searchService = inject(AnnonceSearchService);

  @ViewChild('heroSearchAnchor') heroSearchAnchor?: ElementRef<HTMLElement>;
  private searchObserver?: IntersectionObserver;

  user = computed(() => this.auth.user());
  isBailleur = computed(() => this.user()?.role === 'BAILLEUR');
  currentLang = computed(() => this.translationService.currentLang());
  searchCompact = signal(false);
  searchMode = signal<'classic' | 'ai'>('classic');

  localisation = '';
  checkIn = '';
  checkOut = '';
  guests = '';
  aiQuery = '';

  ngOnInit(): void {
    const c = this.searchService.criteria();
    this.localisation = c.localisation;
    this.checkIn = c.checkIn;
    this.checkOut = c.checkOut;
    this.guests = c.guests;
  }

  ngAfterViewInit(): void {
    const el = this.heroSearchAnchor?.nativeElement;
    if (!el) return;

    this.searchObserver = new IntersectionObserver(
      ([entry]) => this.searchCompact.set(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-70px 0px 0px 0px' }
    );
    this.searchObserver.observe(el);
  }

  ngOnDestroy(): void {
    this.searchObserver?.disconnect();
  }

  setLang(lang: Language): void {
    this.translationService.setLanguage(lang);
  }

  onSearch(): void {
    if (this.searchMode() === 'ai' && this.aiQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { aiQuery: this.aiQuery.trim() } });
    } else {
      this.searchService.navigateToResults(this.router, {
        localisation: this.localisation,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        guests: this.guests
      });
    }
  }

  searchByCategory(category: string): void {
    this.router.navigate(['/search'], { queryParams: { categorie: category } });
  }

  scrollToHeroSearch(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onAddAnnonce(): void {
    this.router.navigate(['/annonces']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
