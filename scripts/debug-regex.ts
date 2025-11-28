import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JSON_PATH = path.resolve(__dirname, '../public/book_data.json');

const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
const section1 = data.sections['section_1'];

if (!section1) {
    console.log("Section 1 not found!");
    process.exit(1);
}

console.log("--- Section 1 Content Start ---");
fs.writeFileSync('section_1.txt', section1);
console.log("Wrote section_1.txt");
console.log("--- Section 1 Content End Snippet ---");
console.log(section1.substring(section1.length - 500));

console.log("\n--- Testing Regexes ---");

const tipRegex = /(?:Tip|Note):\s+([^\n]+)/gi;
let match;
let tipCount = 0;
while ((match = tipRegex.exec(section1)) !== null) {
    console.log(`Found Tip: ${match[1].substring(0, 50)}...`);
    tipCount++;
}
console.log(`Total Tips: ${tipCount}`);

const summaryRegex = /(?:Summary|Essentials)(?:[\s\S]+?)(?=\n(?:Chapter|Review|Written)|$)/i;
const summaryMatch = summaryRegex.exec(section1);
if (summaryMatch) {
    console.log("Found Summary!");
    console.log(summaryMatch[0].substring(0, 100) + "...");
} else {
    console.log("Summary NOT found.");
}

const labRegex = /Written Lab\s+([^\n]+)/i;
const labMatch = labRegex.exec(section1);
if (labMatch) {
    console.log("Found Written Lab!");
    console.log(labMatch[1]);
} else {
    console.log("Written Lab NOT found.");
}
