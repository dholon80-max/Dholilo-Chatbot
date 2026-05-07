# Dholilo Chatbot

A highly intelligent, polite, and professional AI Assistant built with React, Vite, and Express, powered by Google's Gemini models.

## 🚀 Features

- **Multi-Model Support**: Automatically cycles through Gemini 2.0 Flash, 1.5 Flash, and Pro to find the best working model.
- **Smart Quota Handling**: Detects and explains "Speed Limits" (429 errors) gracefully.
- **Region-Aware Diagnostics**: Includes a built-in `/api/health` system to help bypass region restrictions.
- **Polite Personality**: Designed to treat the user with the utmost respect.
- **Dark/Light Mode**: Full responsive UI with smooth transitions.

## 🛠️ Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your API Key in your environment or a `.env` file:
   ```env
   GEMINI_API_KEY_1=your_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 📦 Deployment (Render / Cloud Run)

This app is production-ready. Ensure you set the `PORT` and `GEMINI_API_KEY_1` environment variables in your deployment settings.

## 📄 License

MIT
