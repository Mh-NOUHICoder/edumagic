# ✨ EduMagic: The Future of AI Learning

EduMagic is a premium, state-of-the-art AI learning platform designed to transform any topic into a personalized, visual, and interactive journey. Built with a focus on speed, aesthetics, and hyper-resilient AI integrations, EduMagic provides a unique educational experience tailored to the user's level and language—including specialized support for **Moroccan Darija**.

---

## 🚀 Core Features

### 🧠 Guided Learning Journeys
Transform complex topics into 5-8 logical, easy-to-digest steps. Each lesson is generated using a combination of **GPT-4o** and **Gemini 3 Flash Preview**, ensuring high-quality pedagogical structure and accuracy.

### 🇲🇦 Darija Buddy
A unique integration for Moroccan learners. The "Darija Buddy" provides casual, "street-smart" explanations using Moroccan Darija (Arabizi or Arabic script), making learning feel like a conversation with a local friend.

### 🎨 Neural Visualization Pipeline
Every lesson step is paired with cinematic 3D digital art.
- **Midjourney ImagineCraft Integration**: High-fidelity AI art generated via RapidAPI.
- **Hyper-Resilient Polling**: Advanced backend logic that probes multiple MJ endpoints and polls for results to ensure images always manifest.
- **Lexica Art Fallback**: Secure and high-quality fallback system using Lexica Art search and Unsplash.

### 🎙️ Multi-Lingual Text-to-Speech (TTS)
Full audio support for lessons in English, French, and **Arabic**. Optimized for natural phonetics and browser-resilient voice loading.

### 🧪 Neural Lab & API Diagnostics
A dedicated suite for power users and developers to:
- Test and rotate API keys in real-time.
- Debug AI image generation pipelines (`/test-image`).
- Monitor key health and status (`/test-keys`).

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS with Premium Glassmorphism & Framer Motion
- **Authentication**: Clerk (Standard OAuth & Session Management)
- **Database**: Prisma with SQLite (Optimized for edge performance)
- **AI Engines**:
  - **Text**: Google Gemini 3 Flash Preview & OpenAI GPT-4o
  - **Images**: Midjourney (ImagineCraft), HD AI Image Gen
  - **Diagnostics**: Custom Key Manager with Automatic Rotation

---

## 💎 Design Aesthetics

EduMagic features a **Studio Dark Theme** designed to wow users:
- **Glassmorphism**: Translucent interfaces with backdrop blurs.
- **Micro-Animations**: Smooth transitions powered by `framer-motion`.
- **Responsive Layout**: Optimized for both high-end desktop monitors and mobile devices.
- **High Contrast**: Clean typography and vivid neon accents for readability and tech-forward feel.

---

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd edumagic
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file and populate it with the following keys:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   
   # AI Keys (Support for multiple keys for rotation)
   GEMINI_API_KEY1="..."
   OPENAI_API_KEY="..."
   RAPID_API_KEY="..."
   GPT_API_KEY="..."
   
   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
   CLERK_SECRET_KEY="..."
   ```

4. **Database Initialization**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start Development**:
   ```bash
   npm run dev
   ```

---

## 🛡️ Advanced Architecture: Key Rotation

EduMagic features a built-in `withKeyRotation` higher-order function. If an API key hits its rate limit (429) or fails unexpectedly, the system automatically rotates to the next available key in your `.env`, ensuring 99.9% uptime for the user experience.

---

© 2026 EduMagic - Empowering Intelligence through AI 🚀
