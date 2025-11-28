import { describe, it, expect, vi } from 'vitest';
import { extractTextFromFile } from './fileProcessor';

describe('extractTextFromFile', () => {
    it('should throw error for empty files', async () => {
        const file = new File([], "empty.txt", { type: "text/plain" });
        await expect(extractTextFromFile(file)).rejects.toThrow("File is empty");
    });

    it('should throw error for files larger than 50MB', async () => {
        // Mock file size property since we can't easily create a 50MB file in memory
        const file = {
            name: "large.txt",
            type: "text/plain",
            size: 55 * 1024 * 1024, // 55MB
            text: () => Promise.resolve("content"),
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
            slice: () => new Blob(),
            stream: () => new ReadableStream()
        } as unknown as File;

        await expect(extractTextFromFile(file)).rejects.toThrow("File is too large");
    });

    it('should fallback to full text if no chapters found', async () => {
        const content = "Just some plain text without any chapter headers.";
        const file = new File([content], "plain.txt", { type: "text/plain" });

        const result = await extractTextFromFile(file);

        expect(result.sections['full']).toBe(content);
        expect(result.toc).toHaveLength(1);
        expect(result.toc[0].title).toBe("Full Document");
    });

    it('should correctly split chapters', async () => {
        const content = `
Introduction text.

Chapter 1: The Beginning
Content of chapter 1.

Chapter 2: The Middle
Content of chapter 2.
    `;
        const file = new File([content], "book.txt", { type: "text/plain" });

        const result = await extractTextFromFile(file);

        expect(result.sections['intro']).toContain("Introduction text");
        expect(result.sections['section_1']).toContain("Content of chapter 1");
        expect(result.sections['section_2']).toContain("Content of chapter 2");
        expect(result.toc).toHaveLength(3); // Intro + Ch1 + Ch2
    });

    it('should handle flattened text with missing newlines', async () => {
        // Simulating PDF extraction where headers are inline
        const content = `Introduction text. Chapter 1: The Beginning Content of chapter 1. Chapter 2: The Middle Content of chapter 2.`;
        const file = new File([content], "flattened.txt", { type: "text/plain" });

        const result = await extractTextFromFile(file);

        expect(result.sections['section_1']).toContain("Content of chapter 1");
        expect(result.sections['section_2']).toContain("Content of chapter 2");
        expect(result.toc).toHaveLength(3); // Intro + Ch1 + Ch2
    });

    it('should ignore "See Chapter X" references', async () => {
        const content = `
Chapter 1: Start
This is a reference to (see Chapter 5) in the text.
It should not create a new chapter.
    `;
        const file = new File([content], "references.txt", { type: "text/plain" });

        const result = await extractTextFromFile(file);

        expect(result.toc).toHaveLength(1); // Only Chapter 1
        expect(result.sections['section_1']).toContain("see Chapter 5");
    });

    it('should extract Assessment Test', async () => {
        const content = `
Assessment Test
1. What is the CIA triad?
A. Confidentiality, Integrity, Availability
B. Cat, Ice, Apple
C. Car, Igloo, Ant
D. None of the above
2. Another question.
Chapter 1: Security Governance
        `;
        const file = new File([content], "assessment.txt", { type: "text/plain" });
        const result = await extractTextFromFile(file);

        expect(result.assessmentTest).toBeDefined();
        expect(result.assessmentTest?.questions).toHaveLength(2);
        expect(result.assessmentTest?.questions[0].question).toContain("What is the CIA triad?");
    });

    it('should extract Chapter Elements', async () => {
        const content = `
Chapter 1: Security Governance
Tip: Remember this for the exam.
Summary: This is the summary.
Written Lab 1. Describe the CIA triad.
        `;
        const file = new File([content], "elements.txt", { type: "text/plain" });
        const result = await extractTextFromFile(file);

        const elements = result.chapterElements?.['section_1'];
        expect(elements).toBeDefined();
        expect(elements?.tips).toContain("Remember this for the exam.");
        expect(elements?.studyEssentials).toContain("This is the summary.");
        expect(elements?.writtenLabs[0].question).toContain("Describe the CIA triad.");
    });
});
