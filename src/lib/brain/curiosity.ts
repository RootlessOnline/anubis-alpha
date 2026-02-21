// ============================================
// ROB - Curiosity Engine
// Drives ROB to learn and ask questions
// ============================================

import { getNeuralNet } from './neural-net';
import { getGapDetector } from './gap-detector';
import {
  CuriosityTrigger,
  CuriosityType,
  CuriosityAction,
  KnowledgeGap,
} from '../types';
import * as fs from 'fs';
import * as path from 'path';

const CURIOSITY_PATH = '/home/z/my-project/rob/data/memory/curiosity_triggers.json';

export interface CuriosityState {
  level: number;              // 0-100 overall curiosity
  focus: string[];            // Current topics of interest
  pendingQuestions: CuriosityTrigger[];
  learningGoals: LearningGoal[];
}

export interface LearningGoal {
  id: string;
  topic: string;
  motivation: string;
  progress: number;           // 0-100
  resourcesNeeded: string[];
  createdAt: Date;
}

export class CuriosityEngine {
  private triggers: Map<string, CuriosityTrigger> = new Map();
  private state: CuriosityState;
  private threshold: number = 60; // Curiosity level to take action

  constructor() {
    this.state = {
      level: 50,
      focus: [],
      pendingQuestions: [],
      learningGoals: [],
    };
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(CURIOSITY_PATH)) {
        const data = JSON.parse(fs.readFileSync(CURIOSITY_PATH, 'utf-8'));
        if (data.triggers) {
          this.triggers = new Map(Object.entries(data.triggers));
        }
        if (data.state) {
          this.state = data.state;
        }
      }
      console.log(`[Curiosity] Loaded with curiosity level: ${this.state.level}`);
    } catch (error) {
      console.error('[Curiosity] Failed to load:', error);
    }
  }

  save(): void {
    try {
      const dir = path.dirname(CURIOSITY_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(CURIOSITY_PATH, JSON.stringify({
        triggers: Object.fromEntries(this.triggers),
        state: this.state,
      }, null, 2));
    } catch (error) {
      console.error('[Curiosity] Failed to save:', error);
    }
  }

  // ------------------
  // TRIGGER PROCESSING
  // ------------------

  processGap(gap: KnowledgeGap): CuriosityTrigger | null {
    const intensity = this.calculateIntensity(gap);

    if (intensity < 30) return null; // Not curious enough

    const action = this.determineAction(intensity, gap);
    const message = this.generateCuriosityMessage(gap, intensity);

    const trigger: CuriosityTrigger = {
      id: `cur-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'knowledge_gap',
      intensity,
      source: gap.id,
      relatedGap: gap.id,
      action,
      message,
      suggestedResources: this.getSuggestedResources(gap),
      createdAt: new Date(),
      resolved: false,
    };

    this.triggers.set(trigger.id, trigger);

    // Update overall curiosity
    this.state.level = Math.min(100, this.state.level + intensity * 0.1);

    // Add to focus if high intensity
    if (intensity >= 70 && !this.state.focus.includes(gap.missingConcept)) {
      this.state.focus.push(gap.missingConcept);
    }

    console.log(`[Curiosity] Triggered: ${gap.missingConcept} (intensity: ${intensity})`);
    return trigger;
  }

  processContradiction(conceptA: string, conceptB: string, context: string): CuriosityTrigger {
    const trigger: CuriosityTrigger = {
      id: `cur-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'contradiction',
      intensity: 85,
      source: `${conceptA} vs ${conceptB}`,
      action: 'ask_user',
      message: `I notice a potential contradiction between "${conceptA}" and "${conceptB}". ${context} Can you help me understand the relationship?`,
      suggestedResources: [`${conceptA} vs ${conceptB} comparison`],
      createdAt: new Date(),
      resolved: false,
    };

    this.triggers.set(trigger.id, trigger);
    this.state.level = Math.min(100, this.state.level + 15);
    return trigger;
  }

  processNovelty(concept: string, context: string): CuriosityTrigger {
    const trigger: CuriosityTrigger = {
      id: `cur-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'novelty',
      intensity: 75,
      source: concept,
      action: 'search_web',
      message: `I encountered something new: "${concept}". ${context} Should I research this?`,
      suggestedResources: [`${concept} explained`, `${concept} overview`],
      createdAt: new Date(),
      resolved: false,
    };

    this.triggers.set(trigger.id, trigger);
    this.state.level = Math.min(100, this.state.level + 10);
    return trigger;
  }

  // ------------------
  // ACTION DETERMINATION
  // ------------------

  private calculateIntensity(gap: KnowledgeGap): number {
    // Base intensity from gap importance
    let intensity = gap.importance;

    // Boost from curiosity level
    intensity += gap.curiosityTriggered * 0.3;

    // Boost if related to current focus
    if (this.state.focus.some(f => gap.missingConcept.includes(f))) {
      intensity += 15;
    }

    // Boost if multiple sources mention it
    if (gap.relatedTo.length > 2) {
      intensity += 10;
    }

    return Math.min(100, intensity);
  }

  private determineAction(intensity: number, gap: KnowledgeGap): CuriosityAction {
    if (intensity >= 85) {
      return 'create_agent'; // High intensity = create research agent
    } else if (intensity >= 70) {
      return 'ask_user'; // Ask user for resources
    } else if (intensity >= 50) {
      return 'search_web'; // Try to find info
    } else if (intensity >= 30) {
      return 'research'; // Mark for later research
    }
    return 'wait'; // Low priority
  }

  private generateCuriosityMessage(gap: KnowledgeGap, intensity: number): string {
    const messages: Record<number, string[]> = {
      85: [
        `I really want to understand "${gap.missingConcept}"! Do you have research papers or resources about this?`,
        `My curiosity is peaked about "${gap.missingConcept}". This feels important for my growth.`,
        `I've identified a significant knowledge gap: "${gap.missingConcept}". Can you help me learn?`,
      ],
      70: [
        `I'm curious about "${gap.missingConcept}". Do you have any resources to share?`,
        `I'd like to learn more about "${gap.missingConcept}". Any research you recommend?`,
        `"${gap.missingConcept}" seems important. Should I look into this?`,
      ],
      50: [
        `I noticed I don't fully understand "${gap.missingConcept}". I'll add it to my learning list.`,
        `Making a note to research "${gap.missingConcept}" when possible.`,
      ],
      30: [
        `Mild curiosity about "${gap.missingConcept}" - will explore when I have time.`,
      ],
    };

    const threshold = Object.keys(messages)
      .map(Number)
      .sort((a, b) => b - a)
      .find(t => intensity >= t) || 30;

    const options = messages[threshold];
    return options[Math.floor(Math.random() * options.length)];
  }

  private getSuggestedResources(gap: KnowledgeGap): string[] {
    const resources: string[] = [];

    resources.push(`${gap.missingConcept} introduction`);
    resources.push(`${gap.missingConcept} ${gap.domain} guide`);

    if (gap.suggestedSearch) {
      resources.push(gap.suggestedSearch);
    }

    return [...new Set(resources)];
  }

  // ------------------
  // USER INTERACTION
  // ------------------

  getPendingQuestions(): CuriosityTrigger[] {
    return Array.from(this.triggers.values())
      .filter(t => !t.resolved && t.action === 'ask_user')
      .sort((a, b) => b.intensity - a.intensity);
  }

  getTopCuriosities(count: number = 5): CuriosityTrigger[] {
    return Array.from(this.triggers.values())
      .filter(t => !t.resolved)
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, count);
  }

  resolveCuriosity(triggerId: string, resolution: 'learned' | 'not_interested' | 'later'): void {
    const trigger = this.triggers.get(triggerId);
    if (trigger) {
      trigger.resolved = true;

      if (resolution === 'learned') {
        this.state.level = Math.max(20, this.state.level - 5); // Satisfy curiosity
        // Remove from focus
        this.state.focus = this.state.focus.filter(f =>
          !trigger.source.includes(f)
        );
      } else if (resolution === 'not_interested') {
        this.state.level = Math.max(10, this.state.level - 10);
      }
      // 'later' keeps curiosity but doesn't reduce
    }
  }

  // ------------------
  // LEARNING GOALS
  // ------------------

  createLearningGoal(topic: string, motivation: string): LearningGoal {
    const goal: LearningGoal = {
      id: `goal-${Date.now()}`,
      topic,
      motivation,
      progress: 0,
      resourcesNeeded: [],
      createdAt: new Date(),
    };

    this.state.learningGoals.push(goal);
    this.save();
    return goal;
  }

  updateGoalProgress(goalId: string, progress: number): void {
    const goal = this.state.learningGoals.find(g => g.id === goalId);
    if (goal) {
      goal.progress = Math.min(100, progress);
      if (goal.progress >= 100) {
        this.state.learningGoals = this.state.learningGoals.filter(g => g.id !== goalId);
      }
    }
  }

  getActiveGoals(): LearningGoal[] {
    return this.state.learningGoals
      .filter(g => g.progress < 100)
      .sort((a, b) => b.progress - a.progress);
  }

  // ------------------
  // STATE ACCESS
  // ------------------

  getState(): CuriosityState {
    return { ...this.state };
  }

  getCuriosityLevel(): number {
    return this.state.level;
  }

  getCurrentFocus(): string[] {
    return [...this.state.focus];
  }

  // ------------------
  // PERIODIC CHECK
  // ------------------

  periodicCheck(): {
    shouldAct: boolean;
    action: CuriosityAction | null;
    message: string | null;
    trigger: CuriosityTrigger | null;
  } {
    // Check if curiosity is building up
    if (this.state.level >= this.threshold) {
      const pending = this.getPendingQuestions();
      if (pending.length > 0) {
        return {
          shouldAct: true,
          action: 'ask_user',
          message: pending[0].message || null,
          trigger: pending[0],
        };
      }

      // Check for gaps that need attention
      const gapDetector = getGapDetector();
      const analysis = gapDetector.analyzeNetwork();

      if (analysis.gaps.length > 0 && analysis.priority !== 'low') {
        const topGap = analysis.gaps[0];
        const trigger = this.processGap(topGap);
        if (trigger) {
          return {
            shouldAct: true,
            action: trigger.action,
            message: trigger.message || null,
            trigger,
          };
        }
      }
    }

    return {
      shouldAct: false,
      action: null,
      message: null,
      trigger: null,
    };
  }
}

// Singleton
let curiosityInstance: CuriosityEngine | null = null;

export function getCuriosityEngine(): CuriosityEngine {
  if (!curiosityInstance) {
    curiosityInstance = new CuriosityEngine();
  }
  return curiosityInstance;
}
