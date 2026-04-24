import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AuthService } from 'src/app/core/auth/auth.service';
import { PendingPasswordResetService } from 'src/app/core/auth/pending-password-reset.service';

@Component({
  selector: 'app-reset-password-verify',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reset-password-verify.component.html',
  styleUrls: ['./reset-password-verify.component.scss']
})
export class ResetPasswordVerifyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private pendingReset = inject(PendingPasswordResetService);

  email = '';
  code = '';

  verifyLoading = signal(false);
  message = signal('');

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap.get('email');
    if (!q?.trim()) {
      this.router.navigate(['/forgot-password']);
      return;
    }
    this.email = q.trim();
  }

  submit(): void {
    const emailTrim = this.email.trim();
    const codeTrim = this.code.replace(/\D/g, '').slice(0, 6);
    this.message.set('');

    if (!emailTrim || codeTrim.length !== 6) {
      this.message.set('Saisissez votre email et le code à 6 chiffres reçu par email.');
      return;
    }

    this.verifyLoading.set(true);
    this.auth.verifyResetCode({ email: emailTrim, code: codeTrim }).subscribe({
      next: (res) => {
        this.verifyLoading.set(false);
        this.pendingReset.stashResetToken(res.resetToken);
        this.router.navigate(['/reset-password', 'new']);
      },
      error: (err) => {
        this.verifyLoading.set(false);
        const errorMsg =
          err?.error?.message ||
          (typeof err?.error === 'string' && err.error) ||
          'Code incorrect ou expiré.';
        this.message.set(errorMsg);
      }
    });
  }
}
