// angular import
import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { email, Field, form, minLength, required } from '@angular/forms/signals';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PendingSignupService } from 'src/app/core/auth/pending-signup.service';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-auth-signup',
  imports: [CommonModule, RouterModule, SharedModule, Field],
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.scss']
})
export class AuthSignupComponent {
  private cd = inject(ChangeDetectorRef);
  private router = inject(Router);
  private pendingSignup = inject(PendingSignupService);
  private auth = inject(AuthService);

  submitted = signal(false);
  error = signal('');
  loading = signal(false);
  showPassword = signal(false);
  selectedRole = signal<'LOCATAIRE' | 'BAILLEUR'>('LOCATAIRE');

  registerModel = signal<{ email: string; password: string; nom: string; prenom: string }>({
    email: '',
    password: '',
    nom: '',
    prenom: ''
  });

  registerForm = form(this.registerModel, (schemaPath) => {
    required(schemaPath.nom, { message: 'Nom is required' });
    required(schemaPath.prenom, { message: 'Prenom is required' });
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
    const emailInvalid = this.registerForm.email().invalid();
    const passwordInvalid = this.registerForm.password().errors().length > 0;
    if (nomInvalid || prenomInvalid || emailInvalid || passwordInvalid) {
      this.cd.detectChanges();
      return;
    }

    const model = this.registerModel();
    this.loading.set(true);
    this.auth.checkEmail(model.email).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.exists) {
          this.error.set('Cet email est déjà utilisé.');
        } else {
          const payload = {
            nom: model.nom,
            prenom: model.prenom,
            email: model.email,
            password: model.password,
            role: this.selectedRole()
          };
          this.pendingSignup.stashForVerify(payload);
          this.router.navigate(['/verify-email'], { queryParams: { email: model.email } });
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Une erreur est survenue lors de la vérification de l\'email.');
      }
    });
  }

  selectRole(role: 'LOCATAIRE' | 'BAILLEUR') {
    this.selectedRole.set(role);
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
