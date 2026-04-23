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
      }
    ]
  }
];
