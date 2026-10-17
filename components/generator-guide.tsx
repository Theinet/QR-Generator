import { swissGuide } from "@/lib/swiss-content"
import { getTranslation } from "@/lib/i18n"
import type { Language } from "@/lib/i18n"

const content = {
  ...swissGuide,
  en: {
    heading: "Create a free QR code in three steps",
    steps: ["Choose a content type and enter your website, Wi-Fi details, text, email, phone number, SMS or coordinates.", "Pick colors and a size. Add a PNG, JPEG or WebP logo if you need one.", "Create your QR code and download PNG for everyday sharing or SVG for print. Test it with your phone’s camera before sharing."],
    faq: "QR code questions",
    questions: [
      ["Is this QR code generator free?", "Yes. Create and download QR codes without registration or a subscription."],
      ["Do my QR codes expire?", "No. Downloaded static QR codes keep their encoded content. A website or other destination must still be available. The optional history reminder does not disable the QR code."],
      ["Are my data uploaded?", "QR content and logos are processed in your browser. History is stored on this device, without encryption. Avoid saving sensitive data on a shared device; clear history using Delete."],
      ["Can I create a QR code on my phone?", "Yes. Use the form on your phone, preview the code and save it as PNG or SVG. Use a dark foreground, a light background and test the result with another device."],
    ],
  },
  uk: {
    heading: "Створіть безкоштовний QR-код за три кроки",
    steps: ["Оберіть тип вмісту та введіть посилання, дані Wi-Fi, текст, email, номер телефону, SMS або координати.", "Налаштуйте кольори та розмір. За потреби додайте логотип PNG, JPEG або WebP.", "Створіть QR-код і завантажте PNG для поширення або SVG для друку. Перед використанням перевірте його камерою телефону."],
    faq: "Питання про QR-коди",
    questions: [
      ["Цей генератор QR-кодів безкоштовний?", "Так. Створюйте та завантажуйте QR-коди без реєстрації й підписки."],
      ["Чи мають QR-коди термін дії?", "Ні. Завантажені статичні QR-коди зберігають свій вміст. Сайт або інший ресурс за посиланням має залишатися доступним. Нагадування в історії не вимикає QR-код."],
      ["Чи завантажуються мої дані на сервер?", "Вміст QR-кодів і логотипи обробляються у браузері. Історія зберігається на цьому пристрої без шифрування. Не зберігайте чутливі дані на спільному пристрої; очищуйте історію кнопкою видалення."],
      ["Чи можна створити QR-код на телефоні?", "Так. Заповніть форму на телефоні, перегляньте код і збережіть PNG або SVG. Обирайте темний код на світлому фоні та перевіряйте результат іншим пристроєм."],
    ],
  },
}

export default function GeneratorGuide({ language }: { language: Language }) {
  const text = content[language]
  return <section className="mt-8 rounded-xl border border-blue-100 bg-white p-5 sm:p-8" aria-labelledby="guide-heading">
    <h2 id="guide-heading" className="text-xl sm:text-2xl font-semibold text-gray-900">{text.heading}</h2>
    <ol className="mt-4 grid gap-4 md:grid-cols-3 list-decimal list-inside text-sm text-gray-600 leading-relaxed">{text.steps.map((step) => <li key={step}>{step}</li>)}</ol>
    <h2 className="mt-8 mb-3 text-xl font-semibold">{text.faq}</h2>
    <div className="divide-y">{text.questions.map(([question, answer]) => <details key={question} className="py-3"><summary className="cursor-pointer font-medium py-1">{question}</summary><p className="mt-2 text-sm text-gray-600 leading-relaxed">{answer}</p></details>)}</div>
    <a href={`https://www.theinet.ch/${language}/products`} className="mt-5 inline-flex items-center min-h-11 text-sm text-blue-700 underline">{getTranslation(language, "moreTools")}</a>
  </section>
}
