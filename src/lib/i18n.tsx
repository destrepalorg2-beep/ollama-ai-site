"use client";

import * as React from "react";
import * as db from "@/lib/db";

export const LANGS = [
  { code: "ru", label: "Русский", short: "RU" },
  { code: "en", label: "English", short: "EN" },
  { code: "uk", label: "Українська", short: "UK" },
  { code: "pl", label: "Polski", short: "PL" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];

type Dict = Record<string, string>;

/* Russian is the source text; the other three mirror its keys exactly. */
const ru: Dict = {
  "nav.features": "Возможности",
  "nav.models": "Модели",
  "nav.pricing": "Тарифы",
  "nav.payment": "Оплата",
  "nav.download": "Скачать",
  "nav.faq": "FAQ",
  "nav.contacts": "Контакты",
  "nav.signin": "Войти",

  "menu.profile": "Мой профиль",
  "menu.subscription": "Подписка",
  "menu.download": "Скачать",
  "menu.signout": "Выйти",

  "foot.product": "Продукт",
  "foot.help": "Помощь",
  "foot.account": "Аккаунт",
  "foot.register": "Регистрация",
  "foot.profile": "Профиль",
  "foot.terms": "Условия",
  "foot.write": "Написать нам",
  "foot.tagline":
    "Один AI-сервер на вашем железе. Десктоп-приложение, веб-клиент и телефон работают с одними моделями — без облака и чужих токенов.",
  "foot.privacy": "Все данные остаются на вашем сервере.",

  "auth.signin.title": "Вход",
  "auth.signin.desc": "Войдите, чтобы продолжить работу с AI HUB.",
  "auth.signin.submit": "Войти",
  "auth.signin.switch": "Ещё нет аккаунта?",
  "auth.signin.switchAction": "Зарегистрироваться",
  "auth.register.title": "Регистрация",
  "auth.register.desc": "Создайте аккаунт — доступ к сервису и моделям.",
  "auth.register.submit": "Создать аккаунт",
  "auth.register.switch": "Уже есть аккаунт?",
  "auth.register.switchAction": "Войти",
  "auth.social": "Быстрый вход",
  "auth.or": "или",
  "auth.email": "Email",
  "auth.password": "Пароль",
  "auth.forgot": "Забыли пароль?",
  "auth.confirm": "Повторите пароль",
  "auth.nickname": "Никнейм",
  "auth.nicknamePlaceholder": "Ваше имя в системе",
  "auth.tooShort": "Минимум 8 символов.",
  "auth.mismatch": "Пароли не совпадают.",
  "auth.magic": "Войти по ссылке на почту",
  "auth.termsPrefix": "Продолжая, вы принимаете",
  "auth.terms": "условия",
  "auth.and": "и",
  "auth.privacy": "политику конфиденциальности",
  "auth.home": "На главную",
  "auth.showPassword": "Показать пароль",
  "auth.hidePassword": "Скрыть пароль",

  "profile.loading": "Загрузка…",
  "profile.noEmail": "email не указан",
  "profile.tab.profile": "Профиль",
  "profile.tab.subscription": "Подписка",
  "profile.tab.download": "Скачать",
  "profile.signout": "Выйти",
  "profile.data": "Данные профиля",
  "profile.dataDesc": "Как вас видно в системе.",
  "profile.fieldNickname": "Никнейм",
  "profile.fieldEmail": "Email",
  "profile.fieldPlan": "Тариф",
  "profile.notSet": "не указан",
  "profile.planNotChosen": "не выбран",
  "profile.subTitle": "Подписка",
  "profile.subDesc": "Текущий тариф и что в него входит.",
  "profile.currentPlan": "Текущий тариф",
  "profile.planNone": "Не выбран",
  "profile.changePlan": "Сменить тариф",
  "profile.choosePlan": "Выбрать тариф",
  "profile.connected": "Подключён",
  "profile.cancelNote": "Отменить можно в любой момент — сервер продолжит работать, вы вернётесь на Free.",
  "profile.dlTitle": "Скачать",
  "profile.dlDesc": "Десктоп-приложение для управления сервером.",
  "profile.dlPhone": "Телефон",
  "profile.dlPhoneNote": "по QR-коду, ставить нечего",
  "profile.dlNote":
    "Сборки появятся здесь к первому публичному релизу. Пока сервер и приложение запускаются из исходников — как это сделать, написано на странице установки.",
  "profile.howInstall": "Как установить",
  "profile.offline":
    "Вход без сервера: AI-сервер на порту 3000 не отвечал, поэтому вас пустили локально. Пароль не проверялся, данные хранятся только в этом браузере.",

  "verify.title": "Проверьте почту",
  "verify.subtitle": "Мы отправили 6-значный код подтверждения на",
  "verify.otpTitle": "Введите код",
  "verify.otpTitleLoading": "Проверка...",
  "verify.otpSubtitle": "6 цифр из письма — код действует 15 минут.",
  "verify.successTitle": "Email подтверждён",
  "verify.successSubtitle": "Выполняется вход...",
  "verify.successMessage": "Email подтверждён! Вход в систему...",
  "verify.errorExpired": "Код истёк. Запросите новый",
  "verify.errorTooMany": "Слишком много неверных попыток",
  "verify.errorInvalid": "Неверный код. Попробуйте ещё раз",
  "verify.errorGeneric": "Ошибка проверки кода",
  "verify.errorConnection": "Ошибка соединения с сервером",
  "verify.resendSuccess": "Новый код отправлен!",
  "verify.resendTooMany": "Слишком много попыток. Подождите 10 минут",
  "verify.resendError": "Ошибка отправки",
  "verify.resendConnectionError": "Ошибка соединения",
  "verify.noCode": "Не получили код?",
  "verify.resend": "Отправить повторно",
  "verify.resending": "Отправка...",
  "verify.otpWaiting": "Ожидание ввода…",
  "verify.otpEntered": "Введено: {n} / 6",
  "verify.otpComplete": "Код введён",

  "lang.title": "Язык интерфейса",
};

const en: Dict = {
  "nav.features": "Features",
  "nav.models": "Models",
  "nav.pricing": "Pricing",
  "nav.payment": "Payment",
  "nav.download": "Download",
  "nav.faq": "FAQ",
  "nav.contacts": "Contact",
  "nav.signin": "Sign in",

  "menu.profile": "My profile",
  "menu.subscription": "Subscription",
  "menu.download": "Download",
  "menu.signout": "Sign out",

  "foot.product": "Product",
  "foot.help": "Help",
  "foot.account": "Account",
  "foot.register": "Sign up",
  "foot.profile": "Profile",
  "foot.terms": "Terms",
  "foot.write": "Write to us",
  "foot.tagline":
    "One AI server on your own hardware. The desktop app, web client and phone all share the same models — no cloud, no rented tokens.",
  "foot.privacy": "Your data never leaves your server.",

  "auth.signin.title": "Sign in",
  "auth.signin.desc": "Sign in to carry on with AI HUB.",
  "auth.signin.submit": "Sign in",
  "auth.signin.switch": "No account yet?",
  "auth.signin.switchAction": "Create one",
  "auth.register.title": "Sign up",
  "auth.register.desc": "Create an account — access to the service and the models.",
  "auth.register.submit": "Create account",
  "auth.register.switch": "Already have an account?",
  "auth.register.switchAction": "Sign in",
  "auth.social": "Quick sign-in",
  "auth.or": "or",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.forgot": "Forgot password?",
  "auth.confirm": "Repeat password",
  "auth.nickname": "Username",
  "auth.nicknamePlaceholder": "Your name in the system",
  "auth.tooShort": "At least 8 characters.",
  "auth.mismatch": "Passwords do not match.",
  "auth.magic": "Sign in with an email link",
  "auth.termsPrefix": "By continuing you accept the",
  "auth.terms": "terms",
  "auth.and": "and the",
  "auth.privacy": "privacy policy",
  "auth.home": "Home",
  "auth.showPassword": "Show password",
  "auth.hidePassword": "Hide password",

  "profile.loading": "Loading…",
  "profile.noEmail": "no email set",
  "profile.tab.profile": "Profile",
  "profile.tab.subscription": "Subscription",
  "profile.tab.download": "Download",
  "profile.signout": "Sign out",
  "profile.data": "Profile details",
  "profile.dataDesc": "How you appear in the system.",
  "profile.fieldNickname": "Username",
  "profile.fieldEmail": "Email",
  "profile.fieldPlan": "Plan",
  "profile.notSet": "not set",
  "profile.planNotChosen": "not chosen",
  "profile.subTitle": "Subscription",
  "profile.subDesc": "Your current plan and what it includes.",
  "profile.currentPlan": "Current plan",
  "profile.planNone": "Not chosen",
  "profile.changePlan": "Change plan",
  "profile.choosePlan": "Choose a plan",
  "profile.connected": "Active",
  "profile.cancelNote": "Cancel any time — the server keeps running and you drop back to Free.",
  "profile.dlTitle": "Download",
  "profile.dlDesc": "Desktop app for managing the server.",
  "profile.dlPhone": "Phone",
  "profile.dlPhoneNote": "by QR code, nothing to install",
  "profile.dlNote":
    "Builds land here with the first public release. Until then the server and the app run from source — the install page explains how.",
  "profile.howInstall": "How to install",
  "profile.offline":
    "Signed in without a server: the AI server on port 3000 did not answer, so you were let through locally. No password was checked and the data lives only in this browser.",

  "verify.title": "Check your email",
  "verify.subtitle": "We sent a 6-digit verification code to",
  "verify.otpTitle": "Enter the code",
  "verify.otpTitleLoading": "Checking...",
  "verify.otpSubtitle": "6 digits from the email — valid for 15 minutes.",
  "verify.successTitle": "Email confirmed",
  "verify.successSubtitle": "Signing you in...",
  "verify.successMessage": "Email confirmed! Signing you in...",
  "verify.errorExpired": "Code expired. Request a new one",
  "verify.errorTooMany": "Too many failed attempts",
  "verify.errorInvalid": "Wrong code. Try again",
  "verify.errorGeneric": "Couldn't verify the code",
  "verify.errorConnection": "Couldn't reach the server",
  "verify.resendSuccess": "New code sent!",
  "verify.resendTooMany": "Too many attempts. Wait 10 minutes",
  "verify.resendError": "Couldn't send the code",
  "verify.resendConnectionError": "Connection error",
  "verify.noCode": "Didn't get the code?",
  "verify.resend": "Resend code",
  "verify.resending": "Sending...",
  "verify.otpWaiting": "Waiting for input…",
  "verify.otpEntered": "Entered: {n} / 6",
  "verify.otpComplete": "Code entered",

  "lang.title": "Interface language",
};

const uk: Dict = {
  "nav.features": "Можливості",
  "nav.models": "Моделі",
  "nav.pricing": "Тарифи",
  "nav.payment": "Оплата",
  "nav.download": "Завантажити",
  "nav.faq": "FAQ",
  "nav.contacts": "Контакти",
  "nav.signin": "Увійти",

  "menu.profile": "Мій профіль",
  "menu.subscription": "Підписка",
  "menu.download": "Завантажити",
  "menu.signout": "Вийти",

  "foot.product": "Продукт",
  "foot.help": "Допомога",
  "foot.account": "Акаунт",
  "foot.register": "Реєстрація",
  "foot.profile": "Профіль",
  "foot.terms": "Умови",
  "foot.write": "Написати нам",
  "foot.tagline":
    "Один AI-сервер на вашому залізі. Десктоп-застосунок, вебклієнт і телефон працюють з одними моделями — без хмари та чужих токенів.",
  "foot.privacy": "Усі дані залишаються на вашому сервері.",

  "auth.signin.title": "Вхід",
  "auth.signin.desc": "Увійдіть, щоб продовжити роботу з AI HUB.",
  "auth.signin.submit": "Увійти",
  "auth.signin.switch": "Ще немає акаунта?",
  "auth.signin.switchAction": "Зареєструватися",
  "auth.register.title": "Реєстрація",
  "auth.register.desc": "Створіть акаунт — доступ до сервісу та моделей.",
  "auth.register.submit": "Створити акаунт",
  "auth.register.switch": "Вже є акаунт?",
  "auth.register.switchAction": "Увійти",
  "auth.social": "Швидкий вхід",
  "auth.or": "або",
  "auth.email": "Email",
  "auth.password": "Пароль",
  "auth.forgot": "Забули пароль?",
  "auth.confirm": "Повторіть пароль",
  "auth.nickname": "Нікнейм",
  "auth.nicknamePlaceholder": "Ваше ім'я в системі",
  "auth.tooShort": "Щонайменше 8 символів.",
  "auth.mismatch": "Паролі не збігаються.",
  "auth.magic": "Увійти за посиланням на пошту",
  "auth.termsPrefix": "Продовжуючи, ви приймаєте",
  "auth.terms": "умови",
  "auth.and": "і",
  "auth.privacy": "політику конфіденційності",
  "auth.home": "На головну",
  "auth.showPassword": "Показати пароль",
  "auth.hidePassword": "Сховати пароль",

  "profile.loading": "Завантаження…",
  "profile.noEmail": "email не вказано",
  "profile.tab.profile": "Профіль",
  "profile.tab.subscription": "Підписка",
  "profile.tab.download": "Завантажити",
  "profile.signout": "Вийти",
  "profile.data": "Дані профілю",
  "profile.dataDesc": "Як вас видно в системі.",
  "profile.fieldNickname": "Нікнейм",
  "profile.fieldEmail": "Email",
  "profile.fieldPlan": "Тариф",
  "profile.notSet": "не вказано",
  "profile.planNotChosen": "не вибрано",
  "profile.subTitle": "Підписка",
  "profile.subDesc": "Поточний тариф і що до нього входить.",
  "profile.currentPlan": "Поточний тариф",
  "profile.planNone": "Не вибрано",
  "profile.changePlan": "Змінити тариф",
  "profile.choosePlan": "Вибрати тариф",
  "profile.connected": "Підключено",
  "profile.cancelNote": "Скасувати можна будь-коли — сервер працюватиме далі, ви повернетесь на Free.",
  "profile.dlTitle": "Завантажити",
  "profile.dlDesc": "Десктоп-застосунок для керування сервером.",
  "profile.dlPhone": "Телефон",
  "profile.dlPhoneNote": "за QR-кодом, встановлювати нічого",
  "profile.dlNote":
    "Збірки з'являться тут до першого публічного релізу. Поки сервер і застосунок запускаються з вихідних кодів — як це зробити, написано на сторінці встановлення.",
  "profile.howInstall": "Як встановити",
  "profile.offline":
    "Вхід без сервера: AI-сервер на порту 3000 не відповів, тому вас пустили локально. Пароль не перевірявся, дані зберігаються лише в цьому браузері.",

  "verify.title": "Перевірте пошту",
  "verify.subtitle": "Ми надіслали 6-значний код підтвердження на",
  "verify.otpTitle": "Введіть код",
  "verify.otpTitleLoading": "Перевірка...",
  "verify.otpSubtitle": "6 цифр з листа — код дійсний 15 хвилин.",
  "verify.successTitle": "Email підтверджено",
  "verify.successSubtitle": "Виконується вхід...",
  "verify.successMessage": "Email підтверджено! Виконується вхід...",
  "verify.errorExpired": "Код прострочено. Запросіть новий",
  "verify.errorTooMany": "Забагато невдалих спроб",
  "verify.errorInvalid": "Невірний код. Спробуйте ще раз",
  "verify.errorGeneric": "Помилка перевірки коду",
  "verify.errorConnection": "Помилка з'єднання з сервером",
  "verify.resendSuccess": "Новий код надіслано!",
  "verify.resendTooMany": "Забагато спроб. Зачекайте 10 хвилин",
  "verify.resendError": "Помилка надсилання",
  "verify.resendConnectionError": "Помилка з'єднання",
  "verify.noCode": "Не отримали код?",
  "verify.resend": "Надіслати повторно",
  "verify.resending": "Надсилання...",
  "verify.otpWaiting": "Очікування вводу…",
  "verify.otpEntered": "Введено: {n} / 6",
  "verify.otpComplete": "Код введено",

  "lang.title": "Мова інтерфейсу",
};

const pl: Dict = {
  "nav.features": "Możliwości",
  "nav.models": "Modele",
  "nav.pricing": "Cennik",
  "nav.payment": "Płatność",
  "nav.download": "Pobierz",
  "nav.faq": "FAQ",
  "nav.contacts": "Kontakt",
  "nav.signin": "Zaloguj",

  "menu.profile": "Mój profil",
  "menu.subscription": "Subskrypcja",
  "menu.download": "Pobierz",
  "menu.signout": "Wyloguj",

  "foot.product": "Produkt",
  "foot.help": "Pomoc",
  "foot.account": "Konto",
  "foot.register": "Rejestracja",
  "foot.profile": "Profil",
  "foot.terms": "Warunki",
  "foot.write": "Napisz do nas",
  "foot.tagline":
    "Jeden serwer AI na Twoim sprzęcie. Aplikacja desktopowa, klient webowy i telefon korzystają z tych samych modeli — bez chmury i cudzych tokenów.",
  "foot.privacy": "Wszystkie dane zostają na Twoim serwerze.",

  "auth.signin.title": "Logowanie",
  "auth.signin.desc": "Zaloguj się, aby wrócić do pracy z AI HUB.",
  "auth.signin.submit": "Zaloguj",
  "auth.signin.switch": "Nie masz jeszcze konta?",
  "auth.signin.switchAction": "Zarejestruj się",
  "auth.register.title": "Rejestracja",
  "auth.register.desc": "Załóż konto — dostęp do usługi i modeli.",
  "auth.register.submit": "Utwórz konto",
  "auth.register.switch": "Masz już konto?",
  "auth.register.switchAction": "Zaloguj",
  "auth.social": "Szybkie logowanie",
  "auth.or": "lub",
  "auth.email": "E-mail",
  "auth.password": "Hasło",
  "auth.forgot": "Nie pamiętasz hasła?",
  "auth.confirm": "Powtórz hasło",
  "auth.nickname": "Nazwa użytkownika",
  "auth.nicknamePlaceholder": "Twoja nazwa w systemie",
  "auth.tooShort": "Co najmniej 8 znaków.",
  "auth.mismatch": "Hasła nie są takie same.",
  "auth.magic": "Zaloguj linkiem z e-maila",
  "auth.termsPrefix": "Kontynuując, akceptujesz",
  "auth.terms": "warunki",
  "auth.and": "oraz",
  "auth.privacy": "politykę prywatności",
  "auth.home": "Strona główna",
  "auth.showPassword": "Pokaż hasło",
  "auth.hidePassword": "Ukryj hasło",

  "profile.loading": "Ładowanie…",
  "profile.noEmail": "brak adresu e-mail",
  "profile.tab.profile": "Profil",
  "profile.tab.subscription": "Subskrypcja",
  "profile.tab.download": "Pobierz",
  "profile.signout": "Wyloguj",
  "profile.data": "Dane profilu",
  "profile.dataDesc": "Jak widać Cię w systemie.",
  "profile.fieldNickname": "Nazwa użytkownika",
  "profile.fieldEmail": "E-mail",
  "profile.fieldPlan": "Taryfa",
  "profile.notSet": "nie podano",
  "profile.planNotChosen": "nie wybrano",
  "profile.subTitle": "Subskrypcja",
  "profile.subDesc": "Bieżąca taryfa i co obejmuje.",
  "profile.currentPlan": "Bieżąca taryfa",
  "profile.planNone": "Nie wybrano",
  "profile.changePlan": "Zmień taryfę",
  "profile.choosePlan": "Wybierz taryfę",
  "profile.connected": "Aktywna",
  "profile.cancelNote": "Anulujesz w dowolnej chwili — serwer działa dalej, wracasz na Free.",
  "profile.dlTitle": "Pobierz",
  "profile.dlDesc": "Aplikacja desktopowa do zarządzania serwerem.",
  "profile.dlPhone": "Telefon",
  "profile.dlPhoneNote": "przez kod QR, nic nie instalujesz",
  "profile.dlNote":
    "Pliki pojawią się tutaj wraz z pierwszym publicznym wydaniem. Na razie serwer i aplikacja uruchamiają się ze źródeł — opisuje to strona instalacji.",
  "profile.howInstall": "Jak zainstalować",
  "profile.offline":
    "Logowanie bez serwera: serwer AI na porcie 3000 nie odpowiedział, więc wpuszczono Cię lokalnie. Hasło nie było sprawdzane, dane są tylko w tej przeglądarce.",

  "verify.title": "Sprawdź pocztę",
  "verify.subtitle": "Wysłaliśmy 6-cyfrowy kod weryfikacyjny na",
  "verify.otpTitle": "Wpisz kod",
  "verify.otpTitleLoading": "Weryfikacja...",
  "verify.otpSubtitle": "6 cyfr z e-maila — kod ważny 15 minut.",
  "verify.successTitle": "Email potwierdzony",
  "verify.successSubtitle": "Trwa logowanie...",
  "verify.successMessage": "Email potwierdzony! Trwa logowanie...",
  "verify.errorExpired": "Kod wygasł. Poproś o nowy",
  "verify.errorTooMany": "Zbyt wiele nieudanych prób",
  "verify.errorInvalid": "Błędny kod. Spróbuj ponownie",
  "verify.errorGeneric": "Nie udało się zweryfikować kodu",
  "verify.errorConnection": "Błąd połączenia z serwerem",
  "verify.resendSuccess": "Nowy kod wysłany!",
  "verify.resendTooMany": "Zbyt wiele prób. Odczekaj 10 minut",
  "verify.resendError": "Błąd wysyłki",
  "verify.resendConnectionError": "Błąd połączenia",
  "verify.noCode": "Nie otrzymałeś kodu?",
  "verify.resend": "Wyślij ponownie",
  "verify.resending": "Wysyłanie...",
  "verify.otpWaiting": "Oczekiwanie na wpis…",
  "verify.otpEntered": "Wpisano: {n} / 6",
  "verify.otpComplete": "Kod wpisany",

  "lang.title": "Język interfejsu",
};

const DICTS: Record<Lang, Dict> = { ru, en, uk, pl };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string };
const LangCtx = React.createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  // Always start on the source language so the server HTML and the first
  // client render agree; the stored choice is applied in an effect.
  const [lang, setLangState] = React.useState<Lang>("ru");

  React.useEffect(() => {
    const saved = db.read().prefs.lang as Lang | undefined;
    if (saved && DICTS[saved]) setLangState(saved);
    // Every visit pushes the session expiry forward, so an account in regular
    // use never gets signed out.
    db.touchSession();
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    db.write({ prefs: { ...db.read().prefs, lang: l } });
  }, []);

  const t = React.useCallback((key: string) => DICTS[lang][key] ?? ru[key] ?? key, [lang]);

  const value = React.useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useT(): Ctx {
  const ctx = React.useContext(LangCtx);
  // Falling back keeps components usable outside the provider rather than
  // throwing and blanking the page.
  if (!ctx) return { lang: "ru", setLang: () => {}, t: (k: string) => ru[k] ?? k };
  return ctx;
}
