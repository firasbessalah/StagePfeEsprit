// angular import
import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { email, Field, form, minLength, required } from '@angular/forms/signals';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-auth-signup',
  imports: [CommonModule, RouterModule, SharedModule, Field],
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.scss']
})
export class AuthSignupComponent {
  private cd = inject(ChangeDetectorRef);
  private auth = inject(AuthService);
  private router = inject(Router);

  submitted = signal(false);
  error = signal('');
  showPassword = signal(false);

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
    this.auth
      .register({
        nom: model.nom,
        prenom: model.prenom,
        email: model.email,
        password: model.password
      })
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/login');
        },
        error: (err) => {
          const message =
            (typeof err?.error === 'string' && err.error) ||
            err?.error?.message ||
            err?.message ||
            'Register failed';
          this.error.set(String(message));
          this.cd.detectChanges();
        }
      });
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
