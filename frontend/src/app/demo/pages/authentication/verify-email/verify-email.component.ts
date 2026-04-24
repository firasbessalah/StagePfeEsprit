import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { AuthService } from 'src/app/core/auth/auth.service';
import { PendingSignupService } from 'src/app/core/auth/pending-signup.service';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private pendingSignup = inject(PendingSignupService);

  email = '';
  code = '';

  /** Creating account + sending email (after fast navigation from signup). */
  registerSetupLoading = signal(false);
  registerSetupError = signal('');

  verifyLoading = signal(false);
  success = signal(false);
  message = signal('');

  ngOnInit(): void {
    const fromQuery = this.route.snapshot.queryParamMap.get('email');
    if (fromQuery) {
      this.email = fromQuery;
    }

    const pending = this.pendingSignup.consume();
    if (pending) {
      this.email = pending.email;
      this.registerSetupLoading.set(true);
      this.registerSetupError.set('');
      this.auth.register(pending).subscribe({
        next: () => {
          this.registerSetupLoading.set(false);
        },
        error: (err) => {
          this.registerSetupLoading.set(false);
          const msg =
            err?.error?.message ||
            (typeof err?.error === 'string' && err.error) ||
            err?.message ||
            'Inscription impossible.';
          this.registerSetupError.set(String(msg));
        }
      });
    }
  }

  submit(): void {
    const emailTrim = this.email.trim();
    const codeTrim = this.code.replace(/\D/g, '').slice(0, 6);

    this.message.set('');
    if (!emailTrim || codeTrim.length !== 6) {
      this.message.set('Veuillez saisir votre email et un code à 6 chiffres.');
      return;
    }

    this.verifyLoading.set(true);
    this.auth.verifyEmail({ email: emailTrim, code: codeTrim }).subscribe({
      next: (res) => {
        this.verifyLoading.set(false);
        this.success.set(true);
        this.message.set(res.message);
      },
      error: (err) => {
        this.verifyLoading.set(false);
        this.success.set(false);
        const errorMsg =
          err?.error?.message ||
          (typeof err?.error === 'string' && err.error) ||
          'Une erreur est survenue lors de la vérification.';
        this.message.set(errorMsg);
      }
    });
  }
}
