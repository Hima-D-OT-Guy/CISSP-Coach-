
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_PDF = path.resolve(__dirname, '../public/cissp_guide.pdf');

async function debugObjectiveMap() {
    const dataBuffer = fs.readFileSync(INPUT_PDF);
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(dataBuffer) });
    const pdf = await loadingTask.promise;

    const page = await pdf.getPage(44);
    const textContent = await page.getTextContent();
    const items = textContent.items.map((item: any) => item.str).join(' ');
    console.log(items);
}

debugObjectiveMap();
