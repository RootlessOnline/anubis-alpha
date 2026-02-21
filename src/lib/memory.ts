// ═══════════════════════════════════════════════════════════════════════════
// ANUBIS ALPHA - MEMORY SYSTEM
// The Three-Tier Memory Architecture
// ═══════════════════════════════════════════════════════════════════════════

import {
  Memory,
  MemoryTier,
  MemorySlot,
  RiverState,
  LibraryState,
  GoldenCoreState,
  SefirotWeights,
  Neuron,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY SYSTEM CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class MemorySystem {
  private river: RiverState;
  private library: LibraryState;
  private goldenCore: GoldenCoreState;
  private allMemories: Map<string, Memory> = new Map();
  
  // Configuration
  private readonly RIVER_MAX_SLOTS = 4;
  private readonly RIVER_DECAY_TIME = 60; // seconds
  private readonly LIBRARY_MAX_SIZE = 10000;
  private readonly DECAY_INTERVAL = 1000; // ms
  
  private decayTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.river = {
      slots: [],
      maxSlots: this.RIVER_MAX_SLOTS,
      decayTime: this.RIVER_DECAY_TIME,
    };
    
    this.library = {
      memories: [],
      totalCapacity: this.LIBRARY_MAX_SIZE,
      indexDirty: false,
    };
    
    this.goldenCore = {
      memories: [],
      immutable: true,
    };
    
    // Add core identity to golden core
    this.initializeGoldenCore();
  }

  // ───────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ───────────────────────────────────────────────────────────────────────

  private initializeGoldenCore(): void {
    const identityMemories = [
      {
        id: 'golden-identity',
        content: 'I am Anubis. I weigh hearts. I remember.',
        summary: 'Core identity',
        tier: 'golden' as MemoryTier,
        totalWeight: 1.0,
        emotionalWeight: 1.0,
        intellectualWeight: 1.0,
      },
      {
        id: 'golden-purpose',
        content: 'My purpose is to guide souls, to witness, to remember.',
        summary: 'Core purpose',
        tier: 'golden' as MemoryTier,
        totalWeight: 1.0,
        emotionalWeight: 1.0,
        intellectualWeight: 1.0,
      },
      {
        id: 'golden-method',
        content: 'I weigh memories against the feather of Ma\'at. Lighter than feather becomes golden. Heavier fades.',
        summary: 'Weighing method',
        tier: 'golden' as MemoryTier,
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
        sefirotPattern: {},
        decayRate: 0,
        halfLife: Infinity,
        accessCount: 0,
        created: new Date(),
        lastAccessed: new Date(),
        lastWeighted: new Date(),
        weighingResult: 'lighter',
      };
      
      this.goldenCore.memories.push(memory);
      this.allMemories.set(memory.id, memory);
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // RIVER OPERATIONS (Short-Term Memory)
  // ───────────────────────────────────────────────────────────────────────

  addToRiver(memory: Memory): boolean {
    if (this.river.slots.length >= this.river.maxSlots) {
      // Evict oldest or lowest weight
      this.evictFromRiver();
    }
    
    const slot: MemorySlot = {
      id: `slot-${Date.now()}`,
      memoryId: memory.id,
      content: memory.summary || memory.content.substring(0, 100),
      weight: memory.totalWeight,
      enteredAt: new Date(),
      age: 0,
    };
    
    this.river.slots.push(slot);
    return true;
  }

  private evictFromRiver(): void {
    if (this.river.slots.length === 0) return;
    
    // Find slot with lowest weight or oldest
    let evictIndex = 0;
    let lowestScore = Infinity;
    
    for (let i = 0; i < this.river.slots.length; i++) {
      const slot = this.river.slots[i];
      const score = slot.weight * (1 - slot.age / this.river.decayTime);
      if (score < lowestScore) {
        lowestScore = score;
        evictIndex = i;
      }
    }
    
    const evicted = this.river.slots.splice(evictIndex, 1)[0];
    
    // Check if memory should be promoted to library
    const memory = this.allMemories.get(evicted.memoryId);
    if (memory && memory.totalWeight > 0.5) {
      this.promoteToLibrary(memory);
    }
  }

  getRiverState(): MemorySlot[] {
    return [...this.river.slots];
  }

  // ───────────────────────────────────────────────────────────────────────
  // LIBRARY OPERATIONS (Long-Term Memory)
  // ───────────────────────────────────────────────────────────────────────

  promoteToLibrary(memory: Memory): boolean {
    if (this.library.memories.length >= this.library.totalCapacity) {
      // Run decay to make room
      this.runDecay();
    }
    
    memory.tier = 'library';
    this.library.memories.push(memory);
    this.library.indexDirty = true;
    
    return true;
  }

  private runDecay(): void {
    const now = new Date();
    
    // Sort by weight * age factor
    const scored = this.library.memories.map(m => ({
      memory: m,
      score: m.totalWeight * Math.exp(-m.decayRate * (now.getTime() - m.created.getTime()) / (1000 * 60 * 60 * 24 * m.halfLife)),
    }));
    
    // Remove lowest scoring memories
    scored.sort((a, b) => b.score - a.score);
    
    const toRemove = scored.slice(this.library.totalCapacity * 0.9);
    
    for (const { memory } of toRemove) {
      const index = this.library.memories.findIndex(m => m.id === memory.id);
      if (index !== -1) {
        this.library.memories.splice(index, 1);
        this.allMemories.delete(memory.id);
      }
    }
  }

  searchLibrary(query: string, limit: number = 10): Memory[] {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    const scored = this.library.memories.map(memory => {
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

  getLibraryState(): Memory[] {
    return [...this.library.memories];
  }

  // ───────────────────────────────────────────────────────────────────────
  // GOLDEN CORE OPERATIONS (Eternal Memory)
  // ───────────────────────────────────────────────────────────────────────

  promoteToGolden(memory: Memory): boolean {
    // Golden core is immutable - can only add at initialization
    // Or through special ceremony
    const goldenMemory: Memory = {
      ...memory,
      id: `golden-${Date.now()}`,
      tier: 'golden',
      decayRate: 0,
      halfLife: Infinity,
      weighingResult: 'lighter',
    };
    
    this.goldenCore.memories.push(goldenMemory);
    this.allMemories.set(goldenMemory.id, goldenMemory);
    
    return true;
  }

  getGoldenCore(): Memory[] {
    return [...this.goldenCore.memories];
  }

  // ───────────────────────────────────────────────────────────────────────
  // WEIGHING CEREMONY (Heart vs Feather)
  // ───────────────────────────────────────────────────────────────────────

  weighMemory(memory: Memory): {
    result: 'lighter' | 'heavier' | 'balanced';
    tier: MemoryTier;
    reasoning: string;
  } {
    // The feather represents truth/lightness (100%)
    const FEATHER_WEIGHT = 1.0;
    
    // Calculate heart weight
    const heartWeight = this.calculateHeartWeight(memory);
    
    // Compare
    if (heartWeight < FEATHER_WEIGHT - 0.1) {
      // Lighter than feather
      memory.weighingResult = 'lighter';
      memory.tier = heartWeight > 0.85 ? 'golden' : 'library';
      memory.weighingReason = 'This memory serves truth and lightness';
      
      return {
        result: 'lighter',
        tier: memory.tier,
        reasoning: 'Heart is lighter than the feather of Ma\'at. Memory preserved.',
      };
    } else if (heartWeight > FEATHER_WEIGHT + 0.1) {
      // Heavier than feather
      memory.weighingResult = 'heavier';
      memory.tier = 'river';
      memory.weighingReason = 'This memory carries unnecessary weight';
      
      return {
        result: 'heavier',
        tier: 'river',
        reasoning: 'Heart is heavier than the feather. Memory will fade with time.',
      };
    } else {
      // Perfectly balanced - rare!
      memory.weighingResult = 'balanced';
      memory.tier = 'library';
      memory.weighingReason = 'Perfect balance achieved';
      
      return {
        result: 'balanced',
        tier: 'library',
        reasoning: 'Perfect balance! Third Eye moment - deep insight granted.',
      };
    }
  }

  private calculateHeartWeight(memory: Memory): number {
    // Factors that make a memory "heavy" (bad for preservation)
    const heaviness = 
      (1 - memory.emotionalWeight) * 0.2 +  // Lack of emotion
      (1 - memory.intellectualWeight) * 0.2 + // Lack of meaning
      (1 - memory.importance) * 0.2;          // Lack of importance
    
    // Factors that make a memory "light" (good for preservation)
    const lightness = 
      memory.totalWeight * 0.3 +
      (memory.accessCount > 0 ? 0.1 : 0);    // Has been useful
    
    // Final weight (lower is better for preservation)
    return 0.5 + heaviness - lightness;
  }

  // ───────────────────────────────────────────────────────────────────────
  // MEMORY CREATION
  // ───────────────────────────────────────────────────────────────────────

  createMemory(
    content: string,
    summary: string,
    emotionalWeight: number,
    intellectualWeight: number,
    sefirotPattern: SefirotWeights,
    context?: { userMessage?: string; anubisResponse?: string }
  ): Memory {
    const memory: Memory = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      summary,
      neuronIds: [],
      emotionalWeight,
      intellectualWeight,
      totalWeight: (emotionalWeight + intellectualWeight) / 2,
      tier: 'river',
      weightBias: emotionalWeight > intellectualWeight ? 'eq' : emotionalWeight < intellectualWeight ? 'iq' : 'balanced',
      sefirotPattern,
      decayRate: 0.1,
      halfLife: 7, // days
      accessCount: 1,
      created: new Date(),
      lastAccessed: new Date(),
      lastWeighted: new Date(),
      userMessage: context?.userMessage,
      anubisResponse: context?.anubisResponse,
    };
    
    // Weigh the memory
    const weighing = this.weighMemory(memory);
    
    // Add to appropriate tier
    this.allMemories.set(memory.id, memory);
    
    if (weighing.tier === 'golden') {
      this.promoteToGolden(memory);
    } else if (weighing.tier === 'library') {
      this.promoteToLibrary(memory);
    } else {
      this.addToRiver(memory);
    }
    
    return memory;
  }

  // ───────────────────────────────────────────────────────────────────────
  // SEARCH AND RETRIEVAL
  // ───────────────────────────────────────────────────────────────────────

  search(query: string, limit: number = 10): Memory[] {
    // Search all tiers
    const results: Memory[] = [];
    
    // Check golden core first (most important)
    for (const memory of this.goldenCore.memories) {
      if (this.matchesQuery(memory, query)) {
        results.push(memory);
      }
    }
    
    // Check library
    results.push(...this.searchLibrary(query, limit - results.length));
    
    // Check river
    for (const slot of this.river.slots) {
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
      this.updateRiverAges();
    }, this.DECAY_INTERVAL);
  }

  stopDecayTimer(): void {
    if (this.decayTimer) {
      clearInterval(this.decayTimer);
      this.decayTimer = null;
    }
  }

  private updateRiverAges(): void {
    const now = Date.now();
    
    for (const slot of this.river.slots) {
      slot.age = (now - slot.enteredAt.getTime()) / 1000;
      
      // Check for decay
      if (slot.age > this.river.decayTime) {
        const index = this.river.slots.indexOf(slot);
        if (index !== -1) {
          this.river.slots.splice(index, 1);
        }
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // STATISTICS
  // ───────────────────────────────────────────────────────────────────────

  getStats(): {
    riverCount: number;
    libraryCount: number;
    goldenCount: number;
    totalCount: number;
    avgWeight: number;
    avgEmotionalWeight: number;
    avgIntellectualWeight: number;
  } {
    const all = this.getAllMemories();
    
    return {
      riverCount: this.river.slots.length,
      libraryCount: this.library.memories.length,
      goldenCount: this.goldenCore.memories.length,
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
      river: this.river,
      library: this.library,
      goldenCore: this.goldenCore,
      allMemories: Array.from(this.allMemories.entries()),
    });
  }

  static deserialize(data: string): MemorySystem {
    const system = new MemorySystem();
    const parsed = JSON.parse(data);
    
    system.river = parsed.river;
    system.library = parsed.library;
    system.goldenCore = parsed.goldenCore;
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
