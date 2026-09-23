import type { Lang } from "@/lib/i18n";

/**
 * Page copy, one object per language.
 *
 * Flat "key": "string" pairs work for chrome, but the pages are mostly
 * structured content — ordered steps, FAQ pairs, plan features — so they live
 * as real arrays here. Every language carries the same shape; `checkContent`
 * in the test below verifies that.
 */
export type Content = {
  landing: {
    approachTag: string;
    approach: string;
    download: string;
    aboutTag: string;
    aboutLead: string;
    aboutRest: string;
    philTitleA: string;
    philTitleB: string;
    philBlocks: { tag: string; text: string }[];
    modelsTitle: string;
    modelsLead: string;
    servicesTag: string;
    servicesTitle: string;
    services: { tag: string; title: string; desc: string }[];
    pricingTag: string;
    pricingTitleA: string;
    pricingTitleB: string;
    pricingLead: string;
    monthly: string;
    yearly: string;
    save: string;
    perMonth: string;
    billedYearly: string;
    billedMonthly: string;
    freeForever: string;
    popular: string;
    startFree: string;
    choose: string;
  };
  plans: { id: string; name: string; info: string; feats: string[] }[];
  pricing: { title: string; lead: string; home: string };
  faq: { title: string; lead: string; items: { q: string; a: string }[]; ask: string; docs: string };
  install: {
    title: string;
    lead: string;
    steps: { title: string; body: string; cmd?: string }[];
    fixesTitle: string;
    fixes: { k: string; v: string }[];
    docs: string;
    faq: string;
    contact: string;
  };
  docs: {
    title: string;
    lead: string;
    partsTitle: string;
    parts: { name: string; text: string }[];
    endpointsTitle: string;
    endpoints: { path: string; text: string }[];
    privacyTitle: string;
    privacy: string;
    install: string;
    faq: string;
  };
  download: {
    title: string;
    lead: string;
    builds: { os: string; req: string; note: string }[];
    soon: string;
    phone: string;
    phoneText: string;
    notReady: string;
    howInstall: string;
    docs: string;
  };
  payment: {
    title: string;
    lead: string;
    recipientLabel: string;
    recipient: string;
    sbp: string;
    sbpNote: string;
    cardOzon: string;
    cardTbank: string;
    cardNote: string;
    crypto: string;
    cryptoNote: string;
    copy: string;
    copied: string;
    afterTitle: string;
    after: string;
    writeUs: string;
    plans: string;
    tgTitle: string;
    tgReceipt: string;
    tgReceiptNote: string;
    tgStars: string;
    tgStarsNote: string;
    open: string;
  };
  contacts: {
    title: string;
    lead: string;
    mail: string;
    telegram: string;
    dl: string;
    dlValue: string;
    formTitle: string;
    name: string;
    namePlaceholder: string;
    contact: string;
    contactPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    sending: string;
    ok: string;
    errEmpty: string;
    errServer: string;
    seeFaq: string;
  };
  terms: {
    title: string;
    lead: string;
    sections: { title: string; body: string }[];
    note: string;
  };
};

const ru: Content = {
  landing: {
    approachTag: "Наш подход",
    approach:
      "Всё работает локально: модели Ollama на вашем компьютере или мост к Claude. Данные не покидают ваш сервер, а приложение держит его под контролем.",
    download: "Скачать",
    aboutTag: "О продукте",
    aboutLead: "Ваши модели",
    aboutRest: "на вашем железе, под вашим контролем.",
    philTitleA: "Мощность",
    philTitleB: "Приватность",
    philBlocks: [
      {
        tag: "Выберите провайдера",
        text: "Запускайте любые модели Ollama на своём железе или подключите Claude через локальный мост. Максимальная скорость там, где нужно, и полный контроль над тем, что и куда уходит.",
      },
      {
        tag: "Всё под контролем",
        text: "Пользователи, подписки, логи и QR-доступ — в одном месте. Пароли хранятся хешем, доступ по ролям, а данные не покидают ваш сервер.",
      },
    ],
    modelsTitle: "Модели",
    modelsLead: "Запускайте любые модели Ollama локально или подключите Claude через мост.",
    servicesTag: "Что внутри",
    servicesTitle: "Два слоя одной системы",
    services: [
      {
        tag: "Модели",
        title: "Локальный AI",
        desc: "Ollama на вашем компьютере или мост к Claude. Любые модели, максимальная скорость, никаких чужих токенов.",
      },
      {
        tag: "Управление",
        title: "Приложение и клиенты",
        desc: "Десктоп-приложение, веб-клиент и телефон: пользователи, подписки, логи и QR-доступ в одном месте.",
      },
    ],
    pricingTag: "Тарифы",
    pricingTitleA: "Простые",
    pricingTitleB: "тарифы",
    pricingLead: "Те же планы, что и в приложении. Отменить можно в любой момент.",
    monthly: "Помесячно",
    yearly: "На год",
    save: "−17%",
    perMonth: "/мес",
    billedYearly: "оплата за год",
    billedMonthly: "оплата помесячно",
    freeForever: "Бесплатно навсегда",
    popular: "Популярный",
    startFree: "Начать бесплатно",
    choose: "Выбрать",
  },
  plans: [
    { id: "free", name: "Free", info: "Для знакомства", feats: ["1 000 кредитов / мес", "Основные функции", "Стандартная скорость"] },
    { id: "pro", name: "Pro", info: "Для активной работы", feats: ["5 000 кредитов / мес", "Все функции Free", "Повышенная скорость", "Приоритетная очередь"] },
    { id: "ultra", name: "Ultra", info: "Максимум возможностей", feats: ["15 000 кредитов / мес", "Максимальная скорость", "Высший приоритет", "Ранний доступ к моделям"] },
  ],
  pricing: { title: "Тарифы", lead: "Выберите план под свою нагрузку. Отменить можно в любой момент.", home: "На главную" },
  faq: {
    title: "Частые вопросы",
    lead: "Коротко о том, что спрашивают чаще всего. Не нашли своё — напишите нам.",
    items: [
      { q: "Нужен ли интернет для работы?", a: "Нет. Модели Ollama крутятся на вашем железе, запросы никуда не уходят. Интернет нужен только чтобы скачать саму модель и если вы подключаете Claude через мост." },
      { q: "Куда уходят мои данные?", a: "Никуда. Переписка, файлы и логи лежат на вашем сервере. Мы физически не видим их — у продукта нет облака, в которое они могли бы попасть." },
      { q: "Какое железо нужно?", a: "Для моделей на 7–8 миллиардов параметров хватит 16 ГБ оперативной памяти. Видеокарта не обязательна, но с ней ответы идут заметно быстрее. Модели поменьше (phi3, gemma) заводятся и на 8 ГБ." },
      { q: "Чем отличаются тарифы?", a: "Количеством кредитов в месяц, скоростью и приоритетом в очереди. Сам сервер во всех тарифах ваш и работает одинаково." },
      { q: "Можно ли пользоваться бесплатно?", a: "Да, тариф Free бессрочный: 1 000 кредитов в месяц и основные функции. Карту привязывать не нужно." },
      { q: "Сколько устройств можно подключить?", a: "Сколько угодно. Десктоп-приложение, веб-клиент и телефон работают с одним сервером и одной базой — подписка привязана к аккаунту, а не к устройству." },
      { q: "Как подключить телефон?", a: "В приложении есть раздел «QR-доступ»: он выпускает временный код на 10 минут. Наводите камеру — и всё открывается на телефоне." },
      { q: "Что будет, если я отменю подписку?", a: "Сервер продолжит работать — он ваш. Вы вернётесь на тариф Free с его лимитом кредитов, данные останутся на месте." },
    ],
    ask: "Задать свой вопрос",
    docs: "Документация",
  },
  install: {
    title: "Установка",
    lead: "Четыре шага, около пятнадцати минут. Всё локально.",
    steps: [
      { title: "Поставьте Ollama", body: "Скачайте с ollama.com. После установки слушает localhost:11434." },
      { title: "Загрузите модель", body: "Нужно 16 ГБ памяти. Если 8 ГБ — берите phi3.", cmd: "ollama pull llama3" },
      { title: "Запустите сервер", body: "Поднимется на localhost:3000. Первый запуск дольше.", cmd: "npm install\nnpm run dev" },
      { title: "Подключите клиенты", body: "Веб-клиент уже работает. Телефон — по QR-коду, ставить нечего.", cmd: "cd desktop-app && npm install && npm start" },
    ],
    fixesTitle: "Если не завелось",
    fixes: [
      { k: "Порт занят", v: "Запустите на другом: npm run dev -- --port 3002" },
      { k: "Модель молчит", v: "Проверьте ollama list — модель должна быть в списке" },
      { k: "Приложение не видит сервер", v: "Сверьте порт в настройках и проверьте брандмауэр" },
    ],
    docs: "Документация",
    faq: "FAQ",
    contact: "Не получилось — напишите",
  },
  docs: {
    title: "Документация",
    lead: "Как всё устроено и куда смотреть, когда что-то идёт не так.",
    partsTitle: "Из чего состоит система",
    parts: [
      { name: "Ollama", text: "движок, который держит модели и отвечает на запросы. Слушает localhost:11434 и живёт отдельно от всего остального." },
      { name: "Сервер", text: "прослойка на localhost:3000. Хранит пользователей, подписки и логи, раздаёт веб-клиент и говорит с Ollama." },
      { name: "Клиенты", text: "десктоп-приложение, веб-клиент и телефон. Все три работают с одним сервером и одной базой, поэтому история и лимиты общие." },
    ],
    endpointsTitle: "Полезные адреса",
    endpoints: [
      { path: "/api/status", text: "Проверка, что сервер жив. Отсюда же берёт данные индикатор в шапке." },
      { path: "/api/auth/register", text: "Регистрация. Принимает email, пароль, никнейм и выбранный тариф." },
      { path: "/api/requests", text: "Заявки со страницы «Контакты»." },
    ],
    privacyTitle: "Приватность",
    privacy:
      "Модели считают на вашем железе, база лежит рядом с сервером. Наружу ничего не уходит — кроме случая, когда вы сами включаете мост к Claude: тогда запросы идут к нему.",
    install: "Установка",
    faq: "FAQ",
  },
  download: {
    title: "Скачать",
    lead: "Десктоп-приложение для управления сервером. Сам AI-сервер ставится отдельно.",
    builds: [
      { os: "Windows", req: "Windows 10 или новее, 64-bit", note: "Установщик со встроенным автозапуском сервера." },
      { os: "macOS", req: "macOS 12 или новее, Intel и Apple Silicon", note: "Универсальная сборка, отдельная версия под M-чипы не нужна." },
      { os: "Linux", req: "Ubuntu 22.04+, Fedora 38+, Arch", note: "Portable-сборка: chmod +x и запускайте." },
    ],
    soon: "сборка появится здесь",
    phone: "Телефон",
    phoneText:
      "Отдельное приложение ставить не нужно. Откройте раздел «QR-доступ», нажмите «Создать QR» и наведите камеру — всё откроется в браузере телефона на 10 минут.",
    notReady:
      "Сборки пока не выложены — файлы появятся здесь к первому публичному релизу. До тех пор всё запускается из исходников.",
    howInstall: "Как установить",
    docs: "Документация",
  },
  payment: {
    title: "Оплата",
    lead: "Переводите удобным способом, потом напишите нам — подключим тариф.",
    recipientLabel: "Получатель",
    recipient: "Степан П.",
    sbp: "СБП по номеру телефона",
    sbpNote: "Т-Банк или Ozon Банк — выберите в приложении своего банка.",
    cardOzon: "Карта Ozon Банк",
    cardTbank: "Карта Т-Банк",
    cardNote: "Перевод по номеру карты, комиссия зависит от вашего банка.",
    crypto: "Криптовалюта TON",
    cryptoNote: "Кошелёк Tonkeeper. Сеть TON, другие сети не поддерживаются.",
    copy: "Скопировать",
    copied: "Скопировано",
    afterTitle: "После оплаты",
    after: "Пришлите чек или скриншот на странице «Контакты» и укажите почту аккаунта — тариф подключим вручную.",
    writeUs: "Написать нам",
    plans: "Посмотреть тарифы",
    tgTitle: "Через Telegram",
    tgReceipt: "Отправить чек боту",
    tgReceiptNote: "Бот примет скриншот перевода и подключит тариф.",
    tgStars: "Оплатить звёздами",
    tgStarsNote: "Оплата Telegram Stars прямо в боте, без карт и переводов.",
    open: "Открыть",
  },
  contacts: {
    title: "Контакты",
    lead: "Напишите удобным способом — или оставьте заявку, мы её увидим.",
    mail: "Почта",
    telegram: "Telegram",
    dl: "Скачать",
    dlValue: "Сборки и установка",
    formTitle: "Оставить заявку",
    name: "Как к вам обращаться",
    namePlaceholder: "Имя",
    contact: "Контакт для ответа",
    contactPlaceholder: "you@example.com или @username",
    message: "Сообщение",
    messagePlaceholder: "Что нужно сделать, сроки, детали…",
    submit: "Отправить заявку",
    sending: "Отправляем…",
    ok: "Заявка отправлена — ответим на указанный контакт.",
    errEmpty: "Заполните все поля.",
    errServer: "Сервер недоступен — он запускается вместе с AI-сервером на порту 3000. Пока напишите на почту или в Telegram.",
    seeFaq: "Сначала посмотреть FAQ",
  },
  terms: {
    title: "Условия использования",
    lead: "Пользовательское соглашение",
    sections: [
      {
        title: "1. Общие положения",
        body: "Используя сервис AI Hub, вы соглашаетесь с условиями данного соглашения. Сервис предоставляет интерфейс для взаимодействия с локальными и удалёнными моделями искусственного интеллекта.",
      },
      {
        title: "2. Конфиденциальность и данные",
        body: "Мы придерживаемся принципа максимальной приватности. Все данные чатов хранятся в вашей локальной базе данных. Мы не имеем доступа к вашим сообщениям, если вы сами не настроили удалённый сервер с нашим доступом.",
      },
      {
        title: "3. Ответственность",
        body: "AI Hub не несёт ответственности за содержание ответов, генерируемых моделями ИИ. Пользователь самостоятельно оценивает достоверность полученной информации.",
      },
      {
        title: "4. Использование ресурсов",
        body: "Вы обязуетесь не использовать сервис для создания вредоносного контента, спама или проведения кибератак. В случае нарушения данных условий доступ к аккаунту может быть ограничен.",
      },
    ],
    note: "Данный документ носит ознакомительный характер и предназначен для обеспечения прозрачности работы системы AI Hub.",
  },
};

const en: Content = {
  landing: {
    approachTag: "Our approach",
    approach:
      "Everything runs locally: Ollama models on your own machine, or a bridge to Claude. Your data never leaves your server, and the app keeps it under control.",
    download: "Download",
    aboutTag: "The product",
    aboutLead: "Your models",
    aboutRest: "on your hardware, under your control.",
    philTitleA: "Power",
    philTitleB: "Privacy",
    philBlocks: [
      {
        tag: "Pick a provider",
        text: "Run any Ollama model on your own hardware, or connect Claude through a local bridge. Full speed where you need it, and full control over what leaves the machine.",
      },
      {
        tag: "All in one place",
        text: "Users, subscriptions, logs and QR access in one place. Passwords are hashed, access is role-based, and the data stays on your server.",
      },
    ],
    modelsTitle: "Models",
    modelsLead: "Run any Ollama model locally, or connect Claude through the bridge.",
    servicesTag: "What's inside",
    servicesTitle: "Two layers, one system",
    services: [
      {
        tag: "Models",
        title: "Local AI",
        desc: "Ollama on your machine or a bridge to Claude. Any model, full speed, nobody else's tokens.",
      },
      {
        tag: "Management",
        title: "App and clients",
        desc: "Desktop app, web client and phone: users, subscriptions, logs and QR access in one place.",
      },
    ],
    pricingTag: "Pricing",
    pricingTitleA: "Simple",
    pricingTitleB: "pricing",
    pricingLead: "The same plans as in the app. Cancel whenever you like.",
    monthly: "Monthly",
    yearly: "Yearly",
    save: "−17%",
    perMonth: "/mo",
    billedYearly: "billed yearly",
    billedMonthly: "billed monthly",
    freeForever: "Free forever",
    popular: "Popular",
    startFree: "Start free",
    choose: "Choose",
  },
  plans: [
    { id: "free", name: "Free", info: "To get a feel for it", feats: ["1,000 credits / mo", "Core features", "Standard speed"] },
    { id: "pro", name: "Pro", info: "For everyday work", feats: ["5,000 credits / mo", "Everything in Free", "Higher speed", "Priority queue"] },
    { id: "ultra", name: "Ultra", info: "Everything it can do", feats: ["15,000 credits / mo", "Top speed", "Highest priority", "Early access to models"] },
  ],
  pricing: { title: "Pricing", lead: "Pick the plan that fits your load. Cancel whenever you like.", home: "Home" },
  faq: {
    title: "Frequently asked",
    lead: "The short answers to what people ask most. Can't find yours — write to us.",
    items: [
      { q: "Do I need an internet connection?", a: "No. Ollama models run on your own hardware and requests never leave it. You need the internet only to download a model, and if you connect Claude through the bridge." },
      { q: "Where does my data go?", a: "Nowhere. Conversations, files and logs sit on your server. We physically cannot see them — the product has no cloud for them to land in." },
      { q: "What hardware do I need?", a: "16 GB of RAM is enough for 7–8 billion parameter models. A GPU is optional but makes answers noticeably faster. Smaller models (phi3, gemma) run on 8 GB." },
      { q: "How do the plans differ?", a: "By monthly credits, speed and queue priority. The server itself is yours on every plan and behaves identically." },
      { q: "Can I use it for free?", a: "Yes — Free has no time limit: 1,000 credits a month and the core features. No card required." },
      { q: "How many devices can I connect?", a: "As many as you like. Desktop app, web client and phone share one server and one database — the subscription belongs to the account, not the device." },
      { q: "How do I connect my phone?", a: "The app has a QR access section: it issues a temporary 10-minute code. Point your camera at it and everything opens on the phone." },
      { q: "What happens if I cancel?", a: "The server keeps running — it's yours. You drop back to the Free credit limit and your data stays where it is." },
    ],
    ask: "Ask your own question",
    docs: "Docs",
  },
  install: {
    title: "Install",
    lead: "Four steps, about fifteen minutes. All local.",
    steps: [
      { title: "Install Ollama", body: "Download it from ollama.com. Once installed it listens on localhost:11434." },
      { title: "Pull a model", body: "Needs 16 GB of RAM. On 8 GB, use phi3 instead.", cmd: "ollama pull llama3" },
      { title: "Start the server", body: "Comes up on localhost:3000. The first run takes longer.", cmd: "npm install\nnpm run dev" },
      { title: "Connect the clients", body: "The web client already works. For the phone, scan the QR code — nothing to install.", cmd: "cd desktop-app && npm install && npm start" },
    ],
    fixesTitle: "If it won't start",
    fixes: [
      { k: "Port already in use", v: "Run it on another: npm run dev -- --port 3002" },
      { k: "The model stays silent", v: "Check ollama list — the model should be there" },
      { k: "The app can't see the server", v: "Check the port in the settings and your firewall" },
    ],
    docs: "Docs",
    faq: "FAQ",
    contact: "Stuck? Write to us",
  },
  docs: {
    title: "Documentation",
    lead: "How the pieces fit together, and where to look when they don't.",
    partsTitle: "What the system is made of",
    parts: [
      { name: "Ollama", text: "the engine that holds the models and answers requests. Listens on localhost:11434 and runs independently of everything else." },
      { name: "Server", text: "the layer on localhost:3000. Stores users, subscriptions and logs, serves the web client and talks to Ollama." },
      { name: "Clients", text: "desktop app, web client and phone. All three share one server and one database, so history and limits are common." },
    ],
    endpointsTitle: "Useful endpoints",
    endpoints: [
      { path: "/api/status", text: "Checks the server is alive. The header indicator reads this too." },
      { path: "/api/auth/register", text: "Registration. Takes email, password, username and the chosen plan." },
      { path: "/api/requests", text: "Messages from the contact page." },
    ],
    privacyTitle: "Privacy",
    privacy:
      "Models compute on your hardware and the database sits next to the server. Nothing goes out — except when you switch on the Claude bridge yourself, and then requests go to it.",
    install: "Install",
    faq: "FAQ",
  },
  download: {
    title: "Download",
    lead: "The desktop app for managing the server. The AI server itself installs separately.",
    builds: [
      { os: "Windows", req: "Windows 10 or newer, 64-bit", note: "Installer that starts the server for you." },
      { os: "macOS", req: "macOS 12 or newer, Intel and Apple Silicon", note: "Universal build — no separate M-chip version needed." },
      { os: "Linux", req: "Ubuntu 22.04+, Fedora 38+, Arch", note: "Portable build: chmod +x and run it." },
    ],
    soon: "build lands here",
    phone: "Phone",
    phoneText:
      "Nothing to install. Open the QR access section, press Create QR and point your camera — everything opens in the phone's browser for 10 minutes.",
    notReady:
      "Builds aren't published yet — the files land here with the first public release. Until then everything runs from source.",
    howInstall: "How to install",
    docs: "Docs",
  },
  payment: {
    title: "Payment",
    lead: "Transfer whichever way suits you, then write to us — we'll switch the plan on.",
    recipientLabel: "Recipient",
    recipient: "Stepan P.",
    sbp: "SBP by phone number",
    sbpNote: "T-Bank or Ozon Bank — pick one in your banking app.",
    cardOzon: "Ozon Bank card",
    cardTbank: "T-Bank card",
    cardNote: "Card-to-card transfer; the fee depends on your bank.",
    crypto: "TON cryptocurrency",
    cryptoNote: "Tonkeeper wallet. TON network only — other networks are not supported.",
    copy: "Copy",
    copied: "Copied",
    afterTitle: "After paying",
    after: "Send the receipt or a screenshot through the contact page and include your account email — we switch the plan on by hand.",
    writeUs: "Write to us",
    plans: "See the plans",
    tgTitle: "Through Telegram",
    tgReceipt: "Send the receipt to the bot",
    tgReceiptNote: "The bot takes a screenshot of the transfer and switches the plan on.",
    tgStars: "Pay with Stars",
    tgStarsNote: "Telegram Stars, right inside the bot — no cards, no transfers.",
    open: "Open",
  },
  contacts: {
    title: "Contact",
    lead: "Write however suits you — or leave a message and we'll see it.",
    mail: "Email",
    telegram: "Telegram",
    dl: "Download",
    dlValue: "Builds and install",
    formTitle: "Leave a message",
    name: "What should we call you",
    namePlaceholder: "Name",
    contact: "Where to reply",
    contactPlaceholder: "you@example.com or @username",
    message: "Message",
    messagePlaceholder: "What you need, deadlines, details…",
    submit: "Send",
    sending: "Sending…",
    ok: "Sent — we'll reply to the contact you gave.",
    errEmpty: "Please fill in every field.",
    errServer: "The server is unreachable — it starts together with the AI server on port 3000. For now, email or Telegram us.",
    seeFaq: "Check the FAQ first",
  },
  terms: {
    title: "Terms of Use",
    lead: "User agreement",
    sections: [
      {
        title: "1. General",
        body: "By using AI Hub you agree to the terms of this agreement. The service provides an interface for working with local and remote AI models.",
      },
      {
        title: "2. Privacy and data",
        body: "We follow a maximum-privacy principle. All chat data is stored in your own local database. We have no access to your messages unless you yourself set up a remote server with our access.",
      },
      {
        title: "3. Liability",
        body: "AI Hub is not responsible for the content of responses generated by AI models. Users assess the reliability of the information they receive themselves.",
      },
      {
        title: "4. Use of resources",
        body: "You agree not to use the service to create malicious content, send spam, or carry out cyberattacks. Violating these terms may result in restricted account access.",
      },
    ],
    note: "This document is provided for informational purposes and to keep how the AI Hub system works transparent.",
  },
};

const uk: Content = {
  landing: {
    approachTag: "Наш підхід",
    approach:
      "Усе працює локально: моделі Ollama на вашому комп'ютері або міст до Claude. Дані не покидають ваш сервер, а застосунок тримає його під контролем.",
    download: "Завантажити",
    aboutTag: "Про продукт",
    aboutLead: "Ваші моделі",
    aboutRest: "на вашому залізі, під вашим контролем.",
    philTitleA: "Потужність",
    philTitleB: "Приватність",
    philBlocks: [
      {
        tag: "Оберіть провайдера",
        text: "Запускайте будь-які моделі Ollama на своєму залізі або підключіть Claude через локальний міст. Максимальна швидкість там, де потрібно, і повний контроль над тим, що йде назовні.",
      },
      {
        tag: "Усе під контролем",
        text: "Користувачі, підписки, логи та QR-доступ — в одному місці. Паролі зберігаються хешем, доступ за ролями, а дані не покидають ваш сервер.",
      },
    ],
    modelsTitle: "Моделі",
    modelsLead: "Запускайте будь-які моделі Ollama локально або підключіть Claude через міст.",
    servicesTag: "Що всередині",
    servicesTitle: "Два шари однієї системи",
    services: [
      {
        tag: "Моделі",
        title: "Локальний AI",
        desc: "Ollama на вашому комп'ютері або міст до Claude. Будь-які моделі, максимальна швидкість, жодних чужих токенів.",
      },
      {
        tag: "Керування",
        title: "Застосунок і клієнти",
        desc: "Десктоп-застосунок, вебклієнт і телефон: користувачі, підписки, логи та QR-доступ в одному місці.",
      },
    ],
    pricingTag: "Тарифи",
    pricingTitleA: "Прості",
    pricingTitleB: "тарифи",
    pricingLead: "Ті самі плани, що й у застосунку. Скасувати можна будь-коли.",
    monthly: "Щомісяця",
    yearly: "На рік",
    save: "−17%",
    perMonth: "/міс",
    billedYearly: "оплата за рік",
    billedMonthly: "оплата щомісяця",
    freeForever: "Безкоштовно назавжди",
    popular: "Популярний",
    startFree: "Почати безкоштовно",
    choose: "Обрати",
  },
  plans: [
    { id: "free", name: "Free", info: "Для знайомства", feats: ["1 000 кредитів / міс", "Основні функції", "Стандартна швидкість"] },
    { id: "pro", name: "Pro", info: "Для активної роботи", feats: ["5 000 кредитів / міс", "Усі функції Free", "Підвищена швидкість", "Пріоритетна черга"] },
    { id: "ultra", name: "Ultra", info: "Максимум можливостей", feats: ["15 000 кредитів / міс", "Максимальна швидкість", "Найвищий пріоритет", "Ранній доступ до моделей"] },
  ],
  pricing: { title: "Тарифи", lead: "Оберіть план під своє навантаження. Скасувати можна будь-коли.", home: "На головну" },
  faq: {
    title: "Часті запитання",
    lead: "Коротко про те, що запитують найчастіше. Не знайшли своє — напишіть нам.",
    items: [
      { q: "Чи потрібен інтернет для роботи?", a: "Ні. Моделі Ollama працюють на вашому залізі, запити нікуди не йдуть. Інтернет потрібен лише щоб завантажити саму модель і якщо ви підключаєте Claude через міст." },
      { q: "Куди йдуть мої дані?", a: "Нікуди. Листування, файли та логи лежать на вашому сервері. Ми фізично їх не бачимо — у продукту немає хмари, куди вони могли б потрапити." },
      { q: "Яке залізо потрібне?", a: "Для моделей на 7–8 мільярдів параметрів вистачить 16 ГБ оперативної пам'яті. Відеокарта не обов'язкова, але з нею відповіді помітно швидші. Менші моделі (phi3, gemma) працюють і на 8 ГБ." },
      { q: "Чим відрізняються тарифи?", a: "Кількістю кредитів на місяць, швидкістю та пріоритетом у черзі. Сам сервер на всіх тарифах ваш і працює однаково." },
      { q: "Чи можна користуватися безкоштовно?", a: "Так, тариф Free безстроковий: 1 000 кредитів на місяць і основні функції. Картку прив'язувати не потрібно." },
      { q: "Скільки пристроїв можна підключити?", a: "Скільки завгодно. Десктоп-застосунок, вебклієнт і телефон працюють з одним сервером і однією базою — підписка прив'язана до акаунта, а не до пристрою." },
      { q: "Як підключити телефон?", a: "У застосунку є розділ «QR-доступ»: він видає тимчасовий код на 10 хвилин. Наводьте камеру — і все відкривається на телефоні." },
      { q: "Що буде, якщо я скасую підписку?", a: "Сервер працюватиме далі — він ваш. Ви повернетесь на тариф Free з його лімітом кредитів, дані залишаться на місці." },
    ],
    ask: "Поставити своє запитання",
    docs: "Документація",
  },
  install: {
    title: "Встановлення",
    lead: "Чотири кроки, близько п'ятнадцяти хвилин. Усе локально.",
    steps: [
      { title: "Встановіть Ollama", body: "Завантажте з ollama.com. Після встановлення слухає localhost:11434." },
      { title: "Завантажте модель", body: "Потрібно 16 ГБ пам'яті. Якщо 8 ГБ — беріть phi3.", cmd: "ollama pull llama3" },
      { title: "Запустіть сервер", body: "Підніметься на localhost:3000. Перший запуск довший.", cmd: "npm install\nnpm run dev" },
      { title: "Підключіть клієнти", body: "Вебклієнт уже працює. Телефон — за QR-кодом, встановлювати нічого.", cmd: "cd desktop-app && npm install && npm start" },
    ],
    fixesTitle: "Якщо не запустилось",
    fixes: [
      { k: "Порт зайнятий", v: "Запустіть на іншому: npm run dev -- --port 3002" },
      { k: "Модель мовчить", v: "Перевірте ollama list — модель має бути у списку" },
      { k: "Застосунок не бачить сервер", v: "Звірте порт у налаштуваннях і перевірте брандмауер" },
    ],
    docs: "Документація",
    faq: "FAQ",
    contact: "Не вийшло — напишіть",
  },
  docs: {
    title: "Документація",
    lead: "Як усе влаштовано і куди дивитися, коли щось іде не так.",
    partsTitle: "З чого складається система",
    parts: [
      { name: "Ollama", text: "рушій, що тримає моделі та відповідає на запити. Слухає localhost:11434 і живе окремо від усього іншого." },
      { name: "Сервер", text: "прошарок на localhost:3000. Зберігає користувачів, підписки та логи, роздає вебклієнт і говорить з Ollama." },
      { name: "Клієнти", text: "десктоп-застосунок, вебклієнт і телефон. Усі троє працюють з одним сервером і однією базою, тому історія та ліміти спільні." },
    ],
    endpointsTitle: "Корисні адреси",
    endpoints: [
      { path: "/api/status", text: "Перевірка, що сервер живий. Звідси ж бере дані індикатор у шапці." },
      { path: "/api/auth/register", text: "Реєстрація. Приймає email, пароль, нікнейм і обраний тариф." },
      { path: "/api/requests", text: "Заявки зі сторінки «Контакти»." },
    ],
    privacyTitle: "Приватність",
    privacy:
      "Моделі рахують на вашому залізі, база лежить поруч із сервером. Назовні нічого не йде — крім випадку, коли ви самі вмикаєте міст до Claude: тоді запити йдуть до нього.",
    install: "Встановлення",
    faq: "FAQ",
  },
  download: {
    title: "Завантажити",
    lead: "Десктоп-застосунок для керування сервером. Сам AI-сервер встановлюється окремо.",
    builds: [
      { os: "Windows", req: "Windows 10 або новіше, 64-bit", note: "Інсталятор із вбудованим автозапуском сервера." },
      { os: "macOS", req: "macOS 12 або новіше, Intel і Apple Silicon", note: "Універсальна збірка, окрема версія під M-чипи не потрібна." },
      { os: "Linux", req: "Ubuntu 22.04+, Fedora 38+, Arch", note: "Portable-збірка: chmod +x і запускайте." },
    ],
    soon: "збірка з'явиться тут",
    phone: "Телефон",
    phoneText:
      "Окремий застосунок встановлювати не потрібно. Відкрийте розділ «QR-доступ», натисніть «Створити QR» і наведіть камеру — усе відкриється в браузері телефона на 10 хвилин.",
    notReady:
      "Збірки поки не викладені — файли з'являться тут до першого публічного релізу. До того часу все запускається з вихідних кодів.",
    howInstall: "Як встановити",
    docs: "Документація",
  },
  payment: {
    title: "Оплата",
    lead: "Переказуйте зручним способом, потім напишіть нам — підключимо тариф.",
    recipientLabel: "Отримувач",
    recipient: "Степан П.",
    sbp: "СБП за номером телефона",
    sbpNote: "Т-Банк або Ozon Банк — оберіть у застосунку свого банку.",
    cardOzon: "Картка Ozon Банк",
    cardTbank: "Картка Т-Банк",
    cardNote: "Переказ за номером картки, комісія залежить від вашого банку.",
    crypto: "Криптовалюта TON",
    cryptoNote: "Гаманець Tonkeeper. Мережа TON, інші мережі не підтримуються.",
    copy: "Скопіювати",
    copied: "Скопійовано",
    afterTitle: "Після оплати",
    after: "Надішліть чек або скриншот на сторінці «Контакти» та вкажіть пошту акаунта — тариф підключимо вручну.",
    writeUs: "Написати нам",
    plans: "Переглянути тарифи",
    tgTitle: "Через Telegram",
    tgReceipt: "Надіслати чек боту",
    tgReceiptNote: "Бот прийме скриншот переказу та підключить тариф.",
    tgStars: "Оплатити зірками",
    tgStarsNote: "Оплата Telegram Stars просто в боті, без карток і переказів.",
    open: "Відкрити",
  },
  contacts: {
    title: "Контакти",
    lead: "Напишіть зручним способом — або залиште заявку, ми її побачимо.",
    mail: "Пошта",
    telegram: "Telegram",
    dl: "Завантажити",
    dlValue: "Збірки та встановлення",
    formTitle: "Залишити заявку",
    name: "Як до вас звертатися",
    namePlaceholder: "Ім'я",
    contact: "Контакт для відповіді",
    contactPlaceholder: "you@example.com або @username",
    message: "Повідомлення",
    messagePlaceholder: "Що потрібно зробити, терміни, деталі…",
    submit: "Надіслати заявку",
    sending: "Надсилаємо…",
    ok: "Заявку надіслано — відповімо на вказаний контакт.",
    errEmpty: "Заповніть усі поля.",
    errServer: "Сервер недоступний — він запускається разом з AI-сервером на порту 3000. Поки напишіть на пошту або в Telegram.",
    seeFaq: "Спершу подивитися FAQ",
  },
  terms: {
    title: "Умови використання",
    lead: "Користувацька угода",
    sections: [
      {
        title: "1. Загальні положення",
        body: "Використовуючи сервіс AI Hub, ви погоджуєтесь з умовами цієї угоди. Сервіс надає інтерфейс для взаємодії з локальними та віддаленими моделями штучного інтелекту.",
      },
      {
        title: "2. Конфіденційність і дані",
        body: "Ми дотримуємось принципу максимальної приватності. Усі дані чатів зберігаються у вашій локальній базі даних. Ми не маємо доступу до ваших повідомлень, якщо ви самі не налаштували віддалений сервер із нашим доступом.",
      },
      {
        title: "3. Відповідальність",
        body: "AI Hub не несе відповідальності за зміст відповідей, згенерованих моделями ШІ. Користувач самостійно оцінює достовірність отриманої інформації.",
      },
      {
        title: "4. Використання ресурсів",
        body: "Ви зобов'язуєтесь не використовувати сервіс для створення шкідливого контенту, спаму або проведення кібератак. У разі порушення цих умов доступ до облікового запису може бути обмежено.",
      },
    ],
    note: "Цей документ має ознайомчий характер і призначений для забезпечення прозорості роботи системи AI Hub.",
  },
};

const pl: Content = {
  landing: {
    approachTag: "Nasze podejście",
    approach:
      "Wszystko działa lokalnie: modele Ollama na Twoim komputerze albo most do Claude. Dane nie opuszczają Twojego serwera, a aplikacja trzyma go pod kontrolą.",
    download: "Pobierz",
    aboutTag: "O produkcie",
    aboutLead: "Twoje modele",
    aboutRest: "na Twoim sprzęcie, pod Twoją kontrolą.",
    philTitleA: "Moc",
    philTitleB: "Prywatność",
    philBlocks: [
      {
        tag: "Wybierz dostawcę",
        text: "Uruchamiaj dowolne modele Ollama na własnym sprzęcie albo podłącz Claude przez lokalny most. Pełna szybkość tam, gdzie trzeba, i pełna kontrola nad tym, co wychodzi na zewnątrz.",
      },
      {
        tag: "Wszystko w jednym miejscu",
        text: "Użytkownicy, subskrypcje, logi i dostęp QR w jednym miejscu. Hasła w postaci skrótów, dostęp według ról, dane zostają na Twoim serwerze.",
      },
    ],
    modelsTitle: "Modele",
    modelsLead: "Uruchamiaj dowolne modele Ollama lokalnie albo podłącz Claude przez most.",
    servicesTag: "Co w środku",
    servicesTitle: "Dwie warstwy jednego systemu",
    services: [
      {
        tag: "Modele",
        title: "Lokalny AI",
        desc: "Ollama na Twoim komputerze albo most do Claude. Dowolne modele, pełna szybkość, żadnych cudzych tokenów.",
      },
      {
        tag: "Zarządzanie",
        title: "Aplikacja i klienci",
        desc: "Aplikacja desktopowa, klient webowy i telefon: użytkownicy, subskrypcje, logi i dostęp QR w jednym miejscu.",
      },
    ],
    pricingTag: "Cennik",
    pricingTitleA: "Prosty",
    pricingTitleB: "cennik",
    pricingLead: "Te same plany co w aplikacji. Anulujesz w dowolnej chwili.",
    monthly: "Miesięcznie",
    yearly: "Rocznie",
    save: "−17%",
    perMonth: "/mies",
    billedYearly: "płatność roczna",
    billedMonthly: "płatność miesięczna",
    freeForever: "Za darmo na zawsze",
    popular: "Popularny",
    startFree: "Zacznij za darmo",
    choose: "Wybierz",
  },
  plans: [
    { id: "free", name: "Free", info: "Na początek", feats: ["1 000 kredytów / mies", "Podstawowe funkcje", "Standardowa szybkość"] },
    { id: "pro", name: "Pro", info: "Do codziennej pracy", feats: ["5 000 kredytów / mies", "Wszystko z Free", "Wyższa szybkość", "Priorytetowa kolejka"] },
    { id: "ultra", name: "Ultra", info: "Maksimum możliwości", feats: ["15 000 kredytów / mies", "Najwyższa szybkość", "Najwyższy priorytet", "Wczesny dostęp do modeli"] },
  ],
  pricing: { title: "Cennik", lead: "Wybierz plan pod swoje obciążenie. Anulujesz w dowolnej chwili.", home: "Strona główna" },
  faq: {
    title: "Częste pytania",
    lead: "Krótko o tym, o co pytają najczęściej. Nie ma Twojego — napisz do nas.",
    items: [
      { q: "Czy potrzebny jest internet?", a: "Nie. Modele Ollama działają na Twoim sprzęcie, zapytania nigdzie nie wychodzą. Internet jest potrzebny tylko do pobrania modelu i jeśli podłączasz Claude przez most." },
      { q: "Gdzie trafiają moje dane?", a: "Nigdzie. Rozmowy, pliki i logi leżą na Twoim serwerze. Fizycznie ich nie widzimy — produkt nie ma chmury, do której mogłyby trafić." },
      { q: "Jaki sprzęt jest potrzebny?", a: "Do modeli 7–8 miliardów parametrów wystarczy 16 GB RAM. Karta graficzna nie jest konieczna, ale z nią odpowiedzi są wyraźnie szybsze. Mniejsze modele (phi3, gemma) działają i na 8 GB." },
      { q: "Czym różnią się taryfy?", a: "Liczbą kredytów miesięcznie, szybkością i priorytetem w kolejce. Sam serwer w każdej taryfie jest Twój i działa tak samo." },
      { q: "Czy można korzystać za darmo?", a: "Tak, Free jest bezterminowy: 1 000 kredytów miesięcznie i podstawowe funkcje. Karta niepotrzebna." },
      { q: "Ile urządzeń mogę podłączyć?", a: "Dowolnie wiele. Aplikacja desktopowa, klient webowy i telefon korzystają z jednego serwera i jednej bazy — subskrypcja jest przypisana do konta, nie do urządzenia." },
      { q: "Jak podłączyć telefon?", a: "W aplikacji jest sekcja „dostęp QR”: wydaje tymczasowy kod na 10 minut. Skieruj aparat — wszystko otworzy się na telefonie." },
      { q: "Co się stanie, gdy anuluję?", a: "Serwer działa dalej — jest Twój. Wracasz na limit kredytów Free, a dane zostają na miejscu." },
    ],
    ask: "Zadaj własne pytanie",
    docs: "Dokumentacja",
  },
  install: {
    title: "Instalacja",
    lead: "Cztery kroki, około piętnastu minut. Wszystko lokalnie.",
    steps: [
      { title: "Zainstaluj Ollama", body: "Pobierz z ollama.com. Po instalacji nasłuchuje na localhost:11434." },
      { title: "Pobierz model", body: "Potrzeba 16 GB RAM. Przy 8 GB weź phi3.", cmd: "ollama pull llama3" },
      { title: "Uruchom serwer", body: "Wstanie na localhost:3000. Pierwsze uruchomienie trwa dłużej.", cmd: "npm install\nnpm run dev" },
      { title: "Podłącz klientów", body: "Klient webowy już działa. Telefon — przez kod QR, nic nie instalujesz.", cmd: "cd desktop-app && npm install && npm start" },
    ],
    fixesTitle: "Jeśli nie ruszyło",
    fixes: [
      { k: "Port zajęty", v: "Uruchom na innym: npm run dev -- --port 3002" },
      { k: "Model milczy", v: "Sprawdź ollama list — model powinien być na liście" },
      { k: "Aplikacja nie widzi serwera", v: "Sprawdź port w ustawieniach i zaporę sieciową" },
    ],
    docs: "Dokumentacja",
    faq: "FAQ",
    contact: "Nie wyszło — napisz",
  },
  docs: {
    title: "Dokumentacja",
    lead: "Jak to działa i gdzie szukać, kiedy coś nie gra.",
    partsTitle: "Z czego składa się system",
    parts: [
      { name: "Ollama", text: "silnik, który trzyma modele i odpowiada na zapytania. Nasłuchuje na localhost:11434 i działa niezależnie od reszty." },
      { name: "Serwer", text: "warstwa na localhost:3000. Przechowuje użytkowników, subskrypcje i logi, serwuje klienta webowego i rozmawia z Ollama." },
      { name: "Klienci", text: "aplikacja desktopowa, klient webowy i telefon. Wszyscy trzej korzystają z jednego serwera i jednej bazy, więc historia i limity są wspólne." },
    ],
    endpointsTitle: "Przydatne adresy",
    endpoints: [
      { path: "/api/status", text: "Sprawdzenie, czy serwer żyje. Stąd też czyta wskaźnik w nagłówku." },
      { path: "/api/auth/register", text: "Rejestracja. Przyjmuje e-mail, hasło, nazwę użytkownika i wybraną taryfę." },
      { path: "/api/requests", text: "Zgłoszenia ze strony kontaktowej." },
    ],
    privacyTitle: "Prywatność",
    privacy:
      "Modele liczą na Twoim sprzęcie, baza leży obok serwera. Nic nie wychodzi na zewnątrz — poza sytuacją, gdy sam włączysz most do Claude: wtedy zapytania idą do niego.",
    install: "Instalacja",
    faq: "FAQ",
  },
  download: {
    title: "Pobierz",
    lead: "Aplikacja desktopowa do zarządzania serwerem. Sam serwer AI instaluje się osobno.",
    builds: [
      { os: "Windows", req: "Windows 10 lub nowszy, 64-bit", note: "Instalator z automatycznym startem serwera." },
      { os: "macOS", req: "macOS 12 lub nowszy, Intel i Apple Silicon", note: "Uniwersalna wersja — osobna dla układów M niepotrzebna." },
      { os: "Linux", req: "Ubuntu 22.04+, Fedora 38+, Arch", note: "Wersja przenośna: chmod +x i uruchamiaj." },
    ],
    soon: "plik pojawi się tutaj",
    phone: "Telefon",
    phoneText:
      "Nic nie instalujesz. Otwórz sekcję dostępu QR, naciśnij „Utwórz QR” i skieruj aparat — wszystko otworzy się w przeglądarce telefonu na 10 minut.",
    notReady:
      "Pliki nie są jeszcze opublikowane — pojawią się tutaj wraz z pierwszym publicznym wydaniem. Do tego czasu wszystko uruchamia się ze źródeł.",
    howInstall: "Jak zainstalować",
    docs: "Dokumentacja",
  },
  payment: {
    title: "Płatność",
    lead: "Przelej wygodnym sposobem, potem napisz do nas — włączymy taryfę.",
    recipientLabel: "Odbiorca",
    recipient: "Stepan P.",
    sbp: "SBP na numer telefonu",
    sbpNote: "T-Bank lub Ozon Bank — wybierz w swojej aplikacji bankowej.",
    cardOzon: "Karta Ozon Bank",
    cardTbank: "Karta T-Bank",
    cardNote: "Przelew na numer karty; prowizja zależy od Twojego banku.",
    crypto: "Kryptowaluta TON",
    cryptoNote: "Portfel Tonkeeper. Wyłącznie sieć TON — inne sieci nie są obsługiwane.",
    copy: "Kopiuj",
    copied: "Skopiowano",
    afterTitle: "Po zapłacie",
    after: "Wyślij potwierdzenie lub zrzut ekranu przez stronę kontaktu i podaj e-mail konta — taryfę włączamy ręcznie.",
    writeUs: "Napisz do nas",
    plans: "Zobacz taryfy",
    tgTitle: "Przez Telegram",
    tgReceipt: "Wyślij potwierdzenie do bota",
    tgReceiptNote: "Bot przyjmie zrzut przelewu i włączy taryfę.",
    tgStars: "Zapłać gwiazdkami",
    tgStarsNote: "Telegram Stars prosto w bocie — bez kart i przelewów.",
    open: "Otwórz",
  },
  contacts: {
    title: "Kontakt",
    lead: "Napisz wygodnym kanałem — albo zostaw zgłoszenie, zobaczymy je.",
    mail: "E-mail",
    telegram: "Telegram",
    dl: "Pobierz",
    dlValue: "Pliki i instalacja",
    formTitle: "Zostaw zgłoszenie",
    name: "Jak się do Ciebie zwracać",
    namePlaceholder: "Imię",
    contact: "Kontakt do odpowiedzi",
    contactPlaceholder: "you@example.com lub @username",
    message: "Wiadomość",
    messagePlaceholder: "Co trzeba zrobić, terminy, szczegóły…",
    submit: "Wyślij zgłoszenie",
    sending: "Wysyłanie…",
    ok: "Wysłane — odpowiemy na podany kontakt.",
    errEmpty: "Wypełnij wszystkie pola.",
    errServer: "Serwer niedostępny — uruchamia się razem z serwerem AI na porcie 3000. Na razie napisz e-mailem lub przez Telegram.",
    seeFaq: "Najpierw zajrzyj do FAQ",
  },
  terms: {
    title: "Warunki korzystania",
    lead: "Regulamin użytkownika",
    sections: [
      {
        title: "1. Postanowienia ogólne",
        body: "Korzystając z usługi AI Hub, akceptujesz warunki niniejszego regulaminu. Usługa zapewnia interfejs do pracy z lokalnymi i zdalnymi modelami sztucznej inteligencji.",
      },
      {
        title: "2. Prywatność i dane",
        body: "Kierujemy się zasadą maksymalnej prywatności. Wszystkie dane czatu są przechowywane w Twojej lokalnej bazie danych. Nie mamy dostępu do Twoich wiadomości, chyba że samodzielnie skonfigurujesz zdalny serwer z naszym dostępem.",
      },
      {
        title: "3. Odpowiedzialność",
        body: "AI Hub nie ponosi odpowiedzialności za treść odpowiedzi generowanych przez modele AI. Użytkownik samodzielnie ocenia wiarygodność otrzymanych informacji.",
      },
      {
        title: "4. Korzystanie z zasobów",
        body: "Zobowiązujesz się nie wykorzystywać usługi do tworzenia szkodliwych treści, spamu ani przeprowadzania cyberataków. Naruszenie tych warunków może skutkować ograniczeniem dostępu do konta.",
      },
    ],
    note: "Ten dokument ma charakter informacyjny i służy zapewnieniu przejrzystości działania systemu AI Hub.",
  },
};

export const CONTENT: Record<Lang, Content> = { ru, en, uk, pl };
