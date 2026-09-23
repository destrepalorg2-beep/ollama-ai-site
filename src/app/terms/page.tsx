"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Scale, ShieldCheck } from "lucide-react";

export default function TermsPage() {
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
        <h1 className="text-xl font-bold">Условия использования</h1>
      </header>

      <main className="max-w-3xl mx-auto p-6 py-12 space-y-8">
        <section className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#7c3aed]/20 rounded-xl flex items-center justify-center">
            <Scale className="w-6 h-6 text-[#a855f7]" />
          </div>
          <h2 className="text-3xl font-bold">Пользовательское соглашение</h2>
        </section>

        <div className="space-y-6 text-gray-400 leading-relaxed">
          <section>
            <h3 className="text-white font-semibold mb-2">1. Общие положения</h3>
            <p>
              Используя сервис AI Hub, вы соглашаетесь с условиями данного соглашения. Сервис предоставляет интерфейс для взаимодействия с локальными и удаленными моделями искусственного интеллекта.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2">2. Конфиденциальность и данные</h3>
            <p>
              Мы придерживаемся принципа максимальной приватности. Все данные чатов хранятся в вашей локальной базе данных. Мы не имеем доступа к вашим сообщениям, если вы сами не настроили удаленный сервер с нашим доступом.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2">3. Ответственность</h3>
            <p>
              AI Hub не несет ответственности за содержание ответов, генерируемых моделями ИИ. Пользователь самостоятельно оценивает достоверность полученной информации.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2">4. Использование ресурсов</h3>
            <p>
              Вы обязуетесь не использовать сервис для создания вредоносного контента, спама или проведения кибератак. В случае нарушения данных условий доступ к аккаунту может быть ограничен.
            </p>
          </section>

          <div className="p-6 bg-[#1a1a2e] rounded-3xl border border-[#7c3aed]/20 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            <p className="text-sm italic">
              Данный документ носит ознакомительный характер и предназначен для обеспечения прозрачности работы системы AI Hub.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
