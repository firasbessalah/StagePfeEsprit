// angular import
import { Component, computed, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

// project import
import { NavigationItem } from '../../navigation';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/core/auth/auth.service';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
  selector: 'app-nav-item',
  imports: [SharedModule, RouterModule],
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss']
})
export class NavItemComponent {
  // public props
  item = input<NavigationItem>();

  private auth = inject(AuthService);
  private translationService = inject(TranslationService);

  visible = computed(() => {
    const it = this.item();
    const roles = it?.roles;
    if (!roles?.length) return true;
    return this.auth.hasRole(roles);
  });

  getTranslatedTitle = computed(() => {
    const it = this.item();
    if (!it) return '';
    const id = it.id;
    if (id === 'dashboard') return this.translationService.translate('DASHBOARD');
    if (id === 'home') return this.translationService.translate('HOME');
    if (id === 'user-management') return this.translationService.translate('USER_MANAGE');
    if (id === 'annonce-management') return this.translationService.translate('ANNONCE_MANAGE');
    if (id === 'reservation-management') return this.translationService.translate('RESERVATIONS');
    if (id === 'messages') return this.translationService.translate('MESSAGES');
    return it.title || '';
  });

  // public method
  closeOtherMenu(event: MouseEvent) {
    const ele = event.target as HTMLElement;
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement as HTMLElement;
      const up_parent = ((parent.parentElement as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement;
      const last_parent = (up_parent.parentElement as HTMLElement).parentElement as HTMLElement;
      if (last_parent.classList.contains('pcoded-submenu')) {
        up_parent.classList.remove('pcoded-trigger');
        up_parent.classList.remove('active');
      } else {
        const sections = document.querySelectorAll('.pcoded-hasmenu');
        for (let i = 0; i < sections.length; i++) {
          sections[i].classList.remove('active');
          sections[i].classList.remove('pcoded-trigger');
        }
      }

      if (parent.classList.contains('pcoded-hasmenu')) {
        parent.classList.add('pcoded-trigger');
        parent.classList.add('active');
      } else if (up_parent.classList.contains('pcoded-hasmenu')) {
        up_parent.classList.add('pcoded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent.classList.contains('pcoded-hasmenu')) {
        last_parent.classList.add('pcoded-trigger');
        last_parent.classList.add('active');
      }
    }
    if (document.querySelector('app-navigation.pcoded-navbar').classList.contains('mob-open')) {
      document.querySelector('app-navigation.pcoded-navbar').classList.remove('mob-open');
    }
  }
}
