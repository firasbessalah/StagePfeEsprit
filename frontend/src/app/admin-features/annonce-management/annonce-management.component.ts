import { Component, OnInit, TemplateRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AnnonceAdminService, AnnonceDTO, SignalementDTO } from '../annonce-admin.service';
import { UserAdminService } from '../user-admin.service';
import { UserDTO } from 'src/app/core/auth/auth.models';
import { AuthService } from 'src/app/core/auth/auth.service';
import { TranslationService, Language } from 'src/app/core/services/translation.service';
import { TranslatePipe } from 'src/app/core/pipes/translate.pipe';
import { PublicFooterComponent } from 'src/app/demo/shared/public-footer/public-footer.component';
import * as L from 'leaflet';

const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-annonce-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, NgbDropdownModule, TranslatePipe, PublicFooterComponent],
  templateUrl: './annonce-management.component.html',
  styleUrls: ['./annonce-management.component.scss']
})
export class AnnonceManagementComponent implements OnInit {
  private annonceAdmin = inject(AnnonceAdminService);
  private userAdmin = inject(UserAdminService);
  private modal = inject(NgbModal);
  private auth = inject(AuthService);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private http = inject(HttpClient);

  usersList = signal<UserDTO[]>([]);
  isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');
  isAuthenticated = computed(() => this.auth.isAuthenticated());
  isBailleur = computed(() => this.auth.user()?.role === 'BAILLEUR');
  currentLang = computed(() => this.translationService.currentLang());
  homeLink = computed(() => {
    const role = this.auth.user()?.role;
    if (role === 'LOCATAIRE' || role === 'BAILLEUR') return '/browse';
    return '/';
  });

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

  user = computed(() => this.auth.user());

  annonces = signal<AnnonceDTO[]>([]);
  searchTerm = signal('');
  currentTab = signal<'ALL' | 'REPORTED'>('ALL');

  filteredAnnonces = computed(() => {
    let list = this.annonces();
    if (this.isAdmin() && this.currentTab() === 'REPORTED') {
      list = list.filter(a => a.flagged);
    }

    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return list;
    return list.filter(a =>
      (a.titre?.toLowerCase().includes(term)) ||
      (a.localisation?.toLowerCase().includes(term)) ||
      (a.statut?.toLowerCase().includes(term)) ||
      (a.userNom?.toLowerCase().includes(term)) ||
      (a.userPrenom?.toLowerCase().includes(term))
    );
  });
  loading = signal(false);
  error = signal('');

  addModel: AnnonceDTO = {};
  editModel: AnnonceDTO | null = null;
  showModel: AnnonceDTO | null = null;
  selectedAnnonce: AnnonceDTO | null = null;
  selectedUserId: number | null = null;

  reportsList = signal<SignalementDTO[]>([]);
  loadingReports = signal(false);
  
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

  private showMapInstance: L.Map | undefined;

  locationSearchResults = signal<any[]>([]);
  locationSearchSubject = new Subject<string>();

  ngOnInit(): void {
    this.reload();
    if (this.isAdmin()) {
      this.loadUsers();
    }
    
    this.locationSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 3) return of([]);
        return this.http.get<any[]>(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe(results => {
      this.locationSearchResults.set(results);
    });
  }

  loadUsers(): void {
    this.userAdmin.getAllUsers().subscribe({
      next: (u) => this.usersList.set(u)
    });
  }

  reload(): void {
    this.loading.set(true);
    this.error.set('');
    
    const obs$ = this.isAdmin() 
      ? this.annonceAdmin.getAllAnnoncesAdmin()
      : this.annonceAdmin.getAnnoncesByUser(this.auth.user()?.id as number);

    obs$.subscribe({
      next: (list) => {
        this.annonces.set(list ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.errMsg(err));
        this.loading.set(false);
      }
    });
  }

  openAdd(content: TemplateRef<unknown>): void {
    this.addModel = {
      titre: '',
      description: '',
      prix: 0,
      localisation: 'Tunis',
      latitude: 36.8065,
      longitude: 10.1815
    };
    this.selectedUserId = this.isAdmin() && this.usersList().length > 0 ? this.usersList()[0].id : this.auth.user()?.id || null;
    
    this.modal.open(content, { size: 'lg', backdrop: 'static' }).shown.subscribe(() => {
      this.initMap();
    });
  }

  initMap(): void {
    if (this.map) {
      this.map.remove();
    }
    const lat = this.addModel.latitude || 36.8065;
    const lng = this.addModel.longitude || 10.1815;

    this.map = L.map('map', {
      center: [lat, lng],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.marker) {
        this.marker.setLatLng(e.latlng);
        this.addModel.latitude = e.latlng.lat;
        this.addModel.longitude = e.latlng.lng;
      }
    });

    this.marker.on('dragend', () => {
      if (this.marker) {
        const pos = this.marker.getLatLng();
        this.addModel.latitude = pos.lat;
        this.addModel.longitude = pos.lng;
      }
    });

    // force leaflet to recalculate size inside modal
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  onLocationInput(event: any): void {
    const val = event?.target?.value || event;
    this.locationSearchSubject.next(val);
  }

  selectLocation(loc: any, model: AnnonceDTO): void {
    model.localisation = loc.display_name;
    model.latitude = parseFloat(loc.lat);
    model.longitude = parseFloat(loc.lon);
    this.locationSearchResults.set([]);
    
    // update marker if map exists
    if (this.marker && this.map && model === this.addModel) {
      const latlng = new L.LatLng(model.latitude, model.longitude);
      this.marker.setLatLng(latlng);
      this.map.setView(latlng, 13);
    }
  }

  useCurrentLocation(model: AnnonceDTO): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        model.latitude = position.coords.latitude;
        model.longitude = position.coords.longitude;
        
        // update map if applicable
        if (this.marker && this.map && model === this.addModel) {
          const latlng = new L.LatLng(model.latitude, model.longitude);
          this.marker.setLatLng(latlng);
          this.map.setView(latlng, 13);
        }

        // Reverse geocoding to get location text
        this.http.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${model.latitude}&lon=${model.longitude}`)
          .subscribe({
            next: (res: any) => {
              if (res && res.display_name) {
                model.localisation = res.display_name;
              }
            },
            error: (err) => console.warn('Reverse geocoding failed', err)
          });
      }, (error) => {
        console.warn('Geolocation error:', error);
      });
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  }

  submitAdd(): void {
    if (!this.selectedUserId) {
      this.error.set('Veuillez sélectionner un utilisateur.');
      return;
    }
    this.error.set('');
    this.annonceAdmin.createAnnonce(this.addModel, this.selectedUserId).subscribe({
      next: () => {
        this.modal.dismissAll();
        this.reload();
      },
      error: (err) => this.error.set(this.errMsg(err))
    });
  }

  openEdit(annonce: AnnonceDTO, content: TemplateRef<unknown>): void {
    this.editModel = { ...annonce };
    this.modal.open(content, { size: 'lg', backdrop: 'static' });
  }

  openSignalsModal(annonce: AnnonceDTO, content: TemplateRef<unknown>): void {
    this.selectedAnnonce = annonce;
    this.modal.open(content, { size: 'md', centered: true });
  }

  openReportsModal(annonce: AnnonceDTO, content: TemplateRef<unknown>): void {
    if (!annonce.id) return;
    this.selectedAnnonce = annonce;
    this.reportsList.set([]);
    this.loadingReports.set(true);
    
    this.modal.open(content, { size: 'lg', centered: true });
    
    this.annonceAdmin.getSignalements(annonce.id).subscribe({
      next: (data) => {
        this.reportsList.set(data);
        this.loadingReports.set(false);
      },
      error: () => {
        this.loadingReports.set(false);
      }
    });
  }

  submitEdit(): void {
    const m = this.editModel;
    if (!m?.id) return;
    this.error.set('');
    this.annonceAdmin.updateAnnonce(m.id, m).subscribe({
      next: () => {
        this.modal.dismissAll();
        this.reload();
      },
      error: (err) => this.error.set(this.errMsg(err))
    });
  }

  openShow(annonce: AnnonceDTO, content: TemplateRef<unknown>): void {
    this.showModel = annonce;
    this.modal.open(content, { size: 'lg', backdrop: 'static' }).shown.subscribe(() => {
      this.initShowMap();
    });
  }

  initShowMap(): void {
    if (this.showMapInstance) {
      this.showMapInstance.remove();
    }
    const lat = this.showModel?.latitude || 36.8065;
    const lng = this.showModel?.longitude || 10.1815;

    this.showMapInstance = L.map('showMap', {
      center: [lat, lng],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.showMapInstance);

    L.marker([lat, lng]).addTo(this.showMapInstance);

    // force leaflet to recalculate size inside modal
    setTimeout(() => {
      this.showMapInstance?.invalidateSize();
    }, 100);
  }

  onImagePicked(event: any, model: AnnonceDTO): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      let currentImages = model.images ? [...model.images] : [];
      let loadedCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          currentImages.push(e.target.result);
          loadedCount++;
          if (loadedCount === files.length) {
            model.images = [...currentImages];
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(model: AnnonceDTO, index: number): void {
    if (model.images) {
      model.images.splice(index, 1);
    }
  }

  deleteAnnonce(a: AnnonceDTO): void {
    if (!a.id) return;
    if (!confirm(`Delete annonce ${a.titre}?`)) return;
    this.annonceAdmin.deleteAnnonce(a.id).subscribe({
      next: () => this.reload(),
      error: (err) => this.error.set(this.errMsg(err))
    });
  }

  approveReport(a: AnnonceDTO): void {
    if (!a.id) return;
    if (!confirm(`Dismiss report for ${a.titre}?`)) return;
    this.annonceAdmin.dismissReport(a.id).subscribe({
      next: () => this.reload(),
      error: (err) => this.error.set(this.errMsg(err))
    });
  }

  validerAnnonce(a: AnnonceDTO): void {
    if (!a.id) return;
    this.annonceAdmin.validerAnnonce(a.id).subscribe({
      next: () => this.reload(),
      error: (err) => this.error.set(this.errMsg(err))
    });
  }

  rejeterAnnonce(a: AnnonceDTO): void {
    if (!a.id) return;
    this.annonceAdmin.rejeterAnnonce(a.id).subscribe({
      next: () => this.reload(),
      error: (err) => this.error.set(this.errMsg(err))
    });
  }

  archiverAnnonce(a: AnnonceDTO): void {
    if (!a.id) return;
    this.annonceAdmin.archiverAnnonce(a.id).subscribe({
      next: () => this.reload(),
      error: (err) => this.error.set(this.errMsg(err))
    });
  }

  getStatusBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'VALIDEE': return 'badge bg-success';
      case 'REJETEE': return 'badge bg-danger';
      case 'ARCHIVEE': return 'badge bg-secondary';
      case 'SUSPENDUE': return 'badge bg-warning text-dark';
      default: return 'badge bg-info';
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

  parseSignals(json: string | undefined): any[] {
    if (!json) return [];
    try {
      return JSON.parse(json) as any[];
    } catch {
      return [];
    }
  }
}
