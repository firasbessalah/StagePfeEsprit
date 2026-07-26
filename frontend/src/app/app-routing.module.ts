import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// project import
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { roleGuard } from './core/auth/role.guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./demo/public-home/public-home.component').then((m) => m.PublicHomeComponent),
    pathMatch: 'full'
  },
  {
    path: 'annonce/:id',
    loadComponent: () => import('./demo/annonce-details/annonce-details.component').then((m) => m.AnnonceDetailsComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./demo/search-results/search-results.component').then((m) => m.SearchResultsComponent)
  },
  {
    path: 'browse',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['LOCATAIRE', 'BAILLEUR'] },
    loadComponent: () => import('./demo/user-browse/user-browse.component').then((m) => m.UserBrowseComponent)
  },
  {
    path: 'my-profile',
    canActivate: [authGuard],
    loadComponent: () => import('./demo/public-profile/public-profile.component').then((m) => m.PublicProfileComponent)
  },
  {
    path: 'reservations',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BAILLEUR', 'LOCATAIRE'] },
    loadComponent: () =>
      import('./admin-features/reservation-management/reservation-management.component').then((c) => c.ReservationManagementComponent)
  },
  {
    path: 'messages',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BAILLEUR', 'LOCATAIRE'] },
    loadComponent: () => import('./demo/messages/messages.component').then((c) => c.MessagesComponent)
  },
  {
    path: 'favoris',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['LOCATAIRE'] },
    loadComponent: () => import('./demo/favoris/favoris').then((c) => c.FavorisComponent)
  },
  {
    path: 'alertes',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['LOCATAIRE'] },
    loadComponent: () => import('./demo/alertes/alertes').then((c) => c.AlertesComponent)
  },
  {
    path: 'annonces',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BAILLEUR'] },
    loadComponent: () =>
      import('./admin-features/annonce-management/annonce-management.component').then((c) => c.AnnonceManagementComponent)
  },
  {
    path: '',
    component: GuestComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/auth-signin/auth-signin.component').then((c) => c.AuthSigninComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./demo/pages/authentication/auth-signup/auth-signup.component').then((c) => c.AuthSignupComponent)
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./demo/pages/authentication/verify-email/verify-email.component').then((c) => c.VerifyEmailComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./demo/pages/authentication/forgot-password/forgot-password.component').then((c) => c.ForgotPasswordComponent)
      },
      {
        path: 'reset-password/new',
        loadComponent: () =>
          import('./demo/pages/authentication/reset-password-new/reset-password-new.component').then(
            (c) => c.ResetPasswordNewComponent
          )
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./demo/pages/authentication/reset-password-verify/reset-password-verify.component').then(
            (c) => c.ResetPasswordVerifyComponent
          )
      }
    ]
  },
  {
    path: '',
    component: AdminComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./demo/dashboard/dashboard.component').then((c) => c.DashboardComponent)
      },
      {
        path: 'home',
        canActivate: [roleGuard],
        data: { roles: ['LOCATAIRE', 'BAILLEUR'] },
        loadComponent: () => import('./demo/home/home.component').then((c) => c.HomeComponent)
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./admin-features/user-management/user-management.component').then((c) => c.UserManagementComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./demo/profile/profile.component').then((c) => c.ProfileComponent)
      },
      {
        path: 'admin-annonces',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./admin-features/annonce-management/annonce-management.component').then((c) => c.AnnonceManagementComponent)
      },
      {
        path: 'admin-reservations',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./admin-features/reservation-management/reservation-management.component').then((c) => c.ReservationManagementComponent)
      },
      {
        path: 'admin-messages',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./demo/messages/messages.component').then((c) => c.MessagesComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
