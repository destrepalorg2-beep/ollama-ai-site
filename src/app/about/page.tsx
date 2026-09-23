"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Brain, Globe, Shield, Zap } from "lucide-react";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0f0f1e] text-white">
      <header className="bg-[#1a1a2e] p-4 flex items-center gap-4 border-b border-[#2a2a3e]">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">О проекте</h1>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-12 py-12">
        <section className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-xl">
            🤖
          </div>
          <h2 className="text-4xl font-bold">AI Hub</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Ваша персональная станция управления искусственным интеллектом.
            Локально, приватно и максимально эффективно.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-[#1a1a2e] rounded-3xl border border-transparent hover:border-[#7c3aed] transition-all group">
            <div className="w-12 h-12 bg-[#7c3aed]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#7c3aed]/30 transition-colors">
              <Shield className="w-6 h-6 text-[#a855f7]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Приватность прежде всего</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Ваши данные и переписка хранятся локально на вашем сервере. Мы не собираем ваши сообщения и не обучаем на них модели.
            </p>
          </div>

          <div className="p-6 bg-[#1a1a2e] rounded-3xl border border-transparent hover:border-[#7c3aed] transition-all group">
            <div className="w-12 h-12 bg-[#7c3aed]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#7c3aed]/30 transition-colors">
              <Zap className="w-6 h-6 text-[#a855f7]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Максимальная скорость</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Прямое взаимодействие с локальными моделями через Ollama обеспечивает минимальную задержку и отсутствие лимитов.
            </p>
          </div>

          <div className="p-6 bg-[#1a1a2e] rounded-3xl border border-transparent hover:border-[#7c3aed] transition-all group">
            <div className="w-12 h-12 bg-[#7c3aed]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#7c3aed]/30 transition-colors">
              <Brain className="w-6 h-6 text-[#a855f7]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Гибкий выбор AI</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Поддержка множества моделей Llama, Mistral и других. Переключайтесь между ними в один клик.
            </p>
          </div>

          <div className="p-6 bg-[#1a1a2e] rounded-3xl border border-transparent hover:border-[#7c3aed] transition-all group">
            <div className="w-12 h-12 bg-[#7c3aed]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#7c3aed]/30 transition-colors">
              <Globe className="w-6 h-6 text-[#a855f7]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Кроссплатформенность</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Единый аккаунт и история чатов на сайте, десктопном приложении и в вашем смартфоне.
            </p>
          </div>
        </div>

        <section className="bg-gradient-to-br from-[#7c3aed]/10 to-transparent p-8 rounded-3xl border border-[#7c3aed]/20 text-center">
          <h3 className="text-2xl font-bold mb-4">Готовы начать?</h3>
          <p className="text-gray-400 mb-6">Присоединяйтесь к сообществу исследователей AI сегодня.</p>
          <button
            onClick={() => router.push("/register")}
            className="px-8 py-3 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            Создать аккаунт
          </button>
        </section>
      </main>
    </div>
  );
}
