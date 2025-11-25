import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message, MessageRole, QuizPayload, ConceptVisualization } from "../types";
import { SYSTEM_INSTRUCTION_BASE } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  private fileContext: string = "";

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables");
    }
    
    this.ai = new GoogleGenAI({ apiKey: apiKey || "dummy" }); 
  }

  async initializeSession(fileContent: string): Promise<void> {
    this.fileContext = fileContent;
    
    const truncatedContent = fileContent.length > 800000 
      ? fileContent.substring(0, 800000) + "\n...[Content Truncated for Memory]..." 
      : fileContent;

    try {
      this.chatSession = this.ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_BASE,
          temperature: 0.3, 
        },
        history: [
          {
            role: "user",
            parts: [{ text: `Here is the content of the CISSP Study Guide I am using. Please ingest this into your knowledge base for our session. \n\n --- BEGIN BOOK CONTENT ---\n${truncatedContent}\n--- END BOOK CONTENT ---` }],
          },
          {
            role: "model",
            parts: [{ text: "I have ingested the study guide content. I am ready to act as your CISSP Coach. How would you like to start? We can begin a Guided Course, do a Deep Dive into a topic, or start some Exam Practice questions." }],
          }
        ],
      });
    } catch (error) {
      console.error("Failed to initialize session:", error);
      throw error;
    }
  }

  async sendMessage(message: string, context?: string): Promise<{ text: string, quiz?: QuizPayload, visualizations?: ConceptVisualization[] }> {
    if (!this.chatSession) {
      throw new Error("Session not initialized. Please upload a file first.");
    }

    try {
      let finalPrompt = message;

      if (context) {
        finalPrompt = `
The user selected the following passage from their CISSP study book/lesson. Focus your answer on clarifying this passage, giving examples, and relating it to CISSP exam thinking. Do NOT ignore it.

Selected passage:
"""${context}"""

User question:
${message}
`;
      }

      const result: GenerateContentResponse = await this.chatSession.sendMessage({
        message: finalPrompt
      });
      const rawText = result.text || "";
      return this.parseResponse(rawText);
    } catch (error) {
      console.error("Error sending message:", error);
      return { text: "I encountered an error communicating with the AI service. Please try again." };
    }
  }

  async generateQuiz(domain: string, count: number = 5): Promise<{ text: string, quiz?: QuizPayload }> {
    if (!this.chatSession) return { text: "" };
    
    const prompt = `Generate a structured quiz for Domain: ${domain}. 
    Create ${count} multiple-choice questions. 
    Format them strictly as a JSON object inside \`\`\`json\`\`\` blocks matching the QuizPayload structure (title, questions array with correctIndex, explanation, etc).
    Do not just list the questions in text.`;

    const result: GenerateContentResponse = await this.chatSession.sendMessage({ message: prompt });
    const rawText = result.text || "";
    return this.parseResponse(rawText);
  }

  private parseResponse(text: string): { text: string, quiz?: QuizPayload, visualizations?: ConceptVisualization[] } {
    const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
    let match;
    let cleanText = text;
    let quiz: QuizPayload | undefined;
    const visualizations: ConceptVisualization[] = [];

    // Reset regex index
    codeBlockRegex.lastIndex = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      try {
        const jsonStr = match[1];
        const parsed = JSON.parse(jsonStr);

        // Check if it's a quiz
        if (parsed.questions && Array.isArray(parsed.questions)) {
          quiz = parsed as QuizPayload;
          // Remove the JSON block from the display text
          cleanText = cleanText.replace(match[0], "");
        } 
        // Check if it's a visualization
        else if (parsed.type === "visualization" && parsed.diagramCode) {
          visualizations.push(parsed as ConceptVisualization);
          // Remove the JSON block from the display text
          cleanText = cleanText.replace(match[0], "");
        }
      } catch (e) {
        console.warn("Failed to parse JSON block from AI response", e);
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