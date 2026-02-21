#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# ANUBIS ALPHA - COMPLETE SETUP SCRIPT
# Run this on your clean PC to set up everything
# ═══════════════════════════════════════════════════════════════════════════

echo "══════════════════════════════════════════════════════════════════════════"
echo "   ANUBIS ALPHA - SETUP SCRIPT"
echo "══════════════════════════════════════════════════════════════════════════"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: Install Node.js 20
# ─────────────────────────────────────────────────────────────────────────────
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: Install Bun
# ─────────────────────────────────────────────────────────────────────────────
echo "📦 Installing Bun..."
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: Install System Dependencies
# ─────────────────────────────────────────────────────────────────────────────
echo "📦 Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y git build-essential python3 poppler-utils

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4: Create Project Directory
# ─────────────────────────────────────────────────────────────────────────────
echo "📁 Creating project directory..."
mkdir -p ~/Documents/Quix/anubis-alpha
cd ~/Documents/Quix/anubis-alpha

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5: Initialize Next.js Project
# ─────────────────────────────────────────────────────────────────────────────
echo "🚀 Initializing Next.js project..."
~/.bun/bin/bunx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-turbopack --yes

# ─────────────────────────────────────────────────────────────────────────────
# STEP 6: Install Dependencies
# ─────────────────────────────────────────────────────────────────────────────
echo "📦 Installing project dependencies..."
~/.bun/bin/bun add sql.js idb uuid framer-motion lucide-react

# ─────────────────────────────────────────────────────────────────────────────
# STEP 7: Create Data Directories
# ─────────────────────────────────────────────────────────────────────────────
echo "📁 Creating data directories..."
mkdir -p anubis-data/files
mkdir -p anubis-data/backups
mkdir -p public/assets

# ─────────────────────────────────────────────────────────────────────────────
# STEP 8: Create Environment File
# ─────────────────────────────────────────────────────────────────────────────
echo "⚙️ Creating environment file..."
cat > .env.local << 'EOF'
ANUBIS_VERSION=alpha
ANUBIS_DATA_DIR=./anubis-data
DATABASE_PATH=./anubis-data/anubis.db
EOF

echo ""
echo "══════════════════════════════════════════════════════════════════════════"
echo "   ✅ SETUP COMPLETE!"
echo "══════════════════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. Copy the source files from /home/z/my-project/ to ~/Documents/Quix/anubis-alpha/"
echo "2. Run: cd ~/Documents/Quix/anubis-alpha && bun run dev"
echo "3. Open: http://localhost:3000"
echo ""
