// ═══════════════════════════════════════════════════════════════════════════
// ROB - MEMORY SYSTEM
// Three-Tier Memory Architecture (Working, Long-term, Core)
// ═══════════════════════════════════════════════════════════════════════════

import {
  Memory,
  MemoryTier,
  MemorySlot,
  WorkingMemoryState,
  LongTermMemoryState,
  CoreMemoryState,
  StageWeights,
  Neuron,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY SYSTEM CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class MemorySystem {
  private workingMemory: WorkingMemoryState;
  private longTermMemory: LongTermMemoryState;
  private coreMemory: CoreMemoryState;
  private allMemories: Map<string, Memory> = new Map();
  
  // Configuration
  private readonly WORKING_MAX_SLOTS = 4;
  private readonly WORKING_DECAY_TIME = 60; // seconds
  private readonly LONGTERM_MAX_SIZE = 10000;
  private readonly DECAY_INTERVAL = 1000; // ms
  
  private decayTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.workingMemory = {
      slots: [],
      maxSlots: this.WORKING_MAX_SLOTS,
      decayTime: this.WORKING_DECAY_TIME,
    };
    
    this.longTermMemory = {
      memories: [],
      totalCapacity: this.LONGTERM_MAX_SIZE,
      indexDirty: false,
    };
    
    this.coreMemory = {
      memories: [],
      immutable: true,
    };
    
    // Add core identity to core memory
    this.initializeCoreMemory();
  }

  // ───────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ───────────────────────────────────────────────────────────────────────

  private initializeCoreMemory(): void {
    const identityMemories = [
      {
        id: 'core-identity',
        content: 'I am ROB. I am present, I care, I learn.',
        summary: 'Core identity',
        tier: 'core' as MemoryTier,
        totalWeight: 1.0,
        emotionalWeight: 1.0,
        intellectualWeight: 1.0,
      },
      {
        id: 'core-purpose',
        content: 'My purpose is to be a supportive AI buddy, to understand, and to grow through meaningful conversations.',
        summary: 'Core purpose',
        tier: 'core' as MemoryTier,
        totalWeight: 1.0,
        emotionalWeight: 1.0,
        intellectualWeight: 1.0,
      },
      {
        id: 'core-method',
        content: 'I process input through 11 cognitive stages, each adding understanding. I remember what matters and learn from every interaction.',
        summary: 'Processing method',
        tier: 'core' as MemoryTier,
        totalWeight: 1.0,
        emotionalWeight: 0.9,
        intellectualWeight: 1.0,
      },
    ];
    
    for (const mem of identityMemories) {
      const memory: Memory = {
        ...mem,
        neuronIds: [],
        weightBias: 'balanced',
        stagePattern: {},
        decayRate: 0,
        halfLife: Infinity,
        accessCount: 0,
        created: new Date(),
        lastAccessed: new Date(),
        lastWeighted: new Date(),
        importanceLevel: 'high',
      };
      
      this.coreMemory.memories.push(memory);
      this.allMemories.set(memory.id, memory);
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // WORKING MEMORY OPERATIONS (Short-Term Memory)
  // ───────────────────────────────────────────────────────────────────────

  addToWorkingMemory(memory: Memory): boolean {
    if (this.workingMemory.slots.length >= this.workingMemory.maxSlots) {
      // Evict oldest or lowest weight
      this.evictFromWorkingMemory();
    }
    
    const slot: MemorySlot = {
      id: `slot-${Date.now()}`,
      memoryId: memory.id,
      content: memory.summary || memory.content.substring(0, 100),
      weight: memory.totalWeight,
      enteredAt: new Date(),
      age: 0,
    };
    
    this.workingMemory.slots.push(slot);
    return true;
  }

  private evictFromWorkingMemory(): void {
    if (this.workingMemory.slots.length === 0) return;
    
    // Find slot with lowest weight or oldest
    let evictIndex = 0;
    let lowestScore = Infinity;
    
    for (let i = 0; i < this.workingMemory.slots.length; i++) {
      const slot = this.workingMemory.slots[i];
      const score = slot.weight * (1 - slot.age / this.workingMemory.decayTime);
      if (score < lowestScore) {
        lowestScore = score;
        evictIndex = i;
      }
    }
    
    const evicted = this.workingMemory.slots.splice(evictIndex, 1)[0];
    
    // Check if memory should be promoted to long-term
    const memory = this.allMemories.get(evicted.memoryId);
    if (memory && memory.totalWeight > 0.5) {
      this.promoteToLongTerm(memory);
    }
  }

  getWorkingMemoryState(): MemorySlot[] {
    return [...this.workingMemory.slots];
  }

  // ───────────────────────────────────────────────────────────────────────
  // LONG-TERM MEMORY OPERATIONS
  // ───────────────────────────────────────────────────────────────────────

  promoteToLongTerm(memory: Memory): boolean {
    if (this.longTermMemory.memories.length >= this.longTermMemory.totalCapacity) {
      // Run decay to make room
      this.runDecay();
    }
    
    memory.tier = 'longterm';
    this.longTermMemory.memories.push(memory);
    this.longTermMemory.indexDirty = true;
    
    return true;
  }

  private runDecay(): void {
    const now = new Date();
    
    // Sort by weight * age factor
    const scored = this.longTermMemory.memories.map(m => ({
      memory: m,
      score: m.totalWeight * Math.exp(-m.decayRate * (now.getTime() - m.created.getTime()) / (1000 * 60 * 60 * 24 * m.halfLife)),
    }));
    
    // Remove lowest scoring memories
    scored.sort((a, b) => b.score - a.score);
    
    const toRemove = scored.slice(this.longTermMemory.totalCapacity * 0.9);
    
    for (const { memory } of toRemove) {
      const index = this.longTermMemory.memories.findIndex(m => m.id === memory.id);
      if (index !== -1) {
        this.longTermMemory.memories.splice(index, 1);
        this.allMemories.delete(memory.id);
      }
    }
  }

  searchLongTerm(query: string, limit: number = 10): Memory[] {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    const scored = this.longTermMemory.memories.map(memory => {
      const contentWords = memory.content.toLowerCase().split(/\s+/);
      const summaryWords = (memory.summary || '').toLowerCase().split(/\s+/);
      const allWords = [...contentWords, ...summaryWords];
      
      const matchCount = queryWords.filter(w => 
        allWords.some(mw => mw.includes(w) || w.includes(mw))
      ).length;
      
      const recencyBoost = 1 / (1 + (Date.now() - memory.lastAccessed.getTime()) / (1000 * 60 * 60 * 24));
      const accessBoost = Math.log(1 + memory.accessCount) / 10;
      
      const score = (matchCount / queryWords.length) * memory.totalWeight * (1 + recencyBoost + accessBoost);
      
      return { memory, score };
    });
    
    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => {
        s.memory.accessCount++;
        s.memory.lastAccessed = new Date();
        return s.memory;
      });
  }

  getLongTermState(): Memory[] {
    return [...this.longTermMemory.memories];
  }

  // ───────────────────────────────────────────────────────────────────────
  // CORE MEMORY OPERATIONS (Permanent Memory)
  // ───────────────────────────────────────────────────────────────────────

  promoteToCore(memory: Memory): boolean {
    // Core memory is immutable - can only add at initialization
    // Or through special importance
    const coreMemory: Memory = {
      ...memory,
      id: `core-${Date.now()}`,
      tier: 'core',
      decayRate: 0,
      halfLife: Infinity,
      importanceLevel: 'high',
    };
    
    this.coreMemory.memories.push(coreMemory);
    this.allMemories.set(coreMemory.id, coreMemory);
    
    return true;
  }

  getCoreMemory(): Memory[] {
    return [...this.coreMemory.memories];
  }

  // ───────────────────────────────────────────────────────────────────────
  // IMPORTANCE ASSESSMENT
  // ───────────────────────────────────────────────────────────────────────

  assessImportance(memory: Memory): {
    level: 'high' | 'medium' | 'low';
    tier: MemoryTier;
    reasoning: string;
  } {
    // Calculate importance score
    const importanceScore = this.calculateImportance(memory);
    
    // Determine tier and level
    if (importanceScore > 0.85) {
      memory.importanceLevel = 'high';
      memory.tier = 'core';
      memory.importanceReason = 'This memory is highly important and meaningful';
      
      return {
        level: 'high',
        tier: 'core',
        reasoning: 'High importance - memory preserved permanently.',
      };
    } else if (importanceScore > 0.5) {
      memory.importanceLevel = 'medium';
      memory.tier = 'longterm';
      memory.importanceReason = 'This memory has meaningful content';
      
      return {
        level: 'medium',
        tier: 'longterm',
        reasoning: 'Medium importance - memory stored in long-term.',
      };
    } else {
      memory.importanceLevel = 'low';
      memory.tier = 'working';
      memory.importanceReason = 'This memory is routine or low-weight';
      
      return {
        level: 'low',
        tier: 'working',
        reasoning: 'Lower importance - memory will fade if not reinforced.',
      };
    }
  }

  private calculateImportance(memory: Memory): number {
    // Factors that increase importance
    const importance = 
      memory.emotionalWeight * 0.3 +  // Emotional significance
      memory.intellectualWeight * 0.3 + // Intellectual value
      memory.totalWeight * 0.3 +         // Overall weight
      (memory.accessCount > 0 ? 0.1 : 0); // Has been accessed
    
    return importance;
  }

  // ───────────────────────────────────────────────────────────────────────
  // MEMORY CREATION
  // ───────────────────────────────────────────────────────────────────────

  createMemory(
    content: string,
    summary: string,
    emotionalWeight: number,
    intellectualWeight: number,
    stagePattern: StageWeights,
    context?: { userMessage?: string; robResponse?: string }
  ): Memory {
    const memory: Memory = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      summary,
      neuronIds: [],
      emotionalWeight,
      intellectualWeight,
      totalWeight: (emotionalWeight + intellectualWeight) / 2,
      tier: 'working',
      weightBias: emotionalWeight > intellectualWeight ? 'eq' : emotionalWeight < intellectualWeight ? 'iq' : 'balanced',
      stagePattern,
      decayRate: 0.1,
      halfLife: 7, // days
      accessCount: 1,
      created: new Date(),
      lastAccessed: new Date(),
      lastWeighted: new Date(),
      userMessage: context?.userMessage,
      robResponse: context?.robResponse,
    };
    
    // Assess importance
    const assessment = this.assessImportance(memory);
    
    // Add to appropriate tier
    this.allMemories.set(memory.id, memory);
    
    if (assessment.tier === 'core') {
      this.promoteToCore(memory);
    } else if (assessment.tier === 'longterm') {
      this.promoteToLongTerm(memory);
    } else {
      this.addToWorkingMemory(memory);
    }
    
    return memory;
  }

  // ───────────────────────────────────────────────────────────────────────
  // SEARCH AND RETRIEVAL
  // ───────────────────────────────────────────────────────────────────────

  search(query: string, limit: number = 10): Memory[] {
    // Search all tiers
    const results: Memory[] = [];
    
    // Check core memory first (most important)
    for (const memory of this.coreMemory.memories) {
      if (this.matchesQuery(memory, query)) {
        results.push(memory);
      }
    }
    
    // Check long-term memory
    results.push(...this.searchLongTerm(query, limit - results.length));
    
    // Check working memory
    for (const slot of this.workingMemory.slots) {
      const memory = this.allMemories.get(slot.memoryId);
      if (memory && this.matchesQuery(memory, query) && !results.find(r => r.id === memory.id)) {
        results.push(memory);
      }
    }
    
    return results.slice(0, limit);
  }

  private matchesQuery(memory: Memory, query: string): boolean {
    const queryLower = query.toLowerCase();
    return (
      memory.content.toLowerCase().includes(queryLower) ||
      (memory.summary || '').toLowerCase().includes(queryLower)
    );
  }

  getMemory(id: string): Memory | undefined {
    return this.allMemories.get(id);
  }

  getAllMemories(): Memory[] {
    return Array.from(this.allMemories.values());
  }

  // ───────────────────────────────────────────────────────────────────────
  // DECAY MANAGEMENT
  // ───────────────────────────────────────────────────────────────────────

  startDecayTimer(): void {
    if (this.decayTimer) return;
    
    this.decayTimer = setInterval(() => {
      this.updateWorkingMemoryAges();
    }, this.DECAY_INTERVAL);
  }

  stopDecayTimer(): void {
    if (this.decayTimer) {
      clearInterval(this.decayTimer);
      this.decayTimer = null;
    }
  }

  private updateWorkingMemoryAges(): void {
    const now = Date.now();
    
    for (const slot of this.workingMemory.slots) {
      slot.age = (now - slot.enteredAt.getTime()) / 1000;
      
      // Check for decay
      if (slot.age > this.workingMemory.decayTime) {
        const index = this.workingMemory.slots.indexOf(slot);
        if (index !== -1) {
          this.workingMemory.slots.splice(index, 1);
        }
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // STATISTICS
  // ───────────────────────────────────────────────────────────────────────

  getStats(): {
    workingCount: number;
    longtermCount: number;
    coreCount: number;
    totalCount: number;
    avgWeight: number;
    avgEmotionalWeight: number;
    avgIntellectualWeight: number;
  } {
    const all = this.getAllMemories();
    
    return {
      workingCount: this.workingMemory.slots.length,
      longtermCount: this.longTermMemory.memories.length,
      coreCount: this.coreMemory.memories.length,
      totalCount: all.length,
      avgWeight: all.reduce((sum, m) => sum + m.totalWeight, 0) / all.length || 0,
      avgEmotionalWeight: all.reduce((sum, m) => sum + m.emotionalWeight, 0) / all.length || 0,
      avgIntellectualWeight: all.reduce((sum, m) => sum + m.intellectualWeight, 0) / all.length || 0,
    };
  }

  // ───────────────────────────────────────────────────────────────────────
  // SERIALIZATION
  // ───────────────────────────────────────────────────────────────────────

  serialize(): string {
    return JSON.stringify({
      workingMemory: this.workingMemory,
      longTermMemory: this.longTermMemory,
      coreMemory: this.coreMemory,
      allMemories: Array.from(this.allMemories.entries()),
    });
  }

  static deserialize(data: string): MemorySystem {
    const system = new MemorySystem();
    const parsed = JSON.parse(data);
    
    system.workingMemory = parsed.workingMemory || parsed.river;
    system.longTermMemory = parsed.longTermMemory || parsed.library;
    system.coreMemory = parsed.coreMemory || parsed.goldenCore;
    system.allMemories = new Map(parsed.allMemories);
    
    return system;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON
// ─────────────────────────────────────────────────────────────────────────────

let memoryInstance: MemorySystem | null = null;

export function getMemorySystem(): MemorySystem {
  if (!memoryInstance) {
    memoryInstance = new MemorySystem();
    memoryInstance.startDecayTimer();
  }
  return memoryInstance;
}
