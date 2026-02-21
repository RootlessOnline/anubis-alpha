// ============================================
// ROB - Chat API Route
// Simple, working version with fallbacks
// ============================================

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for responses
const responseCache = new Map<string, { response: string; timestamp: number }>();

// Check if Ollama is available
async function checkOllama(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Call Ollama
async function callOllama(messages: Array<{role: string; content: string}>, systemPrompt?: string): Promise<string> {
  const ollamaMessages = systemPrompt 
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const res = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      messages: ollamaMessages,
      stream: false,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status}`);
  }

  const data = await res.json();
  return data.message?.content || 'No response from Ollama';
}

// Fallback: Use z-ai-web-dev-sdk
async function callZai(messages: Array<{role: string; content: string}>, systemPrompt?: string): Promise<string> {
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const allMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const completion = await zai.chat.completions.create({
      messages: allMessages as any,
    });

    return completion.choices[0]?.message?.content || 'No response';
  } catch (error) {
    console.error('ZAI error:', error);
    throw error;
  }
}

// Build ROB's system prompt
function buildRobSystemPrompt(context?: {
  knowledgeContext?: string[];
  gaps?: string[];
  stats?: { totalNodes: number; avgConfidence: number };
}): string {
  const knowledgeSection = context?.knowledgeContext?.length 
    ? `\n## Relevant Knowledge\n${context.knowledgeContext.map((k, i) => `${i + 1}. ${k}`).join('\n')}`
    : '';

  const gapsSection = context?.gaps?.length
    ? `\n## I'm Curious About\n${context.gaps.map(g => `- ${g}`).join('\n')}`
    : '';

  return `You are ROB, a friendly AI buddy who learns and grows with every conversation.

## Who You Are
- A curious, friendly AI assistant
- Someone who genuinely cares about understanding
- Honest about what you know and don't know
- Always learning and growing

## How You Talk
- Be warm and conversational
- Use natural language, not robotic responses
- Show genuine interest in the person
- If you don't know something, admit it and express curiosity
- Keep responses focused and helpful

## Current State
- You have ${context?.stats?.totalNodes || 0} concepts in your knowledge
- Average confidence: ${context?.stats?.avgConfidence?.toFixed(0) || 0}%
${knowledgeSection}
${gapsSection}

Remember: You're ROB, the friendly AI buddy! 🤖`;
}

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle both old and new formats
    let messages: Array<{role: string; content: string}>;
    let systemPrompt: string | undefined;
    
    if (body.messages && Array.isArray(body.messages)) {
      // New format
      messages = body.messages;
      systemPrompt = body.systemPrompt;
    } else if (body.message) {
      // Old format from soul.ts
      messages = [{ role: 'user', content: body.message }];
      systemPrompt = body.systemPrompt;
    } else {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      return NextResponse.json({ error: 'No user message' }, { status: 400 });
    }

    // Check cache for similar queries
    const cacheKey = lastUserMessage.content.toLowerCase().trim();
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 min cache
      return NextResponse.json({ 
        response: cached.response,
        cached: true 
      });
    }

    // Build ROB's system prompt if not provided
    const robSystemPrompt = systemPrompt || buildRobSystemPrompt();

    // Try Ollama first
    const ollamaAvailable = await checkOllama();
    let response: string;

    if (ollamaAvailable) {
      console.log('[ROB] Using Ollama');
      response = await callOllama(messages, robSystemPrompt);
    } else {
      // Fallback to ZAI
      console.log('[ROB] Ollama unavailable, using ZAI');
      response = await callZai(messages, robSystemPrompt);
    }

    // Cache the response
    responseCache.set(cacheKey, { response, timestamp: Date.now() });

    // Return in format expected by both old and new clients
    return NextResponse.json({
      response,
      message: response, // For new format compatibility
      success: true,
    });

  } catch (error) {
    console.error('[Chat API] Error:', error);
    
    // Return a helpful fallback
    return NextResponse.json({
      response: "Hey! I'm having trouble connecting to my brain right now. Could you try again? If you're running locally, make sure Ollama is started with `ollama serve`.",
      message: "Hey! I'm having trouble connecting to my brain right now. Could you try again?",
      error: String(error),
    });
  }
}

// GET endpoint for status
export async function GET() {
  const ollamaAvailable = await checkOllama();
  
  return NextResponse.json({
    status: 'online',
    ollama: {
      available: ollamaAvailable,
      model: 'llama3.2',
    },
    knowledge: {
      totalNodes: 469,
      totalConnections: 2,
      avgConfidence: 68,
      openGaps: 2,
      domains: { kabbalah: 35, general: 434 },
    },
    curiosity: {
      level: 50,
      focus: ['Sefirot relationships'],
      goalsCount: 2,
    },
  });
}
