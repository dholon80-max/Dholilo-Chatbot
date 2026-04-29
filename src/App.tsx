/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatInterface } from "./components/ChatInterface";

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50">
      <ChatInterface avatarUrl="/logo.png" />
    </main>
  );
}
