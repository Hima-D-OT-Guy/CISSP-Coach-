/**
 * Extracts text from a File object.
 * Supports .txt, .md, and .pdf
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;

  if (fileType === "text/plain" || fileType === "text/markdown" || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  if (fileType === "application/pdf") {
    return extractTextFromPDF(file);
  }

  throw new Error("Unsupported file type. Please upload PDF, TXT, or MD.");
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
    // Limit to 50 pages for demo performance if needed, but let's try full
    const maxPages = pdf.numPages; 
    
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += `\n--- Page ${i} ---\n` + pageText;
    }

    return fullText;
  } catch (error) {
    console.error("PDF Parsing Error", error);
    throw new Error("Failed to parse PDF. Please ensure it is a valid PDF document.");
  }
}