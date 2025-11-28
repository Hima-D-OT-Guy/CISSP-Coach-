
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'public', 'book_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

fs.writeFileSync('toc_dump.json', JSON.stringify(data.toc, null, 2));
console.log('TOC dumped to toc_dump.json');
