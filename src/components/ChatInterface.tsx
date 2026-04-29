
import { useState, useRef, useEffect } from "react";
import { Send, Moon, Sun } from "lucide-react";
import { Message, Role } from "../types";
import { sendMessageStream } from "../services/gemini";
import { MessageBubble } from "./MessageBubble";
import { GenerateContentResponse } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface ChatInterfaceProps {
  avatarUrl: string;
}

export const ChatInterface = ({ avatarUrl }: ChatInterfaceProps) => {
  // Initialize theme based on preference or system setting
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if the user hasn't explicitly set a preference in this session
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: Role.MODEL,
      content: "",
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const welcomeText = "Hello! I am Dholilo your assistant.\n\nHow can I help you today?";

  useEffect(() => {
    let currentText = "";
    let i = 0;
    const interval = setInterval(() => {
      if (i < welcomeText.length) {
        currentText += welcomeText[i];
        setMessages([{
          id: "welcome",
          role: Role.MODEL,
          content: currentText,
          timestamp: Date.now(),
        }]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const responseStream = await sendMessageStream(messages, userMessage.content);
      
      const botMessageId = (Date.now() + 1).toString();
      let fullContent = "";

      // Add an initial empty message for the bot
      setMessages(prev => [...prev, {
        id: botMessageId,
        role: Role.MODEL,
        content: "",
        timestamp: Date.now(),
      }]);

      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        const text = c.text;
        if (text) {
          fullContent += text;
          setMessages(prev => prev.map(msg => 
            msg.id === botMessageId ? { ...msg, content: fullContent } : msg
          ));
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        content: "I am sorry Friend, I faced an error. How can I help you resolve this, Sir?",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-[100vh] w-full max-w-5xl mx-auto relative overflow-hidden transition-colors duration-500",
      theme === 'dark' ? "dark bg-slate-950" : "bg-white"
    )}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 px-4 py-1.5 flex items-center justify-between sticky top-0 z-10 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <img src={avatarUrl} alt="Dholilo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white leading-none text-base">Dholilo Chatbot</h1>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all border border-slate-200 dark:border-slate-800 shadow-sm active:scale-95"
          aria-label="Toggle Theme"
        >
          {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-6 no-scrollbar bg-transparent"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} avatarUrl={avatarUrl} />
          ))}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start"
            >
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-5 py-3 rounded-2xl rounded-tl-none flex items-center justify-center h-10 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-2 pb-3 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 focus-within:border-blue-400 dark:focus-within:border-blue-600 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-4 focus-within:ring-blue-400/10 transition-all flex items-center px-4 overflow-hidden">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 min-h-[44px] py-2 px-0 resize-none text-lg placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 active:scale-90 shadow-sm",
              input.trim() && !isLoading 
                ? "bg-[#0ea5e9] text-white hover:bg-[#0284c7]" 
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            )}
          >
            <Send size={15} fill="currentColor" strokeWidth={0} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
