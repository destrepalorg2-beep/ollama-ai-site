"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, MessageSquare, User, Settings, Home, Loader2, Brain, Code } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Session {
  id: string;
  title: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  useEffect(() => {
    if (!authToken) {
      router.push("/login");
    } else {
      loadSessions();
    }
  }, [authToken, router]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/sessions", {
        headers: { "Authorization": `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      } else if (response.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Load sessions error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    const title = window.prompt("Название чата:", "Новый чат");
    if (!title) return;

    try {
      const response = await fetch("http://localhost:3000/api/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/chat/${data.session.id}`);
      } else {
        alert("Ошибка создания чата");
      }
    } catch (error) {
      console.error("Create chat error:", error);
      alert("Ошибка соединения");
    }
  };

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "только что";
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days === 1) return "вчера";
    if (days < 7) return `${days} дней назад`;
    return date.toLocaleDateString("ru-RU");
  };

  return (
    <div className="min-h-screen bg-[#0f0f1e] text-white pb-24">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-full flex items-center justify-center text-xl sm:text-2xl">
              🤖
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">AI Hub.</h1>
          </div>
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push("/settings")}
          />
        </header>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск чатов..."
            className="w-full pl-12 pr-4 py-4 bg-[#1a1a2e] border-2 border-transparent rounded-2xl text-white transition-all focus:outline-none focus:border-[#7c3aed]"
          />
        </div>

        {/* Tokens Card */}
        <div className="bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-3xl p-6 mb-10 shadow-lg">
          <div className="text-white/80 text-sm mb-2">Токены сегодня</div>
          <div className="text-3xl font-bold mb-3">1,240 / 5,000</div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-500" style={{ width: "24.8%" }}></div>
          </div>
        </div>

        {/* Models */}
        <h2 className="text-[#9ca3af] text-xs font-semibold uppercase tracking-wider mb-4">Мои модели</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {[
            { id: "llama3", name: "Llama 3", info: "8B, локально", icon: <Brain className="w-6 h-6" /> },
            { id: "codellama", name: "CodeLlama", info: "7B, локально", icon: <Code className="w-6 h-6" /> },
          ].map((model) => (
            <div
              key={model.id}
              onClick={() => {
                localStorage.setItem("selectedModel", model.id);
                alert(`Выбрана модель: ${model.name}`);
              }}
              className="bg-[#1a1a2e] p-5 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:border-[#7c3aed] border-2 border-transparent group"
            >
              <div className="w-12 h-12 bg-[#7c3aed]/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#7c3aed]/30 transition-colors">
                <span className="text-[#a855f7]">{model.icon}</span>
              </div>
              <div className="font-semibold text-lg">{model.name}</div>
              <div className="text-gray-500 text-sm">{model.info}</div>
            </div>
          ))}
        </div>

        {/* Chats */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#9ca3af] text-xs font-semibold uppercase tracking-wider">Недавние чаты</h2>
          <button
            onClick={createNewChat}
            className="bg-gradient-to-br from-[#7c3aed] to-[#a855f7] px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(124,58,237,0.4)]"
          >
            + Новый чат
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">💬</div>
            <p>Нет чатов. Создайте первый!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => router.push(`/chat/${session.id}`)}
                className="bg-[#1a1a2e] p-4 rounded-2xl cursor-pointer transition-all hover:border-[#7c3aed] border-2 border-transparent flex items-center gap-4 group hover:translate-x-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-full flex items-center justify-center text-xl flex-shrink-0">
                  💬
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{session.title}</div>
                  <div className="text-gray-500 text-xs">{formatDate(session.createdAt)}</div>
                </div>
                <div className="bg-[#7c3aed]/20 text-[#a78bfa] px-3 py-1 rounded-lg text-xs font-semibold">
                  active
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a2e] border-t border-[#2a2a3e] py-3 px-6 flex justify-around items-center z-50">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#a78bfa]">
          <Home className="w-6 h-6" />
          <span className="text-[10px]">Главная</span>
        </Link>
        <Link href="/chat" className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#a78bfa] transition-colors">
          <MessageSquare className="w-6 h-6" />
          <span className="text-[10px]">Чаты</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#a78bfa] transition-colors">
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
