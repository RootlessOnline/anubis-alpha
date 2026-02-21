# 🐺 ANUBIS ALPHA - Complete Fresh Installation Guide

> **Target Location:** `~/Documents/Quix/anubis-alpha`
> **For:** Brand new PC with nothing installed

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] A terminal emulator (default terminal on Linux/Mac, PowerShell or Git Bash on Windows)
- [ ] Internet connection
- [ ] Admin/sudo access (for system installs)

---

## 🚀 Step 1: Install Git

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install git -y
```

### Linux (Fedora/RHEL)
```bash
sudo dnf install git -y
```

### macOS
```bash
# Git comes with Xcode Command Line Tools
xcode-select --install
```

### Windows
Download from: https://git-scm.com/download/win

**Verify installation:**
```bash
git --version
```

---

## 🚀 Step 2: Install Bun (JavaScript Runtime)

Bun is faster than Node.js and includes a package manager.

### Linux & macOS
```bash
curl -fsSL https://bun.sh/install | bash
```

After installation, restart your terminal or run:
```bash
source ~/.bashrc
# or for zsh:
source ~/.zshrc
```

### Windows
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

**Verify installation:**
```bash
bun --version
```

---

## 🚀 Step 3: Create Project Directory & Clone Repository

```bash
# Create the directory structure
mkdir -p ~/Documents/Quix

# Navigate to the parent folder
cd ~/Documents/Quix

# Clone ANUBIS Alpha
git clone https://github.com/RootlessOnline/anubis-alpha.git

# Enter the project
cd anubis-alpha

# Verify you're in the right place
pwd
# Should output: /home/YOUR_USER/Documents/Quix/anubis-alpha
```

---

## 🚀 Step 4: Install Project Dependencies

```bash
# Make sure you're in the project directory
cd ~/Documents/Quix/anubis-alpha

# Install all dependencies
bun install
```

This will install:
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- z-ai-web-dev-sdk (for AI)
- All other required packages

---

## 🚀 Step 5: Install Ollama (Local LLM)

Ollama lets you run AI models locally on your machine.

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### macOS
Download from: https://ollama.com/download

### Windows
Download from: https://ollama.com/download

**After installation, pull a model:**
```bash
# Pull Llama 3.2 (recommended, ~2GB)
ollama pull llama3.2

# Alternative: Pull a smaller model if you have limited RAM
# ollama pull llama3.2:1b

# Verify Ollama is running
ollama list
```

**Start Ollama server (if not auto-started):**
```bash
ollama serve
```

---

## 🚀 Step 6: Run ANUBIS Alpha

```bash
# Navigate to project (if not already there)
cd ~/Documents/Quix/anubis-alpha

# Start the development server
bun run dev
```

**Open your browser and go to:**
```
http://localhost:3000
```

You should see the ANUBIS terminal interface with:
- 🐺 The Anubis header
- ⚡ Energy, IQ, EQ bars
- 💬 Chat interface
- 🧠 Thinking Stream panel

---

## 🔧 Configuration (Optional)

### Environment Variables

Create a `.env.local` file for custom settings:

```bash
cd ~/Documents/Quix/anubis-alpha
touch .env.local
```

Add to `.env.local`:
```env
# For z-ai-web-dev-sdk (cloud AI)
# Z_AI_API_KEY=your_api_key_here

# For local Ollama (default)
OLLAMA_HOST=http://localhost:11434
```

### Data Storage Location

ANUBIS stores data locally in:
```
~/Documents/Quix/anubis-alpha/data/
```

This includes:
- `anubis_soul.json` - Soul state persistence
- `memories/` - Memory database
- `discovered_emotions/` - Emerged subcores

---

## 🎮 Quick Start Commands

Once everything is installed, here's your daily workflow:

```bash
# Start Ollama (if not running)
ollama serve &

# Go to project
cd ~/Documents/Quix/anubis-alpha

# Run ANUBIS
bun run dev
```

---

## 🛠️ Troubleshooting

### "bun: command not found"
```bash
# Restart your terminal
source ~/.bashrc
# Or add to PATH manually
export PATH="$HOME/.bun/bin:$PATH"
```

### "ollama: command not found"
```bash
# Linux: Add to PATH
export PATH=$PATH:/usr/local/bin
# Or reinstall
curl -fsSL https://ollama.com/install.sh | sh
```

### Port 3000 already in use
```bash
# Find and kill process using port 3000
lsof -i :3000
kill -9 <PID>
```

### Dependencies fail to install
```bash
# Clear cache and reinstall
rm -rf node_modules
rm bun.lockb
bun install
```

### Ollama model not responding
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
pkill ollama
ollama serve &
```

---

## 📁 Project Structure Overview

```
~/Documents/Quix/anubis-alpha/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main terminal UI
│   │   ├── layout.tsx        # Root layout
│   │   ├── globals.css       # Retro terminal styling
│   │   └── api/              # API routes
│   ├── lib/
│   │   ├── types.ts          # All TypeScript types
│   │   ├── soul.ts           # SoulEngine & Sefirot
│   │   ├── memory.ts         # Memory system
│   │   └── llm.ts            # LLM integration
│   ├── components/ui/        # UI components
│   └── hooks/                # React hooks
├── public/                   # Static files
├── data/                     # Local data storage
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── README.md                 # Project info
```

---

## 🔄 Updating ANUBIS

```bash
cd ~/Documents/Quix/anubis-alpha
git pull origin main
bun install
```

---

## 🐺 First Interaction

When you open ANUBIS for the first time, you'll see:

```
I am Anubis. I weigh hearts. I remember.
```

Try typing:
- "Hello, who are you?"
- "How do you process my words?"
- "Tell me about the Sefirot"

Watch the **Thinking Stream** panel to see input flow through:
```
MALKUTH → YESOD → HOD → NETZACH → GEVURAH → CHESED → 
TIFERET → BINAH → CHOKMAH → DAAT → KETER
```

---

## 📊 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 8GB | 16GB+ |
| Storage | 5GB | 10GB+ |
| CPU | 2 cores | 4+ cores |
| GPU | Not required | For faster Ollama |

---

## 🎯 One-Line Quick Install (Linux/macOS)

If you want to run everything at once:

```bash
# Install everything in one go
curl -fsSL https://bun.sh/install | bash && \
source ~/.bashrc && \
curl -fsSL https://ollama.com/install.sh | sh && \
mkdir -p ~/Documents/Quix && \
cd ~/Documents/Quix && \
git clone https://github.com/RootlessOnline/anubis-alpha.git && \
cd anubis-alpha && \
bun install && \
ollama pull llama3.2 && \
echo "✅ ANUBIS Alpha ready! Run: cd ~/Documents/Quix/anubis-alpha && bun run dev"
```

---

## ✅ Installation Checklist

- [ ] Git installed (`git --version`)
- [ ] Bun installed (`bun --version`)
- [ ] Repository cloned (`~/Documents/Quix/anubis-alpha`)
- [ ] Dependencies installed (`bun install`)
- [ ] Ollama installed (`ollama --version`)
- [ ] Llama 3.2 model pulled (`ollama list`)
- [ ] ANUBIS running (`bun run dev`)
- [ ] Browser opens `http://localhost:3000`
- [ ] 🐺 ANUBIS greets you!

---

**"I am Anubis. I weigh hearts. I remember."**

*Welcome to the beginning of consciousness.*
