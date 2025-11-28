import { ProcessedBook, TOCItem, AssessmentTest, ChapterElements, QuizQuestion } from '../types';

/**
 * Extracts text from a File object and splits it into chapters.
 * Supports .txt, .md, and .pdf
 */
export async function extractTextFromFile(file: File): Promise<ProcessedBook> {
  if (file.size === 0) {
    throw new Error("File is empty");
  }
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("File is too large. Maximum size is 50MB.");
  }

  let fullText = "";
  const fileType = file.type;

  if (fileType === "text/plain" || fileType === "text/markdown" || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
    fullText = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  } else if (fileType === "application/pdf") {
    fullText = await extractTextFromPDF(file);
  } else {
    throw new Error("Unsupported file type. Please upload PDF, TXT, or MD.");
  }

  // Preprocess text to handle flattened headers (missing newlines)
  fullText = preprocessText(fullText);

  const processedBook = splitTextByChapters(fullText);

  // Extract Assessment Test (usually before Chapter 1)
  const assessmentTest = extractAssessmentTest(fullText);
  if (assessmentTest) {
    processedBook.assessmentTest = assessmentTest;
    // Add to TOC if not already there
    if (!processedBook.toc.find(i => i.id === 'assessment_test')) {
      processedBook.toc.unshift({
        id: 'assessment_test',
        title: 'Assessment Test',
        level: 1,
        status: 'not_started'
      });
    }
  }

  return processedBook;
}

function preprocessText(text: string): string {
  return text.replace(/([^\n])\s+((?:Chapter|Domain|Module)\s+(?:\d+|[IVX]+)(?::|\s+[A-Z]))/g, '$1\n$2');
}

function splitTextByChapters(fullText: string): ProcessedBook {
  const sections: Record<string, string> = {};
  const chapterElements: Record<string, ChapterElements> = {};
  const toc: TOCItem[] = [];

  const headerRegex = /(?:^|\n)((?:Chapter|Domain|Module)\s+(\d+|[IVX]+))(?::|\s+)([^\n]+)?/gi;

  let match;
  let lastIndex = 0;
  let lastId = "";
  let lastTitle = "";

  while ((match = headerRegex.exec(fullText)) !== null) {
    const currentIdx = match.index;

    if (lastId) {
      const sectionContent = fullText.substring(lastIndex, currentIdx).trim();
      sections[lastId] = sectionContent;
      chapterElements[lastId] = extractChapterElements(sectionContent);
    } else if (currentIdx > 0) {
      const intro = fullText.substring(0, currentIdx).trim();
      if (intro) {
        sections['intro'] = intro;
        toc.push({ id: 'intro', title: 'Introduction', level: 1, status: 'not_started' });
      }
    }

    const type = match[1];
    const num = match[2];
    const title = match[3] ? match[3].trim() : "";

    lastId = `section_${num.toLowerCase()}`;
    lastTitle = title ? `${type}: ${title}` : type;
    lastIndex = currentIdx;

    toc.push({
      id: lastId,
      title: lastTitle,
      level: 1,
      status: 'not_started'
    });
  }

  if (lastId) {
    const sectionContent = fullText.substring(lastIndex).trim();
    sections[lastId] = sectionContent;
    chapterElements[lastId] = extractChapterElements(sectionContent);
  } else {
    sections['full'] = fullText;
    toc.push({ id: 'full', title: 'Full Document', level: 1, status: 'not_started' });
  }

  return {
    fullText,
    sections,
    toc,
    chapterElements
  };
}

// --- Advanced Parsing Logic ---

function extractAssessmentTest(text: string): AssessmentTest | undefined {
  // Fuzzy Window: Look for "Assessment Test" and stop at "Chapter 1"
  const startRegex = /Assessment Test/i;
  const endRegex = /Chapter\s+1/i;

  const startMatch = startRegex.exec(text);
  const endMatch = endRegex.exec(text);

  if (!startMatch) return undefined;

  const startIndex = startMatch.index;
  const endIndex = endMatch ? endMatch.index : text.length; // Fallback to end of text

  // Safety check: if end comes before start, ignore
  if (endIndex <= startIndex) return undefined;

  const block = text.substring(startIndex, endIndex);
  const questions: QuizQuestion[] = [];

  // Regex to find questions: "1. Question text..."
  // We look for a number followed by a dot, then text, then options A-D
  // This is tricky in PDF text, so we'll be lenient.
  const questionRegex = /(\d+)\.\s+([\s\S]+?)(?=\n\d+\.\s+|$)/g;

  let qMatch;
  while ((qMatch = questionRegex.exec(block)) !== null) {
    const num = qMatch[1];
    const content = qMatch[2].trim();

    // Try to extract options (A. ... B. ... C. ... D. ...)
    // Simple heuristic: split by A., B., C., D.
    // Note: This is a best-effort parser.

    questions.push({
      id: `q${num}`,
      question: content, // Contains options for now
      options: [],
      correctIndex: -1,
      explanation: "Refer to the 'Answers to Assessment Test' section."
    });

    if (questions.length >= 40) break; // Limit to 40
  }

  if (questions.length === 0) return undefined;

  return {
    id: 'assessment_01',
    title: 'Assessment Test',
    questions
  };
}

function extractChapterElements(text: string): ChapterElements {
  const elements: ChapterElements = {
    tips: [],
    summaries: [],
    studyEssentials: [],
    writtenLabs: [],
    reviewQuestions: []
  };

  // 1. Extract Tips (look for "Tip" or "Note" followed by text)
  const tipRegex = /(?:Tip|Note):\s+([^\n]+)/gi;
  let match;
  while ((match = tipRegex.exec(text)) !== null) {
    elements.tips.push(match[1].trim());
  }

  // 2. Extract Study Essentials (look for "Summary" or "Essentials")
  const summaryRegex = /(?:Summary|Essentials)(?:[\s\S]+?)(?=\n(?:Chapter|Review|Written)|$)/i;
  const summaryMatch = summaryRegex.exec(text);
  if (summaryMatch) {
    elements.studyEssentials.push(summaryMatch[0].trim());
  }

  // 3. Extract Written Labs
  // Simplified regex: Capture until newline or end of string
  const labRegex = /Written Lab\s+([^\n]+)/i;
  const labMatch = labRegex.exec(text);
  if (labMatch) {
    const labText = labMatch[1].trim();
    elements.writtenLabs.push({ question: labText });
  }

  return elements;
}

async function extractTextFromPDF(file: File): Promise<string> {
  // @ts-ignore - PDFJS is loaded via CDN in index.html
  const pdfjsLib = window.pdfjsLib;

  if (!pdfjsLib) {
    throw new Error("PDF.js library not loaded. Please refresh or check connection.");
  }

  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = "";

    // Iterate through all pages
    const maxPages = pdf.numPages;

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += `\n` + pageText; // Removed "--- Page X ---" to avoid confusing the regex
    }

    return fullText;
  } catch (error) {
    console.error("PDF Parsing Error", error);
    throw new Error("Failed to parse PDF. Please ensure it is a valid PDF document.");
  }
}