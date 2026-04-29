
import { Message, Role, SYSTEM_PROMPT } from "../types";

export const sendMessageStream = async (history: Message[], userInput: string) => {
  const contents = history
    .filter(msg => msg.content.trim() !== "")
    .map(msg => ({
      role: msg.role === Role.USER ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

  contents.push({
    role: "user",
    parts: [{ text: userInput }]
  });

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        topP: 0.95,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No reader available");

  return {
    [Symbol.asyncIterator]: async function* () {
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        yield { text };
      }
    }
  };
};
