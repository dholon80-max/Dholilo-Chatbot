
import { GoogleGenAI } from "@google/genai";
import { Message, Role, SYSTEM_PROMPT } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const sendMessageStream = async (history: Message[], userInput: string) => {
  const ai = getAI();
  
  const contents = history.map(msg => ({
    role: msg.role === Role.USER ? "user" : "model",
    parts: [{ text: msg.content }]
  }));

  contents.push({
    role: "user",
    parts: [{ text: userInput }]
  });

  try {
    return await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        topP: 0.95,
      },
    });
  } catch (error) {
    console.error("Gemini API Error (Stream):", error);
    throw error;
  }
};
