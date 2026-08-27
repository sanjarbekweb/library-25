"use client";

import { useRef } from "react";
import { HelpCircle, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@/components/animate-ui/components/headless/accordion";
import { useLanguage } from "@/components/providers/language-provider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const FAQS_EN = [
  {
    question: "How do online book holds and circulation desk pickups work?",
    answer:
      "Students can browse the catalog and place an instant hold on any available copy for 1 to 7 days. When you arrive at the library circulation desk, the assistant scans your student ID or copy barcode for a rapid sub-10s handover.",
  },
  {
    question: "What is the standard borrowing duration and renewal policy?",
    answer:
      "Standard loans are granted for 14 days. You can track due dates in real-time under My Loans and request renewals before the return deadline directly from your student portal.",
  },
  {
    question: "How does the typo-tolerant search engine work?",
    answer:
      "libra25 is powered by high-speed search indexers that match queries across book titles, authors, ISBNs, and categories even with minor misspellings or partial words.",
  },
  {
    question: "How are staff and assistant permissions managed?",
    answer:
      "The platform features role-based access control (RBAC). Administrators can elevate student librarians to Assistant status to grant access to the rapid circulation desk and inventory management.",
  },
  {
    question: "Can students submit book reviews and ratings?",
    answer:
      "Yes! Verified students who have borrowed and returned a physical book can rate the title 1–5 stars and leave helpful feedback to guide fellow campus readers.",
  },
];

const FAQS_UZ = [
  {
    question: "Onlayn kitob band qilish va kutubxonadan olib ketish qanday ishlaydi?",
    answer:
      "Talabalar katalogni ko'rib, mavjud kitobni 1 kundan 7 kungacha tezkor band qilishlari mumkin. Kutubxona ijara stoliga kelganda, xodim talaba kartasi yoki kitob shtrix-kodini skanerlab, 10 soniyada topshiradi.",
  },
  {
    question: "Kitob ijarasi muddati va uni uzaytirish qanday amalga oshiriladi?",
    answer:
      "Standart ijara muddati 14 kun. 'Ijara kitoblarim' bo'limida qaytarish muddatini real vaqtda kuzatishingiz va muddat tugashidan oldin to'g'ridan-to'g'ri portal orqali uzaytirishingiz mumkin.",
  },
  {
    question: "Xatolikka chidamli qidiruv tizimi qanday ishlaydi?",
    answer:
      "libra25 tezkor qidiruv indeksi orqali kitob nomi, muallifi, ISBN va turkumi bo'yicha hatto imloviy xatolar bilan kiritilganda ham eng to'g'ri natijalarni topib beradi.",
  },
  {
    question: "Xodimlar va yordamchilar huquqlari qanday boshqariladi?",
    answer:
      "Tizim rollarga asoslangan kirish nazorati (RBAC) bilan ishlaydi. Ma'murlar talabalarga tezkor ijara stoli va kitob fondini boshqarish uchun Yordamchi maqomini berishlari mumkin.",
  },
  {
    question: "Talabalar kitobga sharh va baho qoldira oladimi?",
    answer:
      "Ha! Kitobni olib, qaytargan har bir talaba kitobga 1–5 yulduzcha baho berib, boshqa kitobxonlar uchun foydali sharh qoldirishi mumkin.",
  },
];

const FAQS_RU = [
  {
    question: "Как работает онлайн-бронирование и выдача на стойке библиотеки?",
    answer:
      "Студенты могут найти книгу в каталоге и забронировать ее на срок от 1 до 7 дней. На стойке выдачи ассистент сканирует студенческий билет или штрих-код книги за 10 секунд.",
  },
  {
    question: "Каковы стандартные сроки выдачи и правила продления?",
    answer:
      "Стандартный срок аренды — 14 дней. Вы можете отслеживать сроки в реальном времени в разделе 'Мои книги' и продлевать книги до наступления дедлайна.",
  },
  {
    question: "Как работает поиск с защитой от опечаток?",
    answer:
      "Поисковая система libra25 сопоставляет запросы по названию, автору, ISBN и категориям даже при наличии опечаток или неполных слов.",
  },
  {
    question: "Как распределяются права персонала и библиотекарей?",
    answer:
      "Платформа использует ролевой доступ (RBAC). Администраторы могут назначать студентов на роль Ассистента для доступа к стойке выдачи и фонду.",
  },
  {
    question: "Могут ли студенты оставлять отзывы и оценки?",
    answer:
      "Да! Проверенные читатели, которые взяли и вернули книгу, могут поставить оценку от 1 до 5 звезд и оставить полезный отзыв.",
  },
];

export function LandingFaq() {
  const { language } = useLanguage();
  const faqs = language === "uz" ? FAQS_UZ : language === "ru" ? FAQS_RU : FAQS_EN;
  const sectionRef = useRef<HTMLElement>(null);

  const badgeText = language === "uz" ? "Ko'p Beriladigan Savollar" : language === "ru" ? "Часто задаваемые вопросы" : "Frequently Asked Questions";
  const sectionTitle = language === "uz" ? "Barcha Muhim Savollarga Javoblar" : language === "ru" ? "Все, что вам нужно знать" : "Everything You Need to Know";
  const sectionSubtitle = language === "uz"
    ? "Kitob ijarasi, band qilish qoidalari yoki tizimdan foydalanish bo'yicha savollaringiz bormi? Mana javoblar."
    : language === "ru"
    ? "Ответы на популярные вопросы о правилах выдачи, бронировании и работе с библиотекой."
    : "Got questions about borrowing policies, circulation desk workflows, or account management? Here are the answers.";

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { reduceMotion } = context.conditions as { reduceMotion: boolean };

          if (reduceMotion) {
            gsap.set([".faq-header", ".faq-card"], {
              autoAlpha: 1,
              y: 0,
            });
            return;
          }

          gsap.from(".faq-header", {
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 82%",
              toggleActions: "play none none none",
            },
            autoAlpha: 0,
            y: 30,
            duration: 0.8,
            ease: "power3.out",
          });

          gsap.from(".faq-card", {
            scrollTrigger: {
              trigger: ".faq-card",
              start: "top 85%",
              toggleActions: "play none none none",
            },
            autoAlpha: 0,
            y: 35,
            duration: 0.8,
            ease: "power3.out",
          });
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="py-20 bg-slate-50/70 dark:bg-zinc-950/60 border-b border-border/80 overflow-hidden"
    >
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="faq-header text-center space-y-3 will-change-transform">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
            <Sparkles className="h-3.5 w-3.5" />
            {badgeText}
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">
            {sectionTitle}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        {/* Headless Animated Accordion */}
        <div className="faq-card rounded-3xl border border-border/90 bg-card p-6 sm:p-8 shadow-xs will-change-transform">
          <Accordion className="divide-y divide-border/60">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} className="py-2 first:pt-0 last:pb-0">
                <AccordionButton className="text-left font-bold font-display text-sm sm:text-base text-foreground hover:text-brand-blue transition-colors py-3 hover:no-underline cursor-pointer">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-4 w-4 text-brand-blue shrink-0" />
                    <span>{faq.question}</span>
                  </div>
                </AccordionButton>
                <AccordionPanel className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-7 pb-3">
                  {faq.answer}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
