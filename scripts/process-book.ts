
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  ranges: {
    // Skip 1-43 (Cover, TOC, Intro)
    objectiveMap: { start: 44, end: 61 },
    assessmentTest: { start: 62, end: 74 }, // Ends mid-page 74
    assessmentAnswers: { start: 74, end: 85 }, // Starts mid-page 74
    chapters: { start: 86, end: 1631 },
    appendix: { start: 1632, end: 1767 }
  },
  verbose: true
};

// ============================================================================
// TYPES
// ============================================================================

interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  fontSize: number;
}

interface PageLayout {
  pageNum: number;
  text: string;
  items: TextItem[];
}

interface ObjectiveMapItem {
  domainId: string;
  description: string;
  chapters: number[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: string; // "A", "B", etc.
  explanation?: string;
}

interface ChapterMarker {
  pageNum: number;
  chapterNum: number;
  title: string;
  position: number;
}

interface ProcessedBook {
  metadata: any;
  objectiveMap: ObjectiveMapItem[];
  assessmentTest: {
    questions: QuizQuestion[];
    answers: Record<string, string>; // qId -> explanation
  };
  toc: any[];
  sections: Record<string, string>; // chapter_1 -> text
  chapterElements: Record<string, any>;
}

// ============================================================================
// UTILITIES
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_PDF = path.resolve(__dirname, '../public/cissp_guide.pdf');
const OUTPUT_JSON = path.resolve(__dirname, '../public/book_data.json');

function log(message: string) {
  if (CONFIG.verbose) console.log(message);
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

// ============================================================================
// TEXT EXTRACTION
// ============================================================================

async function extractPageWithLayout(page: any, pageNum: number): Promise<PageLayout> {
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1.0 });

  const items: TextItem[] = textContent.items
    .filter((item: any) => item.str && item.str.trim())
    .map((item: any) => ({
      str: item.str,
      x: item.transform[4],
      y: viewport.height - item.transform[5],
      width: item.width,
      height: item.height,
      fontName: item.fontName || '',
      fontSize: Math.abs(item.transform[0])
    }));

  // Sort by Y (top to bottom), then X (left to right)
  items.sort((a, b) => {
    const yDiff = a.y - b.y;
    if (Math.abs(yDiff) > 5) return yDiff;
    return a.x - b.x;
  });

  // Simple reconstruction
  let text = '';
  let lastY = items[0]?.y || 0;

  for (const item of items) {
    const yDiff = Math.abs(item.y - lastY);
    if (yDiff > 10) text += '\n'; // New line
    text += item.str + ' '; // Add space between words
    lastY = item.y;
  }

  return { pageNum, text, items };
}

async function extractRange(pdf: any, start: number, end: number): Promise<string> {
  let fullText = '';
  for (let i = start; i <= end; i++) {
    const page = await pdf.getPage(i);
    const layout = await extractPageWithLayout(page, i);
    fullText += layout.text + '\n';
    if (i % 50 === 0) log(`  Processed page ${i}...`);
  }
  return fullText;
}

// ============================================================================
// PARSERS
// ============================================================================

function parseObjectiveMap(text: string): ObjectiveMapItem[] {
  const items: ObjectiveMapItem[] = [];

  console.log("--- DEBUG MAP TEXT START ---");
  console.log(text.substring(0, 1000));
  console.log("--- DEBUG MAP TEXT END ---");

  // Regex: "1.1 Description... 19"
  // Look for ID (X.X or X.X.X)
  const regex = /(?:^|\n)\s*(\d+(?:\.\d+)+)\s+(.+?)\s+(\d+(?:,\s*\d+)*)\s*(?=\n|$)/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    // Basic validation
    if (match[2].length < 500) {
      items.push({
        domainId: match[1],
        description: cleanText(match[2]),
        chapters: match[3].split(',').map(s => parseInt(s.trim()))
      });
    }
  }
  return items;
}

function parseAssessmentTest(text: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  // Split by "1. ", "2. "
  const parts = text.split(/\n(?=\d+\.\s)/);

  parts.forEach((part, index) => {
    if (index === 0 && !part.match(/^\d+\./)) return; // Skip preamble

    const lines = part.split('\n');
    const questionText = lines[0].replace(/^\d+\.\s/, '').trim();

    // Find options
    const options: string[] = [];
    const optionRegex = /^[A-D]\.\s(.+)/;

    lines.slice(1).forEach(line => {
      const match = line.trim().match(optionRegex);
      if (match) options.push(match[1]);
    });

    if (questionText && options.length > 0) {
      questions.push({
        id: `assessment_q${questions.length + 1}`,
        question: questionText,
        options
      });
    }
  });

  return questions;
}

function detectChapters(text: string): ChapterMarker[] {
  const markers: ChapterMarker[] = [];
  // "Chapter 1: Title"
  const regex = /(?:^|\n)\s*Chapter\s+(\d+)\s*[:\n]\s*([^\n]+)/gi;

  let match;
  while ((match = regex.exec(text)) !== null) {
    markers.push({
      pageNum: 0, // We lost page mapping in bulk text, but we have position
      chapterNum: parseInt(match[1]),
      title: match[2].trim(),
      position: match.index
    });
  }

  // Deduplicate
  const unique: ChapterMarker[] = [];
  const seen = new Set();
  for (const m of markers) {
    if (!seen.has(m.chapterNum)) {
      unique.push(m);
      seen.add(m.chapterNum);
    }
  }

  return unique.sort((a, b) => a.chapterNum - b.chapterNum);
}

function segmentTextByChapters(fullText: string, markers: ChapterMarker[]): Record<string, string> {
  const sections: Record<string, string> = {};

  for (let i = 0; i < markers.length; i++) {
    const current = markers[i];
    const next = markers[i + 1];

    const start = current.position;
    const end = next ? next.position : fullText.length;

    const chapterId = `chapter_${current.chapterNum}`;

    let rawContent = fullText.substring(start, end);

    // REFLOW LOGIC: Fix broken lines
    // Replaces newlines that are followed by a lowercase letter
    let cleanContent = rawContent.replace(/\n(?=[a-z])/g, ' ');

    sections[chapterId] = cleanContent;
  }

  return sections;
}

function extractChapterElements(text: string): any {
  // Basic extraction for now
  const summaries: string[] = [];
  const summaryMatch = text.match(/Summary\s*\n([\s\S]+?)(?=\n(?:Review Questions|Written Lab)|$)/i);
  if (summaryMatch) summaries.push(cleanText(summaryMatch[1]));

  return { summaries, reviewQuestions: [], writtenLabs: [] };
}


// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 Starting CISSP Extraction Pipeline...');

  if (!fs.existsSync(INPUT_PDF)) {
    console.error(`❌ PDF not found at ${INPUT_PDF}`);
    process.exit(1);
  }

  const dataBuffer = fs.readFileSync(INPUT_PDF);
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(dataBuffer) });
  const pdf = await loadingTask.promise;
  console.log(`✓ PDF Loaded (${pdf.numPages} pages)`);

  const bookData: ProcessedBook = {
    metadata: { extractedAt: new Date().toISOString() },
    objectiveMap: [],
    assessmentTest: { questions: [], answers: {} },
    toc: [],
    sections: {},
    chapterElements: {}
  };

  // 1. Objective Map (Manual Load)
  console.log('\n🗺️  Loading Objective Map from manual file...');
  const MANUAL_MAP_PATH = path.resolve(__dirname, '../public/objective_map_manual.json');
  if (fs.existsSync(MANUAL_MAP_PATH)) {
    const mapContent = fs.readFileSync(MANUAL_MAP_PATH, 'utf-8');
    bookData.objectiveMap = JSON.parse(mapContent);
    console.log(`✓ Loaded ${bookData.objectiveMap.length} objectives from manual file`);
  } else {
    console.warn('⚠️ Manual objective map not found, skipping...');
  }

  // 2. Assessment Test & Answers
  console.log('\n📝 Extracting Assessment Test (Pages 62-85)...');
  const assessmentRaw = await extractRange(pdf, CONFIG.ranges.assessmentTest.start, CONFIG.ranges.assessmentAnswers.end);

  // Split at "Answers to Assessment Test"
  const splitMarker = "Answers to Assessment Test";
  const splitIdx = assessmentRaw.indexOf(splitMarker);

  if (splitIdx !== -1) {
    const questionsText = assessmentRaw.substring(0, splitIdx);
    const answersText = assessmentRaw.substring(splitIdx);

    bookData.assessmentTest.questions = parseAssessmentTest(questionsText);
    // TODO: Parse answersText
    console.log(`✓ Found ${bookData.assessmentTest.questions.length} assessment questions`);
  } else {
    console.warn("⚠️ Could not find 'Answers to Assessment Test' split marker");
    // Fallback: assume all is questions if not found (or check page 74 explicitly)
    bookData.assessmentTest.questions = parseAssessmentTest(assessmentRaw);
  }

  // 3. Chapters
  console.log('\n📚 Extracting Chapters (Pages 86-1631)...');
  const chaptersText = await extractRange(pdf, CONFIG.ranges.chapters.start, CONFIG.ranges.chapters.end);

  const markers = detectChapters(chaptersText);
  console.log(`✓ Detected ${markers.length} chapters`);

  bookData.sections = segmentTextByChapters(chaptersText, markers);

  // Build TOC and Elements
  markers.forEach(m => {
    const id = `chapter_${m.chapterNum}`;
    bookData.toc.push({
      id,
      title: `Chapter ${m.chapterNum}: ${m.title}`,
      level: 1
    });

    if (bookData.sections[id]) {
      bookData.chapterElements[id] = extractChapterElements(bookData.sections[id]);
    }
  });

  // 4. Save
  console.log('\n💾 Saving...');
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(bookData, null, 2));
  console.log(`✓ Saved to ${OUTPUT_JSON}`);
}

main();
