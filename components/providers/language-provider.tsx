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
    product: "Product",
    features: "Features",
    pricing: "Pricing",
    resources: "Resources",
    holds: "Holds",
    loans: "Loans",
    circulation: "Circulation",
    manageBooks: "Books",
    adminConsole: "Admin",
    catalog: "Catalog",
    searchPlaceholder: "Search catalog by title, author, or category...",
    topDemand: "Top Demand Reads",
    featuredBooks: "Featured Library Books",
    featuredSubtitle: "Student favorites & popular titles",
    browseCatalog: "Browse Full Catalog",
    viewTitle: "View Title & Reserve",
    available: "Available",
    onHold: "On Hold",
    allCategories: "All Categories",
    sortBy: "Sort by",
    newest: "Newest Arrivals",
    ratingHigh: "Rating: High to Low",
    titleAsc: "Title: A to Z",
    titleDesc: "Title: Z to A",
    viewAllResults: "View all results in main catalog →",
    noBooksFound: "No Matching Titles Found",
    heroTitle: "Modern School Library Management Engine",
    heroSubtitle: "Empower students, librarians, and administrators with instant search, automated circulation desk workflows, and real-time inventory tracking.",
    exploreCatalogBtn: "Explore Book Catalog",
    requestDemoBtn: "Request a Demo",
  },
  uz: {
    product: "Mahsulot",
    features: "Imkoniyatlar",
    pricing: "Tariflar",
    resources: "Manbalar",
    holds: "Band Qilinganlar",
    loans: "Ijara Kitoblar",
    circulation: "Aylanma Bo'limi",
    manageBooks: "Kitoblar",
    adminConsole: "Admin",
    catalog: "Katalog",
    searchPlaceholder: "Katalogdan nomi, muallifi yoki turkumini qidiring...",
    topDemand: "Ommabop Kitoblar",
    featuredBooks: "Tanlangan Kutubxona Kitoblari",
    featuredSubtitle: "Talabalar yoqtirgan va mashhur asarlar",
    browseCatalog: "To'liq Katalogni Ko'rish",
    viewTitle: "Ko'rish va Band Qilish",
    available: "Mavjud",
    onHold: "Band Qilingan",
    allCategories: "Barcha Turkumlar",
    sortBy: "Saralash",
    newest: "Eng Yangilari",
    ratingHigh: "Baho: Yuqoridan Pastga",
    titleAsc: "Nomi: A dan Z gacha",
    titleDesc: "Nomi: Z dan A gacha",
    viewAllResults: "Katalogda barcha natijalarni ko'rish →",
    noBooksFound: "Mos keladigan kitoblar topilmadi",
    heroTitle: "Zamonaviy Maktab Kutubxonasini Boshqarish Tizimi",
    heroSubtitle: "O'quvchilar, kutubyunachilar va ma'murlar uchun tezkor qidiruv, avtomatlashtirilgan ijara tizimi va real vaqtdagi kitob hisobi.",
    exploreCatalogBtn: "Kitoblar Katalogini Ko'rish",
    requestDemoBtn: "Demo So'rash",
  },
  ru: {
    product: "Продукт",
    features: "Возможности",
    pricing: "Тарифы",
    resources: "Ресурсы",
    holds: "Брони",
    loans: "Выдачи",
    circulation: "Циркуляция",
    manageBooks: "Книги",
    adminConsole: "Админ",
    catalog: "Каталог",
    searchPlaceholder: "Поиск книг по названию, автору или категории...",
    topDemand: "Популярные Книги",
    featuredBooks: "Рекомендуемые Книги Библиотеки",
    featuredSubtitle: "Избранное читателей и популярные издания",
    browseCatalog: "Весь Каталог",
    viewTitle: "Просмотр и Бронь",
    available: "В наличии",
    onHold: "Забронировано",
    allCategories: "Все Категории",
    sortBy: "Сортировка",
    newest: "Сначала Новые",
    ratingHigh: "Рейтинг: Высокий",
    titleAsc: "Название: А - Я",
    titleDesc: "Название: Я - А",
    viewAllResults: "Посмотреть все результаты в каталоге →",
    noBooksFound: "Книги не найдены",
    heroTitle: "Современная Система Управления Школьной Библиотекой",
    heroSubtitle: "Удобный поиск, автоматизированный учет выдачи и отслеживание книжного фонда в реальном времени.",
    exploreCatalogBtn: "Открыть Каталог Книг",
    requestDemoBtn: "Запросить Демо",
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
