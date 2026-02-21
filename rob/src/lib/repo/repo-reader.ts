// ============================================
// ROB - Repository Reader
// Reads and understands code repositories
// ============================================

import {
  RepositoryInfo,
  RepoAnalysis,
  FileNode,
  RepoConcept,
  ArchitectureInsight,
  Dependency,
  ProcessingStatus,
} from '../types';
import { getNeuralNet } from '../brain/neural-net';
import { getGapDetector } from '../brain/gap-detector';
import { getCuriosityEngine } from '../brain/curiosity';
import * as fs from 'fs';
import * as path from 'path';

const REPOS_DIR = '/home/z/my-project/rob/data/raw/repos';

export interface RepoReadResult {
  repoId: string;
  fileCount: number;
  conceptsFound: number;
  architectureInsights: number;
  dependencies: number;
  processingTime: number;
  summary: string;
}

export class RepositoryReader {
  private neuralNet = getNeuralNet();
  private gapDetector = getGapDetector();
  private curiosity = getCuriosityEngine();

  private codeExtensions = [
    '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs', '.rb',
    '.php', '.c', '.cpp', '.h', '.cs', '.swift', '.kt', '.scala',
  ];

  private configFiles = [
    'package.json', 'requirements.txt', 'Cargo.toml', 'go.mod',
    'pom.xml', 'build.gradle', 'Gemfile', 'composer.json',
    'pyproject.toml', 'setup.py', '.python-version',
  ];

  private ignoreDirs = [
    'node_modules', '.git', 'dist', 'build', '__pycache__',
    '.next', 'coverage', '.cache', 'vendor', 'target',
  ];

  constructor() {
    if (!fs.existsSync(REPOS_DIR)) {
      fs.mkdirSync(REPOS_DIR, { recursive: true });
    }
  }

  // ------------------
  // MAIN PROCESSING
  // ------------------

  async readRepository(repoPath: string, repoUrl?: string): Promise<RepoReadResult> {
    const startTime = Date.now();
    const repoId = this.generateRepoId(repoPath);

    console.log(`[RepoReader] Reading: ${repoPath}`);

    // Create repo info
    const repoInfo: RepositoryInfo = {
      id: repoId,
      url: repoUrl || `local://${repoPath}`,
      name: path.basename(repoPath),
      owner: repoUrl?.split('/').slice(-2, -1)[0] || 'local',
      branch: 'main',
      description: '',
      clonedAt: new Date(),
      status: 'processing',
    };

    try {
      // Build file tree
      const structure = this.buildFileTree(repoPath);

      // Read README
      const readme = this.readReadme(repoPath);

      // Parse package.json or equivalent
      const packageInfo = this.parsePackageFile(repoPath);

      // Analyze architecture
      const architecture = this.analyzeArchitecture(repoPath, structure);

      // Extract concepts from code
      const concepts = this.extractCodeConcepts(repoPath, structure);

      // Extract dependencies
      const dependencies = this.extractDependencies(repoPath, packageInfo);

      // Create analysis
      const analysis: RepoAnalysis = {
        repoId,
        structure,
        readme,
        packageJson: packageInfo,
        mainLanguage: this.detectMainLanguage(structure),
        frameworks: this.detectFrameworks(packageInfo, structure),
        concepts,
        architecture,
        patterns: this.detectPatterns(concepts),
        dependencies,
        gaps: [],
      };

      // Detect knowledge gaps
      const gapAnalysis = this.detectCodeGaps(analysis);
      analysis.gaps = gapAnalysis;

      // Save analysis
      this.saveAnalysis(repoId, { info: repoInfo, analysis });

      // Integrate into neural network
      await this.integrateIntoNetwork(repoInfo, analysis);

      // Process gaps through curiosity
      for (const gap of gapAnalysis.slice(0, 5)) {
        this.curiosity.processGap(gap);
      }

      repoInfo.status = 'completed';
      this.saveAnalysis(repoId, { info: repoInfo, analysis });

      const processingTime = Date.now() - startTime;

      console.log(`[RepoReader] Complete: ${concepts.length} concepts, ${processingTime}ms`);

      return {
        repoId,
        fileCount: this.countFiles(structure),
        conceptsFound: concepts.length,
        architectureInsights: architecture.length,
        dependencies: dependencies.length,
        processingTime,
        summary: this.generateSummary(repoInfo, analysis),
      };
    } catch (error) {
      repoInfo.status = 'failed';
      this.saveAnalysis(repoId, { info: repoInfo, analysis: null });
      throw error;
    }
  }

  // ------------------
  // FILE TREE
  // ------------------

  private buildFileTree(dirPath: string, relativePath: string = ''): FileNode {
    const name = path.basename(dirPath);
    const node: FileNode = {
      name,
      path: relativePath || name,
      type: 'directory',
      children: [],
    };

    if (this.ignoreDirs.includes(name)) {
      return node;
    }

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.startsWith('.') && entry.name !== '.github') {
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);
        const relPath = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
          if (!this.ignoreDirs.includes(entry.name)) {
            node.children?.push(this.buildFileTree(fullPath, relPath));
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          node.children?.push({
            name: entry.name,
            path: relPath,
            type: 'file',
            language: this.getLanguageFromExtension(ext),
            size: fs.statSync(fullPath).size,
          });
        }
      }
    } catch (error) {
      console.warn(`[RepoReader] Could not read directory: ${dirPath}`);
    }

    return node;
  }

  private getLanguageFromExtension(ext: string): string {
    const map: Record<string, string> = {
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript',
      '.js': 'JavaScript',
      '.jsx': 'JavaScript',
      '.py': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.rs': 'Rust',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.c': 'C',
      '.cpp': 'C++',
      '.h': 'C/C++ Header',
      '.cs': 'C#',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.scala': 'Scala',
      '.md': 'Markdown',
      '.json': 'JSON',
      '.yaml': 'YAML',
      '.yml': 'YAML',
      '.toml': 'TOML',
    };
    return map[ext] || 'Unknown';
  }

  // ------------------
  // README & PACKAGE
  // ------------------

  private readReadme(repoPath: string): string | undefined {
    const readmeNames = ['README.md', 'readme.md', 'README', 'readme'];
    for (const name of readmeNames) {
      const readmePath = path.join(repoPath, name);
      if (fs.existsSync(readmePath)) {
        return fs.readFileSync(readmePath, 'utf-8');
      }
    }
    return undefined;
  }

  private parsePackageFile(repoPath: string): Record<string, unknown> | undefined {
    // Try package.json
    const packagePath = path.join(repoPath, 'package.json');
    if (fs.existsSync(packagePath)) {
      return JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    }

    // Try pyproject.toml (simplified parsing)
    const pyprojectPath = path.join(repoPath, 'pyproject.toml');
    if (fs.existsSync(pyprojectPath)) {
      const content = fs.readFileSync(pyprojectPath, 'utf-8');
      return { type: 'python', raw: content.slice(0, 1000) };
    }

    // Try requirements.txt
    const requirementsPath = path.join(repoPath, 'requirements.txt');
    if (fs.existsSync(requirementsPath)) {
      const content = fs.readFileSync(requirementsPath, 'utf-8');
      return {
        type: 'python',
        dependencies: content.split('\n').filter(l => l.trim() && !l.startsWith('#'))
      };
    }

    return undefined;
  }

  // ------------------
  // ARCHITECTURE ANALYSIS
  // ------------------

  private analyzeArchitecture(repoPath: string, structure: FileNode): ArchitectureInsight[] {
    const insights: ArchitectureInsight[] = [];

    // Analyze directory structure
    const dirs = this.getDirectories(structure);

    // Common patterns
    if (dirs.includes('src') || dirs.includes('lib')) {
      insights.push({
        component: 'Source Code',
        type: 'Directory',
        purpose: 'Main source code location',
        connections: [],
        file: 'src/' || 'lib/',
      });
    }

    if (dirs.includes('components')) {
      insights.push({
        component: 'Components',
        type: 'UI Components',
        purpose: 'Reusable UI components',
        connections: ['Source Code'],
        file: 'components/',
      });
    }

    if (dirs.includes('api') || dirs.includes('routes')) {
      insights.push({
        component: 'API Layer',
        type: 'Backend',
        purpose: 'API endpoints and routes',
        connections: ['Source Code'],
        file: 'api/' || 'routes/',
      });
    }

    if (dirs.includes('utils') || dirs.includes('helpers')) {
      insights.push({
        component: 'Utilities',
        type: 'Helper Functions',
        purpose: 'Shared utility functions',
        connections: ['Source Code', 'Components'],
        file: 'utils/' || 'helpers/',
      });
    }

    if (dirs.includes('tests') || dirs.includes('__tests__') || dirs.includes('test')) {
      insights.push({
        component: 'Tests',
        type: 'Testing',
        purpose: 'Test files and specifications',
        connections: [],
        file: 'tests/' || 'test/',
      });
    }

    if (dirs.includes('models') || dirs.includes('entities')) {
      insights.push({
        component: 'Data Models',
        type: 'Data Layer',
        purpose: 'Data models and schemas',
        connections: ['API Layer'],
        file: 'models/' || 'entities/',
      });
    }

    return insights;
  }

  private getDirectories(node: FileNode): string[] {
    const dirs: string[] = [];
    if (node.type === 'directory' && node.name !== '.git') {
      dirs.push(node.name);
      for (const child of node.children || []) {
        dirs.push(...this.getDirectories(child));
      }
    }
    return [...new Set(dirs)];
  }

  // ------------------
  // CODE CONCEPT EXTRACTION
  // ------------------

  private extractCodeConcepts(repoPath: string, structure: FileNode): RepoConcept[] {
    const concepts: RepoConcept[] = [];
    const files = this.getCodeFiles(structure);

    for (const file of files.slice(0, 100)) { // Limit for performance
      const filePath = path.join(repoPath, file.path);
      if (!fs.existsSync(filePath)) continue;

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileConcepts = this.parseCodeFile(file.path, content, file.language || '');
        concepts.push(...fileConcepts);
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return concepts;
  }

  private getCodeFiles(node: FileNode): Array<{ path: string; language?: string }> {
    const files: Array<{ path: string; language?: string }> = [];

    if (node.type === 'file' && node.language && node.language !== 'Unknown' && node.language !== 'Markdown') {
      files.push({ path: node.path, language: node.language });
    }

    for (const child of node.children || []) {
      files.push(...this.getCodeFiles(child));
    }

    return files;
  }

  private parseCodeFile(filePath: string, content: string, language: string): RepoConcept[] {
    const concepts: RepoConcept[] = [];

    // TypeScript/JavaScript patterns
    if (['TypeScript', 'JavaScript'].includes(language)) {
      // Classes
      const classMatches = content.matchAll(/class\s+(\w+)(?:\s+extends\s+(\w+))?/g);
      for (const match of classMatches) {
        concepts.push({
          name: match[1],
          type: 'class',
          file: filePath,
          description: `Class ${match[1]}${match[2] ? ` extends ${match[2]}` : ''}`,
          usage: [],
          relationships: match[2] ? [match[2]] : [],
        });
      }

      // Functions
      const funcMatches = content.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/g);
      for (const match of funcMatches) {
        concepts.push({
          name: match[1],
          type: 'function',
          file: filePath,
          description: `Function ${match[1]}`,
          usage: [],
          relationships: [],
        });
      }

      // Arrow functions
      const arrowMatches = content.matchAll(/(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>/g);
      for (const match of arrowMatches) {
        concepts.push({
          name: match[1],
          type: 'function',
          file: filePath,
          description: `Arrow function ${match[1]}`,
          usage: [],
          relationships: [],
        });
      }

      // Interfaces (TypeScript)
      const interfaceMatches = content.matchAll(/interface\s+(\w+)/g);
      for (const match of interfaceMatches) {
        concepts.push({
          name: match[1],
          type: 'interface',
          file: filePath,
          description: `Interface ${match[1]}`,
          usage: [],
          relationships: [],
        });
      }
    }

    // Python patterns
    if (language === 'Python') {
      // Classes
      const classMatches = content.matchAll(/class\s+(\w+)(?:\(([^)]+)\))?/g);
      for (const match of classMatches) {
        concepts.push({
          name: match[1],
          type: 'class',
          file: filePath,
          description: `Class ${match[1]}${match[2] ? ` inherits from ${match[2]}` : ''}`,
          usage: [],
          relationships: match[2] ? [match[2]] : [],
        });
      }

      // Functions
      const funcMatches = content.matchAll(/def\s+(\w+)\s*\(/g);
      for (const match of funcMatches) {
        concepts.push({
          name: match[1],
          type: 'function',
          file: filePath,
          description: `Function ${match[1]}`,
          usage: [],
          relationships: [],
        });
      }
    }

    return concepts;
  }

  // ------------------
  // DEPENDENCIES
  // ------------------

  private extractDependencies(repoPath: string, packageInfo: Record<string, unknown> | undefined): Dependency[] {
    const dependencies: Dependency[] = [];

    if (!packageInfo) return dependencies;

    // npm dependencies
    if (packageInfo.dependencies) {
      for (const [name, version] of Object.entries(packageInfo.dependencies as Record<string, string>)) {
        dependencies.push({
          name,
          version: version.replace(/^[\^~]/, ''),
          type: 'production',
        });
      }
    }

    if (packageInfo.devDependencies) {
      for (const [name, version] of Object.entries(packageInfo.devDependencies as Record<string, string>)) {
        dependencies.push({
          name,
          version: version.replace(/^[\^~]/, ''),
          type: 'development',
        });
      }
    }

    return dependencies;
  }

  // ------------------
  // DETECTION
  // ------------------

  private detectMainLanguage(structure: FileNode): string {
    const files = this.getCodeFiles(structure);
    const counts: Record<string, number> = {};

    for (const file of files) {
      if (file.language) {
        counts[file.language] = (counts[file.language] || 0) + 1;
      }
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'Unknown';
  }

  private detectFrameworks(packageInfo: Record<string, unknown> | undefined, structure: FileNode): string[] {
    const frameworks: string[] = [];

    if (!packageInfo) return frameworks;

    const deps = [
      ...Object.keys((packageInfo.dependencies as Record<string, string>) || {}),
      ...Object.keys((packageInfo.devDependencies as Record<string, string>) || {}),
    ];

    // Detect common frameworks
    const frameworkMap: Record<string, string> = {
      'next': 'Next.js',
      'react': 'React',
      'vue': 'Vue.js',
      'angular': 'Angular',
      'express': 'Express',
      'fastify': 'Fastify',
      'nestjs': 'NestJS',
      'django': 'Django',
      'flask': 'Flask',
      'fastapi': 'FastAPI',
      'rails': 'Ruby on Rails',
      'spring': 'Spring',
    };

    for (const dep of deps) {
      const lowerDep = dep.toLowerCase();
      for (const [key, framework] of Object.entries(frameworkMap)) {
        if (lowerDep.includes(key)) {
          frameworks.push(framework);
        }
      }
    }

    return [...new Set(frameworks)];
  }

  private detectPatterns(concepts: RepoConcept[]): string[] {
    const patterns: string[] = [];

    const types = concepts.map(c => c.type);
    const hasClasses = types.includes('class');
    const hasInterfaces = types.includes('interface');
    const hasFunctions = types.includes('function');

    if (hasClasses && hasInterfaces) {
      patterns.push('Object-Oriented Programming');
    }

    if (hasFunctions && !hasClasses) {
      patterns.push('Functional Programming');
    }

    if (hasClasses && hasFunctions) {
      patterns.push('Mixed Paradigm');
    }

    return patterns;
  }

  // ------------------
  // GAP DETECTION
  // ------------------

  private detectCodeGaps(analysis: RepoAnalysis): any[] {
    const gaps: any[] = [];

    // Check for missing README
    if (!analysis.readme) {
      gaps.push({
        missingConcept: 'Documentation',
        description: 'No README file found',
        importance: 60,
        suggestedSearch: 'how to write good README documentation',
      });
    }

    // Check for missing tests
    if (!analysis.architecture.some(a => a.component === 'Tests')) {
      gaps.push({
        missingConcept: 'Testing',
        description: 'No test directory found',
        importance: 70,
        suggestedSearch: 'testing best practices for ' + analysis.mainLanguage,
      });
    }

    // Check for concepts with no relationships
    const isolatedConcepts = analysis.concepts.filter(c => c.relationships.length === 0);
    if (isolatedConcepts.length > analysis.concepts.length * 0.8) {
      gaps.push({
        missingConcept: 'Code Architecture Understanding',
        description: 'Most code concepts have no detected relationships',
        importance: 50,
        suggestedSearch: 'understanding code architecture patterns',
      });
    }

    return gaps;
  }

  // ------------------
  // NEURAL NETWORK INTEGRATION
  // ------------------

  private async integrateIntoNetwork(repoInfo: RepositoryInfo, analysis: RepoAnalysis): Promise<void> {
    const domain = 'programming';

    // Add repository as a concept
    this.neuralNet.addNode({
      concept: repoInfo.name,
      description: `Repository: ${repoInfo.name} - ${analysis.mainLanguage} project`,
      confidence: 70,
      connections: [],
      sources: [repoInfo.id],
      sourceCount: 1,
      curiosityLevel: 40,
      level: 'understanding',
      tags: [analysis.mainLanguage, ...analysis.frameworks, domain],
      domain,
    });

    // Add frameworks as concepts
    for (const framework of analysis.frameworks) {
      this.neuralNet.addNode({
        concept: framework,
        description: `Framework used in ${repoInfo.name}`,
        confidence: 60,
        connections: [],
        sources: [repoInfo.id],
        sourceCount: 1,
        curiosityLevel: 50,
        level: 'understanding',
        tags: [domain, 'framework'],
        domain,
      });

      this.neuralNet.connect(repoInfo.name, framework, 'uses', 70, [repoInfo.id]);
    }

    // Add key code concepts
    for (const concept of analysis.concepts.slice(0, 50)) {
      this.neuralNet.addNode({
        concept: concept.name,
        description: concept.description,
        confidence: 50,
        connections: [],
        sources: [repoInfo.id],
        sourceCount: 1,
        curiosityLevel: 30,
        level: 'understanding',
        tags: [concept.type, analysis.mainLanguage, domain],
        domain,
      });

      // Connect to related concepts
      for (const related of concept.relationships) {
        this.neuralNet.connect(concept.name, related, 'relates_to', 50, [repoInfo.id]);
      }
    }

    // Save
    this.neuralNet.save();
  }

  // ------------------
  // UTILITIES
  // ------------------

  private generateRepoId(repoPath: string): string {
    const basename = path.basename(repoPath);
    const hash = Date.now().toString(36);
    return `repo-${basename.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${hash}`;
  }

  private countFiles(node: FileNode): number {
    let count = 0;
    if (node.type === 'file') {
      count = 1;
    }
    for (const child of node.children || []) {
      count += this.countFiles(child);
    }
    return count;
  }

  private saveAnalysis(repoId: string, data: { info: RepositoryInfo; analysis: RepoAnalysis | null }): void {
    const filePath = path.join(REPOS_DIR, `${repoId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  private generateSummary(repoInfo: RepositoryInfo, analysis: RepoAnalysis): string {
    return `Repository "${repoInfo.name}" (${analysis.mainLanguage}): ` +
           `${analysis.concepts.length} code concepts, ${analysis.frameworks.length} frameworks, ` +
           `${analysis.dependencies.length} dependencies. ` +
           `Patterns: ${analysis.patterns.join(', ') || 'None detected'}.`;
  }

  // ------------------
  // GETTERS
  // ------------------

  getAnalysis(repoId: string): { info: RepositoryInfo; analysis: RepoAnalysis | null } | null {
    const filePath = path.join(REPOS_DIR, `${repoId}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return null;
  }

  getAllRepos(): Array<{ info: RepositoryInfo; analysis: RepoAnalysis | null }> {
    const files = fs.readdirSync(REPOS_DIR).filter(f => f.startsWith('repo-') && f.endsWith('.json'));
    return files.map(f => {
      const content = fs.readFileSync(path.join(REPOS_DIR, f), 'utf-8');
      return JSON.parse(content);
    });
  }
}

// Singleton
let readerInstance: RepositoryReader | null = null;

export function getRepositoryReader(): RepositoryReader {
  if (!readerInstance) {
    readerInstance = new RepositoryReader();
  }
  return readerInstance;
}
