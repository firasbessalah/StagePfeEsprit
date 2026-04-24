import { Injectable } from '@angular/core';

import { RegisterRequest } from './auth.models';

/**
 * Holds registration payload between instant navigation to verify-email
 * and the register API call run on that page (so SMTP delay shows a spinner, not a frozen signup form).
 */
@Injectable({ providedIn: 'root' })
export class PendingSignupService {
  private pending: RegisterRequest | null = null;

  stashForVerify(payload: RegisterRequest): void {
    this.pending = payload;
  }

  /** Returns payload once, then clears it. */
  consume(): RegisterRequest | null {
    const p = this.pending;
    this.pending = null;
    return p;
  }
}
