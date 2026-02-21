// ============================================
// ROB - Agent Manager
// Creates and manages specialized AI agents
// ============================================

import {
  Agent,
  AgentType,
  AgentStatus,
  AgentTask,
  TaskType,
  TaskStatus,
  TaskInput,
  TaskResult,
  AgentTool,
} from '../types';
import { getNeuralNet } from '../brain/neural-net';
import { getGapDetector } from '../brain/gap-detector';
import { getCuriosityEngine } from '../brain/curiosity';
import * as fs from 'fs';
import * as path from 'path';

const AGENTS_DIR = '/home/z/my-project/rob/data/agents/instances';
const REGISTRY_PATH = '/home/z/my-project/rob/data/agents/agent_registry.json';

// Agent templates for different types
const AGENT_TEMPLATES: Record<AgentType, Partial<Agent>> = {
  researcher: {
    description: 'Deep dives into specific topics, gathering and synthesizing information',
    config: {
      temperature: 0.7,
      maxTokens: 4000,
      tools: ['web_search', 'memory_read', 'memory_write'],
    },
  },
  analyzer: {
    description: 'Processes documents and extracts structured information',
    config: {
      temperature: 0.3,
      maxTokens: 4000,
      tools: ['pdf_read', 'repo_read', 'memory_write'],
    },
  },
  connector: {
    description: 'Finds relationships and connections between concepts',
    config: {
      temperature: 0.5,
      maxTokens: 2000,
      tools: ['memory_read', 'memory_write'],
    },
  },
  summarizer: {
    description: 'Condenses information into concise summaries',
    config: {
      temperature: 0.3,
      maxTokens: 1000,
      tools: ['memory_read'],
    },
  },
  questioner: {
    description: 'Generates thought-provoking questions about topics',
    config: {
      temperature: 0.8,
      maxTokens: 1500,
      tools: ['memory_read'],
    },
  },
  teacher: {
    description: 'Explains concepts in accessible ways',
    config: {
      temperature: 0.6,
      maxTokens: 3000,
      tools: ['memory_read', 'web_search'],
    },
  },
  archivist: {
    description: 'Manages and organizes memory storage',
    config: {
      temperature: 0.2,
      maxTokens: 2000,
      tools: ['memory_read', 'memory_write'],
    },
  },
  repo_reader: {
    description: 'Reads and understands code repositories',
    config: {
      temperature: 0.3,
      maxTokens: 4000,
      tools: ['repo_read', 'memory_write'],
    },
  },
  custom: {
    description: 'Custom agent with user-defined behavior',
    config: {
      temperature: 0.5,
      maxTokens: 2000,
      tools: ['memory_read'],
    },
  },
};

export class AgentManager {
  private agents: Map<string, Agent> = new Map();
  private tasks: Map<string, AgentTask> = new Map();
  private neuralNet = getNeuralNet();
  private gapDetector = getGapDetector();
  private curiosity = getCuriosityEngine();

  constructor() {
    this.load();
  }

  // ------------------
  // INITIALIZATION
  // ------------------

  private load(): void {
    // Load registry
    if (fs.existsSync(REGISTRY_PATH)) {
      const data = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
      if (data.agents) {
        this.agents = new Map(Object.entries(data.agents));
      }
      if (data.tasks) {
        this.tasks = new Map(Object.entries(data.tasks));
      }
    }

    // Ensure directories exist
    if (!fs.existsSync(AGENTS_DIR)) {
      fs.mkdirSync(AGENTS_DIR, { recursive: true });
    }

    console.log(`[AgentManager] Loaded ${this.agents.size} agents, ${this.tasks.size} tasks`);
  }

  save(): void {
    const dir = path.dirname(REGISTRY_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(REGISTRY_PATH, JSON.stringify({
      agents: Object.fromEntries(this.agents),
      tasks: Object.fromEntries(this.tasks),
    }, null, 2));
  }

  // ------------------
  // AGENT CREATION
  // ------------------

  createAgent(
    type: AgentType,
    name: string,
    specialization: string,
    options?: {
      knowledgeAccess?: string[];
      customPrompt?: string;
      tools?: AgentTool[];
    }
  ): Agent {
    const template = AGENT_TEMPLATES[type];
    const id = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const agent: Agent = {
      id,
      name,
      type,
      specialization,
      description: template?.description || 'Custom agent',
      status: 'idle',
      energyLevel: 100,
      maxEnergy: 100,
      tasksCompleted: 0,
      knowledgeAccess: options?.knowledgeAccess || [],
      createdAt: new Date(),
      lastActiveAt: new Date(),
      config: {
        ...template?.config,
        systemPrompt: options?.customPrompt,
        tools: options?.tools || template?.config?.tools || ['memory_read'],
      },
      memory: {
        workingMemory: [],
        learnings: [],
        mistakes: [],
      },
    };

    this.agents.set(id, agent);
    this.save();

    console.log(`[AgentManager] Created agent: ${name} (${type})`);
    return agent;
  }

  // ------------------
  // QUICK CREATE METHODS
  // ------------------

  createResearchAgent(topic: string): Agent {
    return this.createAgent('researcher', `${topic} Researcher`, topic, {
      knowledgeAccess: [topic],
    });
  }

  createAnalysisAgent(domain: string): Agent {
    return this.createAgent('analyzer', `${domain} Analyzer`, domain, {
      knowledgeAccess: [domain],
    });
  }

  createConnectorAgent(): Agent {
    return this.createAgent('connector', 'Concept Connector', 'finding relationships');
  }

  createTeacherAgent(subject: string): Agent {
    return this.createAgent('teacher', `${subject} Teacher`, subject, {
      knowledgeAccess: [subject],
    });
  }

  createRepoReaderAgent(): Agent {
    return this.createAgent('repo_reader', 'Code Reader', 'understanding codebases');
  }

  // ------------------
  // AGENT MANAGEMENT
  // ------------------

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAgentsByType(type: AgentType): Agent[] {
    return this.getAllAgents().filter(a => a.type === type);
  }

  getAvailableAgents(): Agent[] {
    return this.getAllAgents().filter(a => a.status === 'idle' && a.energyLevel >= 20);
  }

  updateAgentStatus(agentId: string, status: AgentStatus): boolean {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastActiveAt = new Date();
      this.save();
      return true;
    }
    return false;
  }

  deleteAgent(agentId: string): boolean {
    if (this.agents.has(agentId)) {
      this.agents.delete(agentId);
      this.save();
      return true;
    }
    return false;
  }

  // ------------------
  // ENERGY MANAGEMENT
  // ------------------

  consumeEnergy(agentId: string, amount: number): boolean {
    const agent = this.agents.get(agentId);
    if (agent && agent.energyLevel >= amount) {
      agent.energyLevel -= amount;
      agent.lastActiveAt = new Date();
      this.save();
      return true;
    }
    return false;
  }

  regenerateEnergy(agentId: string, amount: number = 10): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.energyLevel = Math.min(agent.maxEnergy, agent.energyLevel + amount);
      if (agent.energyLevel >= 20 && agent.status === 'resting') {
        agent.status = 'idle';
      }
      this.save();
    }
  }

  regenerateAllEnergy(amount: number = 5): void {
    for (const agent of this.agents.values()) {
      this.regenerateEnergy(agent.id, amount);
    }
  }

  // ------------------
  // TASK MANAGEMENT
  // ------------------

  createTask(
    agentId: string,
    type: TaskType,
    input: TaskInput
  ): AgentTask | null {
    const agent = this.agents.get(agentId);
    if (!agent || agent.status !== 'idle') {
      return null;
    }

    const energyCost = this.getTaskEnergyCost(type);
    if (agent.energyLevel < energyCost) {
      return null;
    }

    const task: AgentTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      type,
      input,
      status: 'queued',
      createdAt: new Date(),
      energyCost,
    };

    this.tasks.set(task.id, task);
    agent.status = 'working';
    this.consumeEnergy(agentId, energyCost);
    this.save();

    console.log(`[AgentManager] Task created: ${type} for ${agent.name}`);
    return task;
  }

  private getTaskEnergyCost(type: TaskType): number {
    const costs: Record<TaskType, number> = {
      analyze_document: 30,
      analyze_repository: 40,
      research_topic: 35,
      find_connections: 20,
      summarize: 15,
      generate_questions: 15,
      explain_concept: 20,
      organize_memory: 25,
      custom: 25,
    };
    return costs[type] || 25;
  }

  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  getTasksByAgent(agentId: string): AgentTask[] {
    return Array.from(this.tasks.values())
      .filter(t => t.agentId === agentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getPendingTasks(): AgentTask[] {
    return Array.from(this.tasks.values())
      .filter(t => t.status === 'queued' || t.status === 'running')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  startTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'queued') {
      task.status = 'running';
      task.startedAt = new Date();
      this.save();
      return true;
    }
    return false;
  }

  completeTask(taskId: string, result: TaskResult): boolean {
    const task = this.tasks.get(taskId);
    const agent = task ? this.agents.get(task.agentId) : null;

    if (task && agent) {
      task.status = 'completed';
      task.completedAt = new Date();
      task.result = result;

      agent.status = 'idle';
      agent.tasksCompleted++;
      agent.memory.learnings.push(result.summary);

      // Add extracted concepts to agent's working memory
      for (const concept of result.conceptsExtracted.slice(0, 5)) {
        agent.memory.workingMemory.push(concept);
        if (agent.memory.workingMemory.length > 10) {
          agent.memory.workingMemory.shift();
        }
      }

      this.save();
      console.log(`[AgentManager] Task completed: ${task.type}`);
      return true;
    }
    return false;
  }

  failTask(taskId: string, error: string): boolean {
    const task = this.tasks.get(taskId);
    const agent = task ? this.agents.get(task.agentId) : null;

    if (task && agent) {
      task.status = 'failed';
      task.completedAt = new Date();

      agent.status = 'idle';
      agent.memory.mistakes.push(error);

      this.save();
      return true;
    }
    return false;
  }

  // ------------------
  // AUTO ASSIGNMENT
  // ------------------

  autoAssignTask(type: TaskType, input: TaskInput): AgentTask | null {
    // Find best agent for task type
    const suitableTypes: Record<TaskType, AgentType[]> = {
      analyze_document: ['analyzer', 'researcher'],
      analyze_repository: ['repo_reader', 'analyzer'],
      research_topic: ['researcher', 'teacher'],
      find_connections: ['connector', 'analyzer'],
      summarize: ['summarizer', 'researcher'],
      generate_questions: ['questioner', 'researcher'],
      explain_concept: ['teacher', 'researcher'],
      organize_memory: ['archivist'],
      custom: ['researcher', 'analyzer'],
    };

    const preferredTypes = suitableTypes[type] || ['researcher'];

    for (const agentType of preferredTypes) {
      const agents = this.getAgentsByType(agentType)
        .filter(a => a.status === 'idle' && a.energyLevel >= 20);

      if (agents.length > 0) {
        // Pick the one with most energy
        const agent = agents.sort((a, b) => b.energyLevel - a.energyLevel)[0];
        return this.createTask(agent.id, type, input);
      }
    }

    return null;
  }

  // ------------------
  // BATCH OPERATIONS
  // ------------------

  async processPendingTasks(): Promise<void> {
    const pending = this.getPendingTasks();

    for (const task of pending) {
      if (task.status === 'queued') {
        this.startTask(task.id);
      }

      // Task execution would be handled by the API with LLM
      // This just manages the state
    }
  }

  restAllAgents(): void {
    for (const agent of this.agents.values()) {
      if (agent.status === 'idle' && agent.energyLevel < 50) {
        agent.status = 'resting';
      }
    }
    this.save();
  }

  // ------------------
  // STATISTICS
  // ------------------

  getStats(): {
    totalAgents: number;
    activeAgents: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    byType: Record<AgentType, number>;
  } {
    const agents = this.getAllAgents();
    const tasks = Array.from(this.tasks.values());

    const byType: Record<AgentType, number> = {
      researcher: 0,
      analyzer: 0,
      connector: 0,
      summarizer: 0,
      questioner: 0,
      teacher: 0,
      archivist: 0,
      repo_reader: 0,
      custom: 0,
    };

    for (const agent of agents) {
      byType[agent.type]++;
    }

    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status !== 'resting').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      pendingTasks: tasks.filter(t => t.status === 'queued' || t.status === 'running').length,
      byType,
    };
  }
}

// Singleton
let managerInstance: AgentManager | null = null;

export function getAgentManager(): AgentManager {
  if (!managerInstance) {
    managerInstance = new AgentManager();
  }
  return managerInstance;
}
