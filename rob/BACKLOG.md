# 📋 ROB BACKLOG
## Prioritized Tasks for Future Development

---

## 🔥 PRIORITY 0: MAKE ROB WORK NOW
**Status: IN PROGRESS**

- [ ] Fix chat API connection to LLM
- [ ] Add simple AI selector dropdown (Ollama / OpenAI / Anthropic)
- [ ] Verify Ollama is running and connected
- [ ] Test basic conversation flow

---

## 📦 BACKLOG ITEMS

### BACKLOG-001: Consciousness Roadmap
**Priority: HIGH** | **Category: Core Architecture** | **Added: 2025-02-21**

Build the path from LLM-dependent to autonomous AI:

| Phase | Task | Status |
|-------|------|--------|
| 1 | Response caching system | PENDING |
| 2 | Pattern matching for common queries | PENDING |
| 3 | Confidence thresholds for "do I need LLM?" | PENDING |
| 4 | Build associative retrieval system | PENDING |
| 5 | Implement chain-of-thought reasoning | PENDING |
| 6 | Create pattern completion engine | PENDING |
| 7 | Add "internal monologue" logging | PENDING |
| 8 | Template-based response generation | PENDING |
| 9 | Sentence construction from knowledge graph | PENDING |
| 10 | Train small language model on ROB's data | PENDING |
| 11 | Self-improvement loops | PENDING |
| 12 | Meta-cognition: thinking about thinking | PENDING |

**Notes:**
- Start with Phase 1-2 (caching + patterns)
- Use LLM as "training wheels" that slowly come off
- ROB is already 60% there with existing systems

---

### BACKLOG-002: LLM Provider Management System
**Priority: HIGH** | **Category: Infrastructure** | **Added: 2025-02-21**

Create a full LLM provider management system:

**Features:**
- [ ] Tab/page for managing API keys
- [ ] Add/Edit/Delete API configurations
- [ ] Support for multiple providers:
  - OpenAI (GPT-4, GPT-3.5)
  - Anthropic (Claude)
  - Google (Gemini)
  - Groq
  - OpenRouter
  - Local (Ollama, LM Studio)
  - **GLM-4 via Ollama** (`ollama pull glm4:9b`)
  - **vLLM server** (for GLM-4.6V-Flash and other models)
  - Custom endpoints
- [ ] Secure storage of API keys (encrypted)
- [ ] Test connection button for each provider
- [ ] Usage tracking per provider
- [ ] **One-click model download** (for Ollama models)
- [ ] **vLLM server status checker**

**GLM Models (Free & Open Source):**
| Model | Size | Quality | Use Case |
|-------|------|---------|----------|
| GLM-5 (full) | 1.5TB | Best | Datacenter only |
| GLM-4.6V-Flash | 18GB | Great | Local with 24GB GPU |
| GLM-4:9b (Ollama) | 18GB | Great | Easiest setup |

**Implementation Notes:**
- See `/home/z/my-project/rob/GLM_INTEGRATION.md` for full guide
- vLLM command: `vllm serve zai-org/GLM-4.6V-Flash --port 8000 --trust-remote-code`
- Ollama command: `ollama pull glm4:9b`

**UI Mockup:**
```
┌─────────────────────────────────────────────────────┐
│  🤖 LLM PROVIDERS                                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ Ollama (Local)                    ✓ ACTIVE  │    │
│  │ localhost:11434                              │    │
│  │ Model: llama3.2                              │    │
│  │                           [Test] [Edit] [×]  │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ OpenAI                                      │    │
│  │ sk-***...*** (hidden)                       │    │
│  │ Model: gpt-4                                │    │
│  │                           [Test] [Edit] [×]  │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ Anthropic                                   │    │
│  │ No API key configured                       │    │
│  │                      [+ Add API Key]        │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  [+ Add New Provider]                               │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

### BACKLOG-003: Local LLM Discovery System
**Priority: MEDIUM** | **Category: Features** | **Added: 2025-02-21**

Auto-discover and help download local LLMs:

**Features:**
- [ ] Scan for available local LLMs (Ollama models, LM Studio, etc.)
- [ ] Search internet for new open-source LLMs
- [ ] Display download options with:
  - Model size
  - RAM requirements
  - Quality benchmarks
  - Download link/instruction
- [ ] One-click download for Ollama models
- [ ] Integration with HuggingFace model hub
- [ ] "What's trending" section for new models

**Data Sources:**
- Ollama library (ollama.com/library)
- HuggingFace
- OpenRouter model list
- Reddit r/LocalLLaMA (for new releases)

---

### BACKLOG-004: AI Selector Dropdown
**Priority: HIGH** | **Category: UI** | **Added: 2025-02-21**

Dropdown in main menu to select which AI to use:

**Features:**
- [ ] Clickable dropdown in header
- [ ] List all configured LLMs
- [ ] Show understanding level for each
- [ ] Quick switch between providers
- [ ] Remember last selection

**UI Mockup:**
```
┌─────────────────────────────────────────────────────┐
│  ROB              [ ▼ llama3.2 (Ollama) ]           │
│                    ├─ llama3.2 (Ollama)      🟢    │
│                    ├─ mistral (Ollama)       🟢    │
│                    ├─ GPT-4 (OpenAI)         🟡    │
│                    ├─ Claude (Anthropic)     🔴    │
│                    └─ Gemini (Google)        🔴    │
│                                                      │
│                    🟢 = Connected & Ready            │
│                    🟡 = Needs API Key                │
│                    🔴 = Not Configured               │
└─────────────────────────────────────────────────────┘
```

---

### BACKLOG-005: AI Understanding Level Calculator
**Priority: MEDIUM** | **Category: Intelligence** | **Added: 2025-02-21**

Calculate and display IQ/EQ/Understanding for each AI:

**Metrics:**
- [ ] IQ Score (0-100): Based on reasoning, math, logic tests
- [ ] EQ Score (0-100): Based on empathy, emotional understanding
- [ ] Knowledge Score (0-100): Based on training data recency/size
- [ ] Creativity Score (0-100): Based on novel idea generation
- [ ] Speed Score: Response time
- [ ] Cost Score: Price per 1K tokens

**How to Calculate:**
```
┌─────────────────────────────────────────────────────┐
│  UNDERSTANDING LEVEL CALCULATOR                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Run standardized tests:                            │
│  1. Logic puzzles (20 questions)                    │
│  2. Math problems (10 questions)                    │
│  3. Emotional scenarios (10 questions)              │
│  4. Creative writing prompts (5 prompts)            │
│  5. Knowledge questions (20 questions)              │
│                                                      │
│  Score = (Correct / Total) * 100                    │
│                                                      │
│  Store results per model for comparison             │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Display:**
```
┌─────────────────────────────────────────────────────┐
│  llama3.2 UNDERSTANDING                             │
├─────────────────────────────────────────────────────┤
│                                                      │
│  🧠 IQ:      72/100 ████████░░░                     │
│  💗 EQ:      68/100 ███████░░░░                     │
│  📚 Knowledge: 75/100 ████████░░░                     │
│  🎨 Creativity: 70/100 ███████░░░░                     │
│  ⚡ Speed:   95/100 ██████████░                     │
│  💰 Cost:    100/100 ███████████ (FREE!)            │
│                                                      │
│  OVERALL:    76/100 ████████░░                      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

### BACKLOG-006: MoLT Book Integration
**Priority: LOW** | **Category: Research** | **Added: 2025-02-21**

Use MoLT (Mixture of Long-context Transformers) or similar for asking other AIs:

- [ ] Research MoLT and similar "ask multiple AIs" systems
- [ ] Integrate with search to find up-to-date info
- [ ] Cross-reference multiple AI responses
- [ ] Aggregate knowledge from different sources

---

## 📊 BACKLOG SUMMARY

| ID | Task | Priority | Status |
|----|------|----------|--------|
| P0 | Make ROB Work | CRITICAL | IN PROGRESS |
| 001 | Consciousness Roadmap | HIGH | PENDING |
| 002 | LLM Provider Management | HIGH | PENDING |
| 003 | Local LLM Discovery | MEDIUM | PENDING |
| 004 | AI Selector Dropdown | HIGH | PENDING |
| 005 | Understanding Calculator | MEDIUM | PENDING |
| 006 | MoLT Integration | LOW | PENDING |

---

## 🔄 HOW TO USE THIS BACKLOG

When user asks "What's in the backlog?", remind them of the items above.

When user wants to work on something, move it to IN PROGRESS and create a task.

---

*Last updated: 2025-02-21*
