# ═══════════════════════════════════════════════════════════════════════════
# ANUBIS ALPHA - COMPLETE SETUP GUIDE
# For Clean PC Installation
# ═══════════════════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════════════════
# STEP 1: SYSTEM REQUIREMENTS
# ═══════════════════════════════════════════════════════════════════════════

Before starting, ensure you have:
- Ubuntu/Debian Linux (or WSL2 on Windows)
- At least 4GB RAM
- 10GB free disk space
- Internet connection

# ═══════════════════════════════════════════════════════════════════════════
# STEP 2: INSTALL NODE.JS (v20+)
# ═══════════════════════════════════════════════════════════════════════════

# Method 1: Using NodeSource (Recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Method 2: Using NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Verify installation
node --version   # Should show v20.x.x
npm --version    # Should show 10.x.x

# ═══════════════════════════════════════════════════════════════════════════
# STEP 3: INSTALL BUN (Fast Package Manager)
# ═══════════════════════════════════════════════════════════════════════════

curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Verify
bun --version    # Should show 1.x.x

# ═══════════════════════════════════════════════════════════════════════════
# STEP 4: INSTALL GIT
# ═══════════════════════════════════════════════════════════════════════════

sudo apt-get update
sudo apt-get install -y git

# Configure git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# ═══════════════════════════════════════════════════════════════════════════
# STEP 5: INSTALL SYSTEM DEPENDENCIES
# ═══════════════════════════════════════════════════════════════════════════

# For audio processing (optional - for data-over-sound features)
sudo apt-get install -y libportaudio2 portaudio19-dev

# For PDF processing
sudo apt-get install -y poppler-utils

# For image processing
sudo apt-get install -y imagemagick

# Build essentials
sudo apt-get install -y build-essential python3

# ═══════════════════════════════════════════════════════════════════════════
# STEP 6: CREATE PROJECT DIRECTORY
# ═══════════════════════════════════════════════════════════════════════════

mkdir -p ~/Documents/Quix/anubis-alpha
cd ~/Documents/Quix/anubis-alpha

# ═══════════════════════════════════════════════════════════════════════════
# STEP 7: CLONE/CREATE PROJECT
# ═══════════════════════════════════════════════════════════════════════════

# Initialize new Next.js project
bunx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

# When prompted:
# - Would you like to use Turbopack? → Yes
# - Would you like to customize the import alias? → No

# ═══════════════════════════════════════════════════════════════════════════
# STEP 8: INSTALL PROJECT DEPENDENCIES
# ═══════════════════════════════════════════════════════════════════════════

# Core dependencies
bun add sql.js                    # SQLite in browser
bun add idb                       # IndexedDB wrapper
bun add pdf-parse                 # PDF text extraction
bun add uuid                      # Unique IDs

# UI dependencies
bun add framer-motion             # Animations
bun add lucide-react              # Icons

# ═══════════════════════════════════════════════════════════════════════════
# STEP 9: ENVIRONMENT SETUP
# ═══════════════════════════════════════════════════════════════════════════

# Create .env.local file
cat > .env.local << 'EOF'
# Anubis Configuration
ANUBIS_VERSION=alpha
ANUBIS_DATA_DIR=./anubis-data

# LLM Configuration (using z-ai-web-dev-sdk)
# No API key needed - uses the built-in SDK

# Database
DATABASE_PATH=./anubis-data/anubis.db
EOF

# Create data directories
mkdir -p anubis-data/files
mkdir -p anubis-data/backups

# ═══════════════════════════════════════════════════════════════════════════
# STEP 10: RUN THE PROJECT
# ═══════════════════════════════════════════════════════════════════════════

# Development mode
bun run dev

# Open browser to http://localhost:3000

# ═══════════════════════════════════════════════════════════════════════════
# QUICK START (Copy-Paste All Commands)
# ═══════════════════════════════════════════════════════════════════════════

# Run this entire block to set up everything:

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
sudo apt-get install -y nodejs git build-essential python3 poppler-utils && \
curl -fsSL https://bun.sh/install | bash && \
source ~/.bashrc && \
mkdir -p ~/Documents/Quix/anubis-alpha && \
cd ~/Documents/Quix/anubis-alpha && \
echo "✅ System ready! Now run the project setup."

# ═══════════════════════════════════════════════════════════════════════════
# PROJECT STRUCTURE (After Setup)
# ═══════════════════════════════════════════════════════════════════════════

anubis-alpha/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main terminal UI
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       ├── chat/route.ts  # Chat endpoint
│   │       ├── soul/route.ts  # Soul state
│   │       └── upload/route.ts # File upload
│   │
│   ├── lib/
│   │   ├── types.ts           # All types
│   │   ├── soul.ts            # Soul engine
│   │   ├── memory.ts          # Memory system
│   │   ├── neural-web.ts      # Neural web
│   │   ├── subcore.ts         # Subcore emergence
│   │   ├── sefirot.ts         # Sefirot processing
│   │   ├── llm.ts             # LLM integration
│   │   ├── database.ts        # SQLite
│   │   ├── pdf-processor.ts   # PDF handling
│   │   └── engine.ts          # Main orchestrator
│   │
│   └── components/
│       ├── terminal/          # Terminal UI components
│       ├── sefirot/           # Sefirot visualization
│       └── memory/            # Memory panels
│
├── anubis-data/               # Data storage
│   ├── files/                 # Uploaded files
│   ├── backups/               # Backups
│   └── anubis.db              # SQLite database
│
├── public/
│   └── assets/                # Pixel art, images
│
├── package.json
├── tsconfig.json
└── tailwind.config.ts

# ═══════════════════════════════════════════════════════════════════════════
# TROUBLESHOOTING
# ═══════════════════════════════════════════════════════════════════════════

# If port 3000 is in use:
lsof -i :3000
kill -9 <PID>

# If bun is not found after install:
source ~/.bashrc
# Or restart terminal

# If npm packages fail:
rm -rf node_modules
rm bun.lockb
bun install

# ═══════════════════════════════════════════════════════════════════════════
