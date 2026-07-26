export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  /** If set, link is shown only when the logged-in user has one of these roles. */
  roles?: string[];
  children?: NavigationItem[];
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'navigation',
    title: 'Navigation',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/dashboard',
        icon: 'feather icon-home',
        classes: 'nav-item',
        roles: ['ADMIN']
      },
      {
        id: 'home',
        title: 'Home',
        type: 'item',
        url: '/home',
        icon: 'feather icon-grid',
        classes: 'nav-item',
        roles: ['LOCATAIRE', 'BAILLEUR']
      },
      {
        id: 'user-management',
        title: 'User management',
        type: 'item',
        url: '/users',
        icon: 'feather icon-users',
        classes: 'nav-item',
        roles: ['ADMIN']
      },
      {
        id: 'annonce-management',
        title: 'Annonce management',
        type: 'item',
        url: '/admin-annonces',
        icon: 'feather icon-list',
        classes: 'nav-item',
        roles: ['ADMIN']
      },
      {
        id: 'reservation-management',
        title: 'Reservations',
        type: 'item',
        url: '/admin-reservations',
        icon: 'feather icon-briefcase',
        classes: 'nav-item',
        roles: ['ADMIN']
      },
      {
        id: 'reservation-user',
        title: 'Reservations',
        type: 'item',
        url: '/reservations',
        icon: 'feather icon-briefcase',
        classes: 'nav-item',
        roles: ['BAILLEUR', 'LOCATAIRE']
      },
      {
        id: 'messages',
        title: 'Messages',
        type: 'item',
        url: '/admin-messages',
        icon: 'feather icon-message-square',
        classes: 'nav-item',
        roles: ['ADMIN']
      },
      {
        id: 'messages-user',
        title: 'Messages',
        type: 'item',
        url: '/messages',
        icon: 'feather icon-message-square',
        classes: 'nav-item',
        roles: ['BAILLEUR', 'LOCATAIRE']
      }
    ]
  }
];
