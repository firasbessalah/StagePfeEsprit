import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AlerteService, AlerteLogementDTO } from '../../core/services/alerte.service';
import { SharedModule } from '../../theme/shared/shared.module';
import { AuthService } from '../../core/auth/auth.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService, Language } from '../../core/services/translation.service';
import { NotificationDropdownComponent } from '../shared/notification-dropdown/notification-dropdown.component';

@Component({
  selector: 'app-alertes',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, RouterModule, TranslatePipe, NgbDropdownModule, NotificationDropdownComponent],
  templateUrl: './alertes.html',
  styleUrl: './alertes.scss'
})
export class AlertesComponent implements OnInit {
  private alerteService = inject(AlerteService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  alertes = signal<AlerteLogementDTO[]>([]);
  loading = signal<boolean>(true);

  newLocalisation = '';
  newPrixMax: number | null = null;
  creating = false;

  user = computed(() => this.auth.user());
  isAuthenticated = computed(() => this.auth.isAuthenticated());
  currentLang = computed(() => this.translationService.currentLang());
  homeLink = computed(() => '/browse');

  ngOnInit() {
    this.loadAlertes();
  }

  loadAlertes() {
    this.loading.set(true);
    this.alerteService.getMyAlerts().subscribe({
      next: (data) => {
        this.alertes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading alertes', err);
        this.loading.set(false);
      }
    });
  }

  createAlert() {
    if (!this.newLocalisation && !this.newPrixMax) return;
    this.creating = true;

    const dto: AlerteLogementDTO = {
      localisation: this.newLocalisation,
      prixMax: this.newPrixMax || 0
    };

    this.alerteService.createAlert(dto).subscribe({
      next: (res) => {
        this.alertes.update(list => [...list, res]);
        this.newLocalisation = '';
        this.newPrixMax = null;
        this.creating = false;
      },
      error: (err) => {
        console.error('Error creating alerte', err);
        this.creating = false;
      }
    });
  }

  deleteAlert(id: number) {
    this.alerteService.deleteAlert(id).subscribe({
      next: () => {
        this.alertes.update(list => list.filter(a => a.id !== id));
      },
      error: (err) => {
        console.error('Error deleting alerte', err);
      }
    });
  }

  toggleAlert(alerte: AlerteLogementDTO) {
    this.alerteService.toggleAlert(alerte.id!).subscribe({
      next: (res) => {
        this.alertes.update(list => list.map(a => a.id === res.id ? res : a));
      },
      error: (err) => {
        console.error('Error toggling alerte', err);
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
