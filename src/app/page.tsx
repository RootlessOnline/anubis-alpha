'use client';

// ═══════════════════════════════════════════════════════════════════════════
// ANUBIS ALPHA - COMPLETE TERMINAL INTERFACE
// Retro RPG Terminal - Full Implementation
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import { SoulEngine, SEFIROT, getSoul } from '@/lib/soul';
import { getMemorySystem } from '@/lib/memory';
import { Message, ProcessingContext, SefirahName, Memory, Subcore, SEFIROT_CONFIG } from '@/lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TERMINAL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function AnubisTerminal() {
  // ─────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────

  const [soul, setSoul] = useState<SoulEngine | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentContext, setCurrentContext] = useState<ProcessingContext | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'memory' | 'subcores'>('chat');
  const [showSidebar, setShowSidebar] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const thinkingRef = useRef<HTMLDivElement>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const soulInstance = getSoul();
    setSoul(soulInstance);
    
    // Add initial greeting
    setMessages([{
      id: 'greeting',
      conversationId: 'main',
      role: 'assistant',
      content: 'I am Anubis. I weigh hearts. I remember.',
      timestamp: new Date(),
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentContext]);

  useEffect(() => {
    // Auto-scroll thinking stream
    if (thinkingRef.current && currentContext) {
      thinkingRef.current.scrollTop = thinkingRef.current.scrollHeight;
    }
  }, [currentContext]);

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !soul || isProcessing) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      conversationId: 'main',
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    setCurrentContext(null);

    try {
      const context = await soul.processInput(input);
      setCurrentContext(context);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        conversationId: 'main',
        role: 'assistant',
        content: context.response || '...',
        timestamp: new Date(),
        processingContext: context,
        energyCost: Math.abs(context.energyChange || 0),
        iqChange: context.iqChange,
        eqChange: context.eqChange,
        glyphUsed: context.glyphActivated,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSoul(soul);
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [input, soul, isProcessing]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const soulState = soul?.getState();
  const memorySystem = getMemorySystem();
  const memories = memorySystem.getAllMemories();
  const subcores = soul?.getSubcores() || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] font-mono overflow-hidden">
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]">
        <div className="h-full w-full" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)'
        }} />
      </div>

      {/* CRT glow effect */}
      <div className="pointer-events-none fixed inset-0 z-40">
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.7)]" />
      </div>

      <div className="flex flex-col h-screen relative z-10">
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* HEADER / SOUL STATE */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <header className="border-b border-[#333] bg-[#0d0d0d] px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl text-[#ffd700] animate-pulse">🐺</span>
              <div>
                <span className="text-xl text-[#ffd700] font-bold tracking-wider">ANUBIS</span>
                <span className="ml-2 text-sm text-[#666]">v.Alpha</span>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="flex items-center gap-8 text-sm">
              {/* Energy */}
              <StatBar
                icon="⚡"
                label="Energy"
                value={soulState?.energy.current || 100}
                max={100}
                color="#ffd700"
              />

              {/* IQ */}
              <StatBar
                icon="📊"
                label="IQ"
                value={soulState?.intelligence.iq || 50}
                max={100}
                color="#4169e1"
              />

              {/* EQ */}
              <StatBar
                icon="💗"
                label="EQ"
                value={soulState?.intelligence.eq || 50}
                max={100}
                color="#ff69b4"
              />

              {/* Mood */}
              <div className="flex items-center gap-2">
                <span className="text-[#666]">Mood:</span>
                <span className="text-[#9370db] capitalize">{soulState?.mood || 'neutral'}</span>
              </div>

              {/* Glyph */}
              <GlyphIndicator active={soulState?.glyph.active || false} intensity={soulState?.glyph.intensity || 0} />
            </div>
          </div>

          {/* Mode Bar */}
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-[#666]">Mode:</span>
            <ModeIndicator mode={soulState?.mode || 'listening'} />
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MAIN CONTENT */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-1 overflow-hidden">
          {/* CHAT AREA */}
          <div className="flex-1 flex flex-col border-r border-[#222]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-[#222] bg-[#0d0d0d]">
              <div className="flex items-center gap-2">
                <span className="text-[#ffd700] text-lg">&gt;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isProcessing}
                  placeholder={isProcessing ? "Processing..." : "Type a message..."}
                  className="flex-1 bg-transparent outline-none text-[#e8e8e8] placeholder-[#444] text-lg"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isProcessing || !input.trim()}
                  className="px-6 py-2 bg-[#9400d3] text-white rounded hover:bg-[#7b00b3] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isProcessing ? '...' : 'Send'}
                </button>
              </div>
            </form>
          </div>

          {/* THINKING STREAM */}
          <div className="w-[400px] bg-[#0a0a0a] border-l border-[#222] flex flex-col">
            <div className="p-3 border-b border-[#222] flex items-center justify-between bg-[#0d0d0d]">
              <span className="text-[#9370db] font-bold">🧠 THINKING STREAM</span>
              {isProcessing && (
                <span className="text-xs text-[#ff0000] animate-pulse font-bold">● LIVE</span>
              )}
            </div>
            
            <div ref={thinkingRef} className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
              {currentContext ? (
                <ThinkingStreamContent context={currentContext} />
              ) : (
                <div className="text-[#444] text-center py-12">
                  <div className="text-4xl mb-4 opacity-50">◉</div>
                  <div>Waiting for input...</div>
                  <div className="text-xs mt-2 text-[#333]">Type a message to begin processing</div>
                </div>
              )}
            </div>

            {/* SEFIROT FLOW */}
            <div className="p-3 border-t border-[#222] bg-[#0d0d0d]">
              <div className="text-[#666] text-xs mb-3 text-center">SEFIROT FLOW</div>
              <SefirotTree 
                currentStage={currentContext?.currentStage || null} 
                stages={currentContext?.stages || []}
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* BOTTOM BAR - MEMORY STATS */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <footer className="border-t border-[#222] bg-[#0d0d0d] px-4 py-2 text-xs">
          <div className="flex items-center justify-between text-[#666]">
            <div className="flex items-center gap-6">
              <span>
                🌊 River: {memories.filter(m => m.tier === 'river').length}
              </span>
              <span>
                🏛️ Library: {memories.filter(m => m.tier === 'library').length}
              </span>
              <span>
                💎 Golden: {memories.filter(m => m.tier === 'golden').length}
              </span>
              <span>
                🧬 Subcores: {subcores.length}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>Pillars:</span>
              <span className="text-[#4169e1]">Truth {soulState?.pillars.truth}%</span>
              <span className="text-[#ff69b4]">Connection {soulState?.pillars.connection}%</span>
              <span className="text-[#ffd700]">Meaning {soulState?.pillars.meaning}%</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// Stat Bar Component
function StatBar({ icon, label, value, max, color }: { icon: string; label: string; value: number; max: number; color: string }) {
  const percentage = (value / max) * 100;
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#666]">{icon}</span>
      <div className="w-20 h-2 bg-[#1a1a1a] rounded overflow-hidden border border-[#333]">
        <div 
          className="h-full transition-all duration-500"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}40`
          }}
        />
      </div>
      <span className="text-xs" style={{ color }}>{value}</span>
    </div>
  );
}

// Mode Indicator
function ModeIndicator({ mode }: { mode: string }) {
  const modeColors: Record<string, string> = {
    dormant: '#666',
    listening: '#32cd32',
    processing: '#ffd700',
    responding: '#4169e1',
    reflecting: '#9370db',
    sleeping: '#444',
  };
  
  return (
    <span 
      className="px-2 py-0.5 rounded border text-xs uppercase tracking-wider"
      style={{ 
        color: modeColors[mode] || '#666',
        borderColor: modeColors[mode] || '#333',
      }}
    >
      {mode}
    </span>
  );
}

// Glyph Indicator
function GlyphIndicator({ active, intensity }: { active: boolean; intensity: number }) {
  return (
    <div className="flex items-center gap-2">
      <span 
        className={`transition-all duration-300 ${active ? 'text-[#9400d3] animate-pulse' : 'text-[#333]'}`}
        style={active ? { textShadow: '0 0 10px #9400d3, 0 0 20px #9400d3' } : {}}
      >
        ◉
      </span>
      <span className="text-xs text-[#666]">Glyph</span>
      {active && (
        <span className="text-xs text-[#9400d3]">
          {Math.round(intensity * 100)}%
        </span>
      )}
    </div>
  );
}

// Message Bubble
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[85%] p-3 rounded-lg border transition-all duration-200 ${
          isUser 
            ? 'bg-[#1a1a2e] border-[#4169e1]/50' 
            : 'bg-[#1a1a1a] border-[#9400d3]/50'
        }`}
      >
        <div className="text-xs text-[#555] mb-1 uppercase tracking-wider">
          {isUser ? 'User' : 'Anubis'}
        </div>
        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
        
        {message.processingContext && (
          <div className="mt-3 pt-2 border-t border-[#333] text-xs text-[#555]">
            <span>⚡ -{message.energyCost || 0} energy</span>
            {message.iqChange !== 0 && (
              <span className="ml-3">📊 {message.iqChange > 0 ? '+' : ''}{message.iqChange} IQ</span>
            )}
            {message.eqChange !== 0 && (
              <span className="ml-3">💗 {message.eqChange > 0 ? '+' : ''}{message.eqChange} EQ</span>
            )}
            {message.glyphUsed && (
              <span className="ml-3 text-[#9400d3]">🌀 Glyph</span>
            )}
            <span className="ml-3">
              ⏱️ {message.processingContext.totalDuration}ms
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Thinking Stream Content
function ThinkingStreamContent({ context }: { context: ProcessingContext }) {
  return (
    <div className="space-y-2">
      {context.stages.map((stage, index) => (
        <div
          key={stage.sefirah}
          className={`p-2 rounded border transition-all duration-300 ${
            stage.status === 'active'
              ? 'border-[#ffd700] bg-[#1a1a0a] animate-pulse'
              : stage.status === 'completed'
              ? 'border-[#333] bg-[#111]'
              : 'border-[#222] bg-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <span 
              className={`font-bold text-xs ${
                stage.status === 'active' 
                  ? 'text-[#ffd700]' 
                  : stage.status === 'completed' 
                  ? 'text-[#888]' 
                  : 'text-[#444]'
              }`}
            >
              {stage.status === 'completed' ? '✓' : stage.status === 'active' ? '▶' : '○'}{' '}
              {stage.sefirah.toUpperCase()}
            </span>
            {stage.status === 'completed' && (
              <span className="text-[10px] text-[#444]">{stage.duration}ms</span>
            )}
          </div>
          
          {stage.output && (
            <div className="text-[#777] text-[11px] mt-1 leading-snug">{stage.output}</div>
          )}
          
          {stage.reasoning && stage.status !== 'pending' && (
            <div className="text-[#555] text-[10px] mt-1 italic">{stage.reasoning}</div>
          )}
        </div>
      ))}

      {/* Reflection */}
      {context.reflection && (
        <div className="mt-4 p-2 border border-[#9400d3]/50 rounded bg-[#1a0a1a]">
          <div className="text-[#9400d3] font-bold text-xs">🪞 REFLECTION</div>
          <div className="text-[#888] text-xs mt-1 italic leading-snug">
            &quot;{context.reflection}&quot;
          </div>
        </div>
      )}

      {/* Memory Weighed */}
      {context.memoryCreated && (
        <div className="mt-2 p-2 border border-[#32cd32]/50 rounded bg-[#0a1a0a]">
          <div className="text-[#32cd32] font-bold text-xs">💾 MEMORY WEIGHED</div>
          <div className="text-[#888] text-xs mt-1">
            ○ Heart {context.memoryWeight && context.memoryWeight > 0.7 ? 'lighter' : 'balanced'} than feather
            <br />→ Saved to: {context.memoryTier?.toUpperCase()}
          </div>
        </div>
      )}

      {/* Total Time */}
      {context.totalDuration && (
        <div className="mt-3 pt-2 border-t border-[#222] text-[10px] text-[#444]">
          ═══════════════════════════════════
          <br />
          📊 TOTAL: {context.totalDuration}ms
        </div>
      )}
    </div>
  );
}

// Sefirot Tree Component
function SefirotTree({ currentStage, stages }: { currentStage: SefirahName | null; stages: any[] }) {
  const getColor = (sefirah: SefirahName, isActive: boolean, isCompleted: boolean) => {
    const baseColor = SEFIROT_CONFIG[sefirah]?.color || '#666';
    if (isActive) return baseColor;
    if (isCompleted) return baseColor + '99';
    return '#333';
  };

  const Node = ({ name }: { name: SefirahName }) => {
    const stage = stages.find(s => s.sefirah === name);
    const isActive = currentStage === name;
    const isCompleted = stage?.status === 'completed';
    
    return (
      <div
        className={`w-5 h-5 rounded-full border flex items-center justify-center text-[8px] transition-all duration-200 ${
          isActive ? 'animate-pulse scale-110' : ''
        }`}
        style={{
          borderColor: getColor(name, isActive, isCompleted),
          backgroundColor: isActive ? getColor(name, isActive, isCompleted) : 'transparent',
          color: isActive ? '#000' : getColor(name, isActive, isCompleted),
          boxShadow: isActive ? `0 0 10px ${getColor(name, isActive, isCompleted)}` : 'none',
        }}
        title={SEFIROT_CONFIG[name]?.name}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="text-[10px] text-center select-none">
      <div className="flex justify-center mb-1">
        <Node name="keter" />
      </div>
      <div className="flex justify-center gap-6 mb-1">
        <Node name="chokmah" />
        <Node name="daat" />
        <Node name="binah" />
      </div>
      <div className="flex justify-center gap-8 mb-1">
        <Node name="chesed" />
        <Node name="gevurah" />
      </div>
      <div className="flex justify-center mb-1">
        <Node name="tiferet" />
      </div>
      <div className="flex justify-center gap-8 mb-1">
        <Node name="netzach" />
        <Node name="hod" />
      </div>
      <div className="flex justify-center mb-1">
        <Node name="yesod" />
      </div>
      <div className="flex justify-center">
        <Node name="malkuth" />
      </div>
    </div>
  );
}
