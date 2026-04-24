import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  loading = signal(false);
  error = signal('');

  submit(): void {
    const trimmed = this.email.trim();
    this.error.set('');
    if (!trimmed) {
      this.error.set('Veuillez saisir votre adresse email.');
      return;
    }
    const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basic.test(trimmed)) {
      this.error.set('Adresse email invalide.');
      return;
    }

    this.loading.set(true);
    this.auth.forgotPassword(trimmed).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/reset-password'], { queryParams: { email: trimmed } });
      },
      error: (err) => {
        this.loading.set(false);
        const msg =
          err?.error?.message ||
          (typeof err?.error === 'string' && err.error) ||
          'Une erreur est survenue. Réessayez plus tard.';
        this.error.set(String(msg));
      }
    });
  }
}
