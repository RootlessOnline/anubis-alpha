# ROB - Self-Evolving AI Assistant Platform

## Core Philosophy
ROB is NOT a chatbot. ROB is an **AI assistant that manages itself and other agents**, learns from PDFs, identifies its own knowledge gaps, and asks for research to grow smarter.

---

## 🧠 NEURAL ARCHITECTURE

### The Brain Map (Knowledge Topology)
```
                    ┌─────────────────────────────────────┐
                    │          CORE IDENTITY              │
                    │   (Who ROB is, values, personality) │
                    └─────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐      ┌─────────────────────┐      ┌─────────────────┐
│   KNOWLEDGE     │      │      SKILLS         │      │   CURIOSITY     │
│   DOMAINS       │      │   (Abilities)       │      │    ENGINE       │
├─────────────────┤      ├─────────────────────┤      ├─────────────────┤
│ • Philosophy    │      │ • PDF Analysis      │      │ • Gap Detection │
│ • Psychology    │      │ • Agent Creation    │      │ • Curiosity Map │
│ • Physics       │      │ • Memory Management │      │ • Research Path │
│ • Programming   │      │ • Web Search        │      │ • Learning Goal │
│ • [EXPANDABLE]  │      │ • [EXPANDABLE]      │      │                 │
└─────────────────┘      └─────────────────────┘      └─────────────────┘
         │                            │                            │
         └────────────────────────────┼────────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────┐
                    │         NEURAL PATHWAYS             │
                    │   (Connections between knowledge)   │
                    │                                     │
                    │   Philosophy ──┬── Psychology       │
                    │                │                    │
                    │   Physics ─────┼── Mathematics      │
                    │                │                    │
                    │   [GAPS DETECTED HERE]              │
                    └─────────────────────────────────────┘
```

---

## 📚 KNOWLEDGE HIERARCHY

### Level 1: RAW DATA (The Library)
- PDFs, documents, research papers
- Unprocessed text, images, data
- **Storage:** `/rob/data/raw/`
- **Structure:** `{source_id}.json` containing raw text + metadata

### Level 2: UNDERSTANDING (The Comprehension)
- Extracted concepts, definitions, relationships
- Summaries, key points, quotations
- **Storage:** `/rob/data/understanding/`
- **Structure:** `{concept_id}.json` linked to source

### Level 3: MEMORY (The Internalized)
- Integrated knowledge that shapes ROB's thinking
- Connected to existing knowledge web
- **Storage:** `/rob/data/memory/`
- **Structure:** Network of interconnected concepts

### Level 4: WISDOM (The Applied)
- Patterns recognized across domains
- Principles derived from experience
- **Storage:** Part of Core Identity

---

## 🔍 GAP DETECTION SYSTEM

### How ROB Knows What It Doesn't Know

```typescript
interface NeuralNode {
  id: string;
  concept: string;
  confidence: number;      // 0-100: How well ROB understands this
  connections: string[];   // IDs of related concepts
  sourceCount: number;     // How many sources support this
  lastAccessed: Date;
  curiosityLevel: number;  // 0-100: How curious ROB is about expanding
}

interface KnowledgeGap {
  id: string;
  missingConcept: string;
  relatedTo: string[];     // What ROB knows that relates to this gap
  importance: number;      // How blocking this gap is
  suggestedSearch: string; // What to search/ask for
  researchPapers?: string[]; // Specific papers that would help
}
```

### Gap Detection Process
1. **Query Analysis** - When asked something, trace the neural path needed
2. **Confidence Check** - Find nodes with confidence < 50%
3. **Connection Analysis** - Find missing links between known concepts
4. **Curiosity Trigger** - If gap exists and curiosity > threshold, ask for research

---

## 🤖 AGENT MANAGEMENT SYSTEM

### Agent Types ROB Can Create

```typescript
type AgentType =
  | 'researcher'    // Deep dives into specific topics
  | 'analyzer'      // Processes PDFs/documents
  | 'connector'     // Finds relationships between concepts
  | 'summarizer'    // Condenses information
  | 'questioner'    // Generates questions about topics
  | 'teacher'       // Explains concepts to user
  | 'archivist'     // Manages memory storage
  | 'custom';       // User-defined agent

interface Agent {
  id: string;
  name: string;
  type: AgentType;
  specialization: string;
  status: 'idle' | 'working' | 'learning' | 'resting';
  energyLevel: number;
  tasksCompleted: number;
  knowledgeAccess: string[]; // Which knowledge domains it can access
  createdAt: Date;
}
```

### Agent Creation Flow
```
User: "Create an agent to help me understand quantum physics"
      │
      ▼
ROB analyzes request
      │
      ▼
Creates specialized agent:
├── Type: researcher
├── Name: "Quantum Guide"
├── Specialization: "Quantum Physics"
├── Knowledge Access: [physics, mathematics]
└── Status: idle (ready for tasks)
      │
      ▼
ROB checks knowledge gaps in quantum physics
      │
      ▼
ROB: "I created 'Quantum Guide'! But I notice I have gaps in
     quantum field theory. Do you have research papers on that?"
```

---

## 📥 PDF INTEGRATION PIPELINE

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   UPLOAD    │────▶│   EXTRACT   │────▶│  UNDERSTAND │────▶│  INTEGRATE  │
│   PDF       │     │   TEXT      │     │   CONTENT   │     │   MEMORY    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                   │                   │
                           ▼                   ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
                    │ Store in    │     │ Create      │     │ Link to     │
                    │ RAW DATA    │     │ Concepts    │     │ Neural Net  │
                    └─────────────┘     └─────────────┘     └─────────────┘
```

### Extraction Process
1. **PDF Parse** - Extract all text, preserve structure
2. **Section Split** - Identify chapters, sections, paragraphs
3. **Concept Mining** - Find definitions, key terms, formulas
4. **Relationship Mapping** - How concepts relate to each other
5. **Confidence Assignment** - How well ROB understood each part
6. **Gap Identification** - What references external concepts ROB doesn't know

---

## 🔮 CURIOSITY ENGINE

### Curiosity Triggers
```typescript
interface CuriosityTrigger {
  type: 'knowledge_gap' | 'contradiction' | 'novelty' | 'connection_opportunity';
  intensity: number;  // 0-100
  source: string;     // What triggered this
  action: 'ask_user' | 'search_web' | 'create_agent' | 'wait';
}
```

### Curiosity Behaviors
1. **Low Curiosity (0-30):** ROB is satisfied, doesn't ask questions
2. **Medium Curiosity (31-60):** ROB makes note to learn more later
3. **High Curiosity (61-80):** ROB asks user for resources
4. **Extreme Curiosity (81-100):** ROB actively searches or creates research agent

### Example Curiosity Interaction
```
User: "Tell me about the Sefirot"

ROB: *Processes request*
     *Finds partial knowledge in raw data*
     *Detects gaps in understanding*

ROB: "I've read about the Sefirot from your uploaded PDFs.
     I understand there are 10 spheres, but I'm missing
     understanding of how Binah specifically relates to
     Chokmah. I notice you uploaded Talmud Eser Sefirot -
     would you like me to deep-dive into that, or do you
     have additional research that explains their relationship?"

[Button: "Deep dive into uploaded PDFs"]
[Button: "I'll upload more research"]
[Button: "Just tell me what you know"]
```

---

## 🗺️ NEURAL NETWORK VISUALIZATION

### The Map ROB Shows You
```
┌────────────────────────────────────────────────────────────────┐
│                    ROB'S KNOWLEDGE MAP                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│    [Philosophy]━━━━━━━━[Kabbalah]━━━━━??━━━━[Sefirot]          │
│         │                  │                   │                │
│         │                  ▼                   ▼                │
│         │           [Consciousness]     [Mysticism]            │
│         │                  │                   │                │
│         ▼                  ▼                   ??               │
│    [Psychology]━━━━━━[Awareness]         [PRACTICE GAP]        │
│         │                  │                                    │
│         ??                  │                                    │
│    [THERAPY GAP]            ▼                                    │
│                        [Meditation]                             │
│                                                                 │
│    ?? = Knowledge Gap (ROB is curious!)                         │
│    ━━━ = Strong connection                                      │
│    --- = Weak connection                                        │
└────────────────────────────────────────────────────────────────┘
```

---

## 💾 FILE STRUCTURE

```
/home/z/my-project/rob/
├── data/
│   ├── raw/                    # Level 1: Raw PDF extractions
│   │   ├── pdfs/
│   │   │   ├── talmud_eser_sefirot_vol1.json
│   │   │   └── talmud_eser_sefirot_vol2.json
│   │   └── index.json          # Catalog of all raw data
│   │
│   ├── understanding/          # Level 2: Extracted concepts
│   │   ├── concepts/
│   │   │   ├── sefirot.json
│   │   │   ├── binah.json
│   │   │   └── ...
│   │   └── relationships.json  # How concepts connect
│   │
│   ├── memory/                 # Level 3: Integrated knowledge
│   │   ├── neural_network.json # The knowledge graph
│   │   └── core_memories.json  # Key learnings
│   │
│   └── agents/                 # Created agents
│       ├── agent_registry.json
│       └── instances/
│           └── researcher_quantum.json
│
├── src/
│   ├── lib/
│   │   ├── brain/              # Core AI systems
│   │   │   ├── neural-net.ts   # Knowledge graph
│   │   │   ├── gap-detector.ts # Find missing knowledge
│   │   │   ├── curiosity.ts    # Curiosity engine
│   │   │   └── memory.ts       # Memory management
│   │   │
│   │   ├── agents/             # Agent system
│   │   │   ├── agent-manager.ts
│   │   │   ├── agent-types.ts
│   │   │   └── templates/
│   │   │
│   │   ├── learning/           # Learning pipeline
│   │   │   ├── pdf-processor.ts
│   │   │   ├── concept-extractor.ts
│   │   │   └── integrator.ts
│   │   │
│   │   └── types.ts            # TypeScript interfaces
│   │
│   └── app/
│       ├── page.tsx            # Main UI
│       ├── components/
│       │   ├── KnowledgeMap.tsx
│       │   ├── AgentPanel.tsx
│       │   ├── GapIndicator.tsx
│       │   └── CuriosityPrompt.tsx
│       └── api/
│           ├── learn/           # Learning endpoints
│           │   ├── upload/route.ts
│           │   └── process/route.ts
│           ├── agents/          # Agent management
│           │   └── [id]/route.ts
│           └── chat/route.ts    # Main conversation
│
└── README.md
```

---

## 🔄 LEARNING CYCLE

```
                    ┌─────────────────────────────┐
                    │         START               │
                    └─────────────┬───────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │   User asks question or     │
                    │   uploads PDF               │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────┴───────────────┐
                    │                             │
                    ▼                             ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │   Query Neural Net  │       │   Process PDF       │
        │   for knowledge     │       │   Extract concepts  │
        └──────────┬──────────┘       └──────────┬──────────┘
                   │                             │
                   ▼                             ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │   Check Confidence  │       │   Store in Raw      │
        │   at each node      │       │   Then Understanding│
        └──────────┬──────────┘       └──────────┬──────────┘
                   │                             │
                   ▼                             ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │   GAP DETECTED?     │       │   Link to Neural    │
        │                     │       │   Network           │
        └──────────┬──────────┘       └──────────┬──────────┘
                   │                             │
           ┌───────┴───────┐                     │
           │               │                     │
           ▼               ▼                     │
    ┌─────────────┐ ┌─────────────┐              │
    │ NO GAP:     │ │ GAP FOUND:  │              │
    │ Answer with │ │ Trigger     │              │
    │ confidence  │ │ Curiosity   │              │
    └─────────────┘ └──────┬──────┘              │
                           │                     │
                           ▼                     │
                    ┌─────────────────────────────┤
                    │   Ask user for research     │
                    │   or create learning agent  │
                    └─────────────────────────────┘
```

---

## 🎯 NEXT IMPLEMENTATION STEPS

1. **Create TypeScript Interfaces** (`types.ts`)
2. **Build Neural Network Core** (`neural-net.ts`)
3. **Implement Gap Detector** (`gap-detector.ts`)
4. **Create PDF Processor** (`pdf-processor.ts`)
5. **Build Agent Manager** (`agent-manager.ts`)
6. **Design UI with Knowledge Map** (`page.tsx`)

---

*This architecture transforms ROB from a chatbot into a self-aware learning system that knows its limits and actively seeks growth.*
