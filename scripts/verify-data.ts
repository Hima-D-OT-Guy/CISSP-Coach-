
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'public', 'book_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log('Total sections:', Object.keys(data.sections).length);
console.log('Section 1 length:', data.sections['section_1']?.length);

if (data.chapterElements && data.chapterElements['section_1']) {
    const elements = data.chapterElements['section_1'];
    console.log('Section 1 Elements:');
    console.log('  Tips:', elements.tips?.length);
    console.log('  Summaries:', elements.summaries?.length);
    console.log('  Review Questions:', elements.reviewQuestions?.length);
    console.log('  Written Labs:', elements.writtenLabs?.length);
} else {
    console.log('No chapter elements found for section_1');
}
