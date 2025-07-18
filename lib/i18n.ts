export const translations = {
  en: {
    title: "QR Code Generator",
    subtitle: "Create unique QR codes with different styles and formats",
    createQR: "Create QR Code",
    fillForm: "Fill out the form to create a new QR code",
    name: "Name",
    namePlaceholder: "e.g., My Website",
    contentType: "Content Type",
    content: "Content",
    expiration: "Expiration",
    create: "Create QR Code",
    createdQRs: "Created QR Codes",
    noQRCodes: "No QR codes created yet",
    expired: "Expired",
    expires: "Expires",
    download: "Download",
    copy: "Copy",
    delete: "Delete",
    copied: "Copied",
    copiedDesc: "Content copied to clipboard",
    success: "Success!",
    successDesc: "QR code created and saved locally",
    error: "Error",
    errorDesc: "Failed to create QR code",
    fillRequired: "Fill in all required fields",
    deleted: "Deleted",
    deletedDesc: "QR code deleted",
    privacy: "Complete Privacy",
    privacyDesc:
      "All your data is stored locally in the browser. No information is sent to the server. QR codes are generated entirely on your device.",
    // Content types
    website: "Website",
    phone: "Phone",
    text: "Text",
    email: "Email",
    sms: "SMS",
    wifi: "WiFi",
    location: "Location",
    // Placeholders
    websitePlaceholder: "https://example.com",
    phonePlaceholder: "+1 (555) 123-4567",
    textPlaceholder: "Enter text...",
    emailPlaceholder: "user@example.com",
    smsPlaceholder: "+1 (555) 123-4567",
    wifiPlaceholder: "Network Name",
    locationPlaceholder: "40.7128,-74.0060",
    // Additional fields
    password: "Password",
    subject: "Subject",
    message: "Message",
    // Expiration options
    oneDay: "1 day",
    sevenDays: "7 days",
    thirtyDays: "30 days",
    ninetyDays: "90 days",
    oneYear: "1 year",
    never: "Never expires",
    // QR Code Size
    qrSize: "QR Code Size",
    small: "Small (128px)",
    medium: "Medium (256px)",
    large: "Large (512px)",
    xlarge: "Extra Large (1024px)",
    // Colors
    foregroundColor: "Foreground Color",
    backgroundColor: "Background Color",
    // Download formats
    downloadPNG: "Download PNG",
    downloadSVG: "Download SVG",
    preview: "Preview",
    // New copy image translations
    browserNotSupportedCopyImage: "Your browser does not support copying images.",
    failedToCopyQR: "Failed to copy QR code.",
  },
  uk: {
    title: "Генератор QR-кодів",
    subtitle: "Створюйте унікальні QR-коди з різними стилями та форматами",
    createQR: "Створити QR-код",
    fillForm: "Заповніть форму для створення нового QR-коду",
    name: "Назва",
    namePlaceholder: "наприклад, Мій сайт",
    contentType: "Тип вмісту",
    content: "Вміст",
    expiration: "Термін дії",
    create: "Створити QR-код",
    createdQRs: "Створені QR-коди",
    noQRCodes: "Поки немає створених QR-кодів",
    expired: "Закінчився",
    expires: "Закінчується",
    download: "Завантажити",
    copy: "Копіювати",
    copied: "Скопійовано",
    copiedDesc: "Вміст скопійовано в буфер обміну",
    success: "Успішно!",
    successDesc: "QR-код створено та збережено локально",
    error: "Помилка",
    errorDesc: "Не вдалося створити QR-код",
    fillRequired: "Заповніть всі обов'язкові поля",
    deleted: "Видалено",
    deletedDesc: "QR-код видалено",
    privacy: "Повна конфіденційність",
    privacyDesc:
      "Всі ваші дані зберігаються локально в браузері. Жодна інформація не надсилається на сервер. QR-коди генеруються повністю на вашому пристрої.",
    // Content types
    website: "Веб-сайт",
    phone: "Телефон",
    text: "Текст",
    email: "Електронна пошта",
    sms: "SMS",
    wifi: "WiFi",
    location: "Місцезнаходження",
    // Placeholders
    websitePlaceholder: "https://example.com",
    phonePlaceholder: "+380 (99) 123-45-67",
    textPlaceholder: "Введіть текст...",
    emailPlaceholder: "user@example.com",
    smsPlaceholder: "+380 (99) 123-45-67",
    wifiPlaceholder: "Назва мережі",
    locationPlaceholder: "50.4501,30.5234",
    // Additional fields
    password: "Пароль",
    subject: "Тема",
    message: "Повідомлення",
    // Expiration options
    oneDay: "1 день",
    sevenDays: "7 днів",
    thirtyDays: "30 днів",
    ninetyDays: "90 днів",
    oneYear: "1 рік",
    never: "Без обмежень",
    // QR Code Size
    qrSize: "Розмір QR-коду",
    small: "Малий (128px)",
    medium: "Середній (256px)",
    large: "Великий (512px)",
    xlarge: "Дуже великий (1024px)",
    // Colors
    foregroundColor: "Колір переднього плану",
    backgroundColor: "Колір фону",
    // Download formats
    downloadPNG: "Завантажити PNG",
    downloadSVG: "Завантажити SVG",
    preview: "Попередній перегляд",
    // Copy image translations
    browserNotSupportedCopyImage: "Ваш браузер не підтримує копіювання зображень.",
    failedToCopyQR: "Не вдалося скопіювати QR-код.",
  },
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.en

export const getTranslation = (lang: Language, key: TranslationKey): string => {
  return translations[lang][key] || translations.en[key]
}
