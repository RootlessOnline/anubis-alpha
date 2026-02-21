// ============================================
// ROB - Chat API Route
// Main conversation endpoint
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getOllama, generateRobSystemPrompt } from '@/lib/ollama';
import { getNeuralNet } from '@/lib/brain/neural-net';
import { getGapDetector } from '@/lib/brain/gap-detector';
import { getCuriosityEngine } from '@/lib/brain/curiosity';
import { getAgentManager } from '@/lib/agents/agent-manager';
import { ChatResponse, Message } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, stream = false } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array required' },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastUserMessage = messages.filter((m: Message) => m.role === 'user').pop();
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      );
    }

    // Initialize systems
    const neuralNet = getNeuralNet();
    const gapDetector = getGapDetector();
    const curiosity = getCuriosityEngine();
    const agentManager = getAgentManager();
    const ollama = getOllama();

    // Check if Ollama is available
    const ollamaAvailable = await ollama.isAvailable();
    if (!ollamaAvailable) {
      return NextResponse.json({
        message: "Hey! I'm ROB, but it looks like my brain (Ollama) isn't running. Please start Ollama with `ollama serve` and make sure you have llama3.2 installed with `ollama pull llama3.2`.",
        confidence: 0,
        gapsFound: [],
        curiosities: [],
        sourcesUsed: [],
        suggestedActions: ['Start Ollama', 'Install llama3.2'],
        agentsInvolved: [],
      } as ChatResponse);
    }

    // Query the neural network for relevant knowledge
    const queryResult = neuralNet.query(lastUserMessage.content);

    // Analyze for gaps
    const gapAnalysis = gapDetector.analyzeForQuery(lastUserMessage.content);

    // Get pending curiosities
    const pendingCuriosities = curiosity.getTopCuriosities(3);

    // Build knowledge context
    const knowledgeContext = queryResult.relevantNodes
      .slice(0, 5)
      .map(node => `${node.concept}: ${node.description} (confidence: ${node.confidence}%)`);

    // Get stats
    const stats = neuralNet.getStats();

    // Generate system prompt
    const systemPrompt = generateRobSystemPrompt({
      knowledgeContext,
      gaps: gapAnalysis.gaps.map(g => g.missingConcept),
      curiosities: pendingCuriosities.map(c => c.source),
      stats: {
        totalNodes: stats.totalNodes,
        avgConfidence: stats.avgConfidence,
      },
    });

    // If streaming, use streaming response
    if (stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            await ollama.streamChat(
              messages,
              (chunk) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
              },
              {
                systemPrompt,
                temperature: 0.7,
                maxTokens: 2000,
              }
            );

            // Save conversation to memory
            // (Implementation would save to conversation log)

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
            controller.close();
          } catch (error) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(error) })}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response
    const response = await ollama.chat(messages, {
      systemPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Process any gaps found
    for (const gap of gapAnalysis.gaps.slice(0, 2)) {
      curiosity.processGap(gap);
    }

    // Save neural network state
    neuralNet.save();
    curiosity.save();

    // Build response
    const chatResponse: ChatResponse = {
      message: response,
      confidence: queryResult.confidence,
      gapsFound: gapAnalysis.gaps.slice(0, 3).map(g => ({
        ...g,
        detected: g.detected.toISOString(),
      } as any)),
      curiosities: pendingCuriosities.slice(0, 2).map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      } as any)),
      sourcesUsed: queryResult.relevantNodes.slice(0, 3).map(n => n.concept),
      suggestedActions: queryResult.suggestions,
      agentsInvolved: [],
    };

    return NextResponse.json(chatResponse);
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint for status
export async function GET() {
  const neuralNet = getNeuralNet();
  const curiosity = getCuriosityEngine();
  const agentManager = getAgentManager();
  const ollama = getOllama();

  const stats = neuralNet.getStats();
  const curiosityState = curiosity.getState();
  const agentStats = agentManager.getStats();
  const ollamaAvailable = await ollama.isAvailable();

  return NextResponse.json({
    status: 'online',
    ollama: {
      available: ollamaAvailable,
      model: ollama.getModel(),
    },
    knowledge: stats,
    curiosity: {
      level: curiosityState.level,
      focus: curiosityState.focus,
      goalsCount: curiosityState.learningGoals.length,
    },
    agents: agentStats,
  });
}
