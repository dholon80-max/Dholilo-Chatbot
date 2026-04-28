
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import { Message, Role } from "../types";
import { cn } from "../lib/utils";

interface MessageProps {
  message: Message;
  avatarUrl?: string;
}

export const MessageBubble = ({ message, avatarUrl }: MessageProps) => {
  const isBot = message.role === Role.MODEL;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full mb-6",
        isBot ? "flex-row" : "flex-row-reverse"
      )}
    >
      <div className={cn(
        "flex flex-col max-w-[85%]",
        isBot ? "items-start" : "items-end"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-2xl shadow-sm border",
          isBot 
            ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none" 
            : "bg-slate-900 dark:bg-white border-slate-800 dark:border-slate-200 text-white dark:text-slate-900 rounded-tr-none"
        )}>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
};
