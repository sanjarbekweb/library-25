import fs from "node:fs";
import path from "node:path";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const projectRoot = process.cwd();
const screenshotDir = path.join(projectRoot, "project-documentation-screenshots");
const outputPath = path.join(projectRoot, "Libra25_loyiha_taqdimoti_Sanjarbek_Saminjonov.docx");

const COLORS = {
  blue: "246BFD",
  darkBlue: "173A7A",
  paleBlue: "EAF2FF",
  yellow: "F6C344",
  ink: "172033",
  muted: "596579",
  line: "DCE3EE",
  soft: "F7F9FC",
  white: "FFFFFF",
};

const image = (fileName: string, width = 610, height = 344): Paragraph =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 100 },
    children: [
      new ImageRun({
        data: fs.readFileSync(path.join(screenshotDir, fileName)),
        transformation: { width, height },
        type: "png",
      }),
    ],
  });

const caption = (text: string): Paragraph =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [
      new TextRun({ text, italics: true, color: COLORS.muted, size: 19 }),
    ],
  });

const pageBreak = (): Paragraph => new Paragraph({ children: [new PageBreak()] });

const body = (text: string): Paragraph =>
  new Paragraph({
    spacing: { after: 150, line: 300 },
    children: [new TextRun({ text, size: 23, color: COLORS.ink })],
  });

const bullet = (text: string): Paragraph =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 110, line: 280 },
    children: [new TextRun({ text, size: 22, color: COLORS.ink })],
  });

const step = (number: number, title: string, description: string): Table =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 90, bottom: 90, left: 120, right: 120 },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            shading: { fill: COLORS.blue, type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL },
              left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL },
            },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: String(number), bold: true, color: COLORS.white, size: 24 })],
            })],
          }),
          new TableCell({
            width: { size: 90, type: WidthType.PERCENTAGE },
            shading: { fill: COLORS.soft, type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.SINGLE, color: COLORS.line, size: 4 },
              bottom: { style: BorderStyle.SINGLE, color: COLORS.line, size: 4 },
              left: { style: BorderStyle.NIL },
              right: { style: BorderStyle.SINGLE, color: COLORS.line, size: 4 },
            },
            children: [new Paragraph({
              spacing: { after: 50 },
              children: [
                new TextRun({ text: `${title}. `, bold: true, size: 22, color: COLORS.ink }),
                new TextRun({ text: description, size: 22, color: COLORS.muted }),
              ],
            })],
          }),
        ],
      }),
    ],
  });

const callout = (title: string, text: string): Table =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 160, bottom: 160, left: 190, right: 190 },
    rows: [new TableRow({ children: [new TableCell({
      shading: { fill: COLORS.paleBlue, type: ShadingType.CLEAR },
      borders: {
        top: { style: BorderStyle.SINGLE, color: "B9D1FF", size: 6 },
        bottom: { style: BorderStyle.SINGLE, color: "B9D1FF", size: 6 },
        left: { style: BorderStyle.SINGLE, color: COLORS.blue, size: 18 },
        right: { style: BorderStyle.SINGLE, color: "B9D1FF", size: 6 },
      },
      children: [
        new Paragraph({ children: [new TextRun({ text: title, bold: true, color: COLORS.darkBlue, size: 23 })] }),
        new Paragraph({ spacing: { before: 70 }, children: [new TextRun({ text, color: COLORS.ink, size: 21 })] }),
      ],
    })] })],
  });

const sectionTitle = (text: string): Paragraph =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 100, after: 220 },
    children: [new TextRun({ text, bold: true, color: COLORS.ink, size: 34 })],
  });

const subTitle = (text: string): Paragraph =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 190, after: 100 },
    children: [new TextRun({ text, bold: true, color: COLORS.darkBlue, size: 27 })],
  });

const doc = new Document({
  creator: "Saminjonov Sanjarbek",
  title: "Libra25 — maktab kutubxonasini raqamli boshqarish platformasi",
  description: "Bag‘dod tumani 25-maktab o‘quvchisi Saminjonov Sanjarbekning loyiha tushuntirishi",
  styles: {
    default: { document: { run: { font: "Aptos", size: 22, color: COLORS.ink } } },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font: "Aptos Display", size: 34, bold: true, color: COLORS.ink },
        paragraph: { spacing: { before: 260, after: 160 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font: "Aptos Display", size: 27, bold: true, color: COLORS.darkBlue },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 },
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 720, right: 720, bottom: 720, left: 720 },
      },
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "LIBRA25  •  RAQAMLI KUTUBXONA", bold: true, size: 17, color: COLORS.blue })],
      })] }),
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Saminjonov Sanjarbek  |  Bag‘dod tumani 25-maktab  •  ", size: 17, color: COLORS.muted }),
          new TextRun({ children: [PageNumber.CURRENT], size: 17, color: COLORS.muted }),
        ],
      })] }),
    },
    children: [
      new Paragraph({ spacing: { before: 520, after: 120 }, children: [new TextRun({ text: "25-MAKTAB UCHUN RAQAMLI YECHIM", bold: true, color: COLORS.blue, size: 21 })] }),
      new Paragraph({ spacing: { after: 130 }, children: [new TextRun({ text: "LIBRA25", bold: true, color: COLORS.ink, size: 62, font: "Aptos Display" })] }),
      new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: "Maktab kutubxonasini raqamli boshqarish platformasi", bold: true, color: COLORS.darkBlue, size: 34 })] }),
      body("Loyiha qanday ishlaydi, o‘quvchi va kutubxonachiga qanday qulaylik beradi — sodda va tushunarli qo‘llanma."),
      image("01-bosh-sahifa.png", 590, 332),
      new Paragraph({ spacing: { before: 180 }, children: [new TextRun({ text: "Loyiha muallifi:", bold: true, size: 22, color: COLORS.muted })] }),
      new Paragraph({ spacing: { after: 70 }, children: [new TextRun({ text: "Saminjonov Sanjarbek", bold: true, size: 29, color: COLORS.ink })] }),
      new Paragraph({ children: [new TextRun({ text: "Bag‘dod tumani 25-maktab o‘quvchisi", size: 22, color: COLORS.muted })] }),

      pageBreak(),
      sectionTitle("1. Nega men bu loyihani qurdim?"),
      body("Men — Bag‘dod tumani 25-maktab o‘quvchisi Saminjonov Sanjarbek. Maktab kutubxonasidagi kitoblar, o‘quvchilar va kitob berish-qaytarish jarayonini bitta zamonaviy tizimga jamlash maqsadida Libra25 raqamli kutubxona platformasini yaratdim."),
      body("Oddiy daftar yoki tarqoq fayllar bilan ishlaganda kitob qayerda ekani, kim olgani, qachon qaytarishi va nechta nusxa qolganini tez topish qiyin bo‘lishi mumkin. Men shu muammoni sodda sayt orqali hal qilishni xohladim."),
      callout("Loyihaning asosiy g‘oyasi", "Kutubxonachi vaqtini tejash, o‘quvchiga kerakli kitobni tez topish imkonini berish va maktabdagi barcha kitoblar uchun tartibli elektron baza yaratish."),
      subTitle("Platformaning afzalliklari"),
      bullet("Barcha kitoblar bitta elektron katalogda saqlanadi."),
      bullet("O‘quvchi kitob bor-yo‘qligini sayt orqali tekshiradi va oldindan band qiladi."),
      bullet("Kutubxonachi kitob berish va qaytarishni tez rasmiylashtiradi."),
      bullet("Har bir nusxaning holati, shtrix-kodi va harakat tarixi ko‘rinadi."),
      bullet("O‘quvchilar kitobga baho va izoh qoldirib, boshqalarga tanlashda yordam beradi."),
      bullet("Administrator real statistika orqali fond holati va kitobxonlik faolligini kuzatadi."),

      pageBreak(),
      sectionTitle("2. Platforma qanday ishlaydi?"),
      body("Libra25 jismoniy kitoblarni boshqaradi. Ya’ni bu saytdan elektron kitob yuklab olinmaydi. O‘quvchi saytda kitobni topadi va band qiladi, keyin maktab kutubxonasidan kitobning haqiqiy nusxasini olib ketadi."),
      step(1, "Kitobni topish", "O‘quvchi katalogdan nomi, muallifi yoki yo‘nalishi bo‘yicha qidiradi."),
      step(2, "Band qilish", "Mavjud nusxa bo‘lsa, o‘quvchi uni belgilangan muddatga band qiladi."),
      step(3, "Kutubxonadan olish", "Kutubxonachi o‘quvchini va kitob nusxasini tekshirib, berishni tasdiqlaydi."),
      step(4, "Muddatni kuzatish", "Kitob o‘quvchining shaxsiy bo‘limida qaytarish sanasi bilan ko‘rinadi."),
      step(5, "Qaytarish va izoh", "Kutubxonachi qaytarishni qayd etadi, o‘quvchi esa kitobga baho va fikr yozishi mumkin."),
      subTitle("Uch xil foydalanuvchi roli"),
      bullet("O‘quvchi: katalog, band qilish, o‘z kitoblari va izohlar."),
      bullet("Kutubxonachi: kitoblar bazasi, yangi nusxa qo‘shish, kitob berish va qaytarish."),
      bullet("Administrator: izohlarni nazorat qilish, foydalanuvchi rollari va analitika."),

      pageBreak(),
      sectionTitle("3. Katalog — barcha kitoblarni ko‘rish"),
      body("Katalog — o‘quvchi uchun asosiy bo‘lim. Bu yerda barcha kitoblar muqovasi, nomi va muallifi bilan ko‘rinadi. Kategoriyalar orqali, masalan, adabiyot, tarix, matematika, kompyuter texnologiyalari yoki tabiiy fanlar bo‘yicha saralash mumkin."),
      image("02-katalog.png"),
      caption("1-rasm. Katalog: qidiruv, kategoriyalar va kitoblar ro‘yxati."),
      bullet("Qidiruv nom, muallif yoki ISBN bo‘yicha ishlaydi."),
      bullet("Xato yozilgan so‘zga yaqin natijani topishga moslashtirilgan."),
      bullet("Har bir kitob kartasini bosib, batafsil ma’lumotga o‘tiladi."),

      pageBreak(),
      sectionTitle("4. Kitobni tanlash va band qilish"),
      body("Kitob sahifasida muallif, tavsif, kategoriya, ISBN, nashr yili va mavjud nusxalar soni ko‘rsatiladi. Masalan, ekranda jami 6 nusxadan 4 tasi mavjud, 1 tasi band qilingan va 1 tasi o‘quvchida ekanini ko‘rish mumkin."),
      image("03-kitob-va-band-qilish.png"),
      caption("2-rasm. Kitob tafsilotlari va “Reserve Book” — kitobni band qilish tugmasi."),
      step(1, "Band qilish tugmasi", "O‘quvchi “Reserve Book” tugmasini bosadi."),
      step(2, "Muddatni tanlash", "Tizim ruxsat bergan vaqt oralig‘idan band qilish muddatini belgilaydi."),
      step(3, "Tasdiq", "Bo‘sh nusxa o‘quvchi nomiga saqlanadi va “Holds” bo‘limida paydo bo‘ladi."),
      callout("Muhim", "Band qilish kitobni avtomatik uyga berildi degani emas. O‘quvchi kutubxonaga keladi, kutubxonachi shaxsni va nusxani tekshirgandan keyin kitob beriladi."),

      pageBreak(),
      sectionTitle("5. Kitob haqida baho va izoh qoldirish"),
      body("O‘quvchi kitobni o‘qib bo‘lgach, 1 dan 5 gacha yulduzcha bilan baholaydi va qisqa fikr yozadi. Bu boshqa o‘quvchilarga kitob tanlashda yordam beradi."),
      image("04-kitob-izohlari.png"),
      caption("3-rasm. Umumiy reyting va o‘quvchilar yozgan izohlar."),
      bullet("Qaytarilgan kitob bo‘yicha yozilgan fikr “tasdiqlangan o‘qish” sifatida ko‘rsatilishi mumkin."),
      bullet("O‘rtacha baho barcha ko‘rinadigan izohlardan hisoblanadi."),
      bullet("Nojo‘ya yoki mavzuga aloqasiz izohni administrator yashirishi yoki o‘chirishi mumkin."),

      pageBreak(),
      sectionTitle("6. “Mening kitoblarim” — o‘quvchining shaxsiy to‘plami"),
      body("Bu bo‘limda o‘quvchi hozir qo‘lida turgan kitoblar, kechiktirilgan kitoblar, avval qaytargan kitoblar va jami olgan kitoblar sonini ko‘radi. Shaxsiy tarix o‘quvchiga o‘z mas’uliyatini nazorat qilishni osonlashtiradi."),
      image("05-mening-kitoblarim.png"),
      caption("4-rasm. Faol kitoblar, kechikishlar va qaytarilgan kitoblar tarixi."),
      bullet("Active Loans — hozir o‘quvchida turgan kitoblar."),
      bullet("Overdue — qaytarish muddati o‘tgan kitoblar."),
      bullet("Past Returns — kutubxonaga qaytarilgan kitoblar tarixi."),
      bullet("Total Borrowed — o‘quvchi shu paytgacha olgan kitoblar soni."),

      pageBreak(),
      sectionTitle("7. Barcha kitoblar va nusxalarni boshqarish"),
      body("“Manage Books” bo‘limi kutubxonachi va administrator uchun mo‘ljallangan. Unda kitob nomi, muallifi, kategoriya, ISBN, jami nusxa, bo‘sh nusxa va o‘quvchida turgan nusxalar bir jadvalda ko‘rinadi."),
      image("07-barcha-kitoblar-boshqaruvi.png"),
      caption("5-rasm. Elektron kitob fondi va har bir nom bo‘yicha nusxalar holati."),
      bullet("Yangi kitob nomini va ma’lumotlarini bazaga qo‘shish mumkin."),
      bullet("Bir kitobning bir nechta jismoniy nusxasi alohida shtrix-kod bilan yuritiladi."),
      bullet("Nusxaning holati: mavjud, band qilingan, o‘quvchida, ta’mirda yoki yo‘qolgan."),
      bullet("Qidiruv va kategoriya filtri katta fond bilan ham tez ishlashga yordam beradi."),

      pageBreak(),
      sectionTitle("8. Kitob aylanishi — berish va qaytarish jarayoni"),
      body("“Circulation Desk” kutubxonachining kundalik ish joyi hisoblanadi. Sahifaning yuqori qismida faol kitoblar, kutilayotgan bandlar, kechiktirilgan kitoblar va bo‘sh nusxalar soni qisqa ko‘rsatkichlarda turadi. Ish jarayoni esa beshta alohida bo‘limga ajratilgan."),
      image("11-circulation-rapid-checkout.png"),
      caption("6-rasm. Circulation Desk va Rapid Checkout — kitobni tez berish bo‘limi."),
      subTitle("1) Rapid Checkout — kitobni tez berish"),
      body("Kutubxonachi avval o‘quvchini ism yoki hisob orqali topadi. Keyin kitob nusxasining shtrix-kodini kiritadi yoki skanerlaydi, qaytarish muddatini belgilaydi va berishni tasdiqlaydi. Tizim nusxa bo‘shligini qayta tekshiradi va uni o‘quvchi hisobiga biriktiradi."),
      subTitle("2) Rapid Check-in — qaytarilgan kitobni qabul qilish"),
      body("Qaytarilgan nusxaning shtrix-kodi topiladi. Kutubxonachi kitob holatini MINT, GOOD, FAIR yoki DAMAGED sifatida belgilaydi. Zarur bo‘lsa ta’mirlash holatiga o‘tkazadi va qisqa izoh yozadi. Tasdiqlangach, o‘quvchining faol qarzi yopiladi."),
      subTitle("3) Holds Queue — band qilingan kitoblar navbati"),
      body("Sayt orqali band qilingan kitoblar shu ro‘yxatda turadi. Jadvalda kitob nomi, o‘quvchi, ajratilgan shtrix-kod va bandning tugash vaqti ko‘rinadi. O‘quvchi kelganda “Fulfill Checkout” orqali ma’lumotlar kitob berish oynasiga avtomatik o‘tkaziladi."),
      subTitle("4) Active Loans — hozir o‘quvchilarda turgan kitoblar"),
      body("Bu bo‘lim kitob shtrix-kodi, nomi, o‘quvchi, olingan sana va qaytarish muddatini bir joyda ko‘rsatadi. Muddat o‘tgan kitoblar alohida ajratiladi. “Return Check-in” tugmasi kerakli nusxani qaytarish bo‘limiga olib o‘tadi."),
      subTitle("5) History — nusxaning to‘liq harakat tarixi"),
      body("Shtrix-kod bo‘yicha har bir jismoniy nusxaning yaratilishi, band qilinishi, kimga berilgani, qachon qaytarilgani va holati qanday o‘zgargani tekshiriladi. Har bir harakat uni bajargan mas’ul foydalanuvchi bilan saqlanadi."),
      subTitle("Oddiy berish-qaytarish ketma-ketligi"),
      step(1, "O‘quvchini topish", "Ism yoki hisob orqali kerakli o‘quvchi tanlanadi."),
      step(2, "Nusxani tekshirish", "Kitobning shtrix-kodi va hozirgi holati tekshiriladi."),
      step(3, "Berishni tasdiqlash", "Qaytarish sanasi belgilanadi va kitob o‘quvchi hisobiga biriktiriladi."),
      step(4, "Qaytarib olish", "Kutubxonachi nusxaning jismoniy holatini ko‘radi va qaytarishni qayd etadi."),
      step(5, "Tarixni saqlash", "Har bir berish, qaytarish va holat o‘zgarishi kim bajargani bilan tarixga yoziladi."),
      callout("Natija", "Kutubxonachi kimda qaysi kitob borligini daftar varaqlamasdan ko‘radi. O‘quvchi esa qaytarish muddatini unutib qo‘ymaydi."),

      pageBreak(),
      sectionTitle("9. Administrator paneli — 3 ta aniq bo‘lim"),
      body("Administrator paneli kundalik nazoratni uchta mustaqil yo‘nalishga ajratadi. Bu tuzilma mas’ul shaxsga kerakli ma’lumotni tez topish va chalkashliksiz boshqarish imkonini beradi."),
      image("06-admin-uch-bolim.png"),
      caption("7-rasm. Administrator panelining uchta asosiy bo‘limi."),
      subTitle("1) Izoh va baholarni nazorat qilish"),
      body("O‘quvchilar yozgan 1–5 yulduzli baholar va kommentlar ko‘riladi. Mavzuga to‘g‘ri kelmaydigan yoki odobga zid izohlar yashiriladi yoki o‘chiriladi."),
      subTitle("2) Foydalanuvchi va rollarni boshqarish"),
      body("Ro‘yxatdan o‘tgan foydalanuvchilar ko‘riladi. Oddiy o‘quvchiga kutubxonachi yoki administrator vakolati faqat mas’ul shaxs tomonidan beriladi. Zarur bo‘lsa hisob vaqtincha faolsizlantiriladi."),
      subTitle("3) Kitob aylanishi va rivojlanish analitikasi"),
      body("Qancha kitob borligi, nechta nusxa bo‘shligi, eng ko‘p o‘qilayotgan yo‘nalishlar, faol kitobxonlar va kechikishlar statistikasi ko‘rsatiladi."),

      pageBreak(),
      sectionTitle("10. Foydalanuvchilar va rollarni boshqarish"),
      body("“User Management” sahifasi tizimda kimlar borligini va ularga qanday vakolat berilganini ko‘rsatadi. Yuqoridagi kartalarda jami foydalanuvchilar, o‘quvchilar, kutubxonachilar, administratorlar va faolsizlantirilgan hisoblar soni chiqadi."),
      image("09-users-full.png"),
      caption("8-rasm. Users & Role Management bo‘limining to‘liq ekran ko‘rinishi."),
      subTitle("O‘quvchi — Student"),
      body("Katalogdan foydalanadi, kitob band qiladi, o‘z kitoblari va qaytarish muddatlarini ko‘radi hamda izoh qoldiradi. Boshqa foydalanuvchilar yoki fond ma’lumotlarini o‘zgartira olmaydi."),
      subTitle("Kutubxonachi — Assistant"),
      body("Kitoblar va nusxalarni boshqaradi, bandlarni bajaradi, kitob beradi va qaytarib oladi. Administratorga tegishli foydalanuvchi rollari yoki umumiy nazorat sozlamalarini o‘zgartira olmaydi."),
      subTitle("Administrator — Admin"),
      body("Barcha xizmat bo‘limlariga kiradi. Foydalanuvchi rolini o‘zgartirishi, hisobni faollashtirishi yoki faolsizlantirishi, izohlarni nazorat qilishi va analitikani ko‘rishi mumkin."),
      bullet("Ism bo‘yicha qidirish va Student, Assistant yoki Admin bo‘yicha filtrlash mumkin."),
      bullet("Active va Deactivated filtrlari hisob holatini tez tekshirishga yordam beradi."),
      bullet("Har bir foydalanuvchi qatorida uning olgan kitoblari va bandlari soni ko‘rinadi."),
      callout("Vakolat nazorati", "Rol faqat administrator tomonidan o‘zgartiriladi. Har bir o‘zgarish serverda tekshirilgan administrator hisobiga bog‘lab qayd etiladi."),

      pageBreak(),
      sectionTitle("11. Izoh va baholarni nazorat qilish"),
      body("“Feedback Moderation” sahifasi o‘quvchilar qoldirgan baho va kommentlarni bitta joyda boshqaradi. Yuqorida jami izohlar, ommaga ko‘rinayotgan izohlar, yashirilgan izohlar va tizimdagi o‘rtacha reyting ko‘rsatiladi."),
      image("10-feedback-full.png"),
      caption("9-rasm. Feedback Moderation bo‘limining to‘liq ekran ko‘rinishi."),
      subTitle("All — barcha izohlar"),
      body("Ochiq va yashirilgan fikrlarning barchasi bir ro‘yxatda ko‘rinadi. Kitob nomi, muallif, o‘quvchi, baho, yozilgan vaqt va komment matni tekshiriladi."),
      subTitle("Published — katalogda ko‘rinadigan izohlar"),
      body("Bu izohlarni boshqa o‘quvchilar kitob sahifasida ko‘ra oladi. Administrator zarur holatda “Hide Review” orqali izohni vaqtincha yashiradi."),
      subTitle("Moderated — yashirilgan izohlar"),
      body("Mavzuga aloqasiz, noto‘g‘ri yoki odobga mos kelmaydigan izohlar katalogdan yashiriladi. Bu ularni tekshirish va zarur bo‘lsa qayta ochish imkonini saqlab qoladi."),
      subTitle("Delete — butunlay o‘chirish"),
      body("Faqat aniq zarurat bo‘lganda administrator izohni butunlay o‘chiradi. Oddiy nazorat uchun avval yashirish funksiyasidan foydalanish xavfsizroq."),

      pageBreak(),
      sectionTitle("12. Analitika — qaror qabul qilish uchun real ma’lumot"),
      body("Analitika bo‘limi shunchaki chiroyli grafik emas. U maktab kutubxonasi fondini qanday rivojlantirish kerakligini ko‘rsatadi. Masalan, qaysi yo‘nalishdagi kitoblarga talab yuqori bo‘lsa, kelajakda aynan shu kitoblardan ko‘proq nusxa olish mumkin."),
      image("08-analitika.png"),
      caption("10-rasm. Fond hajmi, kitob aylanishi, reytinglar va kategoriyalar statistikasi."),
      bullet("Jami kitob nomlari va barcha jismoniy nusxalar soni."),
      bullet("Faol hamda muddati o‘tgan kitoblar ulushi."),
      bullet("Kun, oy yoki tanlangan davr bo‘yicha berish-qaytarish dinamikasi."),
      bullet("Kategoriyalar bo‘yicha fond taqsimoti va eng faol kitobxonlar."),

      pageBreak(),
      sectionTitle("13. Xavfsizlik va ishonchli tarix"),
      body("Platformada har kim bir xil huquqqa ega emas. O‘quvchi faqat o‘ziga tegishli kitoblar va bandlarni boshqaradi. Kutubxonachi kitob aylanishi bilan ishlaydi. Administrator esa foydalanuvchilar, izohlar va statistikani nazorat qiladi."),
      bullet("Kirish va foydalanuvchi shaxsi server tomonidan tekshiriladi."),
      bullet("Har bir muhim o‘zgarish uni bajargan foydalanuvchi bilan bog‘lanadi."),
      bullet("Kitob nusxasining berilish, qaytarilish va holat tarixi yo‘qolib ketmaydi."),
      bullet("Bitta nusxa bir vaqtning o‘zida ikki o‘quvchiga berilmasligi uchun tekshiruvlar mavjud."),
      callout("Maktab uchun foyda", "Tizim shaffoflikni oshiradi: kitob qayerda, kimda va qanday holatda ekanini aniq ko‘rish mumkin."),

      pageBreak(),
      sectionTitle("14. Xulosa"),
      body("Libra25 — maktab kutubxonasini zamonaviy, tartibli va tushunarli ishlashga olib keladigan platforma. U o‘quvchiga kitobni tez topish va band qilish imkonini beradi, kutubxonachining qo‘l mehnatini kamaytiradi, administratorga esa real holatni raqamlar orqali ko‘rsatadi."),
      body("Bu loyiha orqali men maktabdagi oddiy, lekin muhim muammoni texnologiya yordamida hal qilishga harakat qildim. Keyingi bosqichda tizimni maktabning haqiqiy kitob fondi bilan to‘ldirish, o‘zbekcha interfeysni to‘liq yakunlash va amaliy sinovdan o‘tkazish mumkin."),
      callout("Qisqa taqdimot matni", "Men — Bag‘dod tumani 25-maktab o‘quvchisi Saminjonov Sanjarbek. Libra25 nomli raqamli kutubxona platformasini yaratdim. Bu tizim kutubxonachining ishini yengillashtiradi, barcha kitoblar uchun elektron baza yaratadi va o‘quvchilarga kitobni topish, band qilish hamda o‘z o‘qish tarixini kuzatish imkonini beradi. Administrator esa izohlar, foydalanuvchilar va kutubxona statistikasini bitta paneldan boshqaradi."),
      new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "E’TIBORINGIZ UCHUN RAHMAT", bold: true, color: COLORS.blue, size: 31 })] }),
    ],
  }],
});

async function writeDocument(): Promise<void> {
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(outputPath);
}

void writeDocument();
