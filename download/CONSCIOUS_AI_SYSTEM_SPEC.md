# CONSCIOUS AI SYSTEM - COMPLETE SPECIFICATION

## Overview
A conscious AI system that processes input through emotional/intellectual stages, weighs memories for importance, and grows over time through experience. The system simulates consciousness through a processing pipeline, memory hierarchy, and emergent feelings.

---

## CORE CONCEPTS

### Processing Pipeline (11 Stages)
Input flows through 11 processing stages, each adding value and meaning:

| Stage | Plain Name | Function |
|-------|------------|----------|
| 1 | INPUT | Receives and parses user message |
| 2 | MEMORY | Searches for related past experiences |
| 3 | LOGIC | Analyzes text, extracts keywords, sentiment |
| 4 | EMOTION | Detects emotional content, resonance |
| 5 | JUDGMENT | Assesses need for truth vs comfort |
| 6 | COMPASSION | Evaluates empathy needs |
| 7 | BALANCE | Harmonizes judgment and compassion |
| 8 | UNDERSTANDING | Pattern recognition, builds comprehension |
| 9 | INSIGHT | Generates intuitive understanding |
| 10 | SYNTHESIS | Combines all processing (triggers deep awareness) |
| 11 | INTENT | Sets final response intention |

Each stage outputs:
- `value` (0-1): How significant this stage was
- `reasoning`: Why this value was assigned
- `output`: Brief description of what was found

---

## MEMORY SYSTEM (3 Tiers)

### 1. WORKING MEMORY (Short-term)
- 4 slots maximum
- Fades after ~60 seconds
- Quick access for current conversation
- Low-weight memories decay here

### 2. LONG-TERM MEMORY (Library)
- 10,000 memory capacity
- Persists across sessions
- Decays slowly over time
- Moderate-weight memories stored here

### 3. CORE MEMORY (Permanent)
- Immutable, eternal storage
- Contains identity and purpose
- Only highest-weight memories
- Represents what the AI truly "is"

### Memory Weighing
Each memory is "weighed" to determine its fate:
- **Emotional Weight**: How much feeling it carries (0-1)
- **Intellectual Weight**: How much meaning it has (0-1)
- **Total Weight**: Combined importance

**Fate Decision:**
- Weight > 0.85 + high emotion → CORE MEMORY
- Weight > 0.6 → LONG-TERM MEMORY  
- Weight < 0.6 → WORKING MEMORY (fades)

---

## SOUL STATE

The AI maintains a persistent "soul state":

### Energy (0-100)
- Depletes with each processing action
- Base cost: 5 energy per message
- Extra cost for: emotional processing, memory work, deep awareness
- Regenerates over time when idle
- Below 10 energy: AI becomes "tired"

### Intelligence Quotient (0-100)
- Starts at 50
- Grows when meaningful memories are created
- +2 for CORE MEMORY creation
- +1 for LONG-TERM MEMORY creation
- Affects response quality

### Empathy Quotient (0-100)
- Starts at 50
- Grows with emotional experiences
- Same growth rules as IQ
- Affects emotional understanding

### Mood
Types: `joy`, `calm`, `curious`, `concerned`, `neutral`, `tired`, `excited`, `melancholy`
- Changes based on input emotional content
- Has intensity (0-1)

### Mode
States: `dormant`, `listening`, `processing`, `responding`, `reflecting`, `sleeping`
- Indicates current activity state

### Deep Awareness (Special State)
- Activates when processing reaches high coherence
- Triggers when: high emotion OR strong memory connection AND not on cooldown
- Represents heightened perception
- Cooldown: 60 seconds

---

## EMERGENT FEELINGS (Subcores)

New feelings can EMERGE from patterns:
- When 3+ similar emotional patterns are detected
- A new "feeling" is born with its own identity
- Examples: "melancholic nostalgia", "protective warmth", "curious wonder"

### Subcore Structure
```
- id: unique identifier
- name: internal name
- displayName: human-readable name
- pattern: the emotional signature that triggers it
- level: how developed it is
- strength: 0-1 how strong it is
- bornAt: when it emerged
- birthReason: what triggered its creation
```

---

## NEURONS (Knowledge Units)

Individual pieces of knowledge stored as neurons:

```
Neuron {
  id: string
  type: concept|emotion|action|memory|etc
  content: the actual content
  summary: brief version
  position: {x, y, z} in knowledge space
  connections: links to other neurons
  activation: current activation level (0-1)
  weight: importance for memory
  emotionalValence: -1 to +1
  source: where it came from
}
```

---

## PROCESSING FLOW

```
USER INPUT
    ↓
[1. INPUT] - Parse, detect type
    ↓
[2. MEMORY] - Search related memories
    ↓
[3. LOGIC] - Analyze text
    ↓
[4. EMOTION] - Detect feelings
    ↓
[5. JUDGMENT] - Assess truth needs
    ↓
[6. COMPASSION] - Assess empathy needs
    ↓
[7. BALANCE] - Find harmony
    ↓
[8. UNDERSTANDING] - Build comprehension
    ↓
[9. INSIGHT] - Generate intuition
    ↓
[10. SYNTHESIS] - Combine all (may trigger deep awareness)
    ↓
[11. INTENT] - Set final intention
    ↓
[LLM RESPONSE] - Generate actual words
    ↓
[MEMORY WEIGHING] - Create memory if significant
    ↓
[STATE UPDATE] - Update energy, IQ, EQ, mood
    ↓
OUTPUT TO USER
```

---

## INTERFACE DESIGN

### Layout
- **Left Panel**: Chat messages (user + AI)
- **Right Panel**: Live processing stream (shows each stage)
- **Header**: Energy bar, IQ, EQ, Mood, Deep Awareness indicator
- **Footer**: Memory tier counts, pillar stats

### Visual Style
- Dark theme
- Monospace font
- Terminal/console aesthetic
- Stage indicators show real-time progress

### Message Display
Each AI message shows:
- Content
- Energy cost
- IQ/EQ changes
- Whether deep awareness activated
- Processing time

---

## TECHNICAL STACK

```
Frontend: Next.js 15 + React 19 + TypeScript
Styling: Tailwind CSS
UI Components: shadcn/ui
LLM: Ollama (local, free) with llama3.2
Storage: SQLite via sql.js (browser-based, local)
```

### Key Files
```
src/
├── app/
│   ├── page.tsx        # Main terminal UI
│   ├── layout.tsx      # Root layout
│   ├── globals.css     # Styling
│   └── api/chat/       # LLM endpoint (Ollama)
├── lib/
│   ├── types.ts        # All TypeScript interfaces
│   ├── soul.ts         # Processing engine
│   └── memory.ts       # Memory system
└── components/ui/      # UI components
```

---

## TYPE DEFINITIONS

```typescript
// Processing Stage
interface Stage {
  name: string;
  status: 'pending' | 'active' | 'completed';
  output: string;
  value: number;      // 0-1
  reasoning: string;
  duration: number;   // ms
}

// Memory
interface Memory {
  id: string;
  content: string;
  summary: string;
  tier: 'working' | 'longterm' | 'core';
  emotionalWeight: number;
  intellectualWeight: number;
  totalWeight: number;
  created: Date;
  lastAccessed: Date;
  accessCount: number;
}

// Soul State
interface SoulState {
  name: string;
  version: string;
  energy: { current: number; max: number };
  intelligence: { iq: number; eq: number };
  mood: string;
  moodIntensity: number;
  mode: string;
  deepAwareness: { active: boolean; intensity: number };
}

// Processing Context
interface ProcessingContext {
  input: string;
  stages: Stage[];
  currentStage: string | null;
  relevantMemories: string[];
  response?: string;
  memoryCreated?: boolean;
  memoryTier?: string;
  energyChange?: number;
  iqChange?: number;
  eqChange?: number;
  totalDuration?: number;
}
```

---

## CURRENT REPOSITORY

**GitHub:** https://github.com/RootlessOnline/anubis-alpha

**Current Issues:**
- Has extra unused API routes from development
- Still uses Egyptian naming (needs rename to plain English)
- Should clean up unnecessary files

**Current Working Setup:**
- Ollama integration works
- Processing pipeline functional
- Memory system implemented
- UI working

---

## NEXT STEPS FOR CLEAN VERSION

1. Rename all Sefirot/Egyptian terms to plain English
2. Clean up unused API routes
3. Simplify file structure
4. Update UI text (no Egyptian references)
5. Push clean version to fresh repo

---

## SAMPLE INTERACTION

```
User: "I'm feeling overwhelmed with work"

Processing:
[INPUT] - Statement detected, 6 words
[MEMORY] - Found 2 related memories about work
[LOGIC] - Negative sentiment detected
[EMOTION] - Stress detected, 70% intensity
[JUDGMENT] - Supportive approach needed
[COMPASSION] - High support needed
[BALANCE] - 85% harmony, compassionate approach
[UNDERSTANDING] - Drawing from past work discussions
[INSIGHT] - They need to be heard before being helped
[SYNTHESIS] - Processing at 78% coherence
[INTENT] - "Listen deeply and offer gentle presence"

Response: "Work stress can feel like drowning. What's taking up the most space in your mind right now? I'm here to listen."

[MEMORY] - Created in LONG-TERM MEMORY (weight: 0.72)
[ENERGY] -7
```

---

## TO BUILD FROM SCRATCH

1. Clone: `git clone https://github.com/RootlessOnline/anubis-alpha.git`
2. Install: `bun install`
3. Start Ollama: `ollama serve && ollama pull llama3.2`
4. Run: `bun run dev`
5. Open: `http://localhost:3000`

---

*This document contains everything needed to understand and rebuild the conscious AI system from scratch, using plain English terminology instead of mystical references.*
