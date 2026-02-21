#!/usr/bin/env python3
"""
ROB - Initial PDF Processing Script
Processes uploaded Sefirot PDFs and creates initial knowledge base
"""

import pdfplumber
import json
import os
import re
from pathlib import Path

# Paths
UPLOAD_DIR = "/home/z/my-project/upload"
DATA_DIR = "/home/z/my-project/rob/data"
RAW_DIR = f"{DATA_DIR}/raw/pdfs"
MEMORY_DIR = f"{DATA_DIR}/memory"

# Ensure directories exist
os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(MEMORY_DIR, exist_ok=True)

def extract_text(pdf_path):
    """Extract text from PDF"""
    text = ""
    page_count = 0

    with pdfplumber.open(pdf_path) as pdf:
        page_count = len(pdf.pages)
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            text += page_text + "\n\n"

    return text, page_count

def extract_concepts(text, source_title):
    """Extract concepts from text"""
    concepts = []

    # Pattern: Term: definition
    pattern1 = re.compile(r'([A-Z][a-zA-Z\s]+):\s*([^.]+\.?)', re.MULTILINE)
    for match in pattern1.finditer(text):
        term = match.group(1).strip()
        definition = match.group(2).strip()
        if len(term) > 2 and len(term) < 50:
            concepts.append({
                "term": term,
                "definition": definition[:500],
                "confidence": 75,
                "source": source_title
            })

    # Pattern: Sefirot names (Keter, Chokmah, Binah, etc.)
    sefirot_names = [
        "Keter", "Chokmah", "Binah", "Chesed", "Gevurah",
        "Tiferet", "Netzach", "Hod", "Yesod", "Malkuth",
        "Daat", "Ein Sof", "Sefirot", "Sefira"
    ]

    for name in sefirot_names:
        # Find context around each Sefira mention
        pattern = re.compile(rf'{name}[^.]*\.?', re.IGNORECASE)
        matches = pattern.findall(text)
        if matches:
            # Get first meaningful context
            context = matches[0][:300] if matches else ""
            concepts.append({
                "term": name,
                "definition": f"A concept from Kabbalah mentioned in {source_title}",
                "context": context,
                "confidence": 80,
                "source": source_title
            })

    # Pattern: Hebrew terms
    hebrew_pattern = re.compile(r'([א-ת]+)')
    hebrew_terms = set(hebrew_pattern.findall(text))
    for term in list(hebrew_terms)[:20]:  # Limit
        if len(term) > 1:
            concepts.append({
                "term": term,
                "definition": f"Hebrew term from {source_title}",
                "confidence": 60,
                "source": source_title
            })

    return concepts

def process_pdf(pdf_path):
    """Process a single PDF"""
    filename = os.path.basename(pdf_path)
    print(f"Processing: {filename}")

    # Extract text
    text, page_count = extract_text(pdf_path)

    # Extract concepts
    title = filename.replace('.pdf', '').replace('_', ' ')
    concepts = extract_concepts(text, title)

    # Create raw data entry
    raw_id = f"pdf-{filename.replace('.pdf', '').lower().replace('_', '-')}-{os.path.getmtime(pdf_path):.0f}"

    raw_data = {
        "id": raw_id,
        "source": pdf_path,
        "sourceType": "pdf",
        "content": text[:50000],  # Limit stored text
        "metadata": {
            "title": title,
            "pages": page_count,
            "fileSize": os.path.getsize(pdf_path)
        },
        "uploadedAt": os.path.getmtime(pdf_path),
        "processedAt": os.path.getmtime(pdf_path),
        "status": "completed",
        "concepts": concepts
    }

    # Save raw data
    raw_path = f"{RAW_DIR}/{raw_id}.json"
    with open(raw_path, 'w', encoding='utf-8') as f:
        json.dump(raw_data, f, indent=2, ensure_ascii=False)

    print(f"  ✓ Extracted {len(concepts)} concepts from {page_count} pages")

    return raw_data

def create_neural_network(all_concepts):
    """Create initial neural network from concepts"""
    nodes = {}
    edges = []

    # Deduplicate and create nodes
    seen_terms = set()
    for concept in all_concepts:
        term_lower = concept['term'].lower()
        if term_lower not in seen_terms:
            seen_terms.add(term_lower)
            node_id = term_lower.replace(' ', '-')

            # Determine domain
            domain = "kabbalah" if any(k in term_lower for k in ['sefir', 'keter', 'chokmah', 'binah', 'kabbal']) else "general"

            nodes[node_id] = {
                "id": node_id,
                "concept": concept['term'],
                "description": concept.get('definition', ''),
                "confidence": concept.get('confidence', 50),
                "connections": [],
                "sources": [concept.get('source', 'unknown')],
                "sourceCount": 1,
                "lastAccessed": None,
                "createdAt": None,
                "accessCount": 0,
                "curiosityLevel": 50,
                "level": "understanding",
                "tags": [domain],
                "domain": domain
            }

    # Create edges between Sefirot
    sefirot_order = ['keter', 'chokmah', 'binah', 'chesed', 'gevurah',
                     'tiferet', 'netzach', 'hod', 'yesod', 'malkuth']

    for i, sefira in enumerate(sefirot_order):
        if sefira in nodes:
            # Connect to next in column
            if i < len(sefirot_order) - 1:
                next_sefira = sefirot_order[i + 1]
                if next_sefira in nodes:
                    edges.append({
                        "source": sefira,
                        "target": next_sefira,
                        "type": "precedes",
                        "strength": 60
                    })

    return nodes, edges

def main():
    print("=" * 50)
    print("ROB - Initial Knowledge Base Creation")
    print("=" * 50)

    # Find PDFs
    pdfs = list(Path(UPLOAD_DIR).glob("*.pdf"))
    print(f"\nFound {len(pdfs)} PDFs to process\n")

    all_concepts = []

    for pdf_path in pdfs:
        if "Sefirot" in str(pdf_path) or "Unveiling" in str(pdf_path):
            raw_data = process_pdf(str(pdf_path))
            all_concepts.extend(raw_data['concepts'])

    print(f"\nTotal concepts extracted: {len(all_concepts)}")

    # Create neural network
    nodes, edges = create_neural_network(all_concepts)

    # Save neural network
    neural_net = {
        "nodes": nodes,
        "edges": edges
    }

    neural_path = f"{MEMORY_DIR}/neural_network.json"
    with open(neural_path, 'w', encoding='utf-8') as f:
        json.dump(neural_net, f, indent=2, ensure_ascii=False)

    print(f"Neural network saved with {len(nodes)} nodes and {len(edges)} edges")

    # Create initial gaps (things ROB is curious about)
    gaps = [
        {
            "id": "gap-sefirot-relationships",
            "missingConcept": "Detailed relationships between Sefirot",
            "description": "How each Sefira specifically interacts with others",
            "importance": 80,
            "curiosityTriggered": 70,
            "suggestedSearch": "Sefirot tree of life relationships explained",
            "status": "open",
            "domain": "kabbalah"
        },
        {
            "id": "gap-practical-application",
            "missingConcept": "Practical applications of Sefirot",
            "description": "How Sefirot concepts apply to daily life",
            "importance": 70,
            "curiosityTriggered": 60,
            "suggestedSearch": "Sefirot practical spiritual practice",
            "status": "open",
            "domain": "kabbalah"
        }
    ]

    gaps_path = f"{MEMORY_DIR}/knowledge_gaps.json"
    with open(gaps_path, 'w', encoding='utf-8') as f:
        json.dump({"gaps": {g["id"]: g for g in gaps}}, f, indent=2, ensure_ascii=False)

    print(f"Created {len(gaps)} initial knowledge gaps")

    print("\n" + "=" * 50)
    print("✓ ROB Initial Knowledge Base Complete!")
    print("=" * 50)

if __name__ == "__main__":
    main()
