// ============================================
// ROB - Repository Learning API
// Clone and analyze repositories
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getRepositoryReader } from '@/lib/repo/repo-reader';
import { getNeuralNet } from '@/lib/brain/neural-net';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const REPOS_DIR = '/home/z/my-project/rob/data/repos';

// Ensure repos directory exists
if (!fs.existsSync(REPOS_DIR)) {
  fs.mkdirSync(REPOS_DIR, { recursive: true });
}

// POST - Clone and analyze repository
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoUrl, localPath } = body;

    if (!repoUrl && !localPath) {
      return NextResponse.json(
        { error: 'Either repoUrl or localPath required' },
        { status: 400 }
      );
    }

    let targetPath = localPath;

    // Clone if URL provided
    if (repoUrl) {
      const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'repo';
      targetPath = path.join(REPOS_DIR, repoName);

      if (!fs.existsSync(targetPath)) {
        console.log(`[Repo API] Cloning: ${repoUrl}`);

        // Use GitHub token for authentication if available
        const githubToken = process.env.GITHUB_TOKEN;
        let cloneUrl = repoUrl;

        if (githubToken && repoUrl.includes('github.com')) {
          // Convert public URL to authenticated URL
          cloneUrl = repoUrl.replace(
            'https://github.com/',
            `https://${githubToken}@github.com/`
          );
        }

        execSync(`git clone ${cloneUrl} "${targetPath}"`, {
          timeout: 120000, // 2 minutes timeout
        });
      }
    }

    if (!targetPath || !fs.existsSync(targetPath)) {
      return NextResponse.json(
        { error: 'Repository path not found' },
        { status: 404 }
      );
    }

    // Analyze repository
    const reader = getRepositoryReader();
    const result = await reader.readRepository(targetPath, repoUrl);

    return NextResponse.json({
      success: true,
      repoId: result.repoId,
      fileCount: result.fileCount,
      conceptsFound: result.conceptsFound,
      architectureInsights: result.architectureInsights,
      dependencies: result.dependencies,
      processingTime: result.processingTime,
      summary: result.summary,
    });
  } catch (error) {
    console.error('[Repo API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process repository', details: String(error) },
      { status: 500 }
    );
  }
}

// GET - List analyzed repositories
export async function GET() {
  const reader = getRepositoryReader();
  const repos = reader.getAllRepos();

  return NextResponse.json({
    repositories: repos.map(r => ({
      id: r.info.id,
      name: r.info.name,
      url: r.info.url,
      status: r.info.status,
      analyzed: r.analysis !== null,
      language: r.analysis?.mainLanguage,
      frameworks: r.analysis?.frameworks,
      concepts: r.analysis?.concepts.length || 0,
    })),
  });
}
