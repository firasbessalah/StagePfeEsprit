import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription, interval, startWith, switchMap } from 'rxjs';

import { AuthService } from 'src/app/core/auth/auth.service';
import { MessageService, MessageDTO } from './message.service';
import { UserAdminService } from 'src/app/admin-features/user-admin.service';
import { UserDTO } from 'src/app/core/auth/auth.models';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private messageService = inject(MessageService);
  private userService = inject(UserAdminService);

  currentUser = computed(() => this.auth.user());
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  // Contacts list
  contacts = signal<UserDTO[]>([]);
  activeContact = signal<UserDTO | null>(null);

  // Messages list
  messages = signal<MessageDTO[]>([]);
  newMessageContenu = signal('');

  // UI state
  loadingContacts = signal(true);
  loadingMessages = signal(false);
  error = signal('');

  // Polling Subscription
  private pollingSub?: Subscription;

  ngOnInit(): void {
    this.loadContacts();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadContacts(): void {
    this.loadingContacts.set(true);
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        const current = this.currentUser();
        if (!current) return;

        if (this.isAdmin()) {
          // Admin can talk to BAILLEUR and LOCATAIRE
          const clients = users.filter(u => u.id !== current.id && u.role !== 'ADMIN');
          this.contacts.set(clients);
        } else {
          // BAILLEUR and LOCATAIRE only see Admins
          const admins = users.filter(u => u.role === 'ADMIN');
          this.contacts.set(admins);
        }

        // Auto select first contact if available
        if (this.contacts().length > 0) {
          this.selectContact(this.contacts()[0]);
        } else {
          this.loadingContacts.set(false);
        }
      },
      error: (err) => {
        this.error.set('Failed to load contacts.');
        this.loadingContacts.set(false);
      }
    });
  }

  selectContact(contact: UserDTO): void {
    this.activeContact.set(contact);
    this.loadingMessages.set(true);
    this.loadConversation(true);
    this.startPolling();
  }

  loadConversation(scrollToBottom = false): void {
    const current = this.currentUser();
    const active = this.activeContact();
    if (!current?.id || !active?.id) return;

    this.messageService.getConversation(current.id, active.id).subscribe({
      next: (conv) => {
        this.messages.set(conv);
        this.loadingMessages.set(false);
        this.loadingContacts.set(false);

        // Mark unread messages as read
        conv.forEach(m => {
          if (m.id && !m.lu && m.destinataireId === current.id) {
            this.messageService.marquerLu(m.id).subscribe();
          }
        });

        if (scrollToBottom) {
          setTimeout(() => this.scrollToBottom(), 100);
        }
      },
      error: () => {
        this.loadingMessages.set(false);
      }
    });
  }

  sendMessage(): void {
    const text = this.newMessageContenu().trim();
    const current = this.currentUser();
    const active = this.activeContact();

    if (!text || !current?.id || !active?.id) return;

    this.messageService.envoyerMessage(text, current.id, active.id).subscribe({
      next: (msg) => {
        this.messages.update(prev => [...prev, msg]);
        this.newMessageContenu.set('');
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: (err) => {
        this.error.set('Could not send message.');
      }
    });
  }

  startPolling(): void {
    this.stopPolling();
    this.pollingSub = interval(3000)
      .subscribe(() => {
        this.loadConversation(false);
      });
  }

  stopPolling(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = undefined;
    }
  }

  scrollToBottom(): void {
    const container = document.getElementById('chat-messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  getInitials(name?: string, prenom?: string): string {
    const n = name?.substring(0, 1) || '';
    const p = prenom?.substring(0, 1) || '';
    return (p + n).toUpperCase() || '?';
  }
}
