import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message, MessageRole, QuizPayload, ConceptVisualization, TOCItem, AccountTier } from "../types";
import { SYSTEM_INSTRUCTION_BASE } from "../constants";
import { GUIDED_COURSE_PROMPT, DEEP_DIVE_PROMPT } from "../prompts";
import { retryWithBackoff } from "./apiRetry";

// --- CONFIGURATION UPDATES (NOV 2025 STANDARDS) ---

// 1. FLASH_MODEL: 'gemini-2.5-flash'
//    This is the current STABLE fast model alias for AI Studio (June 2025).
const FLASH_MODEL = 'gemini-2.5-flash';

// 2. PRO_MODEL_PAID: 'gemini-2.5-pro'
//    This is the smartest stable model available on AI Studio (June 2025).
const PRO_MODEL_PAID = 'gemini-2.5-pro';

// 3. PRO_MODEL_FREE: 'gemini-2.5-flash'
//    On Free Tier, we stick to Flash for efficiency.
const PRO_MODEL_FREE = 'gemini-2.5-flash';

// 4. FALLBACK: 'gemini-2.5-flash'
//    If Pro fails, fallback to the reliable Flash model.
const FALLBACK_MODEL = 'gemini-2.5-flash';

// Daily limit for Pro Preview (buffer below 1000 to be safe)
const PRO_DAILY_LIMIT = 950;

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private chatSession: Chat | null = null;
  private fileContext: string = "";
  private currentModelName = FLASH_MODEL;

  // User Config State
  private apiKey: string = "";
  private userTier: AccountTier = 'free';

  // Usage Tracking
  private proRequestsToday = 0;
  private lastResetDate = new Date().getDate();

  constructor() {
    this.loadUsageStats();
  }

  private loadUsageStats() {
    try {
      const stored = localStorage.getItem('gemini_usage_stats');
      if (stored) {
        const parsed = JSON.parse(stored);
        const today = new Date().getDate();
        if (parsed.date === today) {
          this.proRequestsToday = parsed.count || 0;
        } else {
          this.resetUsageStats();
        }
      }
    } catch (e) {
      console.warn("Failed to load usage stats", e);
    }
  }

  private saveUsageStats() {
    try {
      localStorage.setItem('gemini_usage_stats', JSON.stringify({
        date: new Date().getDate(),
        count: this.proRequestsToday
      }));
    } catch (e) {
      // ignore
    }
  }

  private resetUsageStats() {
    this.proRequestsToday = 0;
    this.saveUsageStats();
  }

  private incrementProUsage() {
    if (this.currentModelName === PRO_MODEL_PAID) {
      this.proRequestsToday++;
      this.saveUsageStats();
      console.log(`[GeminiService] Pro Usage: ${this.proRequestsToday}/${PRO_DAILY_LIMIT}`);
    }
  }

  setCredentials(apiKey: string, tier: AccountTier) {
    this.apiKey = apiKey;
    this.userTier = tier;
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    console.log(`[GeminiService] Credentials Configured. Tier: ${tier}, Key Length: ${apiKey.length}`);
  }

  private getProModelName(): string {
    if (this.userTier === 'paid') {
      // Intelligent Routing: Check limits
      if (this.proRequestsToday >= PRO_DAILY_LIMIT) {
        console.warn(`[GeminiService] Daily Pro limit reached (${this.proRequestsToday}). Falling back to ${FALLBACK_MODEL}`);
        return FALLBACK_MODEL;
      }
      return PRO_MODEL_PAID;
    }
    return PRO_MODEL_FREE;
  }

  // Find the last complete chapter boundary before the limit
  private findSafeBreakpoint(text: string, maxLength: number): number {
    if (text.length <= maxLength) return text.length;

    // Look for chapter boundaries near the limit
    const searchStart = maxLength - 5000; // Look back 5k chars
    const chapterPattern = /\n(Chapter|Domain|Module)\s+\d+/gi;

    let lastMatch = 0;
    let match;

    // We only search in the substring up to maxLength
    const searchText = text.substring(0, maxLength);

    while ((match = chapterPattern.exec(searchText)) !== null) {
      lastMatch = match.index;
    }

    // If we found a chapter boundary in the last 5000 chars, use it.
    // Otherwise, just cut at maxLength (fallback).
    return lastMatch > searchStart ? lastMatch : maxLength;
  }

  async initializeSession(fileContent: string): Promise<void> {
    console.log(`[GeminiService] Initializing Session. Content Length: ${fileContent.length} chars`);

    if (!this.ai) {
      console.error("[GeminiService] Initialization Failed: API Key not configured.");
      throw new Error("API Key not configured.");
    }

    this.fileContext = fileContent;
    this.currentModelName = FLASH_MODEL;

    // Safe truncation to stay within ~1M context limits
    const safeLimit = 950000;
    let truncatedContent = fileContent;

    if (fileContent.length > safeLimit) {
      const breakpoint = this.findSafeBreakpoint(fileContent, safeLimit);
      truncatedContent = fileContent.substring(0, breakpoint) + "\n\n[Note: Additional chapters not included due to size limits]";
      console.warn(`[GeminiService] Content truncated from ${fileContent.length} to ${breakpoint} chars (Smart Breakpoint).`);
    }

    try {
      this.chatSession = this.ai.chats.create({
        model: FLASH_MODEL,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_BASE,
          temperature: 0.3,
        },
        history: [
          {
            role: "user",
            parts: [{ text: `Here is the content of the CISSP Study Guide. Ingest this now. \n\n --- BEGIN CONTENT ---\n${truncatedContent}\n--- END CONTENT ---` }],
          },
          {
            role: "model",
            parts: [{ text: "I have ingested the study guide. I am ready to act as your CISSP Coach." }],
          }
        ],
      });
      console.log(`[GeminiService] Session initialized successfully with ${FLASH_MODEL}`);
    } catch (error) {
      console.error("[GeminiService] Failed to initialize session:", error);
      throw error;
    }
  }

  private async switchModel(targetMode: 'guided' | 'deep_dive' | 'exam_practice', forceModel?: string) {
    if (!this.chatSession || !this.ai) {
      console.warn("[GeminiService] switchModel called but session/AI is null.");
      return;
    }

    // Determine target model based on Mode AND Tier
    let targetModelName = FLASH_MODEL;

    if (forceModel) {
      targetModelName = forceModel;
    } else if (targetMode === 'deep_dive' || targetMode === 'exam_practice') {
      targetModelName = this.getProModelName();
    }

    // If we are already on the target model, do nothing
    if (targetModelName === this.currentModelName) {
      // console.log(`[GeminiService] Already on target model (${targetModelName}). No switch needed.`);
      return;
    }

    console.log(`[GeminiService] Switching Model: ${this.currentModelName} -> ${targetModelName} (Mode: ${targetMode}, Tier: ${this.userTier})`);

    try {
      const rawHistory = await this.chatSession.getHistory();

      // Sanitize History 
      const cleanHistory = rawHistory.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: h.parts
      }));

      this.chatSession = this.ai.chats.create({
        model: targetModelName,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_BASE,
          temperature: 0.4,
        },
        history: cleanHistory
      });
      this.currentModelName = targetModelName;
      console.log(`[GeminiService] Successfully switched to ${targetModelName}`);

    } catch (criticalError) {
      console.error(`[GeminiService] CRITICAL: Could not switch models. Staying on ${this.currentModelName}`, criticalError);
      throw criticalError;
    }
  }

  // Robust execution wrapper with Fallback Logic
  private async executeWithFallback<T>(
    operation: () => Promise<T>,
    mode: 'guided' | 'deep_dive' | 'exam_practice'
  ): Promise<T> {
    try {
      // Try with current/preferred model
      return await retryWithBackoff(operation);
    } catch (error: any) {
      // Check if we should fallback
      const isRateLimit = error.status === 429 || error.status === 503 || error.message?.includes('429');

      if (isRateLimit && this.currentModelName === PRO_MODEL_PAID) {
        console.warn(`[GeminiService] Rate limit hit on ${PRO_MODEL_PAID}. Attempting fallback to ${FALLBACK_MODEL}...`);

        try {
          await this.switchModel(mode, FALLBACK_MODEL);
          return await retryWithBackoff(operation);
        } catch (fallbackError: any) {
          console.warn(`[GeminiService] Fallback to ${FALLBACK_MODEL} failed. Trying ${FLASH_MODEL}...`);

          // Final fallback to Flash
          await this.switchModel(mode, FLASH_MODEL);
          return await retryWithBackoff(operation);
        }
      }

      throw error;
    }
  }

  async startTopicSession(topicName: string, mode: 'guided' | 'deep_dive', sectionContent?: string): Promise<{ text: string }> {
    console.log(`[GeminiService] startTopicSession: Topic="${topicName}", Mode="${mode}"`);
    if (!this.chatSession) throw new Error("Session not initialized.");

    await this.switchModel(mode);

    let promptTemplate = mode === 'guided' ? GUIDED_COURSE_PROMPT : DEEP_DIVE_PROMPT;
    let prompt = promptTemplate.replace("[TOPIC_NAME]", topicName);

    if (sectionContent) {
      prompt += `\n\n[SYSTEM]: I am providing the specific text for this topic below. Use ONLY this text as your source if possible.\n\n--- TOPIC CONTENT ---\n${sectionContent}\n--- END TOPIC CONTENT ---`;
    } else {
      prompt += `\n\n[SYSTEM]: Locate "${topicName}" in the uploaded text. Use that section as your primary source.`;
    }

    try {
      const result = await this.executeWithFallback(async () => {
        if (!this.chatSession) throw new Error("Session lost");
        const response = await this.chatSession.sendMessage({ message: prompt });
        this.incrementProUsage();
        return response;
      }, mode);

      console.log("[GeminiService] Topic session response received.");
      return this.parseResponse(result.text || "");
    } catch (error) {
      console.error("[GeminiService] Error starting topic session:", error);
      return { text: "I encountered an error processing this topic. This might be due to API rate limits. Please try again in a moment." };
    }
  }

  async sendMessage(message: string, context?: string, mode?: 'guided' | 'deep_dive' | 'exam_practice'): Promise<{ text: string, quiz?: QuizPayload, visualizations?: ConceptVisualization[] }> {
    console.log(`[GeminiService] sendMessage: Length=${message.length}, Mode=${mode}`);

    if (!this.chatSession) throw new Error("Session not initialized. Please upload a file first.");

    if (mode) {
      await this.switchModel(mode);
    }

    try {
      let finalPrompt = message;
      if (context) {
        finalPrompt = `User selection: """${context}"""\n\nQuestion: ${message}`;
      }

      const result = await this.executeWithFallback(async () => {
        if (!this.chatSession) throw new Error("Session lost");
        const response = await this.chatSession.sendMessage({ message: finalPrompt });
        this.incrementProUsage();
        return response;
      }, mode || 'guided');

      console.log("[GeminiService] Message response received.");
      const rawText = result.text || "";
      return this.parseResponse(rawText);
    } catch (error) {
      console.error("[GeminiService] Error sending message:", error);
      return { text: "I encountered an error communicating with the AI service. Please check your API key or internet connection." };
    }
  }

  async generateQuiz(domain: string, count: number = 5): Promise<{ text: string, quiz?: QuizPayload }> {
    console.log(`[GeminiService] generateQuiz: Domain="${domain}", Count=${count}`);
    if (!this.chatSession) return { text: "" };
    const prompt = `Generate a structured quiz for Domain: ${domain}. Create ${count} multiple-choice questions. Format strictly as JSON.`;
    try {
      // Quizzes are usually fine on Flash, but let's be safe
      const result = await retryWithBackoff(async () => {
        if (!this.chatSession) throw new Error("Session lost");
        return await this.chatSession.sendMessage({ message: prompt });
      });

      console.log("[GeminiService] Quiz generated successfully.");
      return this.parseResponse(result.text || "");
    } catch (e) {
      console.error("[GeminiService] Quiz generation failed", e);
      return { text: "Failed to generate quiz." };
    }
  }

  async generateTOC(): Promise<TOCItem[]> {
    console.log("[GeminiService] Generating Table of Contents...");
    if (!this.chatSession) return [];
    const prompt = `Generate a JSON Table of Contents (TOC) for this book. Structure: { "toc": [{ "id": "d1", "title": "Domain 1...", "children": [] }] }`;
    try {
      const result = await retryWithBackoff(async () => {
        if (!this.chatSession) throw new Error("Session lost");
        return await this.chatSession.sendMessage({ message: prompt });
      });

      const text = result.text || "";
      const match = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) {
        const parsed = JSON.parse(match[1]);
        console.log(`[GeminiService] TOC Generated. Items: ${parsed.toc?.length || 0}`);
        return parsed.toc || [];
      }
    } catch (e) {
      console.error("[GeminiService] Failed to generate TOC", e);
    }
    return [];
  }

  private parseResponse(text: string): { text: string, quiz?: QuizPayload, visualizations?: ConceptVisualization[] } {
    const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
    let match;
    let cleanText = text;
    let quiz: QuizPayload | undefined;
    const visualizations: ConceptVisualization[] = [];

    codeBlockRegex.lastIndex = 0;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      try {
        const jsonStr = match[1];
        const parsed = JSON.parse(jsonStr);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          quiz = parsed as QuizPayload;
          cleanText = cleanText.replace(match[0], "");
        } else if (parsed.type === "visualization" || parsed.diagramType) {
          visualizations.push(parsed as ConceptVisualization);
          cleanText = cleanText.replace(match[0], "");
        }
      } catch (e) {
        console.warn("[GeminiService] Failed to parse JSON block in response", e);
      }
    }
    return {
      text: cleanText.trim(),
      quiz,
      visualizations: visualizations.length > 0 ? visualizations : undefined
    };
  }
}

export const geminiService = new GeminiService();