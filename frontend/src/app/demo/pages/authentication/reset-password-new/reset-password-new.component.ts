import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from 'src/app/core/auth/auth.service';
import { PendingPasswordResetService } from 'src/app/core/auth/pending-password-reset.service';

@Component({
  selector: 'app-reset-password-new',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reset-password-new.component.html',
  styleUrls: ['./reset-password-new.component.scss']
})
export class ResetPasswordNewComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private pendingReset = inject(PendingPasswordResetService);

  newPassword = '';
  confirmPassword = '';

  showPassword = signal(false);
  submitLoading = signal(false);
  error = signal('');

  private resetToken = '';

  ngOnInit(): void {
    const token = this.pendingReset.consumeResetToken();
    if (!token) {
      this.router.navigate(['/forgot-password']);
      return;
    }
    this.resetToken = token;
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  submit(): void {
    this.error.set('');
    if (this.newPassword.length < 8) {
      this.error.set('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Les mots de passe ne correspondent pas.');
      return;
    }

    this.submitLoading.set(true);
    this.auth.confirmResetPassword({ resetToken: this.resetToken, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.submitLoading.set(false);
        this.router.navigate(['/login'], {
          queryParams: { reset: 'ok' }
        });
      },
      error: (err) => {
        this.submitLoading.set(false);
        const msg =
          err?.error?.message ||
          (typeof err?.error === 'string' && err.error) ||
          'Impossible de mettre à jour le mot de passe.';
        this.error.set(String(msg));
      }
    });
  }
}
