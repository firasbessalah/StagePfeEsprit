// angular import
import { AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { email, Field, form, minLength, required } from '@angular/forms/signals';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/core/auth/auth.service';
import { environment } from 'src/environments/environment';

declare const grecaptcha: any;
declare const google: any;

@Component({
  selector: 'app-auth-signin',
  imports: [CommonModule, RouterModule, SharedModule, Field],
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss']
})
export class AuthSigninComponent implements OnInit, AfterViewInit, OnDestroy {
  private cd = inject(ChangeDetectorRef);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  submitted = signal(false);
  error = signal('');
  showPassword = signal(false);
  resetSuccess = signal(false);
  captchaResolved = signal(false);
  captchaInvalid = signal(false);
  submitting = signal(false);
  googleSubmitting = signal(false);
  googleEnabled = !!environment.googleClientId?.trim();
  selectedGoogleRole = signal<'LOCATAIRE' | 'BAILLEUR'>('LOCATAIRE');
  private captchaToken = '';
  private recaptchaWidgetId: number | null = null;
  private recaptchaRenderRetries = 0;

  loginModal = signal<{ email: string; password: string }>({
    email: '',
    password: ''
  });

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('reset') === 'ok') {
      this.resetSuccess.set(true);
    }
  }

  ngAfterViewInit(): void {
    this.loadRecaptcha();
    this.loadGoogleSignIn();
  }

  ngOnDestroy(): void {
    this.cleanupRecaptcha();
  }

  loginForm = form(this.loginModal, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    required(schemaPath.password, { message: 'Password is required' });
    minLength(schemaPath.password, 8, { message: 'Password must be at least 8 characters' });
  });

  onSubmit(event: Event) {
    this.submitted.set(true);
    this.error.set('');
    this.captchaInvalid.set(false);
    event.preventDefault();

    const emailInvalid = this.loginForm.email().invalid();
    const passwordInvalid = this.loginForm.password().errors().length > 0;
    if (emailInvalid || passwordInvalid || !this.captchaResolved()) {
      if (!this.captchaResolved()) {
        this.captchaInvalid.set(true);
        this.error.set('Please verify you are not a robot.');
      }
      this.cd.detectChanges();
      return;
    }

    this.submitting.set(true);
    const credentials = {
      ...this.loginModal(),
      captchaToken: this.captchaToken
    };
    this.auth.login(credentials).subscribe({
      next: () => {
        this.submitting.set(false);
        const target = this.auth.getDefaultRouteForRole();
        this.router.navigateByUrl(target);
      },
      error: (err) => {
        this.submitting.set(false);
        this.resetCaptcha();
        const message =
          (typeof err?.error === 'string' && err.error) ||
          err?.error?.message ||
          err?.message ||
          'Login failed';
        this.error.set(String(message));
        this.cd.detectChanges();
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  private loadRecaptcha(): void {
    if (typeof grecaptcha === 'undefined') {
      const existing = document.querySelector('script[src*="google.com/recaptcha/api.js"]') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => this.waitForRecaptchaAndRender(), { once: true });
        this.waitForRecaptchaAndRender();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => this.waitForRecaptchaAndRender();
      document.body.appendChild(script);
      return;
    }
    this.waitForRecaptchaAndRender();
  }

  private waitForRecaptchaAndRender(): void {
    const api = (window as any).grecaptcha;
    const hasRender = !!api?.render || !!api?.enterprise?.render;
    if (!api || !hasRender) {
      if (this.recaptchaRenderRetries < 20) {
        this.recaptchaRenderRetries += 1;
        window.setTimeout(() => this.waitForRecaptchaAndRender(), 150);
      }
      return;
    }

    this.recaptchaRenderRetries = 0;
    if (typeof api.ready === 'function') {
      api.ready(() => this.renderRecaptcha());
      return;
    }

    this.renderRecaptcha();
  }

  private renderRecaptcha(): void {
    const api = (window as any).grecaptcha;
    const container = document.getElementById('recaptcha-container');
    if (!container || !api) return;
    if (container.firstChild) {
      container.replaceChildren();
    }
    if (typeof api.render === 'function') {
      this.recaptchaWidgetId = api.render(container, {
        sitekey: environment.recaptchaSiteKey,
        callback: (token: string) => this.handleCaptchaResolve(token),
        'expired-callback': () => this.handleCaptchaExpired(),
        'error-callback': () => this.handleCaptchaError(),
        size: 'normal',
        theme: 'light'
      });
      return;
    }

    if (api.enterprise && typeof api.enterprise.render === 'function') {
      this.recaptchaWidgetId = api.enterprise.render(container, {
        sitekey: environment.recaptchaSiteKey,
        callback: (token: string) => this.handleCaptchaResolve(token),
        'expired-callback': () => this.handleCaptchaExpired(),
        'error-callback': () => this.handleCaptchaError(),
        size: 'normal',
        theme: 'light'
      });
      return;
    }

    this.error.set('Unable to load reCAPTCHA. Please refresh and try again.');
    this.cd.detectChanges();
  }

  private cleanupRecaptcha(): void {
    const api = (window as any).grecaptcha;
    if (api && this.recaptchaWidgetId !== null) {
      if (typeof api.reset === 'function') {
        api.reset(this.recaptchaWidgetId);
      } else if (api.enterprise && typeof api.enterprise.reset === 'function') {
        api.enterprise.reset(this.recaptchaWidgetId);
      }
    }
  }

  private handleCaptchaResolve(token: string): void {
    this.captchaToken = token;
    this.captchaResolved.set(true);
    this.captchaInvalid.set(false);
    this.error.set('');
    this.cd.detectChanges();
  }

  private handleCaptchaExpired(): void {
    this.captchaToken = '';
    this.captchaResolved.set(false);
    this.captchaInvalid.set(true);
    this.cd.detectChanges();
  }

  private handleCaptchaError(): void {
    this.captchaToken = '';
    this.captchaResolved.set(false);
    this.captchaInvalid.set(true);
    this.cd.detectChanges();
  }

  private resetCaptcha(): void {
    const api = (window as any).grecaptcha;
    this.captchaToken = '';
    this.captchaResolved.set(false);
    this.captchaInvalid.set(true);
    if (api && this.recaptchaWidgetId !== null) {
      if (typeof api.reset === 'function') {
        api.reset(this.recaptchaWidgetId);
      } else if (api.enterprise && typeof api.enterprise.reset === 'function') {
        api.enterprise.reset(this.recaptchaWidgetId);
      }
    }
    this.cd.detectChanges();
  }

  private loadGoogleSignIn(): void {
    if (!environment.googleClientId?.trim()) {
      return;
    }

    const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]') as HTMLScriptElement | null;
    if (existing) {
      this.initGoogleButtonWhenReady();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.initGoogleButtonWhenReady();
    document.body.appendChild(script);
  }

  private initGoogleButtonWhenReady(retries = 0): void {
    const googleObj = (window as any).google;
    const hasAccounts = !!googleObj?.accounts?.id;
    const container = document.getElementById('google-signin-container');
    if (!hasAccounts || !container) {
      if (retries < 20) {
        window.setTimeout(() => this.initGoogleButtonWhenReady(retries + 1), 150);
      }
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential?: string }) => this.handleGoogleCredential(response),
      auto_select: false
    });

    container.replaceChildren();
    google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      width: 280,
      text: 'continue_with'
    });
  }

  private handleGoogleCredential(response: { credential?: string }): void {
    const credential = response?.credential;
    if (!credential) {
      this.error.set('Google login failed. Please try again.');
      this.cd.detectChanges();
      return;
    }

    this.googleSubmitting.set(true);
    this.error.set('');
    this.auth.loginWithGoogle(credential, this.selectedGoogleRole()).subscribe({
      next: () => {
        this.googleSubmitting.set(false);
        const target = this.auth.getDefaultRouteForRole();
        this.router.navigateByUrl(target);
      },
      error: (err) => {
        this.googleSubmitting.set(false);
        const message =
          (typeof err?.error === 'string' && err.error) ||
          err?.error?.message ||
          err?.message ||
          'Google login failed';
        this.error.set(String(message));
        this.cd.detectChanges();
      }
    });
  }

  selectGoogleRole(role: 'LOCATAIRE' | 'BAILLEUR'): void {
    this.selectedGoogleRole.set(role);
  }
}
