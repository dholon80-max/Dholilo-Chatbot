/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatInterface } from "./components/ChatInterface";
import dholiloLogo from "./assets/images/logo.png";

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50">
      <ChatInterface avatarUrl={dholiloLogo} />
    </main>
  );
}
