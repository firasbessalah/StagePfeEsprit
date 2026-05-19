import { Component, OnInit, TemplateRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { UserDTO, UserRole } from 'src/app/core/auth/auth.models';
import { RegisterUserBody, UserAdminService } from '../user-admin.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent implements OnInit {
  private userAdmin = inject(UserAdminService);
  private modal = inject(NgbModal);

  users = signal<UserDTO[]>([]);
  searchTerm = signal('');
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.users();
    return this.users().filter(u =>
      (u.nom?.toLowerCase().includes(term)) ||
      (u.prenom?.toLowerCase().includes(term)) ||
      (u.email?.toLowerCase().includes(term)) ||
      (u.role?.toLowerCase().includes(term)) ||
      (u.telephone?.toLowerCase().includes(term))
    );
  });
  loading = signal(false);
  error = signal('');

  roles: UserRole[] = ['LOCATAIRE', 'BAILLEUR', 'ADMIN'];

  addModel: RegisterUserBody = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    role: 'LOCATAIRE'
  };

  editModel: UserDTO | null = null;
  showModel: UserDTO | null = null;

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set('');
    this.userAdmin.getAllUsers().subscribe({
      next: (list) => {
        this.users.set(list ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.errMsg(err));
        this.loading.set(false);
      }
    });
  }

  openAdd(content: TemplateRef<unknown>): void {
    this.addModel = {
      nom: '',
      prenom: '',
      email: '',
      password: '',
      telephone: '',
      role: 'LOCATAIRE'
    };
    this.modal.open(content, { size: 'lg', backdrop: 'static' });
  }

  submitAdd(): void {
    this.error.set('');
    const b = this.addModel;
    if (!b.nom?.trim() || !b.prenom?.trim() || !b.email?.trim() || !b.password || b.password.length < 8) {
      this.error.set('Please fill nom, prenom, email and password (min 8 characters).');
      return;
    }
    const body: RegisterUserBody = {
      nom: b.nom.trim(),
      prenom: b.prenom.trim(),
      email: b.email.trim(),
      password: b.password,
      telephone: b.telephone?.trim() || undefined,
      role: b.role ?? 'LOCATAIRE'
    };
    this.userAdmin.registerUser(body).subscribe({
      next: () => {
        this.modal.dismissAll();
        this.reload();
      },
      error: (err) => this.error.set(this.errMsg(err))
    });
  }

  openEdit(user: UserDTO, content: TemplateRef<unknown>): void {
    this.editModel = { ...user };
    this.modal.open(content, { size: 'lg', backdrop: 'static' });
  }

  openShow(user: UserDTO, content: TemplateRef<unknown>): void {
    this.showModel = user;
    this.modal.open(content, { size: 'lg', backdrop: 'static' });
  }

  submitEdit(): void {
    const m = this.editModel;
    if (!m?.id) return;
    this.error.set('');
    const dto: UserDTO = {
      id: m.id,
      nom: m.nom,
      prenom: m.prenom,
      email: m.email,
      telephone: m.telephone ?? undefined,
      photoProfil: m.photoProfil ?? undefined,
      role: m.role
    };
    this.userAdmin.updateUser(m.id, dto).subscribe({
      next: () => {
        this.modal.dismissAll();
        this.reload();
      },
      error: (err) => this.error.set(this.errMsg(err))
    });
  }

  onEditPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.editModel) return;
    if (!file.type.startsWith('image/')) {
      this.error.set('Please choose an image file.');
      return;
    }
    if (file.size > 800_000) {
      this.error.set('Image too large (max ~800KB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const r = String(reader.result ?? '');
      this.editModel = { ...this.editModel!, photoProfil: r };
    };
    reader.readAsDataURL(file);
  }

  deleteUser(u: UserDTO): void {
    if (!u.id) return;
    if (!confirm(`Delete user ${u.prenom} ${u.nom} (${u.email}) ?`)) return;
    this.userAdmin.deleteUser(u.id).subscribe({
      next: () => this.reload(),
      error: (err) => this.error.set(this.errMsg(err))
    });
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
