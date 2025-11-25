import React, { useState } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { extractTextFromFile } from '../services/fileProcessor';

interface FileUploadProps {
  onFileProcessed: (content: string, fileName: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const text = await extractTextFromFile(file);
      if (text.length < 100) {
        throw new Error("The file appears to be empty or unreadable.");
      }
      onFileProcessed(text, file.name);
    } catch (err: any) {
      setError(err.message || "Failed to process file");
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-700">
        <div className="text-center mb-8">
          <div className="bg-emerald-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Upload Study Guide</h1>
          <p className="text-slate-400">
            Upload your CISSP PDF, Text, or Markdown file to begin your personalized coaching session.
          </p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative
            ${isDragging 
              ? 'border-emerald-500 bg-emerald-500/5' 
              : 'border-slate-600 hover:border-emerald-500/50 hover:bg-slate-700/50'}
            ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input
            type="file"
            accept=".pdf,.txt,.md"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {isProcessing ? (
             <div className="flex flex-col items-center py-4">
                <Loader2 className="animate-spin text-emerald-500 mb-2" size={32} />
                <p className="text-emerald-500 font-medium">Extracting content...</p>
                <p className="text-xs text-slate-500 mt-1">Large PDFs may take a moment</p>
             </div>
          ) : (
            <>
              <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-300 font-medium mb-1">
                Click to browse or drag file here
              </p>
              <p className="text-xs text-slate-500">
                Supports PDF (Standard Text), TXT, MD
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">What happens next?</h3>
          <ul className="text-sm text-slate-300 space-y-2">
            <li className="flex gap-2">
                <span className="text-emerald-500">•</span>
                AI analyzes your document structure
            </li>
            <li className="flex gap-2">
                <span className="text-emerald-500">•</span>
                Knowledge bank is created in memory
            </li>
            <li className="flex gap-2">
                <span className="text-emerald-500">•</span>
                Interactive training session begins
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;