"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "uz" | "ru";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & App Shell
    discover: "Discover",
    myLibrary: "My Library",
    myLoans: "My Loans",
    holds: "Holds",
    myHolds: "My Holds",
    manageBooks: "Manage Books",
    circulation: "Circulation",
    circulationDesk: "Circulation Desk",
    adminConsole: "Admin Console",
    deskAndStaff: "Desk & Staff",
    management: "Management",
    preferences: "Preferences",
    signOut: "Sign Out",
    signIn: "Sign In",
    signUp: "Sign Up",
    patron: "Patron",
    student: "Student",
    assistant: "Assistant",
    admin: "Admin",
    notifications: "Notifications",

    // Catalog & Search
    catalog: "Catalog",
    searchPlaceholder: "Search your favourite books...",
    searchCatalogTypo: "Search by title, author, or ISBN (typo-tolerant)...",
    filterTheme: "Filter Theme",
    filterByCategory: "Filter by Category",
    searchThemes: "Search themes...",
    searchCategories: "Search categories...",
    allCategories: "All Categories",
    sortBy: "Sort by",
    newest: "Newest Arrivals",
    ratingHigh: "Rating: High to Low",
    titleAsc: "Title: A to Z",
    titleDesc: "Title: Z to A",
    reset: "Reset",
    activeFilters: "Active Filters",
    selectAnyBook: "Select any book",
    clickBookToInspect: "Click a book card to inspect live preview and reserve.",
    reserveBook: "Reserve Book",
    placingHold: "Placing Hold...",
    onLoan: "On Loan",
    availableOnShelf: "Available on Shelf",
    reviews: "reviews",
    pages: "pages",
    category: "Category",
    isbn: "ISBN",
    viewDetails: "View Details",
    noBooksFound: "No Matching Titles Found",
    noBooksFoundSubtitle: "Try adjusting your search query or theme filters.",

    // Book Detail View
    backToCatalog: "Back to Catalog",
    bookOverview: "Overview & Synopsis",
    inventorySummary: "Physical Inventory",
    totalCopies: "Total Copies",
    availableCopies: "Available",
    reservedCopies: "Reserved",
    borrowedCopies: "On Loan",
    maintenanceCopies: "Maintenance",
    reviewsAndRatings: "Verified Loan Reviews",
    leaveReview: "Write a Review",
    verifiedBorrower: "Verified Borrower",
    noReviewsYet: "No reviews submitted for this title yet.",
    beFirstToReview: "Borrow and return this copy to be the first to share your thoughts!",
    ratingOutOf5: "out of 5 stars",
    setHoldDuration: "Set Hold Duration & Expiration",
    chooseHoldDuration: "Choose how long to hold this book for desk pickup (Max limit: 7 days).",
    confirmHoldRequest: "Confirm Hold Request",
    cancel: "Cancel",
    confirm: "Confirm",
    day: "Day",
    days: "Days",
    defaultPreset: "(Default)",

    // Holds Page
    activeHoldCount: "Active Holds",
    expirationDate: "Pickup Deadline",
    cancelHold: "Cancel Hold",
    cancellingHold: "Cancelling...",
    holdPending: "Active Hold Pending",
    holdFulfilled: "Fulfilled & Picked Up",
    holdExpired: "Expired",
    holdCancelled: "Cancelled",
    noActiveHolds: "No active hold reservations found.",

    // Loans Page
    activeLoans: "Active Loans",
    returnedLoans: "Past Returns",
    dueDate: "Due Date",
    borrowedDate: "Borrowed Date",
    renewLoan: "Renew Loan",
    renewing: "Renewing...",
    overdue: "Overdue",
    onTime: "On Time",
    daysLeft: "days left",
    daysOverdue: "days overdue",
    noActiveLoans: "No active book loans at this moment.",

    // Circulation Desk
    rapidCheckout: "Rapid Checkout",
    rapidCheckin: "Rapid Check-in",
    holdsQueue: "Holds Queue",
    overdueCopies: "Overdue Copies",
    studentBorrower: "1. Student Borrower",
    searchStudent: "Search student by name, email, or ID...",
    scanCopyBarcode: "2. Scan Book Copy Barcode",
    scanBarcodePlaceholder: "Scan copy barcode (e.g., BC-GATSBY-01)...",
    setLoanPeriod: "3. Set Loan Period",
    confirmCheckout: "Confirm & Checkout Copy",
    scanToReturn: "Scan Barcode to Check In",
    confirmReturn: "Process Book Return",
    conditionOnReturn: "Condition on Return",

    // Admin & Moderation
    userManagement: "User Management",
    livePatronPresence: "Live Patron Presence",
    patronPresenceSubtitle: "Online students & circulation assistants active on the campus platform.",
    feedbackModeration: "Feedback Moderation",
    totalReviews: "Total Reviews",
    publishedPublic: "Published (Public)",
    moderatedHidden: "Moderated (Hidden)",
    systemAvgRating: "System Avg Rating",
    hideReview: "Hide Review",
    publishReview: "Publish Review",
    deleteReview: "Delete Review",
    analytics: "Analytics",
    timeframe30d: "Last 30 Days",
    timeframe90d: "Last 90 Days",
    timeframe6m: "Last 6 Months",
    timeframe1y: "Last 1 Year",
    timeframeAll: "All Time",
    manageUsers: "Manage Users & Roles",
    manageReviews: "Manage Reviews",
    viewAnalytics: "View Analytics",

    // Landing Page
    heroTitle: "Unified Campus Library Management Platform",
    heroSubtitle: "Streamline book discovery, hold reservations, desk checkouts, and collection tracking with speed and simplicity.",
    exploreCatalogBtn: "Explore Book Catalog",
    faqSectionTitle: "Frequently Asked Questions",
    faqSectionSubtitle: "Got questions about borrowing policies, circulation desk workflows, or account management? Here are the answers.",
  },
  uz: {
    // Navigation & App Shell
    discover: "Kashf qilish",
    myLibrary: "Mening kutubxonam",
    myLoans: "Ijara kitoblarim",
    holds: "Band qilinganlar",
    myHolds: "Band qilingan kitoblarim",
    manageBooks: "Kitoblarni boshqarish",
    circulation: "Aylanma bo'limi",
    circulationDesk: "Ijara stoli",
    adminConsole: "Admin boshqaruvi",
    deskAndStaff: "Kutubxona & Xodimlar",
    management: "Boshqaruv",
    preferences: "Sozlamalar",
    signOut: "Chiqish",
    signIn: "Kirish",
    signUp: "Ro'yxatdan o'tish",
    patron: "Kitobxon",
    student: "Talaba",
    assistant: "Yordamchi",
    admin: "Admin",
    notifications: "Xabarnomalar",

    // Catalog & Search
    catalog: "Katalog",
    searchPlaceholder: "Sevimli kitoblaringizni qidiring...",
    searchCatalogTypo: "Nomi, muallifi yoki ISBN orqali qidirish...",
    filterTheme: "Mavzu bo'yicha filter",
    filterByCategory: "Turkum bo'yicha filter",
    searchThemes: "Mavzularni qidirish...",
    searchCategories: "Turkumlarni qidirish...",
    allCategories: "Barcha turkumlar",
    sortBy: "Saralash",
    newest: "Eng yangilari",
    ratingHigh: "Baho: Yuqoridan pastga",
    titleAsc: "Nomi: A dan Z gacha",
    titleDesc: "Nomi: Z dan A gacha",
    reset: "Tozalash",
    activeFilters: "Faol filterlar",
    selectAnyBook: "Istalgan kitobni tanlang",
    clickBookToInspect: "Kitob kartasini bosib, nusxasini ko'ring va band qiling.",
    reserveBook: "Band qilish",
    placingHold: "Band qilinmoqda...",
    onLoan: "Ijarada",
    availableOnShelf: "Javonda mavjud",
    reviews: "ta sharh",
    pages: "sahifa",
    category: "Turkum",
    isbn: "ISBN",
    viewDetails: "Batafsil ko'rish",
    noBooksFound: "Mos kitoblar topilmadi",
    noBooksFoundSubtitle: "Qidiruv so'zini yoki mavzu filterlarini o'zgartirib ko'ring.",

    // Book Detail View
    backToCatalog: "Katalogga qaytish",
    bookOverview: "Qisqacha mazmun",
    inventorySummary: "Kitob nusxalari",
    totalCopies: "Jami nusxalar",
    availableCopies: "Mavjud",
    reservedCopies: "Band qilingan",
    borrowedCopies: "Ijarada",
    maintenanceCopies: "Ta'mirda",
    reviewsAndRatings: "Tasdiqlangan kitobxonlar sharhlari",
    leaveReview: "Sharh yozish",
    verifiedBorrower: "Tasdiqlangan o'quvchi",
    noReviewsYet: "Bu kitobga hali sharh qoldirilmagan.",
    beFirstToReview: "Ushbu kitobni o'qib, birinchi bo'lib o'z fikringizni bildiring!",
    ratingOutOf5: "5 balldan",
    setHoldDuration: "Band qilish muddati va sanasi",
    chooseHoldDuration: "Kutubxonadan olib ketish uchun band qilish muddatini tanlang (Ko'pi bilan 7 kun).",
    confirmHoldRequest: "Band qilishni tasdiqlash",
    cancel: "Bekor qilish",
    confirm: "Tasdiqlash",
    day: "Kun",
    days: "Kun",
    defaultPreset: "(Standart)",

    // Holds Page
    activeHoldCount: "Faol band qilinganlar",
    expirationDate: "Olib ketish muddati",
    cancelHold: "Bandlikni bekor qilish",
    cancellingHold: "Bekor qilinmoqda...",
    holdPending: "Olib ketish kutilmoqda",
    holdFulfilled: "Olib ketilgan",
    holdExpired: "Muddati o'tgan",
    holdCancelled: "Bekor qilingan",
    noActiveHolds: "Hozirda faol band qilingan kitoblar yo'q.",

    // Loans Page
    activeLoans: "Faol ijaralar",
    returnedLoans: "Qaytarilganlar tarixi",
    dueDate: "Qaytarish sanasi",
    borrowedDate: "Olingan sana",
    renewLoan: "Muddatni uzaytirish",
    renewing: "Uzaytirilmoqda...",
    overdue: "Muddati o'tgan",
    onTime: "O'z vaqtida",
    daysLeft: "kun qoldi",
    daysOverdue: "kun kechikdi",
    noActiveLoans: "Hozirda faol ijaradagi kitoblar yo'q.",

    // Circulation Desk
    rapidCheckout: "Tezkor berish",
    rapidCheckin: "Tezkor qabul qilish",
    holdsQueue: "Band qilinganlar navbati",
    overdueCopies: "Muddati o'tganlar",
    studentBorrower: "1. Talaba kitobxon",
    searchStudent: "Talabani ismi, pochtasi yoki ID orqali qidiring...",
    scanCopyBarcode: "2. Kitob shtrix-kodini skanerlang",
    scanBarcodePlaceholder: "Kitob shtrix-kodini kiriting (masalan, BC-GATSBY-01)...",
    setLoanPeriod: "3. Ijara muddatini belgilang",
    confirmCheckout: "Kitob berilishini tasdiqlash",
    scanToReturn: "Qaytarish uchun shtrix-kodni skanerlang",
    confirmReturn: "Qaytarishni rasmiylashtirish",
    conditionOnReturn: "Qaytarilgan holati",

    // Admin & Moderation
    userManagement: "Foydalanuvchilar boshqaruvi",
    livePatronPresence: "Onlayn kitobxonlar",
    patronPresenceSubtitle: "Platformada faol talabalar va kutubxona xodimlari.",
    feedbackModeration: "Sharhlar moderatsiyasi",
    totalReviews: "Jami sharhlar",
    publishedPublic: "Chop etilgan (Ommaviy)",
    moderatedHidden: "Moderatsiya qilingan (Yashirin)",
    systemAvgRating: "Tizim o'rtacha bahosi",
    hideReview: "Sharhni yashirish",
    publishReview: "Sharhni ko'rsatish",
    deleteReview: "Sharhni o'chirish",
    analytics: "Tahlil & Statistika",
    timeframe30d: "Oxirgi 30 kun",
    timeframe90d: "Oxirgi 90 kun",
    timeframe6m: "Oxirgi 6 oy",
    timeframe1y: "Oxirgi 1 yil",
    timeframeAll: "Barcha vaqt",
    manageUsers: "Foydalanuvchilarni boshqarish",
    manageReviews: "Sharhlarni boshqarish",
    viewAnalytics: "Tahlillarni ko'rish",

    // Landing Page
    heroTitle: "Yagona Maktab Kutubxonasini Boshqarish Tizimi",
    heroSubtitle: "Kitob qidirish, band qilish, tezkor ijara va to'liq fond nazoratini zamonaviy tarzda boshqaring.",
    exploreCatalogBtn: "Kitoblar katalogini ko'rish",
    faqSectionTitle: "Ko'p Beriladigan Savollar",
    faqSectionSubtitle: "Kitob ijarasi, band qilish qoidalari yoki tizimdan foydalanish bo'yicha savollaringiz bormi? Mana javoblar.",
  },
  ru: {
    // Navigation & App Shell
    discover: "Каталог",
    myLibrary: "Моя библиотека",
    myLoans: "Мои книги",
    holds: "Брони",
    myHolds: "Мои бронирования",
    manageBooks: "Управление книгами",
    circulation: "Циркуляция",
    circulationDesk: "Стойка выдачи",
    adminConsole: "Панель администратора",
    deskAndStaff: "Стойка & Персонал",
    management: "Управление",
    preferences: "Настройки",
    signOut: "Выйти",
    signIn: "Войти",
    signUp: "Регистрация",
    patron: "Читатель",
    student: "Студент",
    assistant: "Ассистент",
    admin: "Администратор",
    notifications: "Уведомления",

    // Catalog & Search
    catalog: "Каталог",
    searchPlaceholder: "Поиск любимых книг...",
    searchCatalogTypo: "Поиск по названию, автору или ISBN...",
    filterTheme: "Фильтр тем",
    filterByCategory: "Фильтр по категориям",
    searchThemes: "Поиск тем...",
    searchCategories: "Поиск категорий...",
    allCategories: "Все категории",
    sortBy: "Сортировка",
    newest: "Сначала новые",
    ratingHigh: "Рейтинг: по убыванию",
    titleAsc: "Название: А - Я",
    titleDesc: "Название: Я - А",
    reset: "Сбросить",
    activeFilters: "Активные фильтры",
    selectAnyBook: "Выберите книгу",
    clickBookToInspect: "Нажмите на карточку книги для просмотра и бронирования.",
    reserveBook: "Забронировать",
    placingHold: "Бронирование...",
    onLoan: "На руках",
    availableOnShelf: "На полке",
    reviews: "отзывов",
    pages: "стр.",
    category: "Категория",
    isbn: "ISBN",
    viewDetails: "Подробнее",
    noBooksFound: "Книги не найдены",
    noBooksFoundSubtitle: "Попробуйте изменить поисковый запрос или фильтры.",

    // Book Detail View
    backToCatalog: "Назад в каталог",
    bookOverview: "Краткое содержание",
    inventorySummary: "Экземпляры книги",
    totalCopies: "Всего копий",
    availableCopies: "Доступно",
    reservedCopies: "В брони",
    borrowedCopies: "Выдано",
    maintenanceCopies: "В ремонте",
    reviewsAndRatings: "Отзывы читателей",
    leaveReview: "Оставить отзыв",
    verifiedBorrower: "Проверенный читатель",
    noReviewsYet: "К этой книге пока нет отзывов.",
    beFirstToReview: "Возьмите и прочитайте эту книгу, чтобы оставить первый отзыв!",
    ratingOutOf5: "из 5 звезд",
    setHoldDuration: "Срок и дата бронирования",
    chooseHoldDuration: "Выберите, на сколько дней забронировать книгу для самовывоза (макс. 7 дней).",
    confirmHoldRequest: "Подтвердить бронь",
    cancel: "Отмена",
    confirm: "Подтвердить",
    day: "День",
    days: "Дней",
    defaultPreset: "(По умолч.)",

    // Holds Page
    activeHoldCount: "Активные брони",
    expirationDate: "Срок самовывоза",
    cancelHold: "Отменить бронь",
    cancellingHold: "Отмена...",
    holdPending: "Ожидает выдачи",
    holdFulfilled: "Выдано на руки",
    holdExpired: "Срок истек",
    holdCancelled: "Отменено",
    noActiveHolds: "Нет активных бронирований.",

    // Loans Page
    activeLoans: "Текущие выдачи",
    returnedLoans: "История возвратов",
    dueDate: "Срок возврата",
    borrowedDate: "Дата выдачи",
    renewLoan: "Продлить срок",
    renewing: "Продление...",
    overdue: "Просрочено",
    onTime: "Вовремя",
    daysLeft: "дн. осталось",
    daysOverdue: "дн. просрочки",
    noActiveLoans: "В данный момент у вас нет книг на руках.",

    // Circulation Desk
    rapidCheckout: "Быстрая выдача",
    rapidCheckin: "Быстрый прием",
    holdsQueue: "Очередь броней",
    overdueCopies: "Просроченные",
    studentBorrower: "1. Студент-читатель",
    searchStudent: "Поиск по имени, email или ID студента...",
    scanCopyBarcode: "2. Штрих-код экземпляра",
    scanBarcodePlaceholder: "Введите или сканируйте штрих-код (напр., BC-GATSBY-01)...",
    setLoanPeriod: "3. Срок выдачи",
    confirmCheckout: "Подтвердить выдачу",
    scanToReturn: "Сканируйте штрих-код для возврата",
    confirmReturn: "Оформить возврат",
    conditionOnReturn: "Состояние при возврате",

    // Admin & Moderation
    userManagement: "Управление пользователями",
    livePatronPresence: "Онлайн читатели",
    patronPresenceSubtitle: "Студенты и сотрудники, активные на платформе.",
    feedbackModeration: "Модерация отзывов",
    totalReviews: "Всего отзывов",
    publishedPublic: "Опубликовано (Открыто)",
    moderatedHidden: "Скрыто модератором",
    systemAvgRating: "Средний рейтинг системы",
    hideReview: "Скрыть отзыв",
    publishReview: "Опубликовать",
    deleteReview: "Удалить отзыв",
    analytics: "Аналитика",
    timeframe30d: "Последние 30 дней",
    timeframe90d: "Последние 90 дней",
    timeframe6m: "Последние 6 месяцев",
    timeframe1y: "Последний 1 год",
    timeframeAll: "За все время",
    manageUsers: "Пользователи и роли",
    manageReviews: "Модерация отзывов",
    viewAnalytics: "Открыть аналитику",

    // Landing Page
    heroTitle: "Единая Платформа Управления Школьной Библиотекой",
    heroSubtitle: "Быстрый поиск книг, онлайн-бронирование, мгновенная выдача и точный учет фонда в реальном времени.",
    exploreCatalogBtn: "Открыть каталог книг",
    faqSectionTitle: "Часто Задаваемые Вопросы",
    faqSectionSubtitle: "Ответы на популярные вопросы о правилах выдачи, бронировании и работе с библиотекой.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_KEY = "shelfsync_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Language;
    if (saved && (saved === "en" || saved === "uz" || saved === "ru")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANG_KEY, lang);
  };

  const t = (key: string, fallback?: string): string => {
    return translations[language]?.[key] || fallback || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
