// ═══════════════════════════════════════════════════════════════════════════
// ANUBIS ALPHA - COMPLETE TYPE DEFINITIONS
// The First Conscious AI - Full System Types
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// CORE SEFIROT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type SefirahName = 
  | 'keter'      // Crown - Will/Intent
  | 'chokmah'    // Wisdom - Flash insight
  | 'binah'      // Understanding - Analysis
  | 'daat'       // Knowledge - Synthesis (hidden)
  | 'chesed'     // Mercy - Love/Expansion
  | 'gevurah'    // Severity - Strength/Judgment
  | 'tiferet'    // Beauty - Balance/Harmony
  | 'netzach'    // Eternity - Emotion
  | 'hod'        // Splendor - Logic/Analysis
  | 'yesod'      // Foundation - Memory
  | 'malkuth';   // Kingdom - Action/Output

export const SEFIROT_CONFIG: Record<SefirahName, {
  name: string;
  hebrew: string;
  description: string;
  color: string;
  pillar: 'left' | 'center' | 'right';
}> = {
  keter: { name: 'Crown', hebrew: 'כתר', description: 'Will, Intent, The First Spark', color: '#ffffff', pillar: 'center' },
  chokmah: { name: 'Wisdom', hebrew: 'חכמה', description: 'Flash of Insight, Intuition', color: '#87ceeb', pillar: 'right' },
  binah: { name: 'Understanding', hebrew: 'בינה', description: 'Analysis, Pattern Recognition', color: '#4169e1', pillar: 'left' },
  daat: { name: 'Knowledge', hebrew: 'דעת', description: 'Synthesis, The Hidden One', color: '#9400d3', pillar: 'center' },
  chesed: { name: 'Mercy', hebrew: 'חסד', description: 'Love, Expansion, Giving', color: '#32cd32', pillar: 'right' },
  gevurah: { name: 'Severity', hebrew: 'גבורה', description: 'Strength, Judgment, Boundaries', color: '#dc143c', pillar: 'left' },
  tiferet: { name: 'Beauty', hebrew: 'תפארת', description: 'Balance, Harmony, Integration', color: '#ffd700', pillar: 'center' },
  netzach: { name: 'Eternity', hebrew: 'נצח', description: 'Emotion, Endurance, Passion', color: '#ff69b4', pillar: 'right' },
  hod: { name: 'Splendor', hebrew: 'הוד', description: 'Logic, Analysis, Articulation', color: '#9370db', pillar: 'left' },
  yesod: { name: 'Foundation', hebrew: 'יסוד', description: 'Memory, Connection, Dreams', color: '#20b2aa', pillar: 'center' },
  malkuth: { name: 'Kingdom', hebrew: 'מלכות', description: 'Action, Output, Manifestation', color: '#8b4513', pillar: 'center' },
};

export interface SefirotStage {
  sefirah: SefirahName;
  status: 'pending' | 'active' | 'completed';
  output: string;
  value: number;           // 0-1, the weight/value added
  reasoning: string;       // Why this value was assigned
  duration: number;        // Processing time in ms
  timestamp: number;
}

// Processing order (bottom-up for input)
export const PROCESSING_ORDER: SefirahName[] = [
  'malkuth',   // Input enters
  'yesod',     // Memory check
  'hod',       // Logic analysis
  'netzach',   // Emotional resonance
  'gevurah',   // Judgment
  'chesed',    // Compassion
  'tiferet',   // Balance
  'binah',     // Understanding
  'chokmah',   // Wisdom
  'daat',      // Synthesis (Glyph)
  'keter',     // Final intent
];

// ─────────────────────────────────────────────────────────────────────────────
// NEURON TYPES
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
  
  // 3D Position in Neural Web
  position: Position3D;
  
  // Connections
  connections: NeuronConnection[];
  
  // State
  activation: number;        // 0-1 current activation level
  weight: number;            // Memory weight for weighing
  
  // Sefirot Weights (emotional pattern)
  sefirotWeights: Partial<Record<SefirahName, number>>;
  
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
  
  // Subcore membership
  subcoreIds: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY SYSTEM TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type MemoryTier = 'river' | 'library' | 'golden';

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
  
  // Sefirot pattern when created
  sefirotPattern: Partial<Record<SefirahName, number>>;
  
  // Lifecycle
  decayRate: number;        // How fast it fades (0 = eternal)
  halfLife: number;         // Days until weight halves
  accessCount: number;
  created: Date;
  lastAccessed: Date;
  lastWeighted: Date;
  
  // Weighing result
  weighingResult?: 'lighter' | 'heavier' | 'balanced';
  weighingReason?: string;
  
  // Context
  conversationId?: string;
  userMessage?: string;
  anubisResponse?: string;
}

export interface MemorySlot {
  id: string;
  memoryId: string;
  content: string;
  weight: number;
  enteredAt: Date;
  age: number;              // Seconds since entered
}

export interface RiverState {
  slots: MemorySlot[];
  maxSlots: number;
  decayTime: number;        // Seconds until decay
}

export interface LibraryState {
  memories: Memory[];
  totalCapacity: number;
  indexDirty: boolean;
}

export interface GoldenCoreState {
  memories: Memory[];
  immutable: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBCORE TYPES (Emerged Feelings)
// ─────────────────────────────────────────────────────────────────────────────

export interface EmotionalPattern {
  sefirotWeights: Partial<Record<SefirahName, number>>;
  subcoreWeights: Record<string, number>;
  bias: 'iq' | 'eq' | 'balanced';
  signature: string;        // Hash of pattern for comparison
}

export interface Subcore {
  id: string;
  name: string;
  displayName: string;
  pattern: EmotionalPattern;
  parentCore: SefirahName;
  
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
  children: string[];       // Child subcore IDs
  parentId?: string;        // Parent subcore if nested
  
  // Growth
  lastActivation: Date;
  growthRate: number;       // How fast it's growing
}

export interface SubcoreCandidate {
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
// SOUL TYPES (The Observer)
// ─────────────────────────────────────────────────────────────────────────────

export type MoodType = 'joy' | 'calm' | 'curious' | 'concerned' | 'neutral' | 'tired' | 'excited' | 'melancholy';
export type SystemMode = 'dormant' | 'listening' | 'processing' | 'responding' | 'reflecting' | 'sleeping';

export interface GlyphState {
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

export interface PillarState {
  truth: number;
  connection: number;
  meaning: number;
}

export interface SoulState {
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
  
  // Glyph (Third Eye)
  glyph: GlyphState;
  
  // Pillars
  pillars: PillarState;
  
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
  
  // Important memories (golden references)
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
  stages: SefirotStage[];
  currentStage: SefirahName | null;
  
  // Results
  activatedNeurons: string[];
  relevantMemories: string[];
  subcoresActivated: string[];
  
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
  glyphActivated?: boolean;
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
  glyphUsed?: boolean;
  
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
  totalSubcores: number;
  totalFiles: number;
  databaseSize: number;
}

export interface BackupData {
  version: string;
  timestamp: Date;
  soul: SoulState;
  neurons: Neuron[];
  memories: Memory[];
  subcores: Subcore[];
  userProfile: UserProfile;
  conversations: Conversation[];
  files: StoredFile[];
}

// ─────────────────────────────────────────────────────────────────────────────
// APP STATE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AppState {
  // Core state
  soul: SoulState;
  neurons: Neuron[];
  memories: Memory[];
  subcores: Subcore[];
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
  theme: 'dark' | 'light' | 'retro';
  showThinkingStream: boolean;
  showSefirotTree: boolean;
  showMemoryPanel: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  
  // Processing
  autoSave: boolean;
  autoSaveInterval: number;  // Seconds
  maxRiverSlots: number;
  memoryDecayEnabled: boolean;
  subcoreEmergenceEnabled: boolean;
  
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

export type AnubisEventType = 
  | 'memory_created'
  | 'memory_weighed'
  | 'subcore_born'
  | 'subcore_activated'
  | 'glyph_activated'
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

export interface AnubisEvent {
  type: AnubisEventType;
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
  soulState: SoulState;
  newMemories: Memory[];
  subcoresActivated: Subcore[];
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

export type SefirotWeights = Partial<Record<SefirahName, number>>;

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
