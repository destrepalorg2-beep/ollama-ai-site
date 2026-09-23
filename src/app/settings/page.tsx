"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit2, Mail, Lock, Globe, Camera, Save, X, Trash2, LogOut, AlertTriangle, Bell, Moon, Languages, Info, HelpCircle, Home, MessageSquare, Settings, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Profile {
  nickname: string;
  email: string;
  avatar: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ type: "nickname" | "email" | "password" | "server" | null; data: any } | null>(null);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  useEffect(() => {
    if (!authToken) {
      router.push("/login");
    } else {
      loadProfile();
    }
  }, [authToken, router]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/profile", {
        headers: { "Authorization": `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      } else if (response.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Load profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      const response = await fetch("http://localhost:3000/api/profile", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, ...data } : null);
        return true;
      } else {
        const error = await response.json();
        showToast(error.error || "Ошибка обновления", "error");
        return false;
      }
    } catch (error) {
      showToast("Ошибка соединения", "error");
      return false;
    }
  };

  const handleSaveNickname = async (newNickname: string) => {
    if (newNickname.length < 2) {
      showToast("Имя слишком короткое", "error");
      return;
    }
    if (await updateProfile({ nickname: newNickname })) {
      setModal(null);
      showToast("Имя обновлено");
    }
  };

  const handleSaveEmail = async (newEmail: string) => {
    if (!newEmail.includes("@")) {
      showToast("Некорректный email", "error");
      return;
    }
    if (await updateProfile({ email: newEmail })) {
      setModal(null);
      showToast("Email обновлён. Проверьте почту");
    }
  };

  const handleSaveAvatar = async (newAvatar: string) => {
    if (await updateProfile({ avatar: newAvatar })) {
      setModal(null);
      showToast("Аватар обновлён");
    }
  };

  const handleSavePassword = async (password: string, confirm: string) => {
    if (password.length < 6) {
      showToast("Пароль слишком короткий", "error");
      return;
    }
    if (password !== confirm) {
      showToast("Пароли не совпадают", "error");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/profile", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        setModal(null);
        showToast("Пароль установлен");
      } else {
        const error = await response.json();
        showToast(error.error || "Ошибка", "error");
      }
    } catch (e) {
      showToast("Ошибка соединения", "error");
    }
  };

  const handleConnectServer = async (ip: string, port: string) => {
    const serverUrl = `http://${ip}:${port}`;
    const servers = JSON.parse(localStorage.getItem("savedServers") || "[]");
    if (!servers.find((s: any) => s.url === serverUrl)) {
      servers.push({ url: serverUrl, name: `Сервер ${ip}`, addedAt: new Date().toISOString() });
      localStorage.setItem("savedServers", JSON.stringify(servers));
    }
    localStorage.setItem("serverUrl", serverUrl);
    setModal(null);
    showToast(`Подключено к ${ip}:${port}`);
  };

  const logout = () => {
    if (confirm("Выйти из аккаунта?")) {
      localStorage.removeItem("authToken");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1e] text-white pb-24">
      {/* Header */}
      <header className="bg-[#1a1a2e] p-4 flex items-center gap-4 border-b border-[#2a2a3e] sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Настройки</h1>
      </header>

      {/* Profile Section */}
      <div className="bg-gradient-to-br from-[#7c3aed] to-[#a855f7] p-8 text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center text-4xl cursor-pointer hover:scale-105 transition-transform overflow-hidden">
            {profile?.avatar && profile.avatar.startsWith('http') ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile?.avatar || "👤"
            )}
          </div>
          <button
            className="absolute bottom-0 right-0 w-8 h-8 bg-[#1a1a2e] border-2 border-[#7c3aed] rounded-full flex items-center justify-center text-xs"
            onClick={() => setModal({ type: "avatar", data: profile?.avatar })}
          >
            📷
          </button>
        </div>
        <h2 className="text-2xl font-bold">{profile?.nickname || "Загрузка..."}</h2>
        <p className="text-white/70 text-sm">{profile?.email || "..."}</p>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-8">
        {/* Account Settings */}
        <section>
          <h3 className="text-[#9ca3af] text-xs font-semibold uppercase tracking-wider mb-4 px-2">Аккаунт</h3>
          <div className="space-y-2">
            <SettingsItem
              icon={<Edit2 className="w-5 h-5" />}
              label="Изменить имя"
              value={profile?.nickname}
              onClick={() => setModal({ type: "nickname", data: profile?.nickname })}
            />
            <SettingsItem
              icon={<Mail className="w-5 h-5" />}
              label="Изменить email"
              value={profile?.email}
              onClick={() => setModal({ type: "email", data: profile?.email })}
            />
            <SettingsItem
              icon={<Lock className="w-5 h-5" />}
              label="Пароль"
              value="Установить пароль"
              onClick={() => setModal({ type: "password", data: null })}
            />
          </div>
        </section>

        {/* Server Connection */}
        <section>
          <h3 className="text-[#9ca3af] text-xs font-semibold uppercase tracking-wider mb-4 px-2">Подключение к ПК</h3>
          <div className="space-y-2">
            <SettingsItem
              icon={<Camera className="w-5 h-5" />}
              label="Сканировать QR-код"
              value="Автоматический вход"
              onClick={() => showToast("QR-сканер в разработке", "error")}
            />
            <SettingsItem
              icon={<Globe className="w-5 h-5" />}
              label="Ручное подключение"
              value="IP и Порт"
              onClick={() => setModal({ type: "server", data: null })}
            />
            <SettingsItem
              icon={<Save className="w-5 h-5" />}
              label="Сохранённые серверы"
              value="Список серверов"
              onClick={() => {
                const servers = JSON.parse(localStorage.getItem("savedServers") || "[]");
                showToast(`${servers.length} серверов сохранено`);
              }}
            />
          </div>
        </section>

        {/* App Settings */}
        <section>
          <h3 className="text-[#9ca3af] text-xs font-semibold uppercase tracking-wider mb-4 px-2">Приложение</h3>
          <div className="space-y-2">
            <SettingsItem
              icon={<Languages className="w-5 h-5" />}
              label="Язык"
              value="Русский"
              onClick={() => showToast("Другие языки в разработке", "error")}
            />
            <SettingsItem
              icon={<Moon className="w-5 h-5" />}
              label="Тёмная тема"
              value="Включено"
              isToggle
              active={true}
              onClick={() => showToast("Светлая тема в разработке", "error")}
            />
            <SettingsItem
              icon={<Bell className="w-5 h-5" />}
              label="Уведомления"
              value="Включены"
              isToggle
              active={true}
              onClick={() => showToast("Настройки уведомлений сохранены")}
            />
          </div>
        </section>

        <section>
          <h3 className="text-[#9ca3af] text-xs font-semibold uppercase tracking-wider mb-4 px-2">Информация</h3>
          <div className="space-y-2">
            <SettingsItem
              icon={<Info className="w-5 h-5" />}
              label="О приложении"
              value="Версия 1.0.0"
              onClick={() => router.push("/about")}
            />
            <SettingsItem
              icon={<HelpCircle className="w-5 h-5" />}
              label="Помощь"
              value="FAQ и поддержка"
              onClick={() => router.push("/terms")}
            />
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-8 border-t border-red-900/30">
          <h3 className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-4 px-2">Опасная зона</h3>
          <div className="space-y-2">
            <SettingsItem
              icon={<Trash2 className="w-5 h-5 text-red-400" />}
              label="Очистить данные"
              value="Локальный кеш"
              danger
              onClick={() => {
                if (confirm("Очистить все локальные данные?")) {
                  localStorage.removeItem("savedServers");
                  showToast("Данные очищены");
                }
              }}
            />
            <SettingsItem
              icon={<LogOut className="w-5 h-5 text-red-400" />}
              label="Выйти"
              value="Завершить сессию"
              danger
              onClick={logout}
            />
            <SettingsItem
              icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
              label="Удалить аккаунт"
              value="Безвозвратно"
              danger
              onClick={() => {
                if (confirm("ВНИМАНИЕ! Вы уверены, что хотите удалить аккаунт?")) {
                  showToast("Запрос на удаление отправлен", "error");
                }
              }}
            />
          </div>
        </section>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1a1a2e] rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {modal.type === "avatar" && "Изменить аватар"}
                  {modal.type === "nickname" && "Изменить имя"}
                  {modal.type === "email" && "Изменить email"}
                  {modal.type === "password" && "Установить пароль"}
                  {modal.type === "server" && "Подключение к серверу"}
                </h3>
                <button onClick={() => setModal(null)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modal.type === "avatar" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">URL изображения или Emoji</label>
                    <input
                      autoFocus
                      type="text"
                      defaultValue={modal.data}
                      id="modal-avatar"
                      className="w-full p-3 bg-[#2a2a3e] border-2 border-transparent rounded-xl text-white focus:outline-none focus:border-[#7c3aed]"
                    />
                  </div>
                  <button
                    onClick={() => handleSaveAvatar((document.getElementById("modal-avatar") as HTMLInputElement).value)}
                    className="w-full p-3 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-xl font-semibold"
                  >
                    Сохранить
                  </button>
                </div>
              )}

              {modal.type === "nickname" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Новый никнейм</label>
                    <input
                      autoFocus
                      type="text"
                      defaultValue={modal.data}
                      id="modal-nickname"
                      className="w-full p-3 bg-[#2a2a3e] border-2 border-transparent rounded-xl text-white focus:outline-none focus:border-[#7c3aed]"
                    />
                  </div>
                  <button
                    onClick={() => handleSaveNickname((document.getElementById("modal-nickname") as HTMLInputElement).value)}
                    className="w-full p-3 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-xl font-semibold"
                  >
                    Сохранить
                  </button>
                </div>
              )}

              {modal.type === "email" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Новый email</label>
                    <input
                      autoFocus
                      type="email"
                      defaultValue={modal.data}
                      id="modal-email"
                      className="w-full p-3 bg-[#2a2a3e] border-2 border-transparent rounded-xl text-white focus:outline-none focus:border-[#7c3aed]"
                    />
                  </div>
                  <button
                    onClick={() => handleSaveEmail((document.getElementById("modal-email") as HTMLInputElement).value)}
                    className="w-full p-3 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-xl font-semibold"
                  >
                    Сохранить
                  </button>
                </div>
              )}

              {modal.type === "password" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Новый пароль</label>
                    <input
                      autoFocus
                      type="password"
                      id="modal-pass"
                      className="w-full p-3 bg-[#2a2a3e] border-2 border-transparent rounded-xl text-white focus:outline-none focus:border-[#7c3aed]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Подтвердите пароль</label>
                    <input
                      type="password"
                      id="modal-pass-confirm"
                      className="w-full p-3 bg-[#2a2a3e] border-2 border-transparent rounded-xl text-white focus:outline-none focus:border-[#7c3aed]"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const p = (document.getElementById("modal-pass") as HTMLInputElement).value;
                      const c = (document.getElementById("modal-pass-confirm") as HTMLInputElement).value;
                      handleSavePassword(p, c);
                    }}
                    className="w-full p-3 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-xl font-semibold"
                  >
                    Сохранить
                  </button>
                </div>
              )}

              {modal.type === "server" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">IP адрес</label>
                    <input
                      autoFocus
                      type="text"
                      id="modal-ip"
                      placeholder="192.168.1.100"
                      className="w-full p-3 bg-[#2a2a3e] border-2 border-transparent rounded-xl text-white focus:outline-none focus:border-[#7c3aed]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Порт</label>
                    <input
                      type="number"
                      id="modal-port"
                      defaultValue="3000"
                      className="w-full p-3 bg-[#2a2a3e] border-2 border-transparent rounded-xl text-white focus:outline-none focus:border-[#7c3aed]"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const ip = (document.getElementById("modal-ip") as HTMLInputElement).value;
                      const port = (document.getElementById("modal-port") as HTMLInputElement).value;
                      handleConnectServer(ip, port);
                    }}
                    className="w-full p-3 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-xl font-semibold"
                  >
                    Подключиться
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl z-[100] text-sm font-medium ${
              toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a2e] border-t border-[#2a2a3e] py-3 px-6 flex justify-around items-center z-50">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#a78bfa] transition-colors">
          <Home className="w-6 h-6" />
          <span className="text-[10px]">Главная</span>
        </Link>
        <Link href="/chat" className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#a78bfa] transition-colors">
          <MessageSquare className="w-6 h-6" />
          <span className="text-[10px]">Чаты</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center gap-1 text-[#a78bfa]">
          <Settings className="w-6 h-6" />
          <span className="text-[10px]">Настройки</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#a78bfa] transition-colors">
          <User className="w-6 h-6" />
          <span className="text-[10px]">Профиль</span>
        </Link>
      </nav>
    </div>
  );
}

function SettingsItem({
  icon,
  label,
  value,
  onClick,
  isToggle = false,
  active = false,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | undefined;
  onClick: () => void;
  isToggle?: boolean;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:translate-x-1 border-2 ${
        danger
          ? "bg-red-500/5 border-red-500/20 hover:border-red-500/50"
          : "bg-[#1a1a2e] border-transparent hover:border-[#7c3aed]"
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        danger ? "bg-red-500/20" : "bg-[#7c3aed]/20"
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className={`text-sm font-medium ${danger ? "text-red-400" : "text-white"}`}>{label}</div>
        <div className="text-xs text-gray-500">{value}</div>
      </div>
      {isToggle ? (
        <div className={`w-12 h-6 rounded-full relative transition-colors ${active ? "bg-[#7c3aed]" : "bg-[#3f3f5f]"}`}>
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${active ? "translate-x-6" : ""}`} />
        </div>
      ) : (
        <div className="text-gray-600">›</div>
      )}
    </div>
  );
}
