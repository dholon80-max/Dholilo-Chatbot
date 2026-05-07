/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { ChatInterface } from "./components/ChatInterface";
import { LandingPage } from "./components/LandingPage";
import { AnimatePresence, motion } from "motion/react";
import dholiloLogo from "./assets/images/dholilo_app_icon_1778040338945.png";

export default function App() {
  const [showChat, setShowChat] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <AnimatePresence mode="wait">
        {!showChat ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage onStart={() => setShowChat(true)} logoUrl={dholiloLogo} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-screen w-full"
          >
            <ChatInterface avatarUrl={dholiloLogo} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
