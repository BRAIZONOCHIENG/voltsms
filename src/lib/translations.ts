export type Language = 'en' | 'ru' | 'zh' | 'es' | 'fr';

export interface TranslationDict {
    [key: string]: {
        [lang in Language]: string;
    };
}

export const translations: TranslationDict = {
    // Navbar
    nav_dashboard: {
        en: 'Dashboard',
        ru: 'Панель',
        zh: '仪表板',
        es: 'Tablero',
        fr: 'Tableau de bord'
    },
    nav_api: {
        en: 'API',
        ru: 'API',
        zh: 'API',
        es: 'API',
        fr: 'API'
    },
    nav_support: {
        en: 'Support',
        ru: 'Поддержка',
        zh: '支持',
        es: 'Soporte',
        fr: 'Support'
    },
    nav_affiliate: {
        en: 'Affiliate',
        ru: 'Партнерка',
        zh: '联盟',
        es: 'Afiliado',
        fr: 'Affilié'
    },
    nav_logout: {
        en: 'Logout',
        ru: 'Выйти',
        zh: '登出',
        es: 'Cerrar sesión',
        fr: 'Déconnexion'
    },
    nav_login: {
        en: 'Log in',
        ru: 'Войти',
        zh: '登录',
        es: 'Iniciar sesión',
        fr: 'Connexion'
    },
    nav_get_started: {
        en: 'Get Started',
        ru: 'Начать',
        zh: '开始使用',
        es: 'Empezar',
        fr: 'Commencer'
    },

    // Landing Page
    hero_title: {
        en: 'Instant Non-VoIP Verifications',
        ru: 'Мгновенная Non-VoIP верификация',
        zh: '即时非 VoIP 验证',
        es: 'Verificaciones Non-VoIP instantáneas',
        fr: 'Vérifications Non-VoIP instantanées'
    },
    hero_subtitle: {
        en: 'Secure your accounts with high-success physical SIM numbers. Reliable, fast, and automated.',
        ru: 'Защитите свои аккаунты с помощью физических SIM-карт с высокой вероятностью успеха. Надежно, быстро и автоматически.',
        zh: '使用高成功率的物理 SIM 卡号码保护您的账户。可靠、快速且自动化。',
        es: 'Asegure sus cuentas con números de SIM física de alto éxito. Fiable, rápido y automatizado.',
        fr: 'Sécurisez vos comptes avec des numéros SIM physiques à haut taux de réussite. Fiable, rapide et automatisé.'
    },
    landing_how_title: {
        en: 'How it works',
        ru: 'Как это работает',
        zh: '工作原理',
        es: 'Cómo funciona',
        fr: 'Comment ça marche'
    },
    landing_faq_title: {
        en: 'Frequently Asked Questions',
        ru: 'Часто задаваемые вопросы',
        zh: '常见问题',
        es: 'Preguntas frecuentes',
        fr: 'Foire aux questions'
    },

    // Dashboard
    dash_balance: {
        en: 'Balance',
        ru: 'Баланс',
        zh: '余额',
        es: 'Saldo',
        fr: 'Solde'
    },
    dash_top_up: {
        en: 'Top Up',
        ru: 'Пополнить',
        zh: '充值',
        es: 'Recargar',
        fr: 'Recharger'
    },
    dash_order_number: {
        en: 'Order Number',
        ru: 'Заказать номер',
        zh: '订购号码',
        es: 'Pedir número',
        fr: 'Commander un номер'
    },
    dash_add_funds: {
        en: 'Add Funds',
        ru: 'Пополнить баланс',
        zh: '充值资金',
        es: 'Agregar fondos',
        fr: 'Ajouter des fonds'
    },
    dash_active_verifications: {
        en: 'Active Verifications',
        ru: 'Активные верификации',
        zh: '活动验证',
        es: 'Verificaciones activas',
        fr: 'Vérifications actives'
    },
    dash_history: {
        en: 'History',
        ru: 'История',
        zh: '历史',
        es: 'Historial',
        fr: 'Historique'
    },
    dash_deposits: {
        en: 'Deposits',
        ru: 'Депозиты',
        zh: '存款',
        es: 'Depósitos',
        fr: 'Dépôts'
    },
    dash_header_title: {
        en: 'Verifications',
        ru: 'Верификации',
        zh: '验证',
        es: 'Verificaciones',
        fr: 'Vérifications'
    },
    dash_header_desc: {
        en: 'Manage your SMS verifications',
        ru: 'Управляйте своими SMS-верификациями',
        zh: '管理您的 SMS 验证',
        es: 'Gestione sus verificaciones por SMS',
        fr: 'Gérez vos vérifications par SMS'
    },

    // Services
    svc_select_service: {
        en: 'Select Service',
        ru: 'Выберите сервис',
        zh: '选择服务',
        es: 'Seleccionar servicio',
        fr: 'Sélectionner le service'
    },
    svc_search_placeholder: {
        en: 'Search services...',
        ru: 'Поиск сервисов...',
        zh: '搜索服务...',
        es: 'Buscar servicios...',
        fr: 'Rechercher des services...'
    },
    svc_select_first: {
        en: 'Select a service first',
        ru: 'Сначала выберите сервис',
        zh: '请先选择服务',
        es: 'Primero seleccione un servicio',
        fr: 'Sélectionnez d’abord un service'
    },
    svc_instant_delivery: {
        en: 'Instant Delivery',
        ru: 'Мгновенная доставка',
        zh: '即时交付',
        es: 'Entrega instantánea',
        fr: 'Livraison instantanée'
    },

    // Countries
    cnt_select_country: {
        en: 'Select Country',
        ru: 'Выберите страну',
        zh: '选择国家',
        es: 'Seleccionar país',
        fr: 'Sélectionner le pays'
    },
    cnt_search_placeholder: {
        en: 'Search...',
        ru: 'Поиск...',
        zh: '搜索...',
        es: 'Buscar...',
        fr: 'Rechercher...'
    },

    // Affiliate Section
    aff_partner_title: {
        en: 'Partner with us',
        ru: 'Станьте партнером',
        zh: '与我们合作',
        es: 'Asociarse con nosotros',
        fr: 'Devenez partenaire'
    },
    aff_earn_up_to: {
        en: 'Earn up to',
        ru: 'Зарабатывайте до',
        zh: '赚取高达',
        es: 'Gane hasta',
        fr: 'Gagnez jusqu’à'
    },
    aff_commission: {
        en: '15% Commission',
        ru: '15% комиссии',
        zh: '15% 佣金',
        es: '15% de comisión',
        fr: '15 % de commission'
    },
    aff_desc: {
        en: 'Join the VoltSMS Affiliate Program and earn passive income for every user you refer.',
        ru: 'Присоединяйтесь к партнерской программе VoltSMS и получайте пассивный доход за каждого привлеченного пользователя.',
        zh: '加入 VoltSMS 联盟计划，为您的每位推荐用户赚取被动收入。',
        es: 'Únase al programa de afiliados de VoltSMS y obtenga ingresos pasivos por cada usuario que recomiende.',
        fr: 'Rejoignez le programme d’affiliation VoltSMS et générez des revenus passifs pour chaque utilisateur parrainé.'
    },
    aff_cta: {
        en: 'Become an Affiliate',
        ru: 'Стать партнером',
        zh: '成为联盟合作伙伴',
        es: 'Convertirse en afiliado',
        fr: 'Devenir affilié'
    },

    // Final CTA
    cta_start_title: {
        en: 'Start bypassing',
        ru: 'Начните обходить',
        zh: '开始绕过',
        es: 'Empiece a omitir',
        fr: 'Commencez à contourner'
    },
    cta_verifications_today: {
        en: 'verifications today.',
        ru: 'верификации сегодня.',
        zh: '今天就开始验证。',
        es: 'verificaciones hoy.',
        fr: 'les vérifications dès aujourd’hui.'
    },
    cta_create_account: {
        en: 'Create Free Account',
        ru: 'Создать аккаунт',
        zh: '创建免费账户',
        es: 'Crear cuenta gratuita',
        fr: 'Créer un compte gratuit'
    },

    // Footer
    foot_all_rights: {
        en: 'All rights reserved.',
        ru: 'Все права защищены.',
        zh: '版权所有。',
        es: 'Todos los derechos reservados.',
        fr: 'Tous droits réservés.'
    },
    foot_about: {
        en: 'About',
        ru: 'О нас',
        zh: '关于我们',
        es: 'Acerca de',
        fr: 'À propos'
    },
    foot_contact: {
        en: 'Contact',
        ru: 'Контакты',
        zh: '联系方式',
        es: 'Contacto',
        fr: 'Contact'
    },
    foot_terms: {
        en: 'Terms',
        ru: 'Условия',
        zh: '条款',
        es: 'Términos',
        fr: 'Conditions'
    },
    foot_privacy: {
        en: 'Privacy',
        ru: 'Конфиденциальность',
        zh: '隐私',
        es: 'Privacidad',
        fr: 'Confidentialité'
    },
    foot_disclaimer: {
        en: 'Disclaimer',
        ru: 'Отказ от ответственности',
        zh: '免责声明',
        es: 'Descargo de responsabilidad',
        fr: 'Clause de non-responsabilité'
    },

    // Features
    feat_non_voip_title: {
        en: 'Non-VoIP Guarantee',
        ru: 'Гарантия Non-VoIP',
        zh: '非 VoIP 保证',
        es: 'Garantía Non-VoIP',
        fr: 'Garantie Non-VoIP'
    },
    feat_non_voip_desc: {
        en: 'Real SIM cards from physical devices for the highest success rates.',
        ru: 'Настоящие SIM-карты с физических устройств для высочайшего уровня успеха.',
        zh: '来自物理设备的真实 SIM 卡，确保最高的成功率。',
        es: 'Tarjetas SIM reales de dispositivos físicos para las tasas de éxito más altas.',
        fr: 'De vraies cartes SIM provenant d’appareils physiques pour les taux de réussite les plus élevés.'
    },
    feat_instant_title: {
        en: 'Instant Delivery',
        ru: 'Мгновенная доставка',
        zh: '即时交付',
        es: 'Entrega instantánea',
        fr: 'Livraison instantanée'
    },
    feat_instant_desc: {
        en: 'Automated system delivers numbers and codes 24/7 instantly.',
        ru: 'Автоматизированная система мгновенно выдает номера и коды круглосуточно.',
        zh: '自动化系统全天候即时交付号码和代码。',
        es: 'El sistema automatizado entrega números y códigos 24/7 al instante.',
        fr: 'Le système automatisé livre les numéros et les codes 24/7 instantanément.'
    },
    feat_secure_title: {
        en: 'Secure & Private',
        ru: 'Безопасно и приватно',
        zh: '安全且私密',
        es: 'Seguro y privado',
        fr: 'Sécurisé et privé'
    },
    feat_secure_desc: {
        en: 'Protect your data. Use temporary numbers to verify accounts safely.',
        ru: 'Защитите свои данные. Используйте временные номера для безопасной проверки.',
        zh: '保护您的数据。使用临时号码安全地验证账户。',
        es: 'Proteja sus datos. Utilice números temporales para verificar cuentas de forma segura.',
        fr: 'Protégez vos données. Utilisez des numéros temporaires pour vérifier vos comptes en toute sécurité.'
    },

    // Steps
    step_1_title: {
        en: '1. Create Account',
        ru: '1. Создайте аккаунт',
        zh: '1. 创建账户',
        es: '1. Crear cuenta',
        fr: '1. Créer un compte'
    },
    step_1_desc: {
        en: 'Sign up anonymously. No ID required.',
        ru: 'Зарегистрируйтесь анонимно. Удостоверение личности не требуется.',
        zh: '匿名注册。无需身份验证。',
        es: 'Regístrese de forma anónima. No se requiere identificación.',
        fr: 'Inscrivez-vous anonymement. Aucune pièce d’identité requise.'
    },
    step_2_title: {
        en: '2. Deposit Crypto',
        ru: '2. Пополните баланс',
        zh: '2. 存入加密货币',
        es: '2. Depositar cripto',
        fr: '2. Déposer des cryptos'
    },
    step_3_title: {
        en: '3. Get SMS',
        ru: '3. Получите SMS',
        zh: '3. 获取短信',
        es: '3. Recibir SMS',
        fr: '3. Recevoir un SMS'
    },

    // Contact Page
    contact_title: {
        en: 'Contact Us',
        ru: 'Связаться с нами',
        zh: '联系我们',
        es: 'Contáctenos',
        fr: 'Contactez-nous'
    },
};
