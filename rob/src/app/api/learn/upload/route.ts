// ============================================
// ROB - Learning API Routes
// PDF upload and processing
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getPDFProcessor } from '@/lib/learning/pdf-processor';
import { getRepositoryReader } from '@/lib/repo/repo-reader';
import { getNeuralNet } from '@/lib/brain/neural-net';
import { LearnResponse } from '@/lib/types';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR = '/home/z/my-project/rob/data/uploads';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// POST - Upload and process PDF
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'pdf' or 'repo'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Save uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(UPLOAD_DIR, file.name);
    fs.writeFileSync(filePath, buffer);

    console.log(`[Learn API] Uploaded: ${file.name}`);

    if (type === 'repo' || file.name.endsWith('.zip')) {
      // Handle repository (would need unzip logic)
      return NextResponse.json({
        message: 'Repository upload detected. Use /api/learn/repo endpoint for repositories.',
        filePath,
      });
    }

    // Process PDF
    const processor = getPDFProcessor();
    const result = await processor.processPDF(filePath, {
      title: file.name.replace('.pdf', ''),
    });

    const response: LearnResponse = {
      success: true,
      sourceId: result.rawId,
      conceptsExtracted: result.conceptsExtracted,
      gapsDetected: result.gapsDetected,
      processingTime: result.processingTime,
      summary: result.summary,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Learn API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload', details: String(error) },
      { status: 500 }
    );
  }
}

// GET - Get learning status
export async function GET() {
  const processor = getPDFProcessor();
  const repoReader = getRepositoryReader();
  const neuralNet = getNeuralNet();

  const rawData = processor.getAllRawData();
  const repos = repoReader.getAllRepos();
  const stats = neuralNet.getStats();

  return NextResponse.json({
    documents: {
      total: rawData.length,
      processing: rawData.filter(d => d.status === 'processing').length,
      completed: rawData.filter(d => d.status === 'completed').length,
      failed: rawData.filter(d => d.status === 'failed').length,
    },
    repositories: {
      total: repos.length,
      names: repos.map(r => r.info.name),
    },
    knowledge: stats,
  });
}
