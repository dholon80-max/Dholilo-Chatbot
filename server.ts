import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Proxy for Gemini to keep key secret and avoid CORS
  app.post("/api/chat", async (req, res) => {
    try {
      const { contents, config } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        const errorMsg = "GEMINI_API_KEY is missing or using placeholder ('MY_GEMINI_API_KEY'). Please set the GEMINI_API_KEY environment variable in your Render dashboard.";
        console.error(errorMsg);
        return res.status(500).json({ error: errorMsg });
      }

      // Safe log for debugging
      console.log(`Initialising Gemini API with key: ${apiKey.substring(0, 4)}...`);

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: config?.systemInstruction,
      });

      console.log("Sending request to Gemini model: gemini-1.5-flash");

      const result = await model.generateContentStream({
        contents,
        generationConfig: {
          temperature: config?.temperature || 0.7,
          topP: config?.topP || 0.95,
          maxOutputTokens: 2048,
        }
      });

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          res.write(text);
        }
      }
      res.end();
    } catch (error: any) {
      console.error("Server API Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
