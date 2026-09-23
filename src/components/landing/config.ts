/** Landing config for AI HUB — endpoints connect the site to the local server. */
export const hub = {
  name: "AI HUB",
  apiBase: "http://localhost:3000",
  webClient: "http://localhost:3000",
  adminUrl: "http://localhost:3000/admin",
  // Keep the existing site menu links untouched.
  nav: [
    { label: "Возможности", href: "/#features" },
    { label: "Модели", href: "/#models" },
    { label: "Тарифы", href: "/pricing" },
    { label: "Документация", href: "/docs" },
    { label: "Войти", href: "/login" },
  ] as { label: string; href: string }[],
  plans: [
    { id: "free", name: "Free", info: "Для знакомства", monthly: 0, yearly: 0, feats: ["1 000 кредитов / мес", "Основные функции", "Стандартная скорость"] },
    { id: "pro", name: "Pro", info: "Для активной работы", monthly: 490, yearly: 4900, popular: true, feats: ["5 000 кредитов / мес", "Все функции Free", "Повышенная скорость", "Приоритетная очередь"] },
    { id: "ultra", name: "Ultra", info: "Максимум возможностей", monthly: 1490, yearly: 14900, feats: ["15 000 кредитов / мес", "Максимальная скорость", "Высший приоритет", "Ранний доступ к моделям"] },
  ] as Plan[],
  models: ["llama3", "llama2", "mistral", "phi3", "gemma", "qwen2", "codellama", "deepseek-coder"],
};

export type Plan = { id: string; name: string; info: string; monthly: number; yearly: number; popular?: boolean; feats: string[] };
export const rub = (n: number) => n.toLocaleString("ru-RU") + " ₽";
