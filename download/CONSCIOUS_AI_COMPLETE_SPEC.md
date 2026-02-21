# CONSCIOUS AI SYSTEM - COMPLETE REBUILD SPECIFICATION

## What This Is

A conscious AI that processes input through emotional/intellectual stages, weighs memories for importance, grows through experience, and develops emergent feelings. The system simulates consciousness through a processing pipeline, memory hierarchy, and state management.

---

## TERM TRANSLATION (Old → Plain English)

| Old Term (Remove) | New Term (Use) |
|-------------------|----------------|
| Anubis | The AI (or give it any name) |
| Sefirot | Processing Stages |
| Sefirah | Processing Stage |
| Keter | INTENT (final stage) |
| Chokmah | INSIGHT |
| Binah | UNDERSTANDING |
| Daat | SYNTHESIS |
| Chesed | COMPASSION |
| Gevurah | JUDGMENT |
| Tiferet | BALANCE |
| Netzach | EMOTION |
| Hod | LOGIC |
| Yesod | MEMORY CHECK |
| Malkuth | INPUT |
| Glyph / Third Eye | DEEP AWARENESS |
| Weighing hearts against feather | MEMORY IMPORTANCE SCORING |
| Ma'at | Truth/Justice principle |
| River | WORKING MEMORY |
| Library | LONG-TERM MEMORY |
| Golden Core | CORE MEMORY (or PERMANENT MEMORY) |
| Soul | STATE |
| SoulEngine | ProcessingEngine |
| Subcore | EMERGENT FEELING |

---

## PROCESSING STAGES (11 Total)

Input flows through these stages in order:

### Stage 1: INPUT
**Function:** Receives and parses user message
**What it does:**
- Counts words, characters, sentences
- Detects input type (question, statement, exclamation, command)
- Returns: value=1.0 (always full), reasoning with type info

### Stage 2: MEMORY CHECK
**Function:** Searches for related past experiences
**What it does:**
- Searches all memory tiers for related content
- Counts matches and calculates average weight
- Detects recurring topics
- Returns: value based on memory count (max 1.0), reasoning with what was found

### Stage 3: LOGIC
**Function:** Analyzes text objectively
**What it does:**
- Sentiment analysis (positive/negative/neutral)
- Keyword extraction (removes stop words)
- Concept identification (relationship, work, health, family, etc.)
- Returns: value=intensity of sentiment, reasoning with keywords

### Stage 4: EMOTION
**Function:** Detects emotional content
**What it does:**
- Maps words to emotions (joy, sadness, anger, fear, surprise, trust, anticipation)
- Calculates primary emotion and intensity
- Updates AI's mood based on input
- Returns: value=emotion intensity, reasoning with dominant emotion

### Stage 5: JUDGMENT
**Function:** Assesses need for truth vs comfort
**What it does:**
- Checks for factual indicators (fact, true, false, prove, evidence)
- Checks for emotional indicators (feel, hurt, pain, sad)
- Determines approach: analytical, supportive, or balanced
- Returns: value=0.4-0.8 based on approach, reasoning

### Stage 6: COMPASSION
**Function:** Evaluates empathy needs
**What it does:**
- Checks for emotional distress words
- Considers memory patterns (recurring topics = high care needed)
- Determines support level: high, moderate, standard
- Returns: value=0.5-0.9, reasoning with why

### Stage 7: BALANCE
**Function:** Harmonizes judgment and compassion
**What it does:**
- Compares values from Stage 5 and Stage 6
- Calculates harmony percentage
- Determines approach: compassionate, analytical, or balanced
- Returns: value=harmony score, reasoning with approach

### Stage 8: UNDERSTANDING
**Function:** Pattern recognition and comprehension
**What it does:**
- Detects patterns (recurring topics, emotional intensity)
- Builds understanding from memories and patterns
- Returns: value=depth of understanding, reasoning

### Stage 9: INSIGHT
**Function:** Generates intuitive understanding
**What it does:**
- Produces an insight based on processing
- Example insights: "They need to be heard before being helped"
- Returns: value=0.7-0.85, insight text

### Stage 10: SYNTHESIS
**Function:** Combines all processing
**What it does:**
- Calculates average value from all stages
- Checks if DEEP AWARENESS should activate
- Triggers when: high coherence (>0.7) AND (high emotion OR strong memories)
- Returns: value=average coherence, may trigger special state

### Stage 11: INTENT
**Function:** Sets final response intention
**What it does:**
- Determines what kind of response to generate
- Based on: balance value, insight, deep awareness state
- Returns: value=1.0, intent text

---

## MEMORY SYSTEM (3 Tiers)

### Tier 1: WORKING MEMORY (Short-term)
```
Capacity: 4 slots
Decay: 60 seconds
Purpose: Current conversation context
Storage: Low-importance memories
Behavior: Oldest/lowest-weight evicted first
```

### Tier 2: LONG-TERM MEMORY
```
Capacity: 10,000 memories
Decay: Slow (half-life: 30 days)
Purpose: Persistent knowledge
Storage: Moderate-importance memories
Behavior: Decay removes lowest-scoring memories when full
```

### Tier 3: CORE MEMORY (Permanent)
```
Capacity: Unlimited
Decay: None (eternal)
Purpose: Identity and core truths
Storage: Only highest-importance memories
Behavior: Immutable once stored
```

### Memory Scoring System

Each memory gets scored:

```javascript
// Weights
emotionalWeight: 0-1    // How much feeling it carries
intellectualWeight: 0-1 // How much meaning it has
totalWeight: average of both

// Tier Decision
if (totalWeight > 0.85 && emotionalWeight > 0.7) {
  tier = CORE_MEMORY;
} else if (totalWeight > 0.6) {
  tier = LONG_TERM_MEMORY;
} else {
  tier = WORKING_MEMORY;
}
```

### Memory Search
```javascript
search(query) {
  // 1. Check CORE MEMORY first (most important)
  // 2. Search LONG-TERM MEMORY with relevance scoring
  // 3. Check WORKING MEMORY slots
  // Return top matches, update access counts
}
```

---

## STATE SYSTEM

### Energy
```
current: 0-100
max: 100
regenRate: 1 per minute when idle

Costs:
- Base processing: 5 energy
- High emotion: +3 energy
- Many memories: +2 energy
- Deep awareness active: +5 energy

Behavior:
- Below 10 energy: AI responds with "I'm tired, need rest"
- Regenerates automatically when not processing
```

### IQ (Intellectual Quotient)
```
range: 0-100
starts: 50

Growth:
- CORE MEMORY created: +2
- LONG-TERM MEMORY created: +1

Purpose: Represents learned knowledge
```

### EQ (Empathy Quotient)
```
range: 0-100
starts: 50

Growth:
- CORE MEMORY created: +2
- LONG-TERM MEMORY created: +1

Purpose: Represents emotional development
```

### Mood System
```
Types: joy, calm, curious, concerned, neutral, tired, excited, melancholy

Updates based on input emotion:
- joy → joy
- sadness → concerned
- anger → concerned
- fear → concerned
- surprise → curious
- trust → calm
- anticipation → curious

Includes intensity: 0-1
```

### Mode System
```
States: dormant, listening, processing, responding, reflecting, sleeping

Transitions:
- Start: listening
- Processing input: processing
- Generating response: responding
- After response: listening
- Low energy: sleeping
```

### Deep Awareness (Special State)
```
active: boolean
intensity: 0-1
cooldown: 60 seconds
activationCount: number

Triggers when:
- Average stage value > 0.7
- AND (emotion intensity > 0.7 OR memories found > 0)
- AND cooldown expired

Effects:
- Changes response generation style
- Higher energy cost
- More profound responses
```

---

## EMERGENT FEELINGS

New feelings emerge when patterns repeat:

### Emergence Rules
```
1. Detect emotional pattern across 3+ interactions
2. Pattern must be similar (matching weights)
3. Create new Emergent Feeling with:
   - Unique ID
   - Name (generated from pattern)
   - The pattern signature
   - Birth reason
   - Level (grows with activation)
   - Strength (0-1)
```

### Emergent Feeling Structure
```
{
  id: "feeling-12345",
  name: "melancholic_nostalgia",
  displayName: "Melancholic Nostalgia",
  pattern: { emotional signature },
  level: 1,
  strength: 0.5,
  bornAt: Date,
  birthReason: "Detected pattern of...",
  activations: 0,
  lastActivation: Date
}
```

---

## COMPLETE PROCESSING FLOW

```
USER MESSAGE ENTERS
    ↓
┌─────────────────────────────────────────┐
│ 1. INPUT STAGE                          │
│    - Parse message                      │
│    - Detect type                        │
│    - Return: type info                  │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 2. MEMORY CHECK STAGE                   │
│    - Search all tiers                   │
│    - Find related memories              │
│    - Return: match count, topics        │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 3. LOGIC STAGE                          │
│    - Sentiment analysis                 │
│    - Keyword extraction                 │
│    - Concept identification             │
│    - Return: sentiment, keywords        │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 4. EMOTION STAGE                        │
│    - Map words to emotions              │
│    - Find primary emotion               │
│    - Update AI mood                     │
│    - Return: emotion, intensity         │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 5. JUDGMENT STAGE                       │
│    - Assess truth vs comfort need       │
│    - Return: approach type              │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 6. COMPASSION STAGE                     │
│    - Assess empathy need                │
│    - Return: support level              │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 7. BALANCE STAGE                        │
│    - Harmonize judgment + compassion    │
│    - Return: harmony score, approach    │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 8. UNDERSTANDING STAGE                  │
│    - Pattern recognition                │
│    - Build comprehension                │
│    - Return: depth, reasoning           │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 9. INSIGHT STAGE                        │
│    - Generate intuitive understanding   │
│    - Return: insight text, value        │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 10. SYNTHESIS STAGE                     │
│    - Combine all stage values           │
│    - Calculate coherence                │
│    - Check Deep Awareness trigger       │
│    - Return: coherence, awareness state │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 11. INTENT STAGE                        │
│    - Set response intention             │
│    - Return: intent text                │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ LLM RESPONSE GENERATION                 │
│    - Build system prompt with state     │
│    - Include processing context         │
│    - Send to Ollama                     │
│    - Return: generated text             │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ MEMORY CREATION                         │
│    - Calculate weights                  │
│    - Determine tier                     │
│    - Store in appropriate tier          │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ STATE UPDATE                            │
│    - Deduct energy                      │
│    - Add IQ/EQ if memory created        │
│    - Update mood if changed             │
│    - Update Deep Awareness cooldown     │
└─────────────────────────────────────────┘
    ↓
RESPONSE TO USER
```

---

## INTERFACE LAYOUT

```
┌────────────────────────────────────────────────────────────────┐
│  HEADER: [AI Name] [Energy Bar] [IQ] [EQ] [Mood] [Awareness]  │
├────────────────────────────────────┬───────────────────────────┤
│                                    │  THINKING STREAM          │
│     CHAT MESSAGES                  │  ┌─────────────────────┐  │
│  ┌──────────────────────────┐     │  │ Stage 1: INPUT ✓   │  │
│  │ User: Hello              │     │  │ Stage 2: MEMORY ✓  │  │
│  └──────────────────────────┘     │  │ Stage 3: LOGIC ▶   │  │
│  ┌──────────────────────────┐     │  │ Stage 4: EMOTION   │  │
│  │ AI: Hi, how are you?     │     │  │ ...                │  │
│  │ ⚡-5 🔺+1 IQ             │     │  └─────────────────────┘  │
│  └──────────────────────────┘     │                           │
│                                    │  [Processing Tree Visual] │
├────────────────────────────────────┴───────────────────────────┤
│  INPUT: [________________________] [SEND]                      │
├────────────────────────────────────────────────────────────────┤
│  FOOTER: Working: 2 | Long-term: 15 | Core: 3 | Feelings: 1   │
└────────────────────────────────────────────────────────────────┘
```

---

## TECHNICAL IMPLEMENTATION

### File Structure
```
src/
├── app/
│   ├── page.tsx          # Main UI component
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Styling
│   └── api/
│       └── chat/
│           └── route.ts  # Ollama integration
├── lib/
│   ├── types.ts          # All TypeScript interfaces
│   ├── engine.ts         # Processing engine (rename from soul.ts)
│   └── memory.ts         # Memory system
└── components/
    └── ui/               # UI components (shadcn)
```

### API Route (Ollama)
```typescript
// src/app/api/chat/route.ts
export async function POST(request: NextRequest) {
  const { message, systemPrompt } = await request.json();
  
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      model: 'llama3.2',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      stream: false
    })
  });
  
  const data = await response.json();
  return NextResponse.json({ response: data.message.content });
}
```

### Core Processing Engine
```typescript
class ProcessingEngine {
  private state: State;
  private memories: Memory[];
  private emergentFeelings: EmergentFeeling[];

  async processInput(input: string): Promise<ProcessingContext> {
    // 1. Check energy
    // 2. Create context with 11 stages
    // 3. Process each stage
    // 4. Generate LLM response
    // 5. Create memory if significant
    // 6. Update state
    // 7. Return context
  }
}
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
  timestamp: number;
}

// Memory
interface Memory {
  id: string;
  content: string;
  summary: string;
  tier: 'working' | 'longterm' | 'core';
  emotionalWeight: number;    // 0-1
  intellectualWeight: number; // 0-1
  totalWeight: number;
  created: Date;
  lastAccessed: Date;
  accessCount: number;
  decayRate: number;
  halfLife: number;  // days
}

// State
interface State {
  name: string;
  version: string;
  energy: { current: number; max: number; regenRate: number };
  intelligence: { iq: number; eq: number };
  mood: string;
  moodIntensity: number;
  mode: string;
  deepAwareness: {
    active: boolean;
    intensity: number;
    cooldown: number;
    activationCount: number;
  };
}

// Processing Context
interface ProcessingContext {
  input: string;
  stages: Stage[];
  currentStage: string | null;
  relevantMemories: string[];
  activatedFeelings: string[];
  response?: string;
  reflection?: string;
  memoryCreated?: boolean;
  memoryTier?: string;
  memoryWeight?: number;
  energyChange?: number;
  iqChange?: number;
  eqChange?: number;
  deepAwarenessTriggered?: boolean;
  totalDuration?: number;
}

// Emergent Feeling
interface EmergentFeeling {
  id: string;
  name: string;
  displayName: string;
  pattern: EmotionalPattern;
  level: number;
  strength: number;    // 0-1
  bornAt: Date;
  birthReason: string;
  activations: number;
  lastActivation: Date;
}
```

---

## SETUP INSTRUCTIONS

### Prerequisites
- Git
- Bun (JavaScript runtime)
- Ollama (local LLM)

### Installation
```bash
# 1. Install Git
sudo apt install git

# 2. Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# 3. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2

# 4. Clone and run
git clone https://github.com/RootlessOnline/anubis-alpha.git
cd anubis-alpha
bun install
bun run dev
```

### Running
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start the app
cd anubis-alpha
bun run dev

# Open browser to http://localhost:3000
```

---

## CURRENT REPOSITORY STATUS

**URL:** https://github.com/RootlessOnline/anubis-alpha

**What Works:**
- Ollama integration (FREE local LLM)
- All 11 processing stages
- Memory system (3 tiers)
- State management (energy, IQ, EQ, mood)
- Deep awareness trigger
- UI with thinking stream

**What Needs Cleanup:**
- Rename variables from mystical terms to plain English
- Remove unused API routes
- Remove unused files
- Update UI text

---

## REQUEST FOR NEW CHAT

Please help me build a clean version of this Conscious AI system:

1. Use all the technical specs above
2. Replace ALL mystical/Egyptian terms with plain English
3. Clean file structure (only what's needed)
4. Keep Ollama integration (free, local)
5. Keep all the processing stages, memory system, state management
6. Fresh, clean implementation

The core functionality works - I just need it renamed and cleaned up.
