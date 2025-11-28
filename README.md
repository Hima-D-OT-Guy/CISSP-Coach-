# 🛡️ CISSP Coach AI

**Your Personal, AI-Powered CISSP Certification Mentor.**

CISSP Coach AI is a sophisticated React application designed to help security professionals prepare for the Certified Information Systems Security Professional (CISSP) exam. It leverages Google's Gemini AI models to provide a personalized, interactive, and context-aware study experience.

---

## 🚀 Key Features

### 🧠 Hybrid Intelligence Engine
The application intelligently routes queries between different AI models to balance speed and depth:
*   **Guided Mode**: Uses `gemini-2.5-flash` for instant, conversational responses and rapid curriculum traversal.
*   **Deep Dive / Exam Mode**: Switches to `gemini-3.0-pro` (or `1.5-pro`) for complex reasoning, detailed explanations, and scenario-based exam questions.

### 📚 Smart Chapter Splitting
Unlike generic RAG systems that treat documents as a single blob, CISSP Coach understands the structure of your study guide:
*   **Auto-Segmentation**: Automatically detects "Chapter", "Domain", or "Module" headers using advanced regex.
*   **Precision Context**: When you study a specific domain, the app feeds *only* that chapter's content to the AI, ensuring highly accurate and hallucination-free responses.

### 🔑 Bring Your Own Key (BYOK) Architecture
Designed for privacy and sustainability:
*   **Client-Side Only**: Your API key is stored locally in your browser's `IndexedDB`. It is never sent to our servers.
*   **Tier Awareness**: Automatically optimizes model selection based on your account tier (Free vs. Paid) to prevent rate-limiting.

### 💾 Robust Persistence
*   **State Preservation**: Your chat history, uploaded book, and progress are saved automatically.
*   **Large File Support**: Uses `IndexedDB` to handle large PDF study guides (100MB+) without crashing the browser (solving common `localStorage` limits).

---

## 🛠️ Tech Stack

*   **Frontend**: React 18, TypeScript, Vite
*   **Styling**: Tailwind CSS, Lucide React (Icons)
*   **AI Integration**: Google GenAI SDK (`@google/genai`)
*   **State/Storage**: React Hooks, `idb-keyval` (IndexedDB wrapper)
*   **PDF Processing**: `pdfjs-dist`

---

## ⚡ Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   A Google Gemini API Key (Get one [here](https://aistudio.google.com/app/apikey))

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/cissp-coach.git
    cd cissp-coach
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Launch the App**
    Open your browser to `http://localhost:5173`.

### Initial Setup
1.  On first launch, you will see a **Setup Modal**.
2.  Enter your **Name** and **Gemini API Key**.
3.  Select your **Account Tier** (Free or Paid).
    *   *Tip: Select "Free" if you are using the free tier of AI Studio to ensure the app uses rate-limit friendly models.*

---

## 📖 Usage Guide

1.  **Upload Your Guide**: Drag and drop your CISSP Study Guide (PDF, TXT, or MD).
    *   *The app will analyze and split it into chapters.*
2.  **Select a Mode**:
    *   **Guided Learning**: Follow the AI's lead through the domains.
    *   **Deep Dive**: Ask complex questions about specific topics.
    *   **Exam Practice**: Generate multiple-choice questions to test your knowledge.
3.  **Track Progress**: Use the sidebar to see your token usage and navigate between chapters.

---

## 📂 Project Structure

```
/src
  /components       # UI Components (Chat, Sidebar, FileUpload, etc.)
  /services         # Core Logic (Gemini AI, Storage, File Processing)
  /types.ts         # TypeScript Interfaces (AppState, Message, etc.)
  App.tsx           # Main Application Controller
/scripts
  generate_context.js # Tool to bundle codebase for AI analysis
```

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

MIT License
