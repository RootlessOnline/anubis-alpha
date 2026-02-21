// ============================================
// ROB - Neural Network Core
// The knowledge graph that powers understanding
// ============================================

import {
  NeuralNode,
  NeuralConnection,
  KnowledgeGap,
  RelationshipType,
  GapStatus
} from './types';
import * as fs from 'fs';
import * as path from 'path';

const NEURAL_NET_PATH = '/home/z/my-project/rob/data/memory/neural_network.json';
const GAPS_PATH = '/home/z/my-project/rob/data/memory/knowledge_gaps.json';

export class NeuralNetwork {
  private nodes: Map<string, NeuralNode> = new Map();
  private gaps: Map<string, KnowledgeGap> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.load();
  }

  // ------------------
  // INITIALIZATION
  // ------------------

  private load(): void {
    try {
      // Load neural network
      if (fs.existsSync(NEURAL_NET_PATH)) {
        const data = JSON.parse(fs.readFileSync(NEURAL_NET_PATH, 'utf-8'));
        if (data.nodes) {
          this.nodes = new Map(Object.entries(data.nodes));
        }
      }

      // Load knowledge gaps
      if (fs.existsSync(GAPS_PATH)) {
        const data = JSON.parse(fs.readFileSync(GAPS_PATH, 'utf-8'));
        if (data.gaps) {
          this.gaps = new Map(Object.entries(data.gaps));
        }
      }

      this.initialized = true;
      console.log(`[NeuralNet] Loaded ${this.nodes.size} nodes and ${this.gaps.size} gaps`);
    } catch (error) {
      console.error('[NeuralNet] Failed to load:', error);
      this.initialized = true;
    }
  }

  save(): void {
    try {
      const dir = path.dirname(NEURAL_NET_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Save neural network
      const nodesObj = Object.fromEntries(this.nodes);
      fs.writeFileSync(NEURAL_NET_PATH, JSON.stringify(nodesObj, null, 2));

      // Save gaps
      const gapsObj = Object.fromEntries(this.gaps);
      fs.writeFileSync(GAPS_PATH, JSON.stringify(gapsObj, null, 2));

      console.log(`[NeuralNet] Saved ${this.nodes.size} nodes and ${this.gaps.size} gaps`);
    } catch (error) {
      console.error('[NeuralNet] Failed to save:', error);
    }
  }

  // ------------------
  // NODE MANAGEMENT
  // ------------------

  addNode(node: Omit<NeuralNode, 'id' | 'createdAt' | 'lastAccessed' | 'accessCount'>): NeuralNode {
    const id = this.generateId(node.concept);

    // Check if node already exists
    const existing = this.nodes.get(id);
    if (existing) {
      // Update existing node
      existing.confidence = Math.min(100, existing.confidence + node.confidence * 0.1);
      existing.sources = [...new Set([...existing.sources, ...node.sources])];
      existing.sourceCount = existing.sources.length;
      existing.lastAccessed = new Date();
      existing.accessCount++;
      return existing;
    }

    const newNode: NeuralNode = {
      ...node,
      id,
      createdAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 1,
    };

    this.nodes.set(id, newNode);
    console.log(`[NeuralNet] Added node: ${node.concept} (confidence: ${node.confidence})`);
    return newNode;
  }

  getNode(concept: string): NeuralNode | undefined {
    const id = this.generateId(concept);
    const node = this.nodes.get(id);
    if (node) {
      node.lastAccessed = new Date();
      node.accessCount++;
    }
    return node;
  }

  getNodeById(id: string): NeuralNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): NeuralNode[] {
    return Array.from(this.nodes.values());
  }

  getNodesByDomain(domain: string): NeuralNode[] {
    return this.getAllNodes().filter(node => node.domain === domain);
  }

  getNodesByConfidence(min: number, max: number = 100): NeuralNode[] {
    return this.getAllNodes().filter(node =>
      node.confidence >= min && node.confidence <= max
    );
  }

  // ------------------
  // CONNECTIONS
  // ------------------

  connect(
    conceptA: string,
    conceptB: string,
    relationshipType: RelationshipType,
    strength: number = 50,
    evidence: string[] = []
  ): boolean {
    const nodeA = this.getNode(conceptA);
    const nodeB = this.getNode(conceptB);

    if (!nodeA || !nodeB) {
      console.warn(`[NeuralNet] Cannot connect: one or both nodes missing`);
      return false;
    }

    // Add connection from A to B
    const existingConnectionA = nodeA.connections.find(c => c.targetId === nodeB.id);
    if (existingConnectionA) {
      existingConnectionA.strength = Math.min(100, existingConnectionA.strength + strength * 0.1);
      existingConnectionA.evidence = [...new Set([...existingConnectionA.evidence, ...evidence])];
    } else {
      nodeA.connections.push({
        targetId: nodeB.id,
        relationshipType,
        strength,
        evidence,
      });
    }

    // Add reverse connection (bidirectional awareness)
    const reverseType = this.getReverseRelationship(relationshipType);
    const existingConnectionB = nodeB.connections.find(c => c.targetId === nodeA.id);
    if (existingConnectionB) {
      existingConnectionB.strength = Math.min(100, existingConnectionB.strength + strength * 0.1);
    } else {
      nodeB.connections.push({
        targetId: nodeA.id,
        relationshipType: reverseType,
        strength: strength * 0.8, // Slightly weaker for reverse
        evidence,
      });
    }

    console.log(`[NeuralNet] Connected: ${conceptA} --[${relationshipType}]--> ${conceptB}`);
    return true;
  }

  private getReverseRelationship(type: RelationshipType): RelationshipType {
    const reverseMap: Record<RelationshipType, RelationshipType> = {
      'is_a': 'contains',
      'part_of': 'contains',
      'contains': 'part_of',
      'relates_to': 'relates_to',
      'causes': 'is_caused_by' as RelationshipType,
      'opposes': 'opposes',
      'requires': 'produces',
      'produces': 'requires',
      'analogous_to': 'analogous_to',
      'precedes': 'is_preceded_by' as RelationshipType,
      'references': 'is_referenced_by' as RelationshipType,
    };
    return reverseMap[type] || 'relates_to';
  }

  getConnections(concept: string): NeuralConnection[] {
    const node = this.getNode(concept);
    return node?.connections || [];
  }

  getConnectedNodes(concept: string, maxDepth: number = 2): Map<string, { node: NeuralNode; depth: number; path: string[] }> {
    const result = new Map<string, { node: NeuralNode; depth: number; path: string[] }>();
    const startNode = this.getNode(concept);

    if (!startNode) return result;

    const queue: { nodeId: string; depth: number; path: string[] }[] = [
      { nodeId: startNode.id, depth: 0, path: [concept] }
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { nodeId, depth, path } = queue.shift()!;

      if (visited.has(nodeId) || depth > maxDepth) continue;
      visited.add(nodeId);

      const node = this.getNodeById(nodeId);
      if (node && !result.has(nodeId)) {
        result.set(nodeId, { node, depth, path });
      }

      if (node && depth < maxDepth) {
        for (const conn of node.connections) {
          if (!visited.has(conn.targetId)) {
            const targetNode = this.getNodeById(conn.targetId);
            if (targetNode) {
              queue.push({
                nodeId: conn.targetId,
                depth: depth + 1,
                path: [...path, targetNode.concept],
              });
            }
          }
        }
      }
    }

    return result;
  }

  // ------------------
  // KNOWLEDGE QUERIES
  // ------------------

  query(query: string): {
    relevantNodes: NeuralNode[];
    confidence: number;
    gaps: KnowledgeGap[];
    suggestions: string[];
  } {
    const keywords = this.extractKeywords(query);
    const relevantNodes: NeuralNode[] = [];
    let totalConfidence = 0;

    // Find nodes matching keywords
    for (const node of this.getAllNodes()) {
      const matches = keywords.filter(kw =>
        node.concept.toLowerCase().includes(kw.toLowerCase()) ||
        node.description.toLowerCase().includes(kw.toLowerCase()) ||
        node.tags.some(t => t.toLowerCase().includes(kw.toLowerCase()))
      );

      if (matches.length > 0) {
        relevantNodes.push(node);
        totalConfidence += node.confidence * (matches.length / keywords.length);
      }
    }

    // Find gaps related to the query
    const gaps = this.findGapsForQuery(keywords, relevantNodes);

    // Generate suggestions
    const suggestions = this.generateSuggestions(relevantNodes, gaps);

    const avgConfidence = relevantNodes.length > 0
      ? totalConfidence / relevantNodes.length
      : 0;

    return {
      relevantNodes,
      confidence: avgConfidence,
      gaps,
      suggestions,
    };
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - can be enhanced with NLP
    const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
      'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
      'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between',
      'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
      'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
      'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
      'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'about',
      'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'i', 'me',
      'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours'];

    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
  }

  private findGapsForQuery(keywords: string[], relevantNodes: NeuralNode[]): KnowledgeGap[] {
    const gaps: KnowledgeGap[] = [];

    // Check existing gaps
    for (const gap of this.gaps.values()) {
      if (gap.status !== 'open') continue;

      const matchesKeywords = keywords.some(kw =>
        gap.missingConcept.toLowerCase().includes(kw.toLowerCase()) ||
        gap.description.toLowerCase().includes(kw.toLowerCase())
      );

      if (matchesKeywords) {
        gaps.push(gap);
      }
    }

    // Find potential new gaps (nodes with low confidence or missing connections)
    for (const node of relevantNodes) {
      if (node.confidence < 50) {
        // Low confidence = knowledge gap
        gaps.push({
          id: `gap-${node.id}`,
          missingConcept: node.concept,
          description: `Low confidence understanding of ${node.concept}`,
          relatedTo: [node.id],
          importance: 100 - node.confidence,
          curiosityTriggered: node.curiosityLevel,
          suggestedSearch: `${node.concept} explained ${node.domain}`,
          detected: new Date(),
          status: 'open',
          domain: node.domain,
        });
      }

      // Check for missing connections between related concepts
      if (node.connections.length < 2 && node.sourceCount > 1) {
        gaps.push({
          id: `gap-conn-${node.id}`,
          missingConcept: `Connections for ${node.concept}`,
          description: `${node.concept} has few connections despite multiple sources`,
          relatedTo: [node.id, ...node.connections.map(c => c.targetId)],
          importance: 60,
          curiosityTriggered: 50,
          suggestedSearch: `how does ${node.concept} relate to other concepts`,
          detected: new Date(),
          status: 'open',
          domain: node.domain,
        });
      }
    }

    return gaps;
  }

  private generateSuggestions(nodes: NeuralNode[], gaps: KnowledgeGap[]): string[] {
    const suggestions: string[] = [];

    if (gaps.length > 0) {
      const topGap = gaps.sort((a, b) => b.importance - a.importance)[0];
      suggestions.push(`Research "${topGap.suggestedSearch}" to fill knowledge gap`);
    }

    if (nodes.some(n => n.confidence < 70)) {
      suggestions.push('Upload more sources to strengthen understanding');
    }

    if (nodes.length === 0) {
      suggestions.push('I don\'t have any knowledge about this topic yet. Upload related documents or provide a repository to learn from.');
    }

    return suggestions;
  }

  // ------------------
  // GAP MANAGEMENT
  // ------------------

  addGap(gap: Omit<KnowledgeGap, 'id' | 'detected'>): KnowledgeGap {
    const id = `gap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newGap: KnowledgeGap = {
      ...gap,
      id,
      detected: new Date(),
    };

    this.gaps.set(id, newGap);
    console.log(`[NeuralNet] Added gap: ${gap.missingConcept}`);
    return newGap;
  }

  resolveGap(gapId: string): boolean {
    const gap = this.gaps.get(gapId);
    if (gap) {
      gap.status = 'resolved';
      console.log(`[NeuralNet] Resolved gap: ${gap.missingConcept}`);
      return true;
    }
    return false;
  }

  getOpenGaps(): KnowledgeGap[] {
    return Array.from(this.gaps.values())
      .filter(g => g.status === 'open')
      .sort((a, b) => b.importance - a.importance);
  }

  getAllGaps(): KnowledgeGap[] {
    return Array.from(this.gaps.values());
  }

  // ------------------
  // STATISTICS
  // ------------------

  getStats(): {
    totalNodes: number;
    totalConnections: number;
    totalGaps: number;
    openGaps: number;
    avgConfidence: number;
    domains: Record<string, number>;
  } {
    const nodes = this.getAllNodes();
    const gaps = this.getAllGaps();

    const totalConnections = nodes.reduce((sum, n) => sum + n.connections.length, 0);
    const avgConfidence = nodes.length > 0
      ? nodes.reduce((sum, n) => sum + n.confidence, 0) / nodes.length
      : 0;

    const domains: Record<string, number> = {};
    for (const node of nodes) {
      domains[node.domain] = (domains[node.domain] || 0) + 1;
    }

    return {
      totalNodes: nodes.length,
      totalConnections,
      totalGaps: gaps.length,
      openGaps: gaps.filter(g => g.status === 'open').length,
      avgConfidence,
      domains,
    };
  }

  // ------------------
  // UTILITIES
  // ------------------

  private generateId(concept: string): string {
    return concept
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  exportForVisualization(): {
    nodes: Array<{ id: string; label: string; confidence: number; domain: string }>;
    edges: Array<{ source: string; target: string; type: RelationshipType; strength: number }>;
    gaps: Array<{ id: string; concept: string; importance: number }>;
  } {
    const nodes = this.getAllNodes().map(n => ({
      id: n.id,
      label: n.concept,
      confidence: n.confidence,
      domain: n.domain,
    }));

    const edges: Array<{ source: string; target: string; type: RelationshipType; strength: number }> = [];
    const addedEdges = new Set<string>();

    for (const node of this.getAllNodes()) {
      for (const conn of node.connections) {
        const edgeKey = [node.id, conn.targetId].sort().join('-');
        if (!addedEdges.has(edgeKey)) {
          edges.push({
            source: node.id,
            target: conn.targetId,
            type: conn.relationshipType,
            strength: conn.strength,
          });
          addedEdges.add(edgeKey);
        }
      }
    }

    const gaps = this.getOpenGaps().map(g => ({
      id: g.id,
      concept: g.missingConcept,
      importance: g.importance,
    }));

    return { nodes, edges, gaps };
  }
}

// Singleton instance
let neuralNetInstance: NeuralNetwork | null = null;

export function getNeuralNet(): NeuralNetwork {
  if (!neuralNetInstance) {
    neuralNetInstance = new NeuralNetwork();
  }
  return neuralNetInstance;
}
