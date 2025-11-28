
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_PDF = path.resolve(__dirname, '../public/cissp_guide.pdf');

async function dumpMap() {
    const dataBuffer = fs.readFileSync(INPUT_PDF);
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(dataBuffer) });
    const pdf = await loadingTask.promise;

    let text = '';
    for (let i = 44; i <= 46; i++) { // Just first 3 pages
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items.map((item: any) => item.str).join(' '); // Simple join
        text += `\n--- PAGE ${i} ---\n${items}\n`;
    }

    fs.writeFileSync('public/map_debug.txt', text);
}

dumpMap();
