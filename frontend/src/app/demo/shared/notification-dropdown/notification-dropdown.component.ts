import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from 'src/app/core/pipes/translate.pipe';
import { AuthService } from 'src/app/core/auth/auth.service';
import { NotificationService, NotificationDTO } from 'src/app/admin-features/notification.service';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbDropdownModule, TranslatePipe],
  templateUrl: './notification-dropdown.component.html',
  styles: [`
    .hide-caret::after {
      display: none !important;
    }
  `]
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  notifications = signal<NotificationDTO[]>([]);
  unreadCount = signal<number>(0);
  private pollingSub?: Subscription;

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.loadNotifications();
      this.pollingSub = interval(4000).subscribe(() => {
        this.loadNotifications();
      });
    }
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
        this.notifications.set(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
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
    
    const role = this.auth.user()?.role;
    const isAdmin = role === 'ADMIN';

    // Navigate based on notification type
    if (n.type === 'ANNONCE' && n.relatedEntityId) {
      this.router.navigate(['/annonce', n.relatedEntityId]);
    } else if (n.type === 'MESSAGE') {
      this.router.navigate([isAdmin ? '/admin-messages' : '/messages']);
    } else if (n.type === 'RESERVATION') {
      this.router.navigate([isAdmin ? '/admin-reservations' : '/reservations']);
    } else {
      this.router.navigate([isAdmin ? '/dashboard' : '/browse']);
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
