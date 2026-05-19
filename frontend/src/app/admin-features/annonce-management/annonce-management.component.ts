import { Component, OnInit, TemplateRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AnnonceAdminService, AnnonceDTO } from '../annonce-admin.service';
import { UserAdminService } from '../user-admin.service';
import { UserDTO } from 'src/app/core/auth/auth.models';
import { AuthService } from 'src/app/core/auth/auth.service';
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
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './annonce-management.component.html'
})
export class AnnonceManagementComponent implements OnInit {
  private annonceAdmin = inject(AnnonceAdminService);
  private userAdmin = inject(UserAdminService);
  private modal = inject(NgbModal);
  private auth = inject(AuthService);

  usersList = signal<UserDTO[]>([]);
  isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');

  annonces = signal<AnnonceDTO[]>([]);
  searchTerm = signal('');
  filteredAnnonces = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.annonces();
    return this.annonces().filter(a =>
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
  selectedUserId: number | null = null;
  
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

  private showMapInstance: L.Map | undefined;

  ngOnInit(): void {
    this.reload();
    if (this.isAdmin()) {
      this.loadUsers();
    }
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

  deleteAnnonce(a: AnnonceDTO): void {
    if (!a.id) return;
    if (!confirm(`Delete annonce ${a.titre}?`)) return;
    this.annonceAdmin.deleteAnnonce(a.id).subscribe({
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
}
