'use client';

// ═══════════════════════════════════════════════════════════════════════════
// ROB - SIMPLE WORKING VERSION
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function RobChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ollama: boolean; loading: boolean }>({ 
    ollama: false, 
    loading: true 
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check status on load
  useEffect(() => {
    fetch('/api/chat')
      .then(res => res.json())
      .then(data => {
        setStatus({ ollama: data.ollama?.available, loading: false });
      })
      .catch(() => {
        setStatus({ ollama: false, loading: false });
      });

    // Add welcome message
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hey! I'm ROB 🤖 I'm online and ready to chat! Try asking me about:\n\n• Sefirot and Kabbalah (I learned from your PDFs!)\n• AI agents and how I manage them\n• Anything else you're curious about!",
      timestamp: new Date(),
    }]);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userContent = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      console.log('[ROB] Sending:', userContent);
      
      // Only send the current message (let LLM handle context)
      const res = await fetch('/api/chat?t=' + Date.now(), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userContent }],
        }),
      });

      const data = await res.json();
      console.log('[ROB] Response:', data);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || "Hmm, I'm having trouble thinking right now. Try again?",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('[ROB] Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: "Oops! Something went wrong. Check the console for details.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold shadow-lg shadow-purple-500/30">
              R
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                ROB
              </h1>
              <p className="text-sm text-slate-400">Self-Evolving AI Buddy</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                status.loading ? 'bg-yellow-500 animate-pulse' :
                status.ollama ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-slate-400">
                {status.loading ? 'Connecting...' :
                 status.ollama ? 'Ollama Connected' : 'Using Fallback AI'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-hidden max-w-4xl mx-auto w-full flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
                    : msg.role === 'system'
                    ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-100 rounded-bl-md'
                    : 'bg-slate-800/80 border border-slate-700/50 text-slate-100 rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl px-4 py-3 rounded-bl-md">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-slate-400 text-sm">ROB is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={loading ? "ROB is thinking..." : "Chat with ROB..."}
              className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-500"
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/20"
            >
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 px-6 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <span>🧠 469 concepts | ❓ 2 knowledge gaps</span>
          <span>Curiosity: 50%</span>
        </div>
      </footer>
    </div>
  );
}
