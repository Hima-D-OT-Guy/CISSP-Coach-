export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  domain?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface QuizPayload {
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

export type DiagramType = "mermaid-flowchart" | "mermaid-sequence" | "ascii";

export interface ConceptVisualization {
  title: string;
  purpose: string;
  diagramType: DiagramType;
  diagramCode: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  isThinking?: boolean;
  timestamp: number;
  quizPayload?: QuizPayload;
  visualizations?: ConceptVisualization[];
  selectionContext?: string;
  sourceMode?: "guided" | "deepDive" | "exam";
}

export enum Domain {
  D1 = "Security and Risk Management",
  D2 = "Asset Security",
  D3 = "Security Architecture and Engineering",
  D4 = "Communication and Network Security",
  D5 = "Identity and Access Management (IAM)",
  D6 = "Security Assessment and Testing",
  D7 = "Security Operations",
  D8 = "Software Development Security"
}

export interface DomainStats {
  id: string;
  name: string;
  score: number;
  questionsAnswered: number;
  masteryLevel: 'Novice' | 'Intermediate' | 'Advanced' | 'Expert';
}

export enum TeachingMode {
  GUIDED = "Guided Course",
  DEEP_DIVE = "Topic Deep Dive",
  EXAM_PRACTICE = "Exam Practice"
}

export type TopicStatus = 'not_started' | 'in_progress' | 'completed';

export interface TOCItem {
  id: string;
  title: string;
  level: number; // 1 for Domain, 2 for Topic
  status: TopicStatus;
  children?: TOCItem[];
}

export type AccountTier = 'free' | 'paid';

export interface UserSettings {
  userName: string;
  apiKey: string;
  tier: AccountTier;
}

// --- Phase 8: Advanced Parsing Interfaces ---

export interface AssessmentTest {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface ChapterElements {
  tips: string[];
  summaries: string[];
  studyEssentials: string[];
  writtenLabs: { question: string; answer?: string }[];
  reviewQuestions: QuizQuestion[];
}

export interface ProcessedBook {
  fullText: string;
  sections: Record<string, string>;
  toc: TOCItem[];
  assessmentTest?: AssessmentTest;
  chapterElements?: Record<string, ChapterElements>;
}

export interface AppState {
  hasFile: boolean;
  fileName: string | null;
  fileContent: string | null;
  isProcessing: boolean;
  mode: TeachingMode;
  chatHistory: Message[];
  stats: DomainStats[];
  toc?: TOCItem[];
  apiKeyValid: boolean;
  tokenCount?: number;
  userSettings?: UserSettings;
  processedBook?: ProcessedBook;
}