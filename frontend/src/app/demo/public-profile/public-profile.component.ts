import { Component, OnInit, computed, inject, signal } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService, Language } from 'src/app/core/services/translation.service';
import { TranslatePipe } from 'src/app/core/pipes/translate.pipe';

import { AuthService } from 'src/app/core/auth/auth.service';
import { UserAdminService } from 'src/app/admin-features/user-admin.service';
import { UserDTO } from 'src/app/core/auth/auth.models';
import { PublicFooterComponent } from '../shared/public-footer/public-footer.component';
import { NotificationDropdownComponent } from '../shared/notification-dropdown/notification-dropdown.component';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, SharedModule, NgbDropdownModule, TranslatePipe, PublicFooterComponent, NotificationDropdownComponent],
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.scss']
})
export class PublicProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private usersApi = inject(UserAdminService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  user = computed(() => this.auth.user());
  isAuthenticated = computed(() => this.auth.isAuthenticated());

  currentLang = computed(() => this.translationService.currentLang());

  setLang(lang: Language): void {
    this.translationService.setLanguage(lang);
  }

  profileMessageKey = signal('');
  successMessageKey = signal('');
  passwordMessageKey = signal('');
  passwordSuccessMessageKey = signal('');
  
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  ngOnInit(): void {
    const u = this.auth.user();
    this.profileForm = this.fb.group({
      nom: [u?.nom || '', Validators.required],
      prenom: [u?.prenom || '', Validators.required],
      email: [{value: u?.email || '', disabled: true}, [Validators.required, Validators.email]],
      telephone: [u?.telephone || '']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  getRoleLabel(role: string | undefined): string {
    if (!role) return '';
    return this.translationService.translate(role);
  }

  hasPhoto(photo?: string | null): boolean {
    return !!photo;
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) return;
    
    const u = this.auth.user();
    if (!u?.id) return;
    
    const formVals = this.profileForm.getRawValue();
    const dto: UserDTO = {
      id: u.id,
      nom: formVals.nom,
      prenom: formVals.prenom,
      email: u.email,
      telephone: formVals.telephone,
      photoProfil: u.photoProfil,
      role: u.role
    };
    
    this.usersApi.updateUser(u.id, dto).subscribe({
      next: (updated) => {
        this.auth.updateSessionUser(updated);
        this.successMessageKey.set('PROFILE_UPDATED_SUCCESS');
        this.profileMessageKey.set('');
      },
      error: (err) => {
        this.profileMessageKey.set(this.errMsg(err));
        this.successMessageKey.set('');
      }
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) return;
    
    const u = this.auth.user();
    if (!u?.id) return;
    
    const formVals = this.passwordForm.getRawValue();
    const req = {
      currentPassword: formVals.currentPassword,
      newPassword: formVals.newPassword
    };
    
    this.usersApi.changePassword(u.id, req).subscribe({
      next: () => {
        this.passwordSuccessMessageKey.set('PASSWORD_CHANGED_SUCCESS');
        this.passwordMessageKey.set('');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.passwordMessageKey.set(this.errMsg(err));
        this.passwordSuccessMessageKey.set('');
      }
    });
  }

  onProfilePhotoSelected(event: Event): void {
    const u = this.auth.user();
    if (!u?.id) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.profileMessageKey.set('CHOOSE_IMAGE_FILE');
      return;
    }
    if (file.size > 800_000) {
      this.profileMessageKey.set('IMAGE_TOO_LARGE');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '');
      const dto: UserDTO = {
        id: u.id,
        nom: u.nom,
        prenom: u.prenom,
        email: u.email,
        telephone: u.telephone ?? undefined,
        photoProfil: dataUrl,
        role: u.role
      };
      this.usersApi.updateUser(u.id, dto).subscribe({
        next: (updated) => {
          this.auth.updateSessionUser(updated);
          this.successMessageKey.set('PROFILE_PHOTO_SAVED');
          this.profileMessageKey.set('');
          input.value = '';
        },
        error: (err) => {
          this.profileMessageKey.set(this.errMsg(err));
          this.successMessageKey.set('');
        }
      });
    };
    reader.readAsDataURL(file);
  }

  private errMsg(err: unknown): string {
    const e = err as { error?: unknown; message?: string };
    if (typeof e?.error === 'string') return e.error;
    if (e?.error && typeof (e.error as { message?: string }).message === 'string') {
      return (e.error as { message: string }).message;
    }
    return e?.message || 'REQUEST_FAILED';
  }

  onAddAnnonce() {
    if (this.isAuthenticated()) {
      this.router.navigate(['/annonces']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
