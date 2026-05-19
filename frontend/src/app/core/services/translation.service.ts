import { Injectable, signal, effect } from '@angular/core';

export type Language = 'en' | 'fr' | 'ar';

interface TranslationDictionary {
  [key: string]: {
    en: string;
    fr: string;
    ar: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  // Current language signal, defaults to English or saved preference
  currentLang = signal<Language>((localStorage.getItem('preferredLang') as Language) || 'en');

  private dictionary: TranslationDictionary = {
    // Navigation / Header
    DASHBOARD: { en: 'Dashboard', fr: 'Tableau de bord', ar: 'لوحة التحكم' },
    HOME: { en: 'Home', fr: 'Accueil', ar: 'الرئيسية' },
    USER_MANAGE: { en: 'User management', fr: 'Gestion des utilisateurs', ar: 'إدارة المستخدمين' },
    ANNONCE_MANAGE: { en: 'Annonce management', fr: 'Gestion des annonces', ar: 'إدارة الإعلانات' },
    RESERVATIONS: { en: 'Reservations', fr: 'Réservations', ar: 'الحجوزات' },
    MESSAGES: { en: 'Messages', fr: 'Messages', ar: 'الرسائل' },
    MY_ACCOUNT: { en: 'My Account', fr: 'Mon Compte', ar: 'حسابي' },
    LOGOUT: { en: 'Logout', fr: 'Déconnexion', ar: 'تسجيل الخروج' },
    LIST_PROPERTY: { en: 'List your property', fr: 'Publier une annonce', ar: 'أضف عقارك' },
    REGISTER: { en: 'Register', fr: 'S\'inscrire', ar: 'إنشاء حساب' },
    SIGN_IN: { en: 'Sign in', fr: 'Se connecter', ar: 'تسجيل الدخول' },
    NOTIFICATIONS: { en: 'Notifications', fr: 'Notifications', ar: 'الإشعارات' },

    // Landing / Hero
    FIND_STAY: { en: 'Find your next stay', fr: 'Trouvez votre prochain séjour', ar: 'ابحث عن إقامتك القادمة' },
    HERO_SUBTITLE: { en: 'Search deals on hotels, homes, and much more...', fr: 'Recherchez des offres sur des hôtels, des maisons et bien plus encore...', ar: 'ابحث عن عروض الفنادق والمنازل وأكثر من ذلك بكثير...' },
    WHERE_GOING: { en: 'Where are you going?', fr: 'Où allez-vous ?', ar: 'إلى أين أنت ذاهب؟' },
    CHECK_IN_OUT: { en: 'Check-in — Check-out', fr: 'Arrivée — Départ', ar: 'تسجيل الوصول - المغادرة' },
    SEARCH: { en: 'Search', fr: 'Rechercher', ar: 'بحث' },
    LATEST_PROP: { en: 'Latest Properties', fr: 'Dernières propriétés', ar: 'أحدث العقارات' },
    PRICE: { en: 'Price', fr: 'Prix', ar: 'السعر' },
    MONTH: { en: 'month', fr: 'mois', ar: 'شهر' },
    RESERVE: { en: 'Reserve', fr: 'Réserver', ar: 'حجز' },

    // Home / Dashboard
    USERS: { en: 'Users', fr: 'Utilisateurs', ar: 'المستخدمين' },
    ANNONCES: { en: 'Annonces', fr: 'Annonces', ar: 'الإعلانات' },
    TOTAL_USERS: { en: 'Total registered users', fr: 'Total des utilisateurs inscrits', ar: 'إجمالي المستخدمين المسجلين' },
    TOTAL_ANNONCES: { en: 'Total announcements', fr: 'Total des annonces', ar: 'إجمالي الإعلانات' },
    MY_ANNONCES: { en: 'My announcements', fr: 'Mes annonces', ar: 'إعلاناتي' },

    // Chat
    TYPE_MESSAGE: { en: 'Type your message here...', fr: 'Écrivez votre message ici...', ar: 'اكتب رسالتك هنا...' },
    NO_CONTACTS: { en: 'No contacts found.', fr: 'Aucun contact trouvé.', ar: 'لم يتم العثور على جهات اتصال.' },
    LOADING_CONTACTS: { en: 'Loading your contacts...', fr: 'Chargement des contacts...', ar: 'جاري تحميل جهات الاتصال...' },
    LOADING_CONV: { en: 'Loading conversation...', fr: 'Chargement de la conversation...', ar: 'جاري تحميل المحادثة...' },
    START_CONV: { en: 'Start the conversation!', fr: 'Commencez la conversation !', ar: 'ابدأ المحادثة!' },

    // General UI
    CANCEL: { en: 'Cancel', fr: 'Annuler', ar: 'إلغاء' },
    SAVE: { en: 'Save', fr: 'Enregistrer', ar: 'حفظ' },
    CREATE: { en: 'Create', fr: 'Créer', ar: 'إنشاء' },
    TITRE: { en: 'Title', fr: 'Titre', ar: 'العنوان' },
    DESCRIPTION: { en: 'Description', fr: 'Description', ar: 'الوصف' },
    LOCALISATION: { en: 'Location', fr: 'Localisation', ar: 'الموقع' },

    // Navbar Dropdowns
    SETTINGS: { en: 'Settings', fr: 'Paramètres', ar: 'الإعدادات' },
    PROFILE: { en: 'Profile', fr: 'Profil', ar: 'الملف الشخصي' },
    MY_MESSAGES: { en: 'My Messages', fr: 'Mes Messages', ar: 'رسائلي' },
    LOCK_SCREEN: { en: 'Lock Screen', fr: 'Écran de verrouillage', ar: 'قفل الشاشة' },
    MARK_AS_READ: { en: 'mark as read', fr: 'marquer comme lu', ar: 'تحديد كمقروء' },
    CLEAR_ALL: { en: 'clear all', fr: 'tout effacer', ar: 'مسح الكل' },
    NO_NOTIFS: { en: 'No notifications yet.', fr: 'Aucune notification pour le moment.', ar: 'لا توجد إشعارات بعد.' },

    // Reviews System
    REVIEWS: { en: 'Reviews', fr: 'Avis des clients', ar: 'تقييمات العملاء' },
    WRITE_REVIEW: { en: 'Write a review', fr: 'Écrire un avis', ar: 'أكتب تقييماً' },
    RATING: { en: 'Rating', fr: 'Note', ar: 'التقييم' },
    COMMENT: { en: 'Comment', fr: 'Commentaire', ar: 'التعليق' },
    AVERAGE_RATING: { en: 'Average Rating', fr: 'Note Moyenne', ar: 'متوسط التقييم' },
    NO_REVIEWS: { en: 'No reviews yet.', fr: 'Aucun avis pour le moment.', ar: 'لا توجد تقييمات بعد.' },
    SUBMIT: { en: 'Submit', fr: 'Envoyer', ar: 'إرسال' },
    REVIEW_SUCCESS: { en: 'Review submitted successfully!', fr: 'Avis envoyé avec succès !', ar: 'تم إرسال التقييم بنجاح!' },

    // Auth System
    LOGIN: { en: 'Login', fr: 'Se connecter', ar: 'تسجيل الدخول' },
    SIGN_UP: { en: 'Sign up', fr: "S'inscrire", ar: 'إنشاء حساب' },
    EMAIL_ADDRESS: { en: 'Email Address', fr: 'Adresse e-mail', ar: 'البريد الإلكتروني' },
    PASSWORD: { en: 'Password', fr: 'Mot de passe', ar: 'كلمة المرور' },
    PASSWORD_MIN_8: { en: 'Password (min. 8 characters)', fr: 'Mot de passe (min. 8 caractères)', ar: 'كلمة المرور (8 أحرف على الأقل)' },
    SAVE_DETAILS: { en: 'Save Details', fr: 'Enregistrer mes informations', ar: 'حفظ التفاصيل' },
    OR_LOGIN_GOOGLE: { en: 'or login with Google', fr: 'ou connectez-vous avec Google', ar: 'أو تسجيل الدخول باستخدام Google' },
    GOOGLE_ACCOUNT_TYPE: { en: 'Google account type', fr: 'Type de compte Google', ar: 'نوع حساب Google' },
    LOCATAIRE: { en: 'Locataire', fr: 'Locataire', ar: 'مستأجر' },
    BAILLEUR: { en: 'Bailleur', fr: 'Bailleur', ar: 'مؤجر' },
    FORGOT_PASSWORD_Q: { en: 'Forgot password?', fr: 'Mot de passe oublié ?', ar: 'هل نسيت كلمة المرور؟' },
    RESET: { en: 'Reset', fr: 'Réinitialiser', ar: 'إعادة تعيين' },
    DONT_HAVE_ACCOUNT: { en: "Don't have an account?", fr: "Vous n'avez pas de compte ?", ar: 'ليس لديك حساب؟' },
    ALREADY_HAVE_ACCOUNT: { en: 'Already have an account?', fr: 'Vous avez déjà un compte ?', ar: 'لديك حساب بالفعل؟' },
    FIRST_NAME: { en: 'First Name', fr: 'Prénom', ar: 'الاسم الأول' },
    LAST_NAME: { en: 'Last Name', fr: 'Nom', ar: 'الاسم العائلي' },
    ACCOUNT_TYPE: { en: 'Account Type', fr: 'Type de compte', ar: 'نوع الحساب' },
    VERIFYING: { en: 'Verifying...', fr: 'Vérification...', ar: 'جاري التحقق...' },
    LOGGING_IN: { en: 'Logging in...', fr: 'Connexion...', ar: 'جاري تسجيل الدخول...' }
  };

  constructor() {
    // Automatically apply HTML dir and lang attributes on change
    effect(() => {
      const lang = this.currentLang();
      localStorage.setItem('preferredLang', lang);
      document.documentElement.setAttribute('lang', lang);
      // Keep layout LTR for all languages so sidebar stays on the left
      document.documentElement.setAttribute('dir', 'ltr');
    });
  }

  setLanguage(lang: Language): void {
    this.currentLang.set(lang);
  }

  translate(key: string): string {
    const term = this.dictionary[key];
    if (!term) return key;
    return term[this.currentLang()] || term['en'] || key;
  }
}
