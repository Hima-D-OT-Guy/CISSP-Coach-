
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_PDF = path.resolve(__dirname, '../public/cissp_guide.pdf');

async function checkPages() {
    const dataBuffer = fs.readFileSync(INPUT_PDF);
    const data = new Uint8Array(dataBuffer);
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;

    const pagesToCheck = [74];

    for (const pageNum of pagesToCheck) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(' ');
        console.log(`\n--- Page ${pageNum} Start ---`);
        console.log(text.substring(0, 500)); // Print first 500 chars
        console.log(`--- Page ${pageNum} End ---\n`);
    }
}

checkPages();
