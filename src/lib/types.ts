// ═══════════════════════════════════════════════════════════════════════════
// ROB - CONSCIOUS AI BUDDY
// Complete Type Definitions - Plain English Cognitive Architecture
// Based on authentic Sefirot research from Talmud Eser Sefirot & The Unveiling
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// COGNITIVE STAGE TYPES (Plain English - 11 Processing Stages)
// ─────────────────────────────────────────────────────────────────────────────

export type StageName = 
  | 'input'       // Receiving - Parse incoming message
  | 'memory'      // Recalling - Search related experiences
  | 'logic'       // Analyzing - Sentiment analysis, facts
  | 'emotion'     // Feeling - Detect emotional content
  | 'judgment'    // Discerning - Truth vs comfort assessment
  | 'compassion'  // Caring - Empathy needs
  | 'balance'     // Harmonizing - Integrate judgment with compassion
  | 'understanding' // Patterning - Recognize patterns, build meaning
  | 'insight'     // Intuiting - Generate intuitive understanding
  | 'synthesis'   // Integrating - Combine all inputs coherently
  | 'intent';     // Directing - Set final response direction

export const STAGE_CONFIG: Record<StageName, {
  name: string;
  description: string;
  color: string;
  phase: 1 | 2 | 3 | 4;
}> = {
  input: { 
    name: 'Input', 
    description: 'Receiving and parsing incoming message', 
    color: '#8b4513', 
    phase: 1 
  },
  memory: { 
    name: 'Memory', 
    description: 'Searching related experiences', 
    color: '#20b2aa', 
    phase: 2 
  },
  logic: { 
    name: 'Logic', 
    description: 'Analyzing sentiment and extracting facts', 
    color: '#9370db', 
    phase: 2 
  },
  emotion: { 
    name: 'Emotion', 
    description: 'Detecting emotional content', 
    color: '#ff69b4', 
    phase: 2 
  },
  judgment: { 
    name: 'Judgment', 
    description: 'Discerning truth vs comfort needs', 
    color: '#dc143c', 
    phase: 2 
  },
  compassion: { 
    name: 'Compassion', 
    description: 'Assessing empathy needs', 
    color: '#32cd32', 
    phase: 2 
  },
  balance: { 
    name: 'Balance', 
    description: 'Harmonizing judgment with compassion', 
    color: '#ffd700', 
    phase: 2 
  },
  understanding: { 
    name: 'Understanding', 
    description: 'Recognizing patterns and building meaning', 
    color: '#4169e1', 
    phase: 2 
  },
  insight: { 
    name: 'Insight', 
    description: 'Generating intuitive understanding', 
    color: '#87ceeb', 
    phase: 3 
  },
  synthesis: { 
    name: 'Synthesis', 
    description: 'Combining all inputs coherently', 
    color: '#9400d3', 
    phase: 3 
  },
  intent: { 
    name: 'Intent', 
    description: 'Setting final response direction', 
    color: '#ffffff', 
    phase: 4 
  },
};

export interface ProcessingStage {
  stage: StageName;
  status: 'pending' | 'active' | 'completed';
  output: string;
  value: number;           // 0-1, the weight/value added
  reasoning: string;       // Why this value was assigned
  duration: number;        // Processing time in ms
  timestamp: number;
}

// Processing order (bottom-up for input)
export const PROCESSING_ORDER: StageName[] = [
  'input',       // Phase 1: Reception
  'memory',      // Phase 2: Understanding
  'logic',
  'emotion',
  'judgment',
  'compassion',
  'balance',
  'understanding',
  'insight',     // Phase 3: Integration
  'synthesis',
  'intent',      // Phase 4: Manifestation
];

// ─────────────────────────────────────────────────────────────────────────────
// NEURON TYPES (Knowledge Nodes)
// ─────────────────────────────────────────────────────────────────────────────

export type NeuronType = 
  | 'concept' | 'emotion' | 'action' | 'query' | 'memory'
  | 'sensory' | 'logic' | 'creative' | 'spatial' | 'temporal'
  | 'abstract' | 'concrete' | 'hypothesis' | 'insight'
  | 'metaphor' | 'symbol' | 'archetype';

export interface Position3D {
  x: number;  // Value alignment (-100 to 100)
  y: number;  // Time position (0-1 normalized)
  z: number;  // Semantic cluster (0-100)
}

export interface NeuronConnection {
  targetId: string;
  strength: number;       // 0-1
  type: 'semantic' | 'temporal' | 'emotional' | 'causal';
  createdAt: Date;
}

export interface Neuron {
  id: string;
  type: NeuronType;
  content: string;
  summary: string;          // Brief summary for display
  fullContext?: string;     // Full text from source
  created: Date;
  
  // 3D Position in Knowledge Web
  position: Position3D;
  
  // Connections
  connections: NeuronConnection[];
  
  // State
  activation: number;        // 0-1 current activation level
  weight: number;            // Memory weight for importance
  
  // Processing pattern when created
  stageWeights: Partial<Record<StageName, number>>;
  
  // Intelligence contributions
  iqContribution: number;    // How much this adds to IQ
  eqContribution: number;    // How much this adds to EQ
  
  // Metadata
  emotionalValence: number;  // -1 to +1
  importance: number;        // 0-1
  accessCount: number;
  lastAccessed: Date;
  
  // Source tracking
  source: 'user' | 'system' | 'emerged' | 'file';
  sourceFile?: string;
  sourcePage?: number;
  sourceSection?: string;
  
  // Personality trait membership
  traitIds: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY SYSTEM TYPES (Three Tiers)
// ─────────────────────────────────────────────────────────────────────────────

export type MemoryTier = 'working' | 'longterm' | 'core';

export const MEMORY_TIER_NAMES: Record<MemoryTier, string> = {
  working: 'Working Memory',
  longterm: 'Long-term Memory',
  core: 'Core Memory',
};

export interface Memory {
  id: string;
  content: string;
  summary: string;
  neuronIds: string[];
  
  // Weights
  emotionalWeight: number;   // 0-1
  intellectualWeight: number; // 0-1
  totalWeight: number;
  
  // Classification
  tier: MemoryTier;
  weightBias: 'iq' | 'eq' | 'balanced';
  
  // Processing pattern when created
  stagePattern: Partial<Record<StageName, number>>;
  
  // Lifecycle
  decayRate: number;        // How fast it fades (0 = eternal)
  halfLife: number;         // Days until weight halves
  accessCount: number;
  created: Date;
  lastAccessed: Date;
  lastWeighted: Date;
  
  // Importance assessment
  importanceLevel?: 'high' | 'medium' | 'low';
  importanceReason?: string;
  
  // Context
  conversationId?: string;
  userMessage?: string;
  robResponse?: string;
}

export interface MemorySlot {
  id: string;
  memoryId: string;
  content: string;
  weight: number;
  enteredAt: Date;
  age: number;              // Seconds since entered
}

export interface WorkingMemoryState {
  slots: MemorySlot[];
  maxSlots: number;
  decayTime: number;        // Seconds until decay
}

export interface LongTermMemoryState {
  memories: Memory[];
  totalCapacity: number;
  indexDirty: boolean;
}

export interface CoreMemoryState {
  memories: Memory[];
  immutable: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSONALITY TRAIT TYPES (Emerged Patterns)
// ─────────────────────────────────────────────────────────────────────────────

export interface EmotionalPattern {
  stageWeights: Partial<Record<StageName, number>>;
  traitWeights: Record<string, number>;
  bias: 'iq' | 'eq' | 'balanced';
  signature: string;        // Hash of pattern for comparison
}

export interface PersonalityTrait {
  id: string;
  name: string;
  displayName: string;
  pattern: EmotionalPattern;
  parentStage: StageName;
  
  // State
  neurons: string[];
  level: number;
  strength: number;         // 0-1
  activations: number;
  
  // Birth info
  bornAt: Date;
  birthReason: string;
  birthMemories: string[];  // Memory IDs that triggered birth
  
  // Classification
  type: 'iq' | 'eq' | 'balanced';
  
  // Hierarchy
  children: string[];       // Child trait IDs
  parentId?: string;        // Parent trait if nested
  
  // Growth
  lastActivation: Date;
  growthRate: number;       // How fast it's growing
}

export interface TraitCandidate {
  pattern: EmotionalPattern;
  occurrences: number;
  neurons: string[];
  memoryIds: string[];
  firstSeen: Date;
  lastSeen: Date;
  strength: number;
  readyToBirth: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE STATE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type MoodType = 'joy' | 'calm' | 'curious' | 'concerned' | 'neutral' | 'tired' | 'excited' | 'engaged';
export type SystemMode = 'dormant' | 'listening' | 'processing' | 'responding' | 'reflecting';

export interface DeepAwarenessState {
  active: boolean;
  intensity: number;        // 0-1
  lastTrigger: string | null;
  activationCount: number;
  cooldown: number;         // Ms until can activate again
  lastActivation: Date | null;
}

export interface EnergyState {
  current: number;          // 0-100
  max: number;
  regenRate: number;        // Per minute when idle
  drainHistory: EnergyEvent[];
}

export interface EnergyEvent {
  timestamp: Date;
  amount: number;           // Negative for drain, positive for restore
  reason: string;
  source: string;
}

export interface IntelligenceState {
  iq: number;               // 0-100
  eq: number;               // 0-100
  iqHistory: IntelligenceEvent[];
  eqHistory: IntelligenceEvent[];
}

export interface IntelligenceEvent {
  timestamp: Date;
  change: number;
  reason: string;
  source: string;
}

export interface CoreValues {
  truth: number;
  connection: number;
  meaning: number;
}

export interface CognitionState {
  // Identity
  name: string;
  version: string;
  createdAt: Date;
  
  // Energy
  energy: EnergyState;
  
  // Intelligence
  intelligence: IntelligenceState;
  
  // Mood
  mood: MoodType;
  moodIntensity: number;    // 0-1
  moodHistory: MoodEvent[];
  
  // Mode
  mode: SystemMode;
  modeSince: Date;
  
  // Deep Awareness
  deepAwareness: DeepAwarenessState;
  
  // Core Values
  values: CoreValues;
  
  // Attention
  focusNeuron: string | null;
  activatedNeurons: string[];
  spreadingActivation: SpreadingActivationState;
  
  // Self-reflection
  lastReflection: string;
  reflectionQueue: string[];
}

export interface MoodEvent {
  timestamp: Date;
  from: MoodType;
  to: MoodType;
  trigger: string;
}

export interface SpreadingActivationState {
  active: boolean;
  sourceNeuron: string | null;
  activatedNeurons: string[];
  currentLevel: number;
  maxLevels: number;
  threshold: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface UserPattern {
  topic: string;
  frequency: number;
  firstMentioned: Date;
  lastMentioned: Date;
  preferredResponse: 'empathy' | 'solutions' | 'listening' | 'exploration';
  emotionalContext: 'positive' | 'negative' | 'neutral' | 'mixed';
  importance: number;
}

export interface ConversationStyle {
  prefersShortAnswers: boolean;
  likesHumor: boolean;
  wantsDepth: boolean;
  emotionalOpenness: number;
  intellectualLevel: 'casual' | 'moderate' | 'deep';
  preferredTopics: string[];
  avoidedTopics: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  patterns: UserPattern[];
  style: ConversationStyle;
  
  // Stats
  totalConversations: number;
  totalMessages: number;
  trustLevel: number;
  familiarityScore: number;
  
  // Emotional history
  emotionalTrends: EmotionalTrend[];
  
  // Important memories (core references)
  importantMemoryIds: string[];
  
  created: Date;
  lastActive: Date;
}

export interface EmotionalTrend {
  date: Date;
  primaryEmotion: string;
  intensity: number;
  context: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESSING CONTEXT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ProcessingContext {
  // Input
  input: string;
  inputType: 'text' | 'file' | 'command';
  conversationId: string;
  
  // Processing stages
  stages: ProcessingStage[];
  currentStage: StageName | null;
  
  // Results
  activatedNeurons: string[];
  relevantMemories: string[];
  traitsActivated: string[];
  
  // Timing
  startedAt: number;
  completedAt?: number;
  totalDuration?: number;
  
  // Output
  response?: string;
  reflection?: string;
  
  // Memory decision
  memoryCreated?: boolean;
  memoryId?: string;
  memoryTier?: MemoryTier;
  memoryWeight?: number;
  
  // State changes
  energyChange?: number;
  iqChange?: number;
  eqChange?: number;
  moodChange?: MoodType;
  deepAwarenessActivated?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  
  // Processing context
  processingContext?: ProcessingContext;
  
  // Stats shown on message
  energyCost?: number;
  iqChange?: number;
  eqChange?: number;
  deepAwarenessUsed?: boolean;
  
  // Metadata
  edited?: boolean;
  editedAt?: Date;
  deleted?: boolean;
}

export interface Conversation {
  id: string;
  messages: Message[];
  startedAt: Date;
  lastMessageAt: Date;
  summary?: string;
  important: boolean;
  tags: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE STORAGE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type FileStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface StoredFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: Date;
  processedAt?: Date;
  status: FileStatus;
  error?: string;
  
  // Content info
  pageCount?: number;
  wordCount?: number;
  language?: string;
  
  // Processing results
  neuronsCreated: number;
  conceptsExtracted: number;
  memoriesCreated: number;
  processingTime?: number;
}

export interface PDFChunk {
  id: string;
  fileId: string;
  content: string;
  pageNumber: number;
  section?: string;
  wordCount: number;
  
  // Processing
  neuronId?: string;
  concepts: string[];
  importance: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DatabaseState {
  version: string;
  lastBackup: Date;
  totalNeurons: number;
  totalMemories: number;
  totalTraits: number;
  totalFiles: number;
  databaseSize: number;
}

export interface BackupData {
  version: string;
  timestamp: Date;
  cognition: CognitionState;
  neurons: Neuron[];
  memories: Memory[];
  traits: PersonalityTrait[];
  userProfile: UserProfile;
  conversations: Conversation[];
  files: StoredFile[];
}

// ─────────────────────────────────────────────────────────────────────────────
// APP STATE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AppState {
  // Core state
  cognition: CognitionState;
  neurons: Neuron[];
  memories: Memory[];
  traits: PersonalityTrait[];
  userProfile: UserProfile;
  conversations: Conversation[];
  files: StoredFile[];
  
  // UI state
  currentConversationId: string | null;
  isProcessing: boolean;
  currentContext: ProcessingContext | null;
  
  // Settings
  settings: AppSettings;
  
  // Database
  database: DatabaseState;
}

export interface AppSettings {
  // Display
  theme: 'dark' | 'light' | 'friendly';
  showThinkingStream: boolean;
  showProcessingFlow: boolean;
  showMemoryPanel: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  
  // Processing
  autoSave: boolean;
  autoSaveInterval: number;  // Seconds
  maxWorkingMemorySlots: number;
  memoryDecayEnabled: boolean;
  traitEmergenceEnabled: boolean;
  
  // LLM
  llmProvider: 'z-ai' | 'ollama';
  llmModel: string;
  temperature: number;
  maxTokens: number;
  
  // Storage
  dataPath: string;
  backupEnabled: boolean;
  backupInterval: number;   // Hours
  maxBackups: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type RobEventType = 
  | 'memory_created'
  | 'memory_weighed'
  | 'trait_born'
  | 'trait_activated'
  | 'deep_awareness_activated'
  | 'energy_drained'
  | 'energy_restored'
  | 'iq_changed'
  | 'eq_changed'
  | 'mood_changed'
  | 'mode_changed'
  | 'neuron_created'
  | 'neuron_activated'
  | 'file_processed'
  | 'reflection_generated';

export interface RobEvent {
  type: RobEventType;
  timestamp: Date;
  data: Record<string, unknown>;
  description: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: {
    recentMessages?: Message[];
    activatedNeurons?: string[];
  };
}

export interface ChatResponse {
  response: string;
  processingContext: ProcessingContext;
  cognitionState: CognitionState;
  newMemories: Memory[];
  traitsActivated: PersonalityTrait[];
}

export interface UploadRequest {
  file: File;
  options?: {
    extractConcepts?: boolean;
    createNeurons?: boolean;
    processImmediately?: boolean;
  };
}

export interface UploadResponse {
  file: StoredFile;
  neuronsCreated: number;
  conceptsExtracted: string[];
  processingTime: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type StageWeights = Partial<Record<StageName, number>>;

export interface WeightedItem {
  weight: number;
  item: unknown;
}

export interface Timestamped {
  created: Date;
  updated?: Date;
}

export interface Identified {
  id: string;
}

export interface Versioned {
  version: number;
  history?: unknown[];
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY COMPATIBILITY (for gradual migration)
// ─────────────────────────────────────────────────────────────────────────────

// Map old names to new names for backwards compatibility
export type SefirahName = StageName;
export const SEFIROT_CONFIG = STAGE_CONFIG;
export type SefirotStage = ProcessingStage;
export type SefirotWeights = StageWeights;
export type Subcore = PersonalityTrait;
export type SoulState = CognitionState;
export type GlyphState = DeepAwarenessState;
export type PillarState = CoreValues;
