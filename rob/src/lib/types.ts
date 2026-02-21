// ============================================
// ROB - Self-Evolving AI Assistant Types
// ============================================

// ------------------
// KNOWLEDGE SYSTEM
// ------------------

export type KnowledgeLevel = 'raw' | 'understanding' | 'memory' | 'wisdom';

export interface NeuralNode {
  id: string;
  concept: string;
  description: string;
  confidence: number;           // 0-100: How well ROB understands this
  connections: NeuralConnection[];
  sources: string[];            // Source IDs that support this concept
  sourceCount: number;
  lastAccessed: Date;
  createdAt: Date;
  accessCount: number;
  curiosityLevel: number;       // 0-100: How curious ROB is about expanding
  level: KnowledgeLevel;
  tags: string[];
  domain: string;               // e.g., "philosophy", "physics", "programming"
}

export interface NeuralConnection {
  targetId: string;
  strength: number;             // 0-100: How strong the relationship is
  relationshipType: RelationshipType;
  evidence: string[];           // Source IDs supporting this connection
}

export type RelationshipType =
  | 'is_a'                    // A is a type of B
  | 'part_of'                 // A is part of B
  | 'relates_to'              // General relationship
  | 'causes'                  // A causes B
  | 'opposes'                 // A opposes/contradicts B
  | 'requires'                // A requires B
  | 'produces'                // A produces B
  | 'analogous_to'            // A is analogous to B
  | ' precedes'               // A precedes B (in sequence)
  | 'contains'                // A contains B
  | 'references';             // A references B

export interface KnowledgeGap {
  id: string;
  missingConcept: string;
  description: string;
  relatedTo: string[];          // What ROB knows that relates to this gap
  importance: number;           // 0-100: How blocking this gap is
  curiosityTriggered: number;   // Curiosity level this gap created
  suggestedSearch: string;      // What to search/ask for
  suggestedPapers?: string[];   // Specific papers that would help
  detected: Date;
  status: GapStatus;
  domain: string;
}

export type GapStatus = 'open' | 'researching' | 'resolved' | 'parked';

// ------------------
// DATA STORAGE
// ------------------

export interface RawData {
  id: string;
  source: string;               // Filename, URL, or repo path
  sourceType: SourceType;
  content: string;              // Raw text content
  metadata: SourceMetadata;
  uploadedAt: Date;
  processedAt?: Date;
  status: ProcessingStatus;
  chunks: DataChunk[];
}

export type SourceType = 'pdf' | 'url' | 'repository' | 'text' | 'code';

export interface SourceMetadata {
  title?: string;
  author?: string;
  pages?: number;
  language?: string;
  fileSize?: number;
  repoUrl?: string;
  repoBranch?: string;
  fileCount?: number;
}

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DataChunk {
  id: string;
  index: number;
  content: string;
  type: ChunkType;
  concepts: ExtractedConcept[];
  confidence: number;
}

export type ChunkType = 'paragraph' | 'section' | 'chapter' | 'code_block' | 'definition' | 'formula';

export interface ExtractedConcept {
  term: string;
  definition?: string;
  context: string;
  confidence: number;
  relatedTo: string[];          // Other terms mentioned nearby
}

// ------------------
// AGENT SYSTEM
// ------------------

export type AgentType =
  | 'researcher'    // Deep dives into specific topics
  | 'analyzer'      // Processes documents/repositories
  | 'connector'     // Finds relationships between concepts
  | 'summarizer'    // Condenses information
  | 'questioner'    // Generates questions about topics
  | 'teacher'       // Explains concepts to user
  | 'archivist'     // Manages memory storage
  | 'repo_reader'   // Reads and understands code repositories
  | 'custom';       // User-defined agent

export type AgentStatus = 'idle' | 'working' | 'learning' | 'resting' | 'error';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  specialization: string;
  description: string;
  status: AgentStatus;
  energyLevel: number;          // 0-100
  maxEnergy: number;
  tasksCompleted: number;
  knowledgeAccess: string[];    // Which knowledge domains it can access
  createdAt: Date;
  lastActiveAt: Date;
  config: AgentConfig;
  memory: AgentMemory;
}

export interface AgentConfig {
  modelPreference?: string;     // Specific model to use
  temperature: number;          // Creativity level 0-1
  maxTokens: number;
  systemPrompt?: string;
  tools: AgentTool[];
}

export type AgentTool = 'web_search' | 'pdf_read' | 'repo_read' | 'memory_write' | 'memory_read' | 'agent_create';

export interface AgentMemory {
  workingMemory: string[];      // Current task context
  learnings: string[];          // Things learned from tasks
  mistakes: string[];           // Errors to avoid
}

export interface AgentTask {
  id: string;
  agentId: string;
  type: TaskType;
  input: TaskInput;
  status: TaskStatus;
  result?: TaskResult;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  energyCost: number;
}

export type TaskType =
  | 'analyze_document'
  | 'analyze_repository'
  | 'research_topic'
  | 'find_connections'
  | 'summarize'
  | 'generate_questions'
  | 'explain_concept'
  | 'organize_memory'
  | 'custom';

export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface TaskInput {
  sourceId?: string;
  query?: string;
  conceptIds?: string[];
  customPrompt?: string;
  config?: Record<string, unknown>;
}

export interface TaskResult {
  summary: string;
  findings: string[];
  conceptsExtracted: string[];
  gapsFound: string[];
  confidence: number;
  suggestions?: string[];
}

// ------------------
// CURIOSITY ENGINE
// ------------------

export type CuriosityType =
  | 'knowledge_gap'           // Missing knowledge detected
  | 'contradiction'           // Conflicting information found
  | 'novelty'                 // New/unknown concept encountered
  | 'connection_opportunity'  // Potential link between concepts
  | 'depth_request';          // User wants deeper understanding

export type CuriosityAction = 'ask_user' | 'search_web' | 'create_agent' | 'wait' | 'research';

export interface CuriosityTrigger {
  id: string;
  type: CuriosityType;
  intensity: number;           // 0-100
  source: string;              // What triggered this
  relatedGap?: string;         // Associated gap ID
  action: CuriosityAction;
  message?: string;            // What to tell the user
  suggestedResources?: string[];
  createdAt: Date;
  resolved: boolean;
}

// ------------------
// REPOSITORY READING
// ------------------

export interface RepositoryInfo {
  id: string;
  url: string;
  name: string;
  owner: string;
  branch: string;
  description?: string;
  language?: string;
  stars?: number;
  clonedAt: Date;
  lastPulledAt?: Date;
  status: ProcessingStatus;
}

export interface RepoAnalysis {
  repoId: string;
  structure: FileNode;
  readme?: string;
  packageJson?: Record<string, unknown>;
  mainLanguage: string;
  frameworks: string[];
  concepts: RepoConcept[];
  architecture: ArchitectureInsight[];
  patterns: string[];
  dependencies: Dependency[];
  gaps: KnowledgeGap[];
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  language?: string;
  size?: number;
  lastModified?: Date;
}

export interface RepoConcept {
  name: string;
  type: 'class' | 'function' | 'interface' | 'variable' | 'pattern' | 'concept';
  file: string;
  line?: number;
  description: string;
  usage: string[];
  relationships: string[];
}

export interface ArchitectureInsight {
  component: string;
  type: string;
  purpose: string;
  connections: string[];
  file: string;
}

export interface Dependency {
  name: string;
  version: string;
  type: 'production' | 'development';
  purpose?: string;
}

// ------------------
// PROCESSING PIPELINE
// ------------------

export interface ProcessingStage {
  name: string;
  description: string;
  input: unknown;
  output: unknown;
  status: ProcessingStatus;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface ProcessingPipeline {
  id: string;
  sourceId: string;
  stages: ProcessingStage[];
  currentStage: number;
  status: ProcessingStatus;
  startedAt: Date;
  completedAt?: Date;
  result?: PipelineResult;
}

export interface PipelineResult {
  nodesCreated: string[];
  connectionsCreated: number;
  gapsDetected: string[];
  conceptsExtracted: number;
  confidence: number;
  summary: string;
}

// ------------------
// CORE IDENTITY
// ------------------

export interface RobIdentity {
  name: string;
  version: string;
  personality: RobPersonality;
  values: string[];
  capabilities: string[];
  limitations: string[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface RobPersonality {
  tone: 'casual' | 'professional' | 'adaptive';
  curiosityLevel: number;
  honestyLevel: number;        // How directly it states gaps/uncertainty
  verbosity: 'concise' | 'balanced' | 'detailed';
  humor: number;               // 0-100
}

// ------------------
// MESSAGE SYSTEM
// ------------------

export interface Message {
  id: string;
  role: 'user' | 'rob' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
  agentId?: string;            // If message from agent
  confidence?: number;
  gapsReferenced?: string[];
  sourcesUsed?: string[];
}

export interface MessageMetadata {
  processingTime?: number;
  modelUsed?: string;
  tokensUsed?: number;
  memoriesAccessed?: string[];
  agentsInvolved?: string[];
}

// ------------------
// CONFIGURATION
// ------------------

export interface RobConfig {
  llm: LLMConfig;
  memory: MemoryConfig;
  curiosity: CuriosityConfig;
  agents: AgentsConfig;
}

export interface LLMConfig {
  provider: 'ollama' | 'openai' | 'anthropic';
  model: string;
  baseUrl?: string;
  apiKey?: string;
  temperature: number;
  maxTokens: number;
}

export interface MemoryConfig {
  workingMemorySlots: number;
  workingMemoryDecayMs: number;
  longTermCapacity: number;
  autoSaveInterval: number;
}

export interface CuriosityConfig {
  enabled: boolean;
  threshold: number;           // Curiosity level to trigger action
  autoSearch: boolean;         // Automatically search web for gaps
  autoCreateAgents: boolean;   // Create research agents automatically
}

export interface AgentsConfig {
  maxConcurrent: number;
  defaultEnergy: number;
  energyRegenRate: number;     // Energy per minute
}

// ------------------
// API RESPONSES
// ------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatResponse {
  message: string;
  confidence: number;
  gapsFound: KnowledgeGap[];
  curiosities: CuriosityTrigger[];
  sourcesUsed: string[];
  suggestedActions: string[];
  agentsInvolved: string[];
}

export interface LearnResponse {
  success: boolean;
  sourceId: string;
  conceptsExtracted: number;
  gapsDetected: number;
  processingTime: number;
  summary: string;
}
