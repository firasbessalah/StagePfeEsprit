import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UserAdminService } from 'src/app/admin-features/user-admin.service';
import { UserDTO } from 'src/app/core/auth/auth.models';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, SharedModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private usersApi = inject(UserAdminService);
  private fb = inject(FormBuilder);

  profileMessage = signal('');
  successMessage = signal('');
  passwordMessage = signal('');
  passwordSuccessMessage = signal('');
  user = computed(() => this.auth.user());
  
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
        this.successMessage.set('Profile information updated successfully!');
        this.profileMessage.set('');
      },
      error: (err) => {
        this.profileMessage.set(this.errMsg(err));
        this.successMessage.set('');
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
        this.passwordSuccessMessage.set('Password changed successfully!');
        this.passwordMessage.set('');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.passwordMessage.set(this.errMsg(err));
        this.passwordSuccessMessage.set('');
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
      this.profileMessage.set('Please choose an image file.');
      return;
    }
    if (file.size > 800_000) {
      this.profileMessage.set('Image too large (max ~800KB).');
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
          this.successMessage.set('Profile photo saved successfully.');
          this.profileMessage.set('');
          input.value = '';
        },
        error: (err) => {
          this.profileMessage.set(this.errMsg(err));
          this.successMessage.set('');
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
    return e?.message || 'Request failed';
  }
}

