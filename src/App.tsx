/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatInterface } from "./components/ChatInterface";
import dholiloAvatar from "./assets/images/dholilo_robot_logo_v2_1777404565885.png";

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50">
      <ChatInterface avatarUrl={dholiloAvatar} />
    </main>
  );
}
