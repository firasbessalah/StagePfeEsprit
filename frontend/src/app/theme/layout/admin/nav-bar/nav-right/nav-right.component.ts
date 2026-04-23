// angular import
import { Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule, RouterModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  userName = computed(() => {
    const u = this.auth.user();
    if (!u) return '';
    return `${u.prenom} ${u.nom}`.trim();
  });

  avatarSrc = computed(() => {
    const p = this.auth.user()?.photoProfil;
    if (p && String(p).trim().length > 0) return String(p);
    return 'assets/images/user/avatar-1.jpg';
  });

  // constructor
  constructor() {
    const config = inject(NgbDropdownConfig);

    config.placement = 'bottom-right';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
