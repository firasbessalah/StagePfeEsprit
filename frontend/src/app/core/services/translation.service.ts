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
    PROFILE: { en: 'Profile', fr: 'Profil', ar: 'الملف الشخصي' },
    ALL_RIGHTS_RESERVED: { en: 'All rights reserved.', fr: 'Tous droits réservés.', ar: 'جميع الحقوق محفوظة.' },
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
    CHECK_IN: { en: 'Check in', fr: 'Arrivée', ar: 'تسجيل الوصول' },
    CHECK_OUT: { en: 'Check out', fr: 'Départ', ar: 'المغادرة' },
    ADD_DATES: { en: 'Add dates', fr: 'Ajouter des dates', ar: 'أضف التواريخ' },
    GUESTS: { en: 'Guests', fr: 'Voyageurs', ar: 'الضيوف' },
    ADD_GUESTS: { en: 'Add guests', fr: 'Ajouter des voyageurs', ar: 'أضف الضيوف' },
    ANYWHERE: { en: 'Anywhere', fr: 'N\'importe où', ar: 'أي مكان' },
    ANY_WEEK: { en: 'Any week', fr: 'N\'importe quand', ar: 'أي أسبوع' },
    SEARCH_DESTINATIONS: { en: 'Search destinations', fr: 'Rechercher des destinations', ar: 'ابحث عن الوجهات' },
    SEARCH: { en: 'Search', fr: 'Rechercher', ar: 'بحث' },
    SEARCH_RESULTS: { en: 'Search results', fr: 'Résultats de recherche', ar: 'نتائج البحث' },
    ALL_PROPERTIES: { en: 'All properties', fr: 'Toutes les propriétés', ar: 'جميع العقارات' },
    NO_SEARCH_RESULTS: { en: 'No properties found', fr: 'Aucune propriété trouvée', ar: 'لم يتم العثور على عقارات' },
    TRY_DIFFERENT_SEARCH: { en: 'Try different dates or another location.', fr: 'Essayez d\'autres dates ou un autre lieu.', ar: 'جرب تواريخ أو موقعًا مختلفًا.' },
    BACK_HOME: { en: 'Back to home', fr: 'Retour à l\'accueil', ar: 'العودة للرئيسية' },
    VIEW_DETAILS: { en: 'View', fr: 'Voir', ar: 'عرض' },
    LATEST_PROP: { en: 'Latest Properties', fr: 'Dernières propriétés', ar: 'أحدث العقارات' },
    ABOUT_SITE_TITLE: { en: 'About Lofina', fr: 'À propos de Lofina', ar: 'عن لوفينا' },
    SITE_DESCRIPTION: {
      en: 'Lofina is your trusted platform for finding and renting apartments, houses, and vacation stays across Tunisia. Whether you are looking for a short-term rental or a long-term home, we connect tenants and property owners in a simple and secure way. Browse listings, compare prices, and book your next stay with confidence.',
      fr: 'Lofina est votre plateforme de confiance pour trouver et louer des appartements, des maisons et des séjours de vacances en Tunisie. Que vous recherchiez une location à court terme ou un logement à long terme, nous mettons en relation locataires et propriétaires de manière simple et sécurisée. Parcourez les annonces, comparez les prix et réservez votre prochain séjour en toute sérénité.',
      ar: 'لوفينا هي منصتك الموثوقة للعثور على شقق ومنازل وإقامات عطلات في جميع أنحاء تونس. سواء كنت تبحث عن إيجار قصير الأجل أو سكن طويل الأجل، نربط المستأجرين وأصحاب العقارات بطريقة بسيطة وآمنة. تصفح الإعلانات، قارن الأسعار، واحجز إقامتك القادمة بثقة.'
    },
    FOOTER_TAGLINE: {
      en: 'Your trusted platform for finding the best stays and apartments in Tunisia.',
      fr: 'Votre plateforme de confiance pour trouver les meilleurs séjours et appartements en Tunisie.',
      ar: 'منصتك الموثوقة للعثور على أفضل الإقامات والشقق في تونس.'
    },
    FOOTER_QUICK_LINKS: { en: 'Quick Links', fr: 'Liens rapides', ar: 'روابط سريعة' },
    FOOTER_ABOUT_US: { en: 'About Us', fr: 'À propos', ar: 'من نحن' },
    FOOTER_SUPPORT: { en: 'Support', fr: 'Assistance', ar: 'الدعم' },
    FOOTER_HELP_CENTER: { en: 'Help Center', fr: 'Centre d\'aide', ar: 'مركز المساعدة' },
    FOOTER_TERMS: { en: 'Terms of Service', fr: 'Conditions d\'utilisation', ar: 'شروط الخدمة' },
    FOOTER_PRIVACY: { en: 'Privacy Policy', fr: 'Politique de confidentialité', ar: 'سياسة الخصوصية' },
    FOOTER_CONTACT: { en: 'Contact', fr: 'Contact', ar: 'اتصل بنا' },
    HOME_BLOCK_1_TITLE: { en: 'For landlords', fr: 'Pour les bailleurs', ar: 'للمؤجرين' },
    HOME_BLOCK_1_TEXT: {
      en: 'Rent your property in Bizerte easily and without intermediaries! Are you the owner of an apartment, villa, or house in Bizerte? Our platform allows you to publish your ad for free and quickly find tenants or vacationers. No need to pay commissions to an intermediary or spend weeks looking for a client. You keep control of your ads, your rates, and your availability. Visitors can easily find your property thanks to search filters and geolocation. You save time, reduce your costs, and increase the visibility of your accommodation. A simple, fast, and effective solution to rent your property in Bizerte with complete peace of mind!',
      fr: 'Louez votre bien à Bizerte facilement et sans intermédiaire ! Vous êtes propriétaire d\'un appartement, d\'une villa ou d\'une maison à Bizerte? Notre plateforme vous permet de publier votre annonce gratuitement et de trouver rapidement des locataires ou des vacanciers. Plus besoin de verser des commissions à un intermédiaire ou de passer des semaines à chercher un client. Vous gardez le contrôle de vos annonces, de vos tarifs et de vos disponibilités. Les visiteurs trouvent facilement votre bien grâce aux filtres de recherche et à la géolocalisation. Vous gagnez du temps, réduisez vos coûts et augmentez la visibilité de votre logement. Une solution simple, rapide et efficace pour louer votre bien à Bizerte en toute sérénité !',
      ar: 'قم بتأجير عقارك في بنزرت بسهولة وبدون وسطاء! هل تمتلك شقة أو فيلا أو منزلاً في بنزرت؟ تتيح لك منصتنا نشر إعلانك مجاناً والعثور بسرعة على مستأجرين أو مصطافين. لا حاجة لدفع عمولات لوسيط أو قضاء أسابيع في البحث عن عميل. أنت تحتفظ بالسيطرة على إعلاناتك وأسعارك وتوافرك. يجد الزوار عقارك بسهولة بفضل فلاتر البحث وتحديد الموقع الجغرافي. أنت توفر الوقت، وتقلل تكاليفك، وتزيد من رؤية مكان إقامتك. حل بسيط وسريع وفعال لتأجير عقارك في بنزرت بكل راحة بال!'
    },
    HOME_BLOCK_2_TITLE: { en: 'For vacationers', fr: 'Pour les vacanciers', ar: 'للمصطافين' },
    HOME_BLOCK_2_TEXT: {
      en: 'Discover the beauty of Bizerte in one click! Bizerte, vacation rentals: find the perfect accommodation without wasting time. Bizerte, with its picturesque old port, its fine sandy beaches, and its unique Mediterranean charm, deserves a stay worthy of its beauty. No more time wasted comparing ten different sites to find accommodation: our platform brings together in one place all the hotels, guest houses, villas, and studios available in Bizerte. Thanks to our intelligent filters for geolocation, prices, and real-time availability, you can find the ideal accommodation near the beach, the city center, or the port, according to your budget and your desires. Each ad displays full photos and details in a single click, with no surprises on arrival. Whether you are looking for a romantic getaway, family vacation, or a weekend with friends, book with confidence and save time to fully enjoy the beauty of Bizerte. Your next stay starts here, simply and quickly.',
      fr: 'Découvrez la beauté de Bizerte en un clic ! Bizerte, location vacances : trouvez le logement parfait sans perdre de temps. Bizerte, avec son vieux port pittoresque, ses plages de sable fin et son charme méditerranéen unique, mérite un séjour à la hauteur de sa beauté. Fini le temps perdu à comparer dix sites différents pour trouver un hébergement : notre plateforme réunit en un seul endroit tous les hôtels, maisons d\'hôtes, villas et studios disponibles à Bizerte. Grâce à nos filtres intelligents de géolocalisation, de tarifs et de disponibilité en temps réel, vous trouvez le logement idéal près de la plage, du centre-ville ou du port, selon votre budget et vos envies. Chaque annonce affiche photos et détails complets en un seul clic, sans surprise à l\'arrivée. Que vous cherchiez une escapade romantique, des vacances en famille ou un week-end entre amis, réservez en toute confiance et gagnez du temps pour profiter pleinement de la beauté de Bizerte. Votre prochain séjour commence ici, simplement et rapidement.',
      ar: 'اكتشف جمال بنزرت بنقرة واحدة! إيجارات العطلات في بنزرت: ابحث عن السكن المثالي دون إضاعة الوقت. تستحق بنزرت، بمينائها القديم الخلاب وشواطئها ذات الرمال الناعمة وسحرها المتوسطي الفريد، إقامة تليق بجمالها. وداعاً للوقت الضائع في مقارنة عشرة مواقع مختلفة للعثور على سكن: تجمع منصتنا في مكان واحد جميع الفنادق ودور الضيافة والفيلات والاستوديوهات المتاحة في بنزرت. بفضل فلاترنا الذكية لتحديد الموقع الجغرافي والأسعار والتوافر في الوقت الفعلي، يمكنك العثور على السكن المثالي بالقرب من الشاطئ أو وسط المدينة أو الميناء، وفقاً لميزانيتك ورغباتك. يعرض كل إعلان صوراً وتفاصيل كاملة بنقرة واحدة، بدون مفاجآت عند الوصول. سواء كنت تبحث عن عطلة رومانسية، أو إجازة عائلية، أو عطلة نهاية أسبوع مع الأصدقاء، احجز بثقة ووفر الوقت للاستمتاع الكامل بجمال بنزرت. إقامتك القادمة تبدأ هنا، بكل بساطة وسرعة.'
    },
    HOME_BLOCK_3_TITLE: { en: 'For students', fr: 'Pour les étudiants', ar: 'للطلاب' },
    HOME_BLOCK_3_TEXT: {
      en: 'Find your student accommodation in Bizerte without stress. Searching for student accommodation can be long and tiring, especially when you have to travel all over the city. Our platform helps you quickly find a studio, a room, or an apartment close to your university or school. You reduce your daily commute and avoid long hours in transport. You save time, save energy, and enjoy a better balance between studies and personal life. Bizerte finally becomes a city where studying rhymes with peace of mind. Thanks to filters by location, budget, and availability, you will easily find the accommodation that suits you. Settle down peacefully in Bizerte and focus on your success.',
      fr: 'Trouvez votre logement étudiant à Bizerte sans stress. La recherche d\'un logement étudiant peut être longue et fatigante, surtout lorsqu\'il faut parcourir toute la ville. Notre plateforme vous aide à trouver rapidement un studio, une chambre ou un appartement proche de votre université ou de votre école. Vous réduisez vos déplacements quotidiens et évitez les longues heures dans les transports. Vous gagnez du temps, économisez de l\'énergie et profitez d\'un meilleur équilibre entre études et vie personnelle. Bizerte devient enfin une ville où étudier rime avec tranquillité d\'esprit. Grâce aux filtres par localisation, budget et disponibilité, vous trouverez facilement le logement qui vous convient. Installez-vous sereinement à Bizerte et concentrez-vous sur votre réussite.',
      ar: 'ابحث عن سكنك الطلابي في بنزرت بدون ضغوط. قد يكون البحث عن سكن طلابي طويلاً ومتعباً، خاصة عندما تضطر إلى التجول في جميع أنحاء المدينة. تساعدك منصتنا في العثور بسرعة على استوديو أو غرفة أو شقة قريبة من جامعتك أو مدرستك. أنت تقلل من تنقلاتك اليومية وتتجنب الساعات الطويلة في وسائل النقل. أنت توفر الوقت والطاقة وتستمتع بتوازن أفضل بين الدراسة والحياة الشخصية. أصبحت بنزرت أخيراً مدينة حيث ترتبط الدراسة براحة البال. بفضل فلاتر الموقع والميزانية والتوافر، ستتمكن بسهولة من العثور على السكن الذي يناسبك. استقر بهدوء في بنزرت وركز على نجاحك.'
    },
    PRICE: { en: 'Price', fr: 'Prix', ar: 'السعر' },
    MONTH: { en: 'month', fr: 'mois', ar: 'شهر' },
    RESERVE: { en: 'Reserve', fr: 'Réserver', ar: 'حجز' },

    // Home / Dashboard
    USERS: { en: 'Users', fr: 'Utilisateurs', ar: 'المستخدمين' },
    ANNONCES: { en: 'Annonces', fr: 'Annonces', ar: 'الإعلانات' },
    TOTAL_USERS: { en: 'Total registered users', fr: 'Total des utilisateurs inscrits', ar: 'إجمالي المستخدمين المسجلين' },
    TOTAL_ANNONCES: { en: 'Total announcements', fr: 'Total des annonces', ar: 'إجمالي الإعلانات' },
    MY_ANNONCES: { en: 'My announcements', fr: 'Mes annonces', ar: 'إعلاناتي' },

    // Dashboard Analytics
    LOADING_ANALYTICS: { en: 'Loading analytics...', fr: 'Chargement des analyses...', ar: 'جاري تحميل التحليلات...' },
    ACTIVE_USERS_MAU: { en: 'Active Users (MAU)', fr: 'Utilisateurs actifs (MAU)', ar: 'المستخدمون النشطون (شهرياً)' },
    TOTAL_RESERVATIONS: { en: 'Total Reservations', fr: 'Total des réservations', ar: 'إجمالي الحجوزات' },
    USERS_WITH_RESERVATIONS: { en: 'Users with Reservations', fr: 'Utilisateurs avec réservations', ar: 'مستخدمون لديهم حجوزات' },
    NEW_USERS_THIS_MONTH: { en: 'New Users This Month', fr: 'Nouveaux utilisateurs ce mois', ar: 'مستخدمون جدد هذا الشهر' },
    RESERVATIONS_THIS_MONTH: { en: 'Reservations This Month', fr: 'Réservations ce mois', ar: 'الحجوزات هذا الشهر' },
    ANNONCES_THIS_MONTH: { en: 'Announcements This Month', fr: 'Annonces ce mois', ar: 'الإعلانات هذا الشهر' },
    MONTHLY_NEW_USERS: { en: 'Monthly New Users', fr: 'Nouveaux utilisateurs mensuels', ar: 'المستخدمون الجدد شهرياً' },
    ACTIVE_USERS: { en: 'Active Users', fr: 'Utilisateurs actifs', ar: 'المستخدمون النشطون' },
    PEAK_USAGE_TIME: { en: 'Peak Usage Time (by hour)', fr: 'Heures de pointe d\'utilisation', ar: 'أوقات ذروة الاستخدام (بالساعات)' },
    USER_ACTIVITY_OVER_TIME: { en: 'User Activity Over Time', fr: 'Activité des utilisateurs dans le temps', ar: 'نشاط المستخدمين عبر الوقت' },
    DAYS_7: { en: '7 Days', fr: '7 Jours', ar: '7 أيام' },
    DAYS_30: { en: '30 Days', fr: '30 Jours', ar: '30 يوماً' },
    MONTHS_12: { en: '12 Months', fr: '12 Mois', ar: '12 شهراً' },
    MONTHLY_RESERVATIONS: { en: 'Monthly Reservations', fr: 'Réservations mensuelles', ar: 'الحجوزات الشهرية' },
    USERS_WHO_MADE_RESERVATIONS: { en: 'Users Who Made Reservations', fr: 'Utilisateurs ayant effectué des réservations', ar: 'المستخدمون الذين قاموا بالحجز' },
    MONTHLY_ANNONCES: { en: 'Monthly Announcements', fr: 'Annonces mensuelles', ar: 'الإعلانات الشهرية' },
    MONTHLY_COMPARISON: { en: 'Monthly Comparison', fr: 'Comparaison mensuelle', ar: 'المقارنة الشهرية' },
    CURRENT_MONTH: { en: 'Current Month', fr: 'Mois en cours', ar: 'الشهر الحالي' },
    PREVIOUS_MONTH: { en: 'Previous Month', fr: 'Mois précédent', ar: 'الشهر السابق' },
    WITH_RESERVATIONS: { en: 'With Reservations', fr: 'Avec réservations', ar: 'مع حجوزات' },
    WITHOUT_RESERVATIONS: { en: 'Without Reservations', fr: 'Sans réservations', ar: 'بدون حجوزات' },
    USERS_CREATED_ANNONCES: { en: 'users have created announcements', fr: 'utilisateurs ont créé des annonces', ar: 'مستخدمون قاموا بإنشاء إعلانات' },
    OF: { en: 'of', fr: 'sur', ar: 'من' },

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
    LOGGING_IN: { en: 'Logging in...', fr: 'Connexion...', ar: 'جاري تسجيل الدخول...' },

    // Profile Page
    LEVEL_1_MEMBER: { en: 'Level 1 Member', fr: 'Membre Niveau 1', ar: 'عضو المستوى 1' },
    ADMIN_DASHBOARD: { en: 'Admin Dashboard', fr: 'Tableau de bord Admin', ar: 'لوحة تحكم المسؤول' },
    ADMIN: { en: 'Admin', fr: 'Administrateur', ar: 'مسؤول' },
    PERSONAL_DETAILS: { en: 'Personal details', fr: 'Informations personnelles', ar: 'التفاصيل الشخصية' },
    PERSONAL_DETAILS_SUBTITLE: { en: 'Update your information and find out how it\'s used.', fr: 'Mettez à jour vos informations et découvrez comment elles sont utilisées.', ar: 'حدّث معلوماتك واكتشف كيفية استخدامها.' },
    PROFILE_PHOTO: { en: 'Profile Photo', fr: 'Photo de profil', ar: 'صورة الملف الشخصي' },
    CHANGE_PROFILE_PHOTO: { en: 'Change Profile Photo', fr: 'Changer la photo de profil', ar: 'تغيير صورة الملف الشخصي' },
    EDIT_PROFILE_INFO: { en: 'Edit Profile Information', fr: 'Modifier les informations du profil', ar: 'تعديل معلومات الملف الشخصي' },
    PROFILE_UPDATED_SUCCESS: { en: 'Profile information updated successfully!', fr: 'Informations du profil mises à jour avec succès !', ar: 'تم تحديث معلومات الملف الشخصي بنجاح!' },
    FIRST_NAME_REQUIRED: { en: 'First name is required', fr: 'Le prénom est requis', ar: 'الاسم الأول مطلوب' },
    LAST_NAME_REQUIRED: { en: 'Last name is required', fr: 'Le nom est requis', ar: 'الاسم العائلي مطلوب' },
    EMAIL_CANT_CHANGE: { en: 'This is the email address you use to sign in. It can\'t be changed.', fr: 'Ceci est l\'adresse e-mail que vous utilisez pour vous connecter. Elle ne peut pas être modifiée.', ar: 'هذا هو البريد الإلكتروني الذي تستخدمه لتسجيل الدخول. لا يمكن تغييره.' },
    PHONE_NUMBER: { en: 'Phone Number', fr: 'Numéro de téléphone', ar: 'رقم الهاتف' },
    SECURITY_PASSWORD: { en: 'Security & password', fr: 'Sécurité et mot de passe', ar: 'الأمان وكلمة المرور' },
    CURRENT_PASSWORD: { en: 'Current Password', fr: 'Mot de passe actuel', ar: 'كلمة المرور الحالية' },
    CURRENT_PASSWORD_REQUIRED: { en: 'Current password is required', fr: 'Le mot de passe actuel est requis', ar: 'كلمة المرور الحالية مطلوبة' },
    NEW_PASSWORD: { en: 'New Password', fr: 'Nouveau mot de passe', ar: 'كلمة المرور الجديدة' },
    NEW_PASSWORD_MIN_6: { en: 'New password must be at least 6 characters', fr: 'Le nouveau mot de passe doit contenir au moins 6 caractères', ar: 'يجب أن تحتوي كلمة المرور الجديدة على 6 أحرف على الأقل' },
    CONFIRM_NEW_PASSWORD: { en: 'Confirm New Password', fr: 'Confirmer le nouveau mot de passe', ar: 'تأكيد كلمة المرور الجديدة' },
    PASSWORDS_DONT_MATCH: { en: 'Passwords do not match', fr: 'Les mots de passe ne correspondent pas', ar: 'كلمات المرور غير متطابقة' },
    UPDATE_PASSWORD: { en: 'Update password', fr: 'Mettre à jour le mot de passe', ar: 'تحديث كلمة المرور' },
    PASSWORD_CHANGED_SUCCESS: { en: 'Password changed successfully!', fr: 'Mot de passe modifié avec succès !', ar: 'تم تغيير كلمة المرور بنجاح!' },
    PROFILE_PHOTO_SAVED: { en: 'Profile photo saved successfully.', fr: 'Photo de profil enregistrée avec succès.', ar: 'تم حفظ صورة الملف الشخصي بنجاح.' },
    CHOOSE_IMAGE_FILE: { en: 'Please choose an image file.', fr: 'Veuillez choisir un fichier image.', ar: 'يرجى اختيار ملف صورة.' },
    IMAGE_TOO_LARGE: { en: 'Image too large (max ~800KB).', fr: 'Image trop volumineuse (max ~800 Ko).', ar: 'الصورة كبيرة جداً (الحد الأقصى ~800 كيلوبايت).' },
    REQUEST_FAILED: { en: 'Request failed', fr: 'La requête a échoué', ar: 'فشل الطلب' },

    // Reservations & Statuses
    PROPERTY: { en: 'Property', fr: 'Propriété', ar: 'العقار' },
    APPLICANT: { en: 'Applicant', fr: 'Demandeur', ar: 'مقدم الطلب' },
    DATES: { en: 'Dates', fr: 'Dates', ar: 'التواريخ' },
    MESSAGE: { en: 'Message', fr: 'Message', ar: 'الرسالة' },
    TOTAL_PRICE: { en: 'Total Price', fr: 'Prix Total', ar: 'السعر الإجمالي' },
    STATUS: { en: 'Status', fr: 'Statut', ar: 'الحالة' },
    ACTIONS: { en: 'Actions', fr: 'Actions', ar: 'الإجراءات' },
    MANAGE_BOOKINGS_DESC: { en: 'Manage all your bookings and requests here.', fr: 'Gérez toutes vos réservations et demandes ici.', ar: 'إدارة جميع حجوزاتك وطلباتك هنا.' },
    IN: { en: 'In', fr: 'Arrivée', ar: 'الدخول' },
    OUT: { en: 'Out', fr: 'Départ', ar: 'المغادرة' },
    NO_RESERVATIONS: { en: 'No reservations found', fr: 'Aucune réservation trouvée', ar: 'لم يتم العثور على حجوزات' },
    NO_ACTIVE_RESERVATIONS: { en: 'You do not have any active reservations.', fr: 'Vous n\'avez aucune réservation active.', ar: 'ليس لديك أي حجوزات نشطة.' },
    ACCEPT: { en: 'Accept', fr: 'Accepter', ar: 'قبول' },
    REFUSE: { en: 'Refuse', fr: 'Refuser', ar: 'رفض' },
    EN_ATTENTE: { en: 'Pending', fr: 'En attente', ar: 'قيد الانتظار' },
    CONFIRMEE: { en: 'Confirmed', fr: 'Confirmée', ar: 'مؤكدة' },
    ANNULEE: { en: 'Cancelled', fr: 'Annulée', ar: 'ملغاة' },
    TERMINEE: { en: 'Completed', fr: 'Terminée', ar: 'مكتملة' },
    VALIDEE: { en: 'Validated', fr: 'Validée', ar: 'تم التحقق' },
    REJETEE: { en: 'Rejected', fr: 'Rejetée', ar: 'مرفوضة' },
    ARCHIVEE: { en: 'Archived', fr: 'Archivée', ar: 'مؤرشفة' }
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
