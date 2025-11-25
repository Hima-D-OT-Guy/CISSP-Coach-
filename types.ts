export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // e.g. ["A. ...", "B. ...", "C. ...", "D. ..."]
  correctIndex: number; // 0-based index of options
  explanation: string;
  domain?: string;      // optional CISSP domain name
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
  score: number; // 0-100
  questionsAnswered: number;
  masteryLevel: 'Novice' | 'Intermediate' | 'Advanced' | 'Expert';
}

export enum TeachingMode {
  GUIDED = "Guided Course",
  DEEP_DIVE = "Topic Deep Dive",
  EXAM_PRACTICE = "Exam Practice"
}

export interface AppState {
  hasFile: boolean;
  fileName: string | null;
  fileContent: string | null;
  isProcessing: boolean;
  mode: TeachingMode;
  chatHistory: Message[];
  stats: DomainStats[];
  apiKeyValid: boolean;
}