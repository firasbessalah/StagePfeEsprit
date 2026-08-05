// angular import
import { ChangeDetectorRef, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { email, Field, form, minLength, required } from '@angular/forms/signals';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PendingSignupService } from 'src/app/core/auth/pending-signup.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { TranslationService, Language } from 'src/app/core/services/translation.service';
import { TranslatePipe } from 'src/app/core/pipes/translate.pipe';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-auth-signup',
  imports: [CommonModule, RouterModule, SharedModule, Field, TranslatePipe, NgbDropdownModule],
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.scss']
})
export class AuthSignupComponent {
  private cd = inject(ChangeDetectorRef);
  private router = inject(Router);
  private pendingSignup = inject(PendingSignupService);
  private auth = inject(AuthService);
  private translationService = inject(TranslationService);

  currentLang = computed(() => this.translationService.currentLang());

  setLang(lang: Language): void {
    this.translationService.setLanguage(lang);
  }

  submitted = signal(false);
  error = signal('');
  loading = signal(false);
  showPassword = signal(false);
  selectedRole = signal<'LOCATAIRE' | 'BAILLEUR'>('LOCATAIRE');

  registerModel = signal<{ email: string; password: string; nom: string; prenom: string; telephone: string }>({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: ''
  });

  registerForm = form(this.registerModel, (schemaPath) => {
    required(schemaPath.nom, { message: 'Nom is required' });
    required(schemaPath.prenom, { message: 'Prenom is required' });
    required(schemaPath.telephone, { message: 'Phone number is required' });
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    required(schemaPath.password, { message: 'Password is required' });
    minLength(schemaPath.password, 8, { message: 'Password must be at least 8 characters' });
  });

  onSubmit(event: Event) {
    this.submitted.set(true);
    this.error.set('');
    event.preventDefault();

    const nomInvalid = this.registerForm.nom().errors().length > 0;
    const prenomInvalid = this.registerForm.prenom().errors().length > 0;
    const telephoneInvalid = this.registerForm.telephone().errors().length > 0;
    const emailInvalid = this.registerForm.email().invalid();
    const passwordInvalid = this.registerForm.password().errors().length > 0;
    if (nomInvalid || prenomInvalid || telephoneInvalid || emailInvalid || passwordInvalid) {
      this.cd.detectChanges();
      return;
    }

    const model = this.registerModel();
    const payload = {
      nom: model.nom,
      prenom: model.prenom,
      email: model.email,
      telephone: model.telephone,
      password: model.password,
      role: this.selectedRole()
    };
    this.pendingSignup.stashForVerify(payload);
    this.router.navigate(['/verify-email'], { queryParams: { email: model.email } });
  }

  selectRole(role: 'LOCATAIRE' | 'BAILLEUR') {
    this.selectedRole.set(role);
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
