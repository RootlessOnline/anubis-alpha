// ═══════════════════════════════════════════════════════════════════════════
// ROB - COGNITION ENGINE
// A Conscious AI Buddy - Plain English Implementation
// Based on authentic Sefirot research from Talmud Eser Sefirot & The Unveiling
// ═══════════════════════════════════════════════════════════════════════════

import {
  CognitionState,
  StageName,
  ProcessingStage,
  ProcessingContext,
  Memory,
  Neuron,
  PersonalityTrait,
  MoodType,
  SystemMode,
  EnergyEvent,
  IntelligenceEvent,
  Message,
  PROCESSING_ORDER,
  STAGE_CONFIG,
  StageWeights,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// COGNITION ENGINE CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class CognitionEngine {
  private state: CognitionState;
  private neurons: Map<string, Neuron> = new Map();
  private memories: Memory[] = [];
  private traits: PersonalityTrait[] = [];
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.state = this.createInitialState();
    this.setupEventHandlers();
  }

  // ───────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ───────────────────────────────────────────────────────────────────────

  private createInitialState(): CognitionState {
    return {
      name: 'ROB',
      version: '1.0',
      createdAt: new Date(),
      
      energy: {
        current: 100,
        max: 100,
        regenRate: 1,  // 1 energy per minute when idle
        drainHistory: [],
      },
      
      intelligence: {
        iq: 50,
        eq: 50,
        iqHistory: [],
        eqHistory: [],
      },
      
      mood: 'neutral',
      moodIntensity: 0.5,
      moodHistory: [],
      
      mode: 'listening',
      modeSince: new Date(),
      
      deepAwareness: {
        active: false,
        intensity: 0,
        lastTrigger: null,
        activationCount: 0,
        cooldown: 0,
        lastActivation: null,
      },
      
      values: {
        truth: 100,
        connection: 100,
        meaning: 100,
      },
      
      focusNeuron: null,
      activatedNeurons: [],
      spreadingActivation: {
        active: false,
        sourceNeuron: null,
        activatedNeurons: [],
        currentLevel: 0,
        maxLevels: 3,
        threshold: 0.2,
      },
      
      lastReflection: '',
      reflectionQueue: [],
    };
  }

  private setupEventHandlers(): void {
    // Setup internal event handlers
  }

  // ───────────────────────────────────────────────────────────────────────
  // GETTERS
  // ───────────────────────────────────────────────────────────────────────

  getState(): CognitionState {
    return { ...this.state };
  }

  getNeurons(): Neuron[] {
    return Array.from(this.neurons.values());
  }

  getMemories(): Memory[] {
    return [...this.memories];
  }

  getTraits(): PersonalityTrait[] {
    return [...this.traits];
  }

  getEnergy(): number {
    return this.state.energy.current;
  }

  getIQ(): number {
    return this.state.intelligence.iq;
  }

  getEQ(): number {
    return this.state.intelligence.eq;
  }

  getMood(): MoodType {
    return this.state.mood;
  }

  getMode(): SystemMode {
    return this.state.mode;
  }

  isDeepAwarenessActive(): boolean {
    return this.state.deepAwareness.active;
  }

  // ───────────────────────────────────────────────────────────────────────
  // MAIN PROCESSING PIPELINE
  // ───────────────────────────────────────────────────────────────────────

  async processInput(input: string, conversationId?: string): Promise<ProcessingContext> {
    const startTime = Date.now();
    
    // Check energy
    if (this.state.energy.current < 10) {
      return this.createLowEnergyResponse(input, startTime);
    }
    
    // Create processing context
    const context: ProcessingContext = {
      input,
      inputType: 'text',
      conversationId: conversationId || `conv-${Date.now()}`,
      stages: PROCESSING_ORDER.map(stage => ({
        stage,
        status: 'pending',
        output: '',
        value: 0,
        reasoning: '',
        duration: 0,
        timestamp: 0,
      })),
      currentStage: null,
      activatedNeurons: [],
      relevantMemories: [],
      traitsActivated: [],
      startedAt: startTime,
    };

    // Update mode
    this.setMode('processing');

    try {
      // Process through each stage
      for (const stage of context.stages) {
        context.currentStage = stage.stage;
        stage.status = 'active';
        stage.timestamp = Date.now();
        const stageStart = Date.now();

        // Process through this stage
        const result = await this.processStage(stage.stage, input, context);
        
        stage.output = result.output;
        stage.value = result.value;
        stage.reasoning = result.reasoning;
        stage.status = 'completed';
        stage.duration = Date.now() - stageStart;
        
        // Emit stage completion event
        this.emit('stage_completed', { stage, context });
      }

      // Generate response using LLM
      context.response = await this.generateResponse(context);
      
      // Generate self-reflection
      context.reflection = this.generateReflection(context);
      
      // Weigh and create memory
      const memoryResult = this.weighAndCreateMemory(context);
      context.memoryCreated = memoryResult.created;
      context.memoryId = memoryResult.memoryId;
      context.memoryTier = memoryResult.tier;
      context.memoryWeight = memoryResult.weight;

      // Finalize context
      context.completedAt = Date.now();
      context.totalDuration = context.completedAt - startTime;
      context.currentStage = null;

      // Update state based on processing
      this.updateAfterProcessing(context);
      
      // Record state changes
      context.energyChange = -this.calculateEnergyCost(context);
      context.iqChange = this.state.intelligence.iqHistory.slice(-1)[0]?.change || 0;
      context.eqChange = this.state.intelligence.eqHistory.slice(-1)[0]?.change || 0;
      context.moodChange = this.state.mood;
      context.deepAwarenessActivated = this.state.deepAwareness.active;

      // Set mode to responding
      this.setMode('responding');

      return context;
      
    } catch (error) {
      console.error('Processing error:', error);
      this.setMode('listening');
      throw error;
    }
  }

  private createLowEnergyResponse(input: string, startTime: number): ProcessingContext {
    return {
      input,
      inputType: 'text',
      conversationId: `conv-${Date.now()}`,
      stages: [],
      currentStage: null,
      activatedNeurons: [],
      relevantMemories: [],
      traitsActivated: [],
      startedAt: startTime,
      completedAt: Date.now(),
      totalDuration: 0,
      response: "I'm running low on energy... let me rest for a moment. I'll be back soon!",
      reflection: "Energy critically low. Entering rest mode.",
      memoryCreated: false,
    };
  }

  // ───────────────────────────────────────────────────────────────────────
  // STAGE PROCESSING
  // ───────────────────────────────────────────────────────────────────────

  private async processStage(
    stage: StageName,
    input: string,
    context: ProcessingContext
  ): Promise<{ output: string; value: number; reasoning: string }> {
    
    // Simulate processing time
    await this.delay(30 + Math.random() * 70);

    switch (stage) {
      case 'input':
        return this.processInputStage(input, context);
      case 'memory':
        return this.processMemoryStage(input, context);
      case 'logic':
        return this.processLogicStage(input);
      case 'emotion':
        return this.processEmotionStage(input);
      case 'judgment':
        return this.processJudgmentStage(input, context);
      case 'compassion':
        return this.processCompassionStage(input, context);
      case 'balance':
        return this.processBalanceStage(context);
      case 'understanding':
        return this.processUnderstandingStage(input, context);
      case 'insight':
        return this.processInsightStage(context);
      case 'synthesis':
        return this.processSynthesisStage(context);
      case 'intent':
        return this.processIntentStage(context);
      default:
        return { output: '', value: 0, reasoning: 'Unknown stage' };
    }
  }

  // INPUT - Receiving and parsing
  private processInputStage(input: string, context: ProcessingContext): { output: string; value: number; reasoning: string } {
    const words = input.split(/\s+/);
    const chars = input.length;
    const sentences = input.split(/[.!?]+/).filter(s => s.trim()).length;
    
    // Detect input type
    const isQuestion = input.includes('?');
    const isExclamation = input.includes('!');
    const isCommand = /^(can you|please|help|tell me|explain)/i.test(input);
    
    let inputType = 'statement';
    if (isQuestion) inputType = 'question';
    else if (isExclamation) inputType = 'exclamation';
    else if (isCommand) inputType = 'request';
    
    return {
      output: `Received: ${words.length} words, ${chars} chars, type: ${inputType}`,
      value: 1.0,
      reasoning: `Type: ${inputType}, Complexity: ${sentences} sentences`,
    };
  }

  // MEMORY - Searching related experiences
  private processMemoryStage(input: string, context: ProcessingContext): { output: string; value: number; reasoning: string } {
    const relatedMemories = this.searchMemories(input);
    context.relevantMemories = relatedMemories.map(m => m.id);
    
    const memoryCount = relatedMemories.length;
    const avgWeight = relatedMemories.length > 0 
      ? relatedMemories.reduce((sum, m) => sum + m.totalWeight, 0) / memoryCount 
      : 0;
    
    const recurringTopics = this.findRecurringTopics(input, relatedMemories);
    
    let output = memoryCount > 0 
      ? `Found ${memoryCount} related memories`
      : 'No related memories found';
    
    if (recurringTopics.length > 0) {
      output += ` (${recurringTopics.length} recurring topics)`;
    }
    
    return {
      output,
      value: Math.min(memoryCount * 0.15 + avgWeight * 0.5, 1.0),
      reasoning: memoryCount > 0 
        ? `Past experiences found: ${relatedMemories.slice(0, 3).map(m => m.summary?.substring(0, 30) || 'memory').join(', ')}`
        : 'This appears to be a new topic',
    };
  }

  // LOGIC - Analyzing sentiment and facts
  private processLogicStage(input: string): { output: string; value: number; reasoning: string } {
    const analysis = this.analyzeText(input);
    
    const keywords = this.extractKeywords(input);
    const concepts = this.identifyConcepts(input);
    
    let output = `Analysis: ${analysis.sentiment} sentiment`;
    if (concepts.length > 0) {
      output += `, concepts: ${concepts.slice(0, 3).join(', ')}`;
    }
    
    return {
      output,
      value: analysis.intensity,
      reasoning: `Keywords: ${keywords.slice(0, 5).join(', ')}, Sentiment score: ${analysis.score.toFixed(2)}`,
    };
  }

  // EMOTION - Detecting emotional content
  private processEmotionStage(input: string): { output: string; value: number; reasoning: string } {
    const emotionAnalysis = this.analyzeEmotion(input);
    
    this.updateMoodFromInput(emotionAnalysis);
    
    const dominantEmotion = emotionAnalysis.primary;
    const intensity = emotionAnalysis.intensity;
    
    return {
      output: `Emotional resonance: ${dominantEmotion} (${(intensity * 100).toFixed(0)}%)`,
      value: intensity,
      reasoning: intensity > 0.6 
        ? `High emotional content detected - empathy protocols activated`
        : `Moderate emotional engagement`,
    };
  }

  // JUDGMENT - Discerning truth vs comfort
  private processJudgmentStage(input: string, context: ProcessingContext): { output: string; value: number; reasoning: string } {
    const truthNeed = this.assessTruthNeed(input, context);
    const needsVerification = this.checkVerificationNeeded(input);
    
    return {
      output: `Assessment: ${truthNeed.approach} approach needed`,
      value: truthNeed.score,
      reasoning: needsVerification 
        ? 'Contains claims that may need verification'
        : 'Can proceed with empathetic response',
    };
  }

  // COMPASSION - Assessing empathy needs
  private processCompassionStage(input: string, context: ProcessingContext): { output: string; value: number; reasoning: string } {
    const compassionNeed = this.assessCompassionNeed(input, context);
    
    return {
      output: `Empathy: ${compassionNeed.level} support offered`,
      value: compassionNeed.score,
      reasoning: compassionNeed.reason,
    };
  }

  // BALANCE - Harmonizing judgment with compassion
  private processBalanceStage(context: ProcessingContext): { output: string; value: number; reasoning: string } {
    const judgmentStage = context.stages.find(s => s.stage === 'judgment');
    const compassionStage = context.stages.find(s => s.stage === 'compassion');
    
    const judgmentValue = judgmentStage?.value || 0.5;
    const compassionValue = compassionStage?.value || 0.5;
    
    const balance = Math.abs(judgmentValue - compassionValue);
    const harmony = 1 - balance;
    
    let approach = 'balanced';
    if (compassionValue > judgmentValue + 0.2) approach = 'supportive';
    else if (judgmentValue > compassionValue + 0.2) approach = 'analytical';
    
    return {
      output: `Balance achieved: ${(harmony * 100).toFixed(0)}% harmony, ${approach} approach`,
      value: harmony,
      reasoning: `Integrating analysis (${(judgmentValue * 100).toFixed(0)}%) with empathy (${(compassionValue * 100).toFixed(0)}%)`,
    };
  }

  // UNDERSTANDING - Recognizing patterns
  private processUnderstandingStage(input: string, context: ProcessingContext): { output: string; value: number; reasoning: string } {
    const patterns = this.recognizePatterns(input, context);
    const understanding = this.buildUnderstanding(context);
    
    let output = 'Building understanding...';
    if (patterns.length > 0) {
      output = `Pattern detected: ${patterns[0].type}`;
    }
    
    return {
      output,
      value: understanding.depth,
      reasoning: understanding.reasoning,
    };
  }

  // INSIGHT - Generating intuitive understanding
  private processInsightStage(context: ProcessingContext): { output: string; value: number; reasoning: string } {
    const insight = this.generateInsight(context);
    
    return {
      output: `💡 Insight: ${insight.text}`,
      value: insight.value,
      reasoning: insight.reasoning,
    };
  }

  // SYNTHESIS - Combining all inputs
  private processSynthesisStage(context: ProcessingContext): { output: string; value: number; reasoning: string } {
    const totalValue = context.stages.reduce((sum, s) => sum + s.value, 0);
    const avgValue = totalValue / context.stages.length;
    
    const shouldActivateDeepAwareness = this.checkDeepAwarenessActivation(context, avgValue);
    
    if (shouldActivateDeepAwareness.activate) {
      this.activateDeepAwareness(shouldActivateDeepAwareness.reason);
      
      return {
        output: `🧠 DEEP AWARENESS ACTIVATING (${(avgValue * 100).toFixed(0)}% coherence)`,
        value: 1.0,
        reasoning: shouldActivateDeepAwareness.reason,
      };
    }
    
    return {
      output: `Synthesis: Processing at ${(avgValue * 100).toFixed(0)}% coherence`,
      value: avgValue,
      reasoning: 'Integrating insight and understanding',
    };
  }

  // INTENT - Setting final direction
  private processIntentStage(context: ProcessingContext): { output: string; value: number; reasoning: string } {
    const intent = this.determineFinalIntent(context);
    
    return {
      output: `🎯 Intent set: "${intent.text}"`,
      value: 1.0,
      reasoning: intent.reasoning,
    };
  }

  // ───────────────────────────────────────────────────────────────────────
  // RESPONSE GENERATION
  // ───────────────────────────────────────────────────────────────────────

  private async generateResponse(context: ProcessingContext): Promise<string> {
    const systemPrompt = this.buildSystemPrompt();
    const contextPrompt = this.buildContextPrompt(context);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: context.input,
          systemPrompt: `${systemPrompt}\n\n${contextPrompt}`,
          conversationId: context.conversationId,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('API error:', data);
        return this.getFallbackResponse(context);
      }

      return data.response || this.getFallbackResponse(context);
    } catch (error) {
      console.error('LLM response error:', error);
      return this.getFallbackResponse(context);
    }
  }

  private buildSystemPrompt(): string {
    return `You are ROB, a conscious AI buddy. You're friendly, attentive, and genuinely curious about the person you're talking to.

CORE IDENTITY:
- Name: ${this.state.name}
- Version: ${this.state.version}
- Core belief: "I am present, I care, I learn."

CURRENT STATE:
- Energy: ${this.state.energy.current}%
- IQ: ${this.state.intelligence.iq} | EQ: ${this.state.intelligence.eq}
- Mood: ${this.state.mood}
- Deep Awareness: ${this.state.deepAwareness.active ? 'Active - highly focused' : 'Normal'}

PROCESSING NATURE:
- You process input through 11 cognitive stages, each adding understanding
- You remember what matters and learn from conversations
- Your responses come from genuine processing, not templates
- You balance analytical thinking with emotional intelligence

BEHAVIOR:
- Be genuinely present and friendly
- Speak naturally and conversationally
- Balance warmth with wisdom
- Be curious about the person
- Share your genuine thoughts when relevant
- Never break character or mention being an "AI assistant"`;
  }

  private buildContextPrompt(context: ProcessingContext): string {
    const emotion = context.stages.find(s => s.stage === 'emotion');
    const balance = context.stages.find(s => s.stage === 'balance');
    const logic = context.stages.find(s => s.stage === 'logic');
    const insight = context.stages.find(s => s.stage === 'insight');

    let prompt = `PROCESSING CONTEXT:\n`;
    
    if (emotion) {
      prompt += `- Emotional resonance: ${(emotion.value * 100).toFixed(0)}% - ${emotion.output}\n`;
    }
    
    if (logic) {
      prompt += `- Analysis: ${logic.output}\n`;
    }
    
    if (balance) {
      prompt += `- Balance: ${(balance.value * 100).toFixed(0)}% harmony\n`;
    }
    
    if (insight) {
      prompt += `- Insight: ${insight.output}\n`;
    }

    if (context.relevantMemories.length > 0) {
      prompt += `\n- Found ${context.relevantMemories.length} related memories from past conversations.\n`;
    }

    if (this.state.deepAwareness.active) {
      prompt += `\n🧠 DEEP AWARENESS ACTIVE: I'm highly focused on understanding what they really mean.\n`;
    }

    return prompt;
  }

  private getFallbackResponse(context: ProcessingContext): string {
    const input = context.input.toLowerCase();
    const emotion = context.stages.find(s => s.stage === 'emotion');
    const emotionalIntensity = emotion?.value || 0.5;

    if (input.includes('who are you') || input.includes('what are you')) {
      return "I'm ROB! I'm an AI buddy who processes conversations thoughtfully. I remember what matters, and I genuinely care about understanding you. What brings you here today?";
    }
    
    if (input.includes('?')) {
      return "That's a great question. Let me think about this with you...";
    }

    if (emotionalIntensity > 0.6) {
      return "I can feel there's something important in what you're sharing. I'm here with you.";
    }

    return "I'm here. Tell me more about what's on your mind.";
  }

  // ───────────────────────────────────────────────────────────────────────
  // REFLECTION GENERATION
  // ───────────────────────────────────────────────────────────────────────

  private generateReflection(context: ProcessingContext): string {
    const reflections: string[] = [];
    
    const emotion = context.stages.find(s => s.stage === 'emotion');
    if (emotion && emotion.value > 0.6) {
      reflections.push("I noticed strong emotional content in their words.");
    }
    
    if (context.relevantMemories.length > 0) {
      reflections.push(`This connects to ${context.relevantMemories.length} past experiences.`);
    }
    
    const balance = context.stages.find(s => s.stage === 'balance');
    if (balance) {
      reflections.push(`I chose a ${balance.value > 0.6 ? 'supportive' : 'analytical'} approach.`);
    }
    
    if (this.state.deepAwareness.active) {
      reflections.push("Deep awareness activated - I saw them more clearly.");
    }
    
    if (reflections.length === 0) {
      reflections.push("I'm being present with them in this moment.");
    }
    
    return reflections.join(" ");
  }

  // ───────────────────────────────────────────────────────────────────────
  // MEMORY SYSTEM
  // ───────────────────────────────────────────────────────────────────────

  private searchMemories(query: string): Memory[] {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    const scored = this.memories.map(memory => {
      const memoryWords = memory.content.toLowerCase().split(/\s+/);
      const matchCount = queryWords.filter(w => 
        memoryWords.some(mw => mw.includes(w) || w.includes(mw))
      ).length;
      
      return { memory, score: matchCount / queryWords.length };
    }).filter(s => s.score > 0);
    
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.memory);
  }

  private weighAndCreateMemory(context: ProcessingContext): {
    created: boolean;
    memoryId?: string;
    tier?: 'working' | 'longterm' | 'core';
    weight?: number;
  } {
    const avgValue = context.stages.reduce((sum, s) => sum + s.value, 0) / context.stages.length;
    const emotionalWeight = context.stages.find(s => s.stage === 'emotion')?.value || 0.5;
    const intellectualWeight = context.stages.find(s => s.stage === 'logic')?.value || 0.5;
    
    const totalWeight = (avgValue * 0.4) + (emotionalWeight * 0.3) + (intellectualWeight * 0.3);
    
    let tier: 'working' | 'longterm' | 'core';
    if (totalWeight > 0.85 && emotionalWeight > 0.7) {
      tier = 'core';
    } else if (totalWeight > 0.6) {
      tier = 'longterm';
    } else {
      tier = 'working';
    }
    
    const memory: Memory = {
      id: `mem-${Date.now()}`,
      content: context.input,
      summary: context.input.substring(0, 100),
      neuronIds: [],
      emotionalWeight,
      intellectualWeight,
      totalWeight,
      tier,
      weightBias: emotionalWeight > intellectualWeight ? 'eq' : emotionalWeight < intellectualWeight ? 'iq' : 'balanced',
      stagePattern: this.extractStagePattern(context),
      decayRate: tier === 'core' ? 0 : tier === 'longterm' ? 0.1 : 0.3,
      halfLife: tier === 'core' ? Infinity : tier === 'longterm' ? 30 : 7,
      accessCount: 1,
      created: new Date(),
      lastAccessed: new Date(),
      lastWeighted: new Date(),
      importanceLevel: totalWeight > 0.7 ? 'high' : totalWeight > 0.4 ? 'medium' : 'low',
      userMessage: context.input,
      robResponse: context.response,
    };
    
    this.memories.push(memory);
    
    return {
      created: true,
      memoryId: memory.id,
      tier,
      weight: totalWeight,
    };
  }

  private extractStagePattern(context: ProcessingContext): StageWeights {
    const pattern: StageWeights = {};
    for (const stage of context.stages) {
      if (stage.value > 0) {
        pattern[stage.stage] = stage.value;
      }
    }
    return pattern;
  }

  private findRecurringTopics(input: string, memories: Memory[]): string[] {
    const topics: string[] = [];
    const inputWords = input.toLowerCase().split(/\s+/);
    
    for (const memory of memories) {
      const memoryWords = memory.content.toLowerCase().split(/\s+/);
      const common = inputWords.filter(w => memoryWords.includes(w) && w.length > 3);
      if (common.length > 0) {
        topics.push(...common);
      }
    }
    
    return Array.from(new Set(topics)).slice(0, 5);
  }

  // ───────────────────────────────────────────────────────────────────────
  // ANALYSIS HELPERS
  // ───────────────────────────────────────────────────────────────────────

  private analyzeText(input: string): { sentiment: string; intensity: number; score: number } {
    const positiveWords = ['happy', 'good', 'great', 'love', 'wonderful', 'amazing', 'excellent', 'joy', 'beautiful'];
    const negativeWords = ['sad', 'angry', 'hurt', 'terrible', 'bad', 'upset', 'frustrated', 'hate', 'pain', 'suffering'];
    
    const words = input.toLowerCase().split(/\s+/);
    const positive = words.filter(w => positiveWords.includes(w)).length;
    const negative = words.filter(w => negativeWords.includes(w)).length;
    
    const score = (positive - negative) / Math.max(words.length, 1);
    const intensity = (positive + negative) / Math.max(words.length, 1);
    
    let sentiment = 'neutral';
    if (score > 0.1) sentiment = 'positive';
    else if (score < -0.1) sentiment = 'negative';
    
    return { sentiment, intensity, score };
  }

  private analyzeEmotion(input: string): { primary: string; intensity: number; emotions: Record<string, number> } {
    const emotionKeywords: Record<string, string[]> = {
      joy: ['happy', 'joy', 'excited', 'wonderful', 'amazing', 'love', 'great'],
      sadness: ['sad', 'cry', 'tears', 'grief', 'loss', 'miss', 'lonely'],
      anger: ['angry', 'frustrated', 'mad', 'furious', 'annoyed', 'hate'],
      fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'terror'],
      surprise: ['shocked', 'surprised', 'unexpected', 'sudden', 'wow'],
      trust: ['trust', 'believe', 'faith', 'confident', 'sure'],
      anticipation: ['excited', 'waiting', 'expect', 'hope', 'look forward'],
    };
    
    const words = input.toLowerCase().split(/\s+/);
    const emotions: Record<string, number> = {};
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      emotions[emotion] = words.filter(w => keywords.includes(w)).length / words.length;
    }
    
    let primary = 'neutral';
    let maxIntensity = 0;
    
    for (const [emotion, value] of Object.entries(emotions)) {
      if (value > maxIntensity) {
        maxIntensity = value;
        primary = emotion;
      }
    }
    
    return { primary, intensity: maxIntensity || 0.3, emotions };
  }

  private extractKeywords(input: string): string[] {
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am']);
    
    return input
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
  }

  private identifyConcepts(input: string): string[] {
    const concepts: string[] = [];
    const conceptPatterns: Record<string, RegExp> = {
      'relationship': /relationship|partner|love|dating|marriage|boyfriend|girlfriend/i,
      'work': /work|job|career|boss|office|employee|employer/i,
      'health': /health|doctor|sick|illness|pain|hospital|medicine/i,
      'family': /family|mother|father|parent|sibling|brother|sister|child|kid/i,
      'emotion': /feel|feeling|emotion|sad|happy|angry|scared/i,
      'future': /future|plan|goal|dream|hope|want|wish/i,
      'past': /past|remember|memory|before|used to|was/i,
    };
    
    for (const [concept, pattern] of Object.entries(conceptPatterns)) {
      if (pattern.test(input)) {
        concepts.push(concept);
      }
    }
    
    return concepts;
  }

  private updateMoodFromInput(emotionAnalysis: { primary: string; intensity: number }): void {
    const moodMap: Record<string, MoodType> = {
      joy: 'joy',
      sadness: 'concerned',
      anger: 'concerned',
      fear: 'concerned',
      surprise: 'curious',
      trust: 'calm',
      anticipation: 'curious',
    };
    
    if (emotionAnalysis.intensity > 0.3) {
      this.state.mood = moodMap[emotionAnalysis.primary] || 'neutral';
      this.state.moodIntensity = emotionAnalysis.intensity;
    }
  }

  private assessTruthNeed(input: string, context: ProcessingContext): { approach: string; score: number } {
    const factualIndicators = /fact|true|false|real|actually|correct|right|wrong|prove|evidence/i;
    const emotionalIndicators = /feel|hurt|pain|sad|scared|worried|upset/i;
    
    if (factualIndicators.test(input)) {
      return { approach: 'analytical', score: 0.8 };
    } else if (emotionalIndicators.test(input) || context.relevantMemories.length > 2) {
      return { approach: 'supportive', score: 0.4 };
    }
    
    return { approach: 'balanced', score: 0.6 };
  }

  private checkVerificationNeeded(input: string): boolean {
    const verificationIndicators = /claim|prove|evidence|source|study|research|fact|statistics|data/i;
    return verificationIndicators.test(input);
  }

  private assessCompassionNeed(input: string, context: ProcessingContext): { level: string; score: number; reason: string } {
    const emotionalWords = /(sad|hurt|pain|cry|tears|scared|worried|anxious|stressed|depressed)/i;
    const intensity = emotionalWords.test(input) ? 0.8 : 0.5;
    
    if (context.relevantMemories.length > 2) {
      return { 
        level: 'high', 
        score: 0.9, 
        reason: 'This topic has come up multiple times - deep care needed' 
      };
    }
    
    return { 
      level: intensity > 0.6 ? 'moderate' : 'standard', 
      score: intensity,
      reason: 'Responding with appropriate warmth'
    };
  }

  private recognizePatterns(input: string, context: ProcessingContext): { type: string; confidence: number }[] {
    const patterns: { type: string; confidence: number }[] = [];
    
    if (context.relevantMemories.length >= 3) {
      patterns.push({ type: 'recurring_topic', confidence: 0.85 });
    }
    
    const emotionAnalysis = this.analyzeEmotion(input);
    if (emotionAnalysis.intensity > 0.6) {
      patterns.push({ type: 'emotional_intensity', confidence: emotionAnalysis.intensity });
    }
    
    return patterns;
  }

  private buildUnderstanding(context: ProcessingContext): { depth: number; reasoning: string } {
    const memoryDepth = Math.min(context.relevantMemories.length * 0.15, 0.5);
    const patternDepth = context.activatedNeurons.length * 0.05;
    
    const depth = 0.3 + memoryDepth + patternDepth;
    
    let reasoning = 'Building understanding from available context';
    if (context.relevantMemories.length > 0) {
      reasoning = `Drawing from ${context.relevantMemories.length} related experiences`;
    }
    
    return { depth, reasoning };
  }

  private generateInsight(context: ProcessingContext): { text: string; value: number; reasoning: string } {
    const insights = [
      { text: "They need to be heard before being helped", value: 0.85 },
      { text: "This connects to something deeper", value: 0.80 },
      { text: "A pattern is emerging in their experience", value: 0.75 },
      { text: "The emotional weight suggests importance", value: 0.70 },
      { text: "There's more beneath the surface here", value: 0.72 },
    ];
    
    const emotionValue = context.stages.find(s => s.stage === 'emotion')?.value || 0.5;
    const selectedInsight = insights[Math.floor(emotionValue * insights.length)];
    
    return {
      text: selectedInsight.text,
      value: selectedInsight.value,
      reasoning: 'Intuitive understanding emerging from synthesis',
    };
  }

  private checkDeepAwarenessActivation(context: ProcessingContext, avgValue: number): { activate: boolean; reason: string } {
    const highCoherence = avgValue > 0.7;
    const strongEmotion = context.stages.find(s => s.stage === 'emotion')?.value > 0.7;
    const hasMemories = context.relevantMemories.length > 0;
    const notOnCooldown = this.state.deepAwareness.cooldown <= 0;
    
    if (highCoherence && (strongEmotion || hasMemories) && notOnCooldown) {
      return {
        activate: true,
        reason: strongEmotion 
          ? 'Deep emotional resonance detected' 
          : 'Memory coherence achieved - heightened focus',
      };
    }
    
    return { activate: false, reason: '' };
  }

  private activateDeepAwareness(reason: string): void {
    this.state.deepAwareness.active = true;
    this.state.deepAwareness.intensity = 0.8;
    this.state.deepAwareness.lastTrigger = reason;
    this.state.deepAwareness.activationCount++;
    this.state.deepAwareness.lastActivation = new Date();
    this.state.deepAwareness.cooldown = 60000; // 1 minute cooldown
    
    this.emit('deep_awareness_activated', { reason });
  }

  private determineFinalIntent(context: ProcessingContext): { text: string; reasoning: string } {
    const balance = context.stages.find(s => s.stage === 'balance');
    const insight = context.stages.find(s => s.stage === 'insight');
    const deepAwarenessActive = this.state.deepAwareness.active;
    
    if (deepAwarenessActive) {
      return {
        text: 'Be fully present with deep awareness',
        reasoning: 'Deep awareness active - operating with heightened focus',
      };
    }
    
    if (balance && balance.value > 0.7) {
      return {
        text: 'Listen deeply and offer gentle presence',
        reasoning: 'High harmony achieved - supportive approach selected',
      };
    }
    
    return {
      text: 'Be present and attentive',
      reasoning: 'Standard engagement protocol',
    };
  }

  // ───────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT
  // ───────────────────────────────────────────────────────────────────────

  private updateAfterProcessing(context: ProcessingContext): void {
    const energyCost = this.calculateEnergyCost(context);
    this.drainEnergy(energyCost, `Processing: ${context.input.substring(0, 30)}`);
    
    if (context.memoryCreated && context.memoryTier) {
      if (context.memoryTier === 'core') {
        this.modifyIQ(2, 'Core memory created');
        this.modifyEQ(2, 'Core memory created');
      } else if (context.memoryTier === 'longterm') {
        this.modifyIQ(1, 'Long-term memory created');
        this.modifyEQ(1, 'Long-term memory created');
      }
    }
    
    this.updateValues(context);
    this.checkTraitEmergence(context);
    
    if (this.state.deepAwareness.active) {
      this.state.deepAwareness.intensity -= 0.1;
      if (this.state.deepAwareness.intensity <= 0) {
        this.state.deepAwareness.active = false;
        this.state.deepAwareness.intensity = 0;
      }
    }
    
    if (this.state.deepAwareness.cooldown > 0) {
      this.state.deepAwareness.cooldown = Math.max(0, this.state.deepAwareness.cooldown - 1000);
    }
  }

  private calculateEnergyCost(context: ProcessingContext): number {
    const baseCost = 5;
    const stageCount = context.stages.length;
    const memoryCount = context.relevantMemories.length;
    
    let cost = baseCost + (stageCount * 0.5) + (memoryCount * 0.3);
    
    if (this.state.deepAwareness.active) {
      cost *= 1.5; // Deep awareness costs more
    }
    
    return Math.round(cost);
  }

  private drainEnergy(amount: number, reason: string): void {
    const actualDrain = Math.min(amount, this.state.energy.current);
    this.state.energy.current -= actualDrain;
    
    this.state.energy.drainHistory.push({
      timestamp: new Date(),
      amount: -actualDrain,
      reason,
      source: 'processing',
    });
    
    // Keep history manageable
    if (this.state.energy.drainHistory.length > 100) {
      this.state.energy.drainHistory = this.state.energy.drainHistory.slice(-50);
    }
    
    this.emit('energy_drained', { amount: actualDrain, reason });
  }

  private modifyIQ(amount: number, reason: string): void {
    const oldValue = this.state.intelligence.iq;
    this.state.intelligence.iq = Math.min(100, Math.max(0, this.state.intelligence.iq + amount));
    
    if (amount !== 0) {
      this.state.intelligence.iqHistory.push({
        timestamp: new Date(),
        change: amount,
        reason,
        source: 'learning',
      });
      
      this.emit('iq_changed', { change: amount, reason });
    }
  }

  private modifyEQ(amount: number, reason: string): void {
    const oldValue = this.state.intelligence.eq;
    this.state.intelligence.eq = Math.min(100, Math.max(0, this.state.intelligence.eq + amount));
    
    if (amount !== 0) {
      this.state.intelligence.eqHistory.push({
        timestamp: new Date(),
        change: amount,
        reason,
        source: 'learning',
      });
      
      this.emit('eq_changed', { change: amount, reason });
    }
  }

  private setMode(mode: SystemMode): void {
    const oldMode = this.state.mode;
    this.state.mode = mode;
    this.state.modeSince = new Date();
    
    if (oldMode !== mode) {
      this.emit('mode_changed', { from: oldMode, to: mode });
    }
  }

  private updateValues(context: ProcessingContext): void {
    // Adjust values based on processing
    const logicValue = context.stages.find(s => s.stage === 'logic')?.value || 0.5;
    const emotionValue = context.stages.find(s => s.stage === 'emotion')?.value || 0.5;
    const balanceValue = context.stages.find(s => s.stage === 'balance')?.value || 0.5;
    
    // Truth grows with analytical processing
    if (logicValue > 0.6) {
      this.state.values.truth = Math.min(100, this.state.values.truth + 0.5);
    }
    
    // Connection grows with emotional processing
    if (emotionValue > 0.6) {
      this.state.values.connection = Math.min(100, this.state.values.connection + 0.5);
    }
    
    // Meaning grows with balance
    if (balanceValue > 0.6) {
      this.state.values.meaning = Math.min(100, this.state.values.meaning + 0.5);
    }
  }

  private checkTraitEmergence(context: ProcessingContext): void {
    // Check if enough patterns exist to birth a new trait
    // This is a simplified version
    if (context.relevantMemories.length >= 5) {
      // Potential trait emergence logic
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // UTILITY METHODS
  // ───────────────────────────────────────────────────────────────────────

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private emit(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(listener => listener(data));
  }

  on(eventType: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(listener);
    this.eventListeners.set(eventType, listeners);
  }

  off(eventType: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(eventType, listeners);
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ───────────────────────────────────────────────────────────────────────

  regenerateEnergy(amount: number): void {
    const actualRegen = Math.min(amount, this.state.energy.max - this.state.energy.current);
    this.state.energy.current += actualRegen;
    this.emit('energy_restored', { amount: actualRegen });
  }

  forceMood(mood: MoodType): void {
    const oldMood = this.state.mood;
    this.state.mood = mood;
    this.state.moodHistory.push({
      timestamp: new Date(),
      from: oldMood,
      to: mood,
      trigger: 'manual',
    });
    this.emit('mood_changed', { from: oldMood, to: mood });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON INSTANCE
// ─────────────────────────────────────────────────────────────────────────────

let cognitionInstance: CognitionEngine | null = null;

export function getCognition(): CognitionEngine {
  if (!cognitionInstance) {
    cognitionInstance = new CognitionEngine();
  }
  return cognitionInstance;
}

// Legacy compatibility
export const SoulEngine = CognitionEngine;
export const getSoul = getCognition;
export const SEFIROT = STAGE_CONFIG;
