/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatInterface } from "./components/ChatInterface";

// We use the generated avatar image. 
// In a real build environment, we'd import it, 
// but here we can use the relative path if Vite is configured to serve assets.
const DHOLILO_AVATAR = "/src/assets/images/dholilo_robot_logo_v2_1777404565885.png";

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50">
      <ChatInterface avatarUrl={DHOLILO_AVATAR} />
    </main>
  );
}
