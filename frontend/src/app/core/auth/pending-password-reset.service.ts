import { Injectable } from '@angular/core';

/**
 * Carries the one-time reset session token from the code step to the new-password page.
 */
@Injectable({ providedIn: 'root' })
export class PendingPasswordResetService {
  private resetToken: string | null = null;

  stashResetToken(token: string): void {
    this.resetToken = token;
  }

  consumeResetToken(): string | null {
    const t = this.resetToken;
    this.resetToken = null;
    return t;
  }
}
