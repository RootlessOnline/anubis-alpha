// ============================================
// ROB - PDF Processor
// Extracts knowledge from PDFs and integrates
// into the neural network
// ============================================

import {
  RawData,
  DataChunk,
  ExtractedConcept,
  ProcessingStatus,
  SourceType,
} from '../types';
import { getNeuralNet } from '../brain/neural-net';
import { getGapDetector } from '../brain/gap-detector';
import { getCuriosityEngine } from '../brain/curiosity';
import * as fs from 'fs';
import * as path from 'path';

const RAW_DATA_DIR = '/home/z/my-project/rob/data/raw/pdfs';

export interface PDFExtractionResult {
  rawId: string;
  totalPages: number;
  conceptsExtracted: number;
  chunksCreated: number;
  processingTime: number;
  summary: string;
  gapsDetected: number;
}

export class PDFProcessor {
  private neuralNet = getNeuralNet();
  private gapDetector = getGapDetector();
  private curiosity = getCuriosityEngine();

  constructor() {
    // Ensure directories exist
    if (!fs.existsSync(RAW_DATA_DIR)) {
      fs.mkdirSync(RAW_DATA_DIR, { recursive: true });
    }
  }

  // ------------------
  // MAIN PROCESSING
  // ------------------

  async processPDF(filePath: string, metadata?: Record<string, unknown>): Promise<PDFExtractionResult> {
    const startTime = Date.now();
    const rawId = this.generateRawId(filePath);

    console.log(`[PDFProcessor] Processing: ${filePath}`);

    // Create raw data entry
    const rawData: RawData = {
      id: rawId,
      source: filePath,
      sourceType: 'pdf',
      content: '',
      metadata: {
        title: metadata?.title || path.basename(filePath, '.pdf'),
        ...metadata,
      },
      uploadedAt: new Date(),
      status: 'processing',
      chunks: [],
    };

    try {
      // Use pdfplumber via Python script
      const extraction = await this.extractWithPython(filePath);

      rawData.content = extraction.fullText;
      rawData.metadata.pages = extraction.pageCount;
      rawData.metadata.fileSize = fs.statSync(filePath).size;

      // Split into chunks
      rawData.chunks = this.createChunks(extraction.fullText, extraction.pageCount);

      // Extract concepts from each chunk
      let totalConcepts = 0;
      for (const chunk of rawData.chunks) {
        const concepts = await this.extractConcepts(chunk.content, rawData.metadata.title as string);
        chunk.concepts = concepts;
        totalConcepts += concepts.length;
        chunk.confidence = this.calculateChunkConfidence(concepts);
      }

      // Save raw data
      this.saveRawData(rawData);

      // Integrate concepts into neural network
      await this.integrateIntoNetwork(rawData);

      // Detect gaps
      const gapAnalysis = this.gapDetector.analyzeForQuery(rawData.metadata.title as string);
      const gapsDetected = gapAnalysis.gaps.length;

      // Process gaps through curiosity engine
      for (const gap of gapAnalysis.gaps.slice(0, 3)) {
        this.curiosity.processGap(gap);
      }

      rawData.status = 'completed';
      rawData.processedAt = new Date();
      this.saveRawData(rawData);

      const processingTime = Date.now() - startTime;

      console.log(`[PDFProcessor] Complete: ${totalConcepts} concepts, ${processingTime}ms`);

      return {
        rawId,
        totalPages: extraction.pageCount,
        conceptsExtracted: totalConcepts,
        chunksCreated: rawData.chunks.length,
        processingTime,
        summary: this.generateSummary(rawData),
        gapsDetected,
      };
    } catch (error) {
      rawData.status = 'failed';
      this.saveRawData(rawData);
      throw error;
    }
  }

  // ------------------
  // PYTHON EXTRACTION
  // ------------------

  private async extractWithPython(filePath: string): Promise<{
    fullText: string;
    pageCount: number;
    sections: string[];
  }> {
    // Create Python script for extraction
    const scriptPath = '/home/z/my-project/rob/scripts/extract_pdf.py';

    const script = `
import pdfplumber
import json
import sys

pdf_path = sys.argv[1]

with pdfplumber.open(pdf_path) as pdf:
    full_text = ""
    sections = []

    for i, page in enumerate(pdf.pages):
        text = page.extract_text() or ""
        full_text += text + "\\n\\n"

        # Try to identify sections
        lines = text.split("\\n")
        for line in lines:
            if len(line) < 100 and (
                line.isupper() or
                line.startswith("Chapter") or
                line.startswith("Section") or
                any(char.isdigit() for char in line[:5])
            ):
                sections.append(line.strip())

    result = {
        "fullText": full_text,
        "pageCount": len(pdf.pages),
        "sections": sections[:50]  # Limit sections
    }

    print(json.dumps(result))
`;

    // Ensure scripts directory exists
    const scriptsDir = path.dirname(scriptPath);
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }
    fs.writeFileSync(scriptPath, script);

    // Run extraction
    const { execSync } = require('child_process');
    const output = execSync(`python3 "${scriptPath}" "${filePath}"`, {
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large PDFs
    });

    return JSON.parse(output);
  }

  // ------------------
  // CHUNKING
  // ------------------

  private createChunks(fullText: string, pageCount: number): DataChunk[] {
    const chunks: DataChunk[] = [];

    // Split by paragraphs first
    const paragraphs = fullText.split(/\n\n+/).filter(p => p.trim().length > 50);

    paragraphs.forEach((para, index) => {
      const chunkType = this.determineChunkType(para);
      chunks.push({
        id: `chunk-${index}`,
        index,
        content: para.trim(),
        type: chunkType,
        concepts: [],
        confidence: 0,
      });
    });

    return chunks;
  }

  private determineChunkType(text: string): DataChunk['type'] {
    // Check for code-like content
    if (text.includes('function') || text.includes('class ') || text.includes('import ')) {
      return 'code_block';
    }

    // Check for definitions
    if (text.match(/^.+:\s*.+/) || text.includes(' is defined as') || text.includes(' refers to')) {
      return 'definition';
    }

    // Check for formulas
    if (text.match(/[=+\-*/^]/) && text.match(/\d/)) {
      return 'formula';
    }

    // Check for section headers
    if (text.length < 100 && (text.isUpperCase?.() || text.match(/^Chapter|^Section|^\d+\./))) {
      return 'section';
    }

    return 'paragraph';
  }

  // ------------------
  // CONCEPT EXTRACTION
  // ------------------

  private async extractConcepts(text: string, sourceTitle: string): Promise<ExtractedConcept[]> {
    const concepts: ExtractedConcept[] = [];

    // Pattern matching for common concept formats
    const patterns = [
      // Term: definition
      /([A-Z][a-zA-Z\s]+):\s*([^.]+\.)/g,
      // "Term" is/are/means/refers to
      /"([^"]+)"\s+(?:is|are|means|refers to)\s+([^.]+\.)/gi,
      // Term (explanation in parentheses)
      /([A-Z][a-zA-Z]+)\s*\(([^)]+)\)/g,
      // Capitalized phrases that could be terms
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
    ];

    // Extract from pattern matches
    let match;
    const textLower = text.toLowerCase();

    // Pattern 1: Term: definition
    while ((match = patterns[0].exec(text)) !== null) {
      const term = match[1].trim();
      if (term.length > 2 && term.length < 50) {
        concepts.push({
          term,
          definition: match[2].trim(),
          context: text.slice(Math.max(0, match.index - 50), match.index + match[0].length + 50),
          confidence: 80,
          relatedTo: this.extractRelatedTerms(match[2], [term]),
        });
      }
    }

    // Pattern 2: "Term" is/are/means
    while ((match = patterns[1].exec(text)) !== null) {
      const term = match[1].trim();
      if (term.length > 2 && term.length < 50) {
        concepts.push({
          term,
          definition: match[2].trim(),
          context: text.slice(Math.max(0, match.index - 50), match.index + match[0].length + 50),
          confidence: 75,
          relatedTo: this.extractRelatedTerms(match[2], [term]),
        });
      }
    }

    // Pattern 3: Term (explanation)
    while ((match = patterns[2].exec(text)) !== null) {
      const term = match[1].trim();
      if (term.length > 2 && term.length < 30) {
        concepts.push({
          term,
          definition: match[2].trim(),
          context: text.slice(Math.max(0, match.index - 50), match.index + match[0].length + 50),
          confidence: 70,
          relatedTo: [],
        });
      }
    }

    // Deduplicate by term
    const uniqueConcepts = new Map<string, ExtractedConcept>();
    for (const concept of concepts) {
      const key = concept.term.toLowerCase();
      if (!uniqueConcepts.has(key) || uniqueConcepts.get(key)!.confidence < concept.confidence) {
        uniqueConcepts.set(key, concept);
      }
    }

    return Array.from(uniqueConcepts.values()).slice(0, 20); // Limit per chunk
  }

  private extractRelatedTerms(text: string, exclude: string[]): string[] {
    const related: string[] = [];
    const words = text.split(/\s+/);

    for (const word of words) {
      const clean = word.replace(/[^a-zA-Z]/g, '');
      if (clean.length > 3 && !exclude.includes(clean) && clean[0] === clean[0].toUpperCase()) {
        related.push(clean);
      }
    }

    return [...new Set(related)].slice(0, 5);
  }

  private calculateChunkConfidence(concepts: ExtractedConcept[]): number {
    if (concepts.length === 0) return 30;
    const avgConfidence = concepts.reduce((sum, c) => sum + c.confidence, 0) / concepts.length;
    return Math.round(avgConfidence);
  }

  // ------------------
  // NEURAL NETWORK INTEGRATION
  // ------------------

  private async integrateIntoNetwork(rawData: RawData): Promise<void> {
    // Determine domain from title/content
    const domain = this.detectDomain(rawData.metadata.title as string, rawData.content);

    for (const chunk of rawData.chunks) {
      for (const concept of chunk.concepts) {
        // Add node to neural network
        const node = this.neuralNet.addNode({
          concept: concept.term,
          description: concept.definition || `Concept from ${rawData.metadata.title}`,
          confidence: concept.confidence,
          connections: [],
          sources: [rawData.id],
          sourceCount: 1,
          curiosityLevel: 50,
          level: 'understanding',
          tags: [domain, ...concept.relatedTo.slice(0, 3)],
          domain,
        });

        // Create connections to related concepts
        for (const relatedTerm of concept.relatedTo) {
          const existingNode = this.neuralNet.getNode(relatedTerm);
          if (existingNode) {
            this.neuralNet.connect(
              concept.term,
              relatedTerm,
              'relates_to',
              40,
              [rawData.id]
            );
          }
        }
      }
    }

    // Save neural network
    this.neuralNet.save();
  }

  private detectDomain(title: string, content: string): string {
    const keywords: Record<string, string[]> = {
      'philosophy': ['philosophy', 'metaphysics', 'ethics', 'existence', 'consciousness', 'being'],
      'kabbalah': ['sefirot', 'kabbalah', 'kabbalistic', 'tree of life', 'emanation', 'divine'],
      'psychology': ['psychology', 'mind', 'behavior', 'cognitive', 'emotion', 'mental'],
      'physics': ['physics', 'quantum', 'energy', 'matter', 'force', 'particle'],
      'programming': ['code', 'function', 'algorithm', 'programming', 'software', 'development'],
      'spirituality': ['spiritual', 'soul', 'meditation', 'divine', 'sacred', 'mystical'],
    };

    const textToCheck = (title + ' ' + content.slice(0, 1000)).toLowerCase();

    for (const [domain, terms] of Object.entries(keywords)) {
      for (const term of terms) {
        if (textToCheck.includes(term)) {
          return domain;
        }
      }
    }

    return 'general';
  }

  // ------------------
  // UTILITIES
  // ------------------

  private generateRawId(filePath: string): string {
    const basename = path.basename(filePath, '.pdf');
    const hash = Date.now().toString(36);
    return `pdf-${basename.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${hash}`;
  }

  private saveRawData(rawData: RawData): void {
    const filePath = path.join(RAW_DATA_DIR, `${rawData.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(rawData, null, 2));
  }

  private generateSummary(rawData: RawData): string {
    const totalConcepts = rawData.chunks.reduce((sum, c) => sum + c.concepts.length, 0);
    return `Processed "${rawData.metadata.title}" (${rawData.metadata.pages} pages). ` +
           `Extracted ${totalConcepts} concepts across ${rawData.chunks.length} sections. ` +
           `Domain: ${this.detectDomain(rawData.metadata.title as string, '')}.`;
  }

  // ------------------
  // BATCH PROCESSING
  // ------------------

  async processDirectory(dirPath: string): Promise<PDFExtractionResult[]> {
    const results: PDFExtractionResult[] = [];
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.pdf'));

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      try {
        const result = await this.processPDF(filePath);
        results.push(result);
      } catch (error) {
        console.error(`[PDFProcessor] Failed to process ${file}:`, error);
      }
    }

    return results;
  }

  // ------------------
  // GETTERS
  // ------------------

  getRawData(rawId: string): RawData | null {
    const filePath = path.join(RAW_DATA_DIR, `${rawId}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return null;
  }

  getAllRawData(): RawData[] {
    const files = fs.readdirSync(RAW_DATA_DIR).filter(f => f.endsWith('.json'));
    return files.map(f => {
      const content = fs.readFileSync(path.join(RAW_DATA_DIR, f), 'utf-8');
      return JSON.parse(content);
    });
  }
}

// Singleton
let processorInstance: PDFProcessor | null = null;

export function getPDFProcessor(): PDFProcessor {
  if (!processorInstance) {
    processorInstance = new PDFProcessor();
  }
  return processorInstance;
}
