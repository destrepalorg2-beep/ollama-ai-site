"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send, Loader2, Home, MessageSquare, Settings, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverStatus, setServerStatus] = useState("Подключение...");
  const [ws, setWs] = useState<WebSocket | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  useEffect(() => {
    if (!authToken || !sessionId) {
      router.push("/login");
      return;
    }

    loadMessages();
    checkServerStatus();
    connectWebSocket();
  }, [authToken, sessionId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/messages/${sessionId}`, {
        headers: { "Authorization": `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else if (response.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Load messages error:", error);
    }
  };

  const checkServerStatus = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/status");
      if (response.ok) {
        const data = await response.json();
        setServerStatus(data.ollama?.available
          ? `Подключено • ${data.uptime}s`
          : "Ollama не запущен");
      }
    } catch (error) {
      setServerStatus("Ошибка подключения");
    }
  };

  const connectWebSocket = () => {
    const wsUrl = `ws://localhost:3000`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      socket.send(JSON.stringify({
        type: "auth",
        payload: { token: authToken },
      }));
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWSMessage(message);
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setTimeout(connectWebSocket, 3000);
    };

    setWs(socket);
  };

  const handleWSMessage = (message: any) => {
    if (message.type === "ai_response_chunk") {
      setIsTyping(true);
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === "assistant") {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...lastMsg,
            content: lastMsg.content + message.payload.chunk
          };
          return updated;
        } else {
          return [...prev, {
            role: "assistant",
            content: message.payload.chunk,
            timestamp: new Date().toISOString()
          }];
        }
      });
    } else if (message.type === "ai_response_complete") {
      setIsTyping(false);
      setIsProcessing(false);
    } else if (message.type === "error") {
      setIsTyping(false);
      setIsProcessing(false);
      alert("AI Error: " + message.payload.message);
    }
  };

  const sendMessage = async (text?: string) => {
    const content = text || input;
    if (!content || isProcessing) return;

    if (!text) setInput("");
    setIsProcessing(true);

    const userMsg: Message = {
      role: "user",
      content: content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "ai_request",
        payload: {
          id: `req-${Date.now()}`,
          sessionId: sessionId,
          content: content,
        },
      }));
    } else {
      setIsProcessing(false);
      alert("Ошибка подключения к серверу");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen w-full bg-[#0f0f1e] text-white flex flex-col overflow-hidden pb-20">
      {/* Header */}
      <header className="bg-[#1a1a2e] p-4 flex items-center gap-4 border-b border-[#2a2a3e]">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <div className="font-semibold">AI Hub Chat</div>
          <div className="text-xs flex items-center gap-2 text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {serverStatus}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-6">
            <div className="text-6xl">💬</div>
            <div>
              <h3 className="text-white text-xl font-semibold mb-2">Начните разговор</h3>
              <p className="text-sm max-w-xs">Задайте любой вопрос AI, и он ответит вам в режиме реального времени.</p>
            </div>
            <div className="grid grid-cols-1 gap-2 max-w-md w-full">
              {["Расскажи о себе", "Помоги написать код на Python", "Объясни квантовую физику"].map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="p-3 bg-[#1a1a2e] border border-transparent hover:border-[#7c3aed] rounded-xl text-left text-sm transition-all hover:translate-x-1"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-br-none"
                  : "bg-[#1a1a2e] rounded-bl-none"
              }`}>
                <div className="whitespace-pre-wrap break-words leading-relaxed">
                  {msg.content}
                </div>
                <div className="text-[10px] opacity-50 mt-2 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a2e] p-4 rounded-2xl rounded-bl-none flex gap-1">
              <div className="w-1.5 h-1.5 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <footer className="p-4 bg-[#1a1a2e] border-t border-[#2a2a3e]">
        <div className="max-w-4xl mx-auto flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Сообщение..."
            rows={1}
            className="flex-1 p-4 bg-[#2a2a3e] border-2 border-transparent rounded-2xl text-white focus:outline-none focus:border-[#7c3aed] transition-all resize-none max-h-[120px]"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isProcessing}
            className="w-14 h-14 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </div>
      </footer>
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a2e] border-t border-[#2a2a3e] py-3 px-6 flex justify-around items-center z-50">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#a78bfa] transition-colors">
          <Home className="w-6 h-6" />
          <span className="text-[10px]">Главная</span>
        </Link>
        <Link href="/chat" className="flex flex-col items-center gap-1 text-[#a78bfa]">
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
