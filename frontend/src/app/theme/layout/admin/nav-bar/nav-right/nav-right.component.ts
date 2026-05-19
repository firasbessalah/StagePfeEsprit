import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';

// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/core/auth/auth.service';
import { NotificationService, NotificationDTO } from 'src/app/admin-features/notification.service';
import { TranslationService, Language } from 'src/app/core/services/translation.service';
import { TranslatePipe } from 'src/app/core/pipes/translate.pipe';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule, RouterModule, CommonModule, TranslatePipe],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);

  notifications = signal<NotificationDTO[]>([]);
  unreadCount = signal<number>(0);
  private pollingSub?: Subscription;

  currentLang = computed(() => this.translationService.currentLang());

  setLang(lang: Language): void {
    this.translationService.setLanguage(lang);
  }

  userName = computed(() => {
    const u = this.auth.user();
    if (!u) return '';
    return `${u.prenom} ${u.nom}`.trim();
  });

  avatarSrc = computed(() => {
    const p = this.auth.user()?.photoProfil;
    if (p && String(p).trim().length > 0) return String(p);
    return 'assets/images/user/avatar-1.jpg';
  });

  // constructor
  constructor() {
    const config = inject(NgbDropdownConfig);

    config.placement = 'bottom-right';
  }

  ngOnInit(): void {
    this.loadNotifications();
    // Poll notifications every 4 seconds
    this.pollingSub = interval(4000).subscribe(() => {
      this.loadNotifications();
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  loadNotifications(): void {
    const u = this.auth.user();
    if (!u?.id) return;

    this.notificationService.getNotifications(u.id).subscribe({
      next: (list) => {
        // Keep top 5 latest notifications
        this.notifications.set(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
        
        // Count unread notifications
        const unread = list.filter(n => !n.lu).length;
        this.unreadCount.set(unread);
      }
    });
  }

  markAsRead(n: NotificationDTO): void {
    if (n.id && !n.lu) {
      this.notificationService.marquerLue(n.id).subscribe({
        next: () => this.loadNotifications()
      });
    }
  }

  clearAll(): void {
    const u = this.auth.user();
    if (!u?.id) return;

    this.notifications().forEach(n => {
      if (n.id && !n.lu) {
        this.notificationService.marquerLue(n.id).subscribe();
      }
    });
    setTimeout(() => this.loadNotifications(), 300);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  getNotificationIcon(type: string): string {
    switch(type) {
      case 'MESSAGE': return 'feather icon-message-square text-primary';
      case 'RESERVATION': return 'feather icon-briefcase text-success';
      case 'ANNONCE': return 'feather icon-home text-warning';
      default: return 'feather icon-bell text-secondary';
    }
  }

  getTimeAgo(dateStr: string): string {
    if (!dateStr) return 'now';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours`;
    return date.toLocaleDateString();
  }
}
