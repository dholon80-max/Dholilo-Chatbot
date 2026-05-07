
import { motion } from "motion/react";
import { MessageSquare, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

interface LandingPageProps {
  onStart: () => void;
  logoUrl: string;
}

export const LandingPage = ({ onStart, logoUrl }: LandingPageProps) => {
  return (
    <div className="h-screen w-full bg-[#020617] text-white flex flex-col items-center justify-between p-6 pt-10 pb-8 text-center select-none overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[400px] flex flex-col items-center h-full justify-between"
      >
        <div className="flex flex-col items-center w-full">
          {/* Logo */}
          <div className="w-20 h-20 bg-white rounded-[1.75rem] p-3.5 shadow-2xl mb-6 flex items-center justify-center overflow-hidden">
            <img src={logoUrl} alt="Dholilo Logo" className="w-full h-full object-contain" />
          </div>

          {/* Title */}
          <h1 className="text-[25px] sm:text-3xl font-medium mb-3 tracking-tight px-2">
            Welcome to Dholilo Chatbot
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-[14px] leading-snug mb-8 px-6 font-light">
            Your highly intelligent AI Assistants, polite, and professional AI companion for building anything.
          </p>

          {/* Feature Cards - Made smaller */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] mb-8">
            <div className="bg-[#0f172a]/40 border border-slate-800/50 rounded-2xl py-4 px-2 flex flex-col items-center justify-center transition-all">
              <MessageSquare className="w-6 h-6 text-[#3b82f6] mb-2" strokeWidth={1.5} />
              <span className="text-[14px] font-bold tracking-[0.1em] text-slate-400 uppercase">Smart Chat</span>
            </div>
            <div className="bg-[#0f172a]/40 border border-slate-800/50 rounded-2xl py-4 px-2 flex flex-col items-center justify-center transition-all">
              <ShieldCheck className="w-6 h-6 text-[#22c55e] mb-2" strokeWidth={1.5} />
              <span className="text-[14px] font-bold tracking-[0.1em] text-slate-400 uppercase">Secure</span>
            </div>
          </div>

          {/* Sync Info - Better spacing */}
          <p className="text-slate-400 text-[14px] leading-relaxed px-8 font-light max-w-[320px]">
            This official app is free, syncs your history across devices, and brings you the first model improvements from Dholilo Chatbot.
          </p>
        </div>

        <div className="w-full mt-auto pt-8">
          {/* CTA Button */}
          <button
            onClick={onStart}
            className="w-full bg-[#1e60ff] hover:bg-[#1a5adb] text-white font-semibold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-blue-500/10 group"
          >
            <span className="text-xl">Get Started</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Footer */}
          <p className="mt-6 text-[11px] text-slate-500 font-light px-2">
            By continuing, you agree to our <span className="text-slate-400 cursor-pointer">Terms</span> and have read our <span className="text-slate-400 cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
