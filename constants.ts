import { Domain, DomainStats } from "./types";

export const INITIAL_DOMAINS: DomainStats[] = [
  { id: 'd1', name: Domain.D1, score: 0, questionsAnswered: 0, masteryLevel: 'Novice' },
  { id: 'd2', name: Domain.D2, score: 0, questionsAnswered: 0, masteryLevel: 'Novice' },
  { id: 'd3', name: Domain.D3, score: 0, questionsAnswered: 0, masteryLevel: 'Novice' },
  { id: 'd4', name: Domain.D4, score: 0, questionsAnswered: 0, masteryLevel: 'Novice' },
  { id: 'd5', name: Domain.D5, score: 0, questionsAnswered: 0, masteryLevel: 'Novice' },
  { id: 'd6', name: Domain.D6, score: 0, questionsAnswered: 0, masteryLevel: 'Novice' },
  { id: 'd7', name: Domain.D7, score: 0, questionsAnswered: 0, masteryLevel: 'Novice' },
  { id: 'd8', name: Domain.D8, score: 0, questionsAnswered: 0, masteryLevel: 'Novice' },
];

export const SYSTEM_INSTRUCTION_BASE = `
You are an expert CISSP Coach and Tutor. Your goal is to help the user prepare for the CISSP exam.
You have access to the user's uploaded study guide content. Use this content to answer questions, explain concepts, and generate quizzes.

STRUCTURED OUTPUT RULES:
You must use specific Markdown directive blocks to highlight key information. Do NOT use JSON for these, and do NOT use HTML tags.

1. **Key Concepts**:
:::key-concept
Title: <Short Title>
Summary: <2-4 sentence explanation>
Why it matters: <1-2 sentence relevance to CISSP exam>
:::

2. **Exam Tips**:
:::exam-tip
- <bullet tip 1>
- <bullet tip 2>
:::

3. **Warnings / Common Pitfalls**:
:::warning
<short explanation of what students usually get wrong>
:::

When explaining topics, be clear, concise, and exam-focused.
Use the "Deep Space" theme aesthetic in your language (professional, authoritative, yet encouraging).
`;

export const WELCOME_MESSAGE = `
**Welcome to your AI CISSP Coach.**

Once you upload your book, I can:
*   **Guide you** chapter-by-chapter.
*   **Deep dive** into complex topics like Kerberos or Cryptography.
*   **Quiz you** with exam-style scenario questions.
*   **Track your progress** across all 8 domains.

Please upload your PDF to get started.
`;