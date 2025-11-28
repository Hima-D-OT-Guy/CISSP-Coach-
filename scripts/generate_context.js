import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const outputFile = path.join(rootDir, 'cissp_coach_codebase_context.md');

const filesToBundle = [
    'package.json',
    'project_changes_log.md',
    'tsconfig.json',
    'vite.config.ts',
    'index.html',
    'index.tsx',
    'App.tsx',
    'types.ts',
    'constants.ts',
    'prompts.ts',
    'services/geminiService.ts',
    'services/storageService.ts',
    'services/fileProcessor.ts',
    'components/ChatInterface.tsx',
    'components/ConceptVisualizationPanel.tsx',
    'components/FileUpload.tsx',
    'components/LessonReader.tsx',
    'components/Quiz.tsx',
    'components/SelectionQuestionModal.tsx',
    'components/SetupModal.tsx',
    'components/Sidebar.tsx',
    'components/cards/KeyConceptCard.tsx',
    'components/cards/ExamTipCard.tsx',
    'components/cards/WarningCard.tsx'
];

let output = '# CISSP Coach Application - Full Codebase Context\n\n';
output += `Generated on: ${new Date().toISOString()}\n\n`;

filesToBundle.forEach(relPath => {
    const fullPath = path.join(rootDir, relPath);
    try {
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const ext = path.extname(fullPath).substring(1);
            const lang = ext === 'ts' || ext === 'tsx' ? 'typescript' : ext;

            output += `## File: ${relPath}\n`;
            output += '```' + lang + '\n';
            output += content + '\n';
            output += '```\n\n';
            console.log(`Bundled: ${relPath}`);
        } else {
            console.warn(`File not found: ${relPath}`);
            output += `## File: ${relPath}\n(File not found)\n\n`;
        }
    } catch (err) {
        console.error(`Error reading ${relPath}:`, err);
    }
});

fs.writeFileSync(outputFile, output);
console.log(`\nSuccessfully created codebase context at: ${outputFile}`);
