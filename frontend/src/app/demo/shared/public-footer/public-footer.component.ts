import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { TranslatePipe } from 'src/app/core/pipes/translate.pipe';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './public-footer.component.html',
  styleUrls: ['./public-footer.component.scss']
})
export class PublicFooterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  currentYear = new Date().getFullYear();

  homeLink = computed(() => {
    const role = this.auth.user()?.role;
    if (role === 'LOCATAIRE' || role === 'BAILLEUR') return '/browse';
    return '/';
  });

  onAddAnnonce(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/annonces']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
