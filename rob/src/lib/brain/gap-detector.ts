// ============================================
// ROB - Gap Detector
// Finds missing knowledge in the neural network
// ============================================

import { NeuralNetwork, getNeuralNet } from './neural-net';
import { KnowledgeGap, NeuralNode, GapStatus } from '../types';

export interface GapAnalysisResult {
  gaps: KnowledgeGap[];
  criticalPath: string[];     // The learning path to fill gaps
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestedResources: string[];
}

export class GapDetector {
  private neuralNet: NeuralNetwork;

  constructor() {
    this.neuralNet = getNeuralNet();
  }

  // ------------------
  // MAIN DETECTION
  // ------------------

  analyzeForQuery(query: string): GapAnalysisResult {
    const queryResult = this.neuralNet.query(query);
    const gaps: KnowledgeGap[] = [];
    const criticalPath: string[] = [];
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check if we have any relevant knowledge
    if (queryResult.relevantNodes.length === 0) {
      // Complete knowledge gap
      const keywords = this.extractMainTopic(query);
      gaps.push(this.createGap({
        missingConcept: keywords,
        description: `No knowledge found for query: "${query}"`,
        relatedTo: [],
        importance: 100,
        curiosityTriggered: 90,
        suggestedSearch: `${keywords} introduction guide`,
        domain: 'unknown',
      }));
      priority = 'critical';
      criticalPath.push(keywords);
    } else {
      // Check confidence levels
      const lowConfidenceNodes = queryResult.relevantNodes.filter(n => n.confidence < 50);
      const mediumConfidenceNodes = queryResult.relevantNodes.filter(n => n.confidence >= 50 && n.confidence < 75);

      // Low confidence nodes = high importance gaps
      for (const node of lowConfidenceNodes) {
        gaps.push(this.createGap({
          missingConcept: node.concept,
          description: `Low confidence (${node.confidence}%) understanding of ${node.concept}`,
          relatedTo: [node.id, ...node.connections.map(c => c.targetId)],
          importance: 100 - node.confidence,
          curiosityTriggered: node.curiosityLevel,
          suggestedSearch: `${node.concept} detailed explanation ${node.domain}`,
          domain: node.domain,
        }));
        criticalPath.push(node.concept);
      }

      // Medium confidence = need reinforcement
      for (const node of mediumConfidenceNodes) {
        gaps.push(this.createGap({
          missingConcept: `${node.concept} (reinforcement)`,
          description: `Moderate confidence in ${node.concept} - could be strengthened`,
          relatedTo: [node.id],
          importance: 50,
          curiosityTriggered: 30,
          suggestedSearch: `${node.concept} advanced concepts`,
          domain: node.domain,
        }));
      }

      // Check for missing connections between found concepts
      const connectionGaps = this.findConnectionGaps(queryResult.relevantNodes);
      gaps.push(...connectionGaps);

      // Determine priority
      if (lowConfidenceNodes.length > 0) {
        priority = 'high';
      } else if (mediumConfidenceNodes.length > 0) {
        priority = 'medium';
      }
    }

    // Generate resource suggestions
    const suggestedResources = this.generateResourceSuggestions(gaps);

    return {
      gaps,
      criticalPath,
      priority,
      suggestedResources,
    };
  }

  analyzeNetwork(): GapAnalysisResult {
    const stats = this.neuralNet.getStats();
    const gaps: KnowledgeGap[] = [];

    // Check for domains with low coverage
    const lowCoverageDomains = Object.entries(stats.domains)
      .filter(([_, count]) => count < 5)
      .map(([domain, count]) => ({ domain, count }));

    for (const { domain, count } of lowCoverageDomains) {
      gaps.push(this.createGap({
        missingConcept: `More knowledge in ${domain}`,
        description: `Domain "${domain}" only has ${count} concepts`,
        relatedTo: [],
        importance: 70,
        curiosityTriggered: 60,
        suggestedSearch: `${domain} foundational concepts`,
        domain,
      }));
    }

    // Find nodes with no connections (orphan concepts)
    const allNodes = this.neuralNet.getAllNodes();
    const orphanNodes = allNodes.filter(n => n.connections.length === 0);

    for (const node of orphanNodes) {
      gaps.push(this.createGap({
        missingConcept: `Connections for ${node.concept}`,
        description: `${node.concept} has no connections to other concepts`,
        relatedTo: [node.id],
        importance: 50,
        curiosityTriggered: 40,
        suggestedSearch: `how does ${node.concept} relate to other concepts`,
        domain: node.domain,
      }));
    }

    // Find weak connections
    const weakConnections = allNodes.filter(n =>
      n.connections.some(c => c.strength < 30)
    );

    for (const node of weakConnections) {
      const weakConn = node.connections.find(c => c.strength < 30)!;
      const targetNode = this.neuralNet.getNodeById(weakConn.targetId);

      if (targetNode) {
        gaps.push(this.createGap({
          missingConcept: `Relationship: ${node.concept} ↔ ${targetNode.concept}`,
          description: `Weak connection (${weakConn.strength}%) between ${node.concept} and ${targetNode.concept}`,
          relatedTo: [node.id, targetNode.id],
          importance: 40,
          curiosityTriggered: 35,
          suggestedSearch: `${node.concept} and ${targetNode.concept} relationship`,
          domain: node.domain,
        }));
      }
    }

    return {
      gaps,
      criticalPath: gaps.slice(0, 3).map(g => g.missingConcept),
      priority: gaps.length > 10 ? 'high' : gaps.length > 5 ? 'medium' : 'low',
      suggestedResources: this.generateResourceSuggestions(gaps),
    };
  }

  // ------------------
  // CONNECTION GAP DETECTION
  // ------------------

  private findConnectionGaps(nodes: NeuralNode[]): KnowledgeGap[] {
    const gaps: KnowledgeGap[] = [];
    const nodeIds = new Set(nodes.map(n => n.id));

    // Check if related nodes should be connected but aren't
    for (const node of nodes) {
      const connectedIds = new Set(node.connections.map(c => c.targetId));

      for (const otherNode of nodes) {
        if (node.id === otherNode.id) continue;
        if (connectedIds.has(otherNode.id)) continue;

        // These nodes are both relevant but not connected
        // Check if they share domain or tags
        const sharedTags = node.tags.filter(t => otherNode.tags.includes(t));
        const sameDomain = node.domain === otherNode.domain;

        if (sharedTags.length > 0 || sameDomain) {
          gaps.push(this.createGap({
            missingConcept: `Connection: ${node.concept} → ${otherNode.concept}`,
            description: `Potential unexplored relationship between ${node.concept} and ${otherNode.concept}`,
            relatedTo: [node.id, otherNode.id],
            importance: 30,
            curiosityTriggered: 45,
            suggestedSearch: `relationship between ${node.concept} and ${otherNode.concept}`,
            domain: node.domain,
          }));
        }
      }
    }

    return gaps;
  }

  // ------------------
  // LEARNING PATH
  // ------------------

  generateLearningPath(gaps: KnowledgeGap[]): {
    immediate: KnowledgeGap[];
    shortTerm: KnowledgeGap[];
    longTerm: KnowledgeGap[];
  } {
    const sorted = [...gaps].sort((a, b) => b.importance - a.importance);

    return {
      immediate: sorted.filter(g => g.importance >= 70).slice(0, 3),
      shortTerm: sorted.filter(g => g.importance >= 40 && g.importance < 70).slice(0, 5),
      longTerm: sorted.filter(g => g.importance < 40),
    };
  }

  // ------------------
  // UTILITIES
  // ------------------

  private extractMainTopic(query: string): string {
    const words = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    return words.slice(0, 3).join(' ') || 'unknown topic';
  }

  private createGap(base: Omit<KnowledgeGap, 'id' | 'detected' | 'status'>): KnowledgeGap {
    return this.neuralNet.addGap(base);
  }

  private generateResourceSuggestions(gaps: KnowledgeGap[]): string[] {
    const suggestions: string[] = [];

    for (const gap of gaps.slice(0, 5)) {
      if (gap.importance >= 70) {
        suggestions.push(`Search: "${gap.suggestedSearch}"`);
        suggestions.push(`Upload: PDF or research about ${gap.missingConcept}`);
      }
    }

    // Remove duplicates
    return [...new Set(suggestions)];
  }

  // ------------------
  // GAP RESOLUTION
  // ------------------

  markGapResolved(gapId: string): boolean {
    return this.neuralNet.resolveGap(gapId);
  }

  startResearching(gapId: string): boolean {
    const gaps = this.neuralNet.getAllGaps();
    const gap = gaps.find(g => g.id === gapId);
    if (gap && gap.status === 'open') {
      gap.status = 'researching';
      return true;
    }
    return false;
  }
}

// Singleton
let gapDetectorInstance: GapDetector | null = null;

export function getGapDetector(): GapDetector {
  if (!gapDetectorInstance) {
    gapDetectorInstance = new GapDetector();
  }
  return gapDetectorInstance;
}
