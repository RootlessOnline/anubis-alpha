'use client';

import { useState, useEffect, useRef } from 'react';

// Types
interface Message {
  id: string;
  role: 'user' | 'rob' | 'system';
  content: string;
  timestamp: Date;
  confidence?: number;
  gaps?: Gap[];
}

interface Gap {
  missingConcept: string;
  importance: number;
  suggestedSearch: string;
}

interface Node {
  id: string;
  label: string;
  confidence: number;
  domain: string;
}

interface Edge {
  source: string;
  target: string;
  type: string;
  strength: number;
}

interface Stats {
  totalNodes: number;
  totalConnections: number;
  avgConfidence: number;
  openGaps: number;
  domains: Record<string, number>;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  status: string;
  specialization: string;
  energyLevel: number;
  tasksCompleted: number;
}

// Main Component
export default function RobPage() {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge' | 'agents' | 'learn'>('chat');
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [curiosityLevel, setCuriosityLevel] = useState(50);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      setStats(data.knowledge);
      setCuriosityLevel(data.curiosity?.level || 50);
      setOllamaStatus(data.ollama?.available ? 'online' : 'offline');
    } catch (error) {
      console.error('Failed to fetch status:', error);
      setOllamaStatus('offline');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      const robMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'rob',
        content: data.message,
        timestamp: new Date(),
        confidence: data.confidence,
        gaps: data.gapsFound,
      };

      setMessages(prev => [...prev, robMessage]);

      // Update curiosity if changed
      if (data.curiosities?.length > 0) {
        setCuriosityLevel(prev => Math.min(100, prev + 10));
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Oops! Something went wrong. Make sure Ollama is running!',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await fetch('/api/learn/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      const systemMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: `📚 Learned from "${file.name}"!\n\n${data.summary}\n\nConcepts extracted: ${data.conceptsExtracted}\nGaps found: ${data.gapsDetected}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, systemMessage]);
      fetchStatus();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xl font-bold">
              R
            </div>
            <div>
              <h1 className="text-xl font-bold">ROB</h1>
              <p className="text-xs text-gray-400">Self-Evolving AI Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Ollama Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                ollamaStatus === 'online' ? 'bg-green-500' :
                ollamaStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm text-gray-400">
                {ollamaStatus === 'online' ? 'Ollama Online' :
                 ollamaStatus === 'offline' ? 'Ollama Offline' : 'Checking...'}
              </span>
            </div>

            {/* Curiosity Meter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Curiosity:</span>
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${curiosityLevel}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="text-sm text-gray-400">
                <span className="mr-3">🧠 {stats.totalNodes} concepts</span>
                <span className="mr-3">🔗 {stats.totalConnections} connections</span>
                <span>❓ {stats.openGaps} gaps</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex h-[calc(100vh-64px)]">
        {/* Sidebar - Tabs */}
        <nav className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 gap-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === 'chat' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Chat"
          >
            💬
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === 'knowledge' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Knowledge Map"
          >
            🗺️
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === 'agents' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Agents"
          >
            🤖
          </button>
          <button
            onClick={() => setActiveTab('learn')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === 'learn' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Learn"
          >
            📚
          </button>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 mt-20">
                    <div className="text-6xl mb-4">👋</div>
                    <h2 className="text-2xl font-bold mb-2">Hey! I'm ROB!</h2>
                    <p>I'm your friendly AI buddy who learns and grows.</p>
                    <p className="mt-2 text-sm">Upload PDFs or just chat with me!</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600'
                          : msg.role === 'rob'
                          ? 'bg-gray-700'
                          : 'bg-yellow-600/20 border border-yellow-600/50'
                      }`}
                    >
                      {msg.role === 'rob' && (
                        <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
                          <span>ROB</span>
                          {msg.confidence !== undefined && (
                            <span className="px-1.5 py-0.5 bg-gray-600 rounded">
                              {msg.confidence.toFixed(0)}% confidence
                            </span>
                          )}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.gaps && msg.gaps.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">
                          <p className="font-medium">🤔 I'm curious about:</p>
                          {msg.gaps.map((gap, i) => (
                            <p key={i}>• {gap.missingConcept}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                        <span className="text-sm text-gray-400 ml-2">ROB is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-700 p-4">
                <div className="flex gap-2">
                  <label className="cursor-pointer px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    📎 Upload PDF
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Chat with ROB..."
                    className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Knowledge Map Tab */}
          {activeTab === 'knowledge' && (
            <div className="flex-1 p-4">
              <h2 className="text-xl font-bold mb-4">🗺️ Knowledge Map</h2>

              {stats && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-3xl font-bold text-blue-400">{stats.totalNodes}</p>
                    <p className="text-sm text-gray-400">Concepts</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-3xl font-bold text-green-400">{stats.totalConnections}</p>
                    <p className="text-sm text-gray-400">Connections</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-3xl font-bold text-yellow-400">{stats.avgConfidence.toFixed(0)}%</p>
                    <p className="text-sm text-gray-400">Avg Confidence</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-3xl font-bold text-orange-400">{stats.openGaps}</p>
                    <p className="text-sm text-gray-400">Knowledge Gaps</p>
                  </div>
                </div>
              )}

              {/* Domain breakdown */}
              {stats && Object.keys(stats.domains).length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Knowledge Domains</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.domains).map(([domain, count]) => (
                      <div key={domain} className="flex items-center gap-3">
                        <span className="w-24 text-sm text-gray-400 capitalize">{domain}</span>
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(count / stats.totalNodes) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visualization placeholder */}
              <div className="mt-6 bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-400">Interactive knowledge graph visualization coming soon!</p>
                <p className="text-sm text-gray-500 mt-2">For now, use the chat to explore concepts.</p>
              </div>
            </div>
          )}

          {/* Agents Tab */}
          {activeTab === 'agents' && (
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">🤖 Agent Management</h2>
                <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  + Create Agent
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Agent Types */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Available Agent Types</h3>
                  <div className="space-y-2">
                    {[
                      { type: 'researcher', icon: '🔍', desc: 'Deep dive into topics' },
                      { type: 'analyzer', icon: '📊', desc: 'Process documents' },
                      { type: 'connector', icon: '🔗', desc: 'Find relationships' },
                      { type: 'teacher', icon: '👨‍🏫', desc: 'Explain concepts' },
                      { type: 'repo_reader', icon: '💻', desc: 'Understand code' },
                    ].map((agent) => (
                      <button
                        key={agent.type}
                        className="w-full flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-left"
                      >
                        <span className="text-2xl">{agent.icon}</span>
                        <div>
                          <p className="font-medium capitalize">{agent.type.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-400">{agent.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Agents */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Active Agents</h3>
                  {agents.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No agents created yet</p>
                  ) : (
                    <div className="space-y-2">
                      {agents.map((agent) => (
                        <div key={agent.id} className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{agent.name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              agent.status === 'idle' ? 'bg-green-600' :
                              agent.status === 'working' ? 'bg-yellow-600' : 'bg-gray-600'
                            }`}>
                              {agent.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{agent.specialization}</p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                            <span>⚡ {agent.energyLevel}%</span>
                            <span>•</span>
                            <span>✅ {agent.tasksCompleted} tasks</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Learn Tab */}
          {activeTab === 'learn' && (
            <div className="flex-1 p-4">
              <h2 className="text-xl font-bold mb-4">📚 Learning Center</h2>

              <div className="grid grid-cols-2 gap-4">
                {/* PDF Upload */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="font-medium mb-3">📄 Upload Documents</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Upload PDFs to teach ROB new concepts. Each document will be analyzed and integrated into the knowledge network.
                  </p>
                  <label className="block cursor-pointer border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-gray-400">Click to upload PDF</p>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {/* Repository */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="font-medium mb-3">💻 Analyze Repository</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Give ROB access to a GitHub repository to understand code structure, patterns, and concepts.
                  </p>
                  <input
                    type="text"
                    placeholder="https://github.com/user/repo"
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="w-full px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                    Clone & Analyze
                  </button>
                </div>
              </div>

              {/* Learning Goals */}
              <div className="mt-6 bg-gray-800 rounded-lg p-6">
                <h3 className="font-medium mb-3">🎯 Learning Goals</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Based on detected knowledge gaps, here's what ROB wants to learn:
                </p>
                <div className="space-y-2">
                  {stats?.openGaps ? (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                        <span className="text-orange-400">🔥</span>
                        <span>Fill knowledge gaps to improve understanding</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                        <span className="text-blue-400">📚</span>
                        <span>Upload more diverse sources</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-green-400 text-center py-4">
                      ✅ No urgent learning goals! ROB is satisfied.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
