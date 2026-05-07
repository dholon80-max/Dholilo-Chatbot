
import { useState, useRef, useEffect } from "react";
import { Send, Moon, Sun } from "lucide-react";
import { Message, Role } from "../types";
import { sendMessageStream } from "../services/gemini";
import { MessageBubble } from "./MessageBubble";
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
  const [quotaCountdown, setQuotaCountdown] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const welcomeText = "Hello! I am Dholilo your assistant.\n\nHow can I help you today?";

  // Quota Countdown Logic
  useEffect(() => {
    if (quotaCountdown > 0) {
      const timer = setTimeout(() => setQuotaCountdown(quotaCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [quotaCountdown]);

  const clearChat = () => {
    setMessages([{
      id: "welcome",
      role: Role.MODEL,
      content: welcomeText,
      timestamp: Date.now(),
    }]);
  };

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
        const text = (chunk as { text: string }).text;
        if (text) {
          fullContent += text;
          setMessages(prev => prev.map(msg => 
            msg.id === botMessageId ? { ...msg, content: fullContent } : msg
          ));
        }
      }
    } catch (error: any) {
      console.error("Chat Handle Error:", error);
      
      let displayError = "Unknown error";
      let isQuota = false;
      let isRegion = false;
      
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.error) {
          displayError = parsed.error;
          if (parsed.error.includes("Minute") || parsed.error.includes("429")) {
            isQuota = true;
            setQuotaCountdown(60);
          }
          if (parsed.error.includes("Region") || parsed.error.includes("Restriction")) {
            isRegion = true;
          }
          if (parsed.suggestion) {
            displayError += `\n\n---\n\n### 🛡️ HOW TO FIX THIS:\n${parsed.suggestion}`;
          }
        }
      } catch (e) {
        displayError = error.message || "Unknown Connection Error";
        if (displayError.toLowerCase().includes("location") || displayError.toLowerCase().includes("unsupported") || displayError.toLowerCase().includes("restricted")) {
          isRegion = true;
        }
      }

          const healthUrl = "/api/health";

          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: Role.MODEL,
            content: isQuota 
              ? `### ⏳ SPEED LIMIT REACHED\nSir, you used the free key too fast. **Please wait 1 minute.**\n\nYour key is **WORKING**, but Google is slowing us down. The countdown is starting at the bottom.`
              : isRegion 
              ? `### 🌏 REGION BLOCKED (PERMANENT)\nSir, this is **NOT** a timed block. Google is detecting your location.\n\n**HOW TO FIX:**\n1. Ensure **VPN (USA)** is ON.\n2. Open a **Guest Profile** in your browser.\n3. Create a **New Google Account** while on VPN.\n\n*Check the [System Check](${healthUrl}) for details.*`
              : `I am sorry Sir, I faced an error: **${displayError}**\n\n---\n### 🛡️ SYSTEM ADVICE:\n1. **[Get a New Key here](https://aistudio.google.com/app/apikey)** if yours is deleted or expired.\n2. Always verify with **[System Check](${healthUrl})**.\n3. Keep your **VPN set to USA**.`,
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
        <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 relative group">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Dholilo" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold">D</div>
            )}
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white leading-tight text-lg">Dholilo Chatbot</h1>
            <p className="text-[10px] text-green-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all border border-slate-200 dark:border-slate-800 shadow-sm active:scale-95"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar bg-transparent"
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
              <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-2xl rounded-tl-none flex items-center justify-center h-8">
                <div className="flex gap-1">
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
        {quotaCountdown > 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-4xl mx-auto mb-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-700 dark:text-amber-400 text-sm font-medium flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="animate-spin text-lg">⏳</span>
              Sir, please wait for Gemini to cool down.
            </div>
            <div className="bg-amber-200 dark:bg-amber-900 px-3 py-1 rounded-full font-bold">
              {quotaCountdown}s
            </div>
          </motion.div>
        )}
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
