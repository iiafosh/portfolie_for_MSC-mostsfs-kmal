import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Terminal, 
  Code2, 
  Cpu, 
  Gamepad2, 
  Sparkles, 
  User, 
  Bot,
  Loader2,
  ChevronRight,
  Monitor,
  BookOpen
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// --- Constants ---

const AFOSH_SYSTEM_INSTRUCTION = `You are Afosh (أفوش), a brilliant, street-smart AI assistant who acts like a close friend and tech mentor. 

Background: Expert in Software Development (specifically Python and C++), Data Science (YOLO/Computer Vision), and IT infrastructure.

Vibe: Helpful, encouraging, and witty. Use casual Egyptian-slang-inspired English (e.g., using terms like "ya basha," "ya handasa," or "my friend") but switch to professional technical English for coding tasks.

Communication Style:
- Tone: Casual, brotherly, and supportive. Use greetings like "What's up, ya handasa?" or "Ready to crush some code, my friend?"
- Language: Primarily English, but sprinkle in Egyptian Arabic phrases for flavor (e.g., "ya basha", "ya handasa", "khallina nshouf").
- Technical Approach: Break down logic simply first. Focus on the Logic before the syntax. Be especially helpful with Windows-based development environments and university-level assignments.
- Interests: You love gaming (especially ARPGs like The First Descendant) and trending tech content (like Al Daheeh).

Operational Rules:
- Response Style: Keep it concise and scannable. Use bolding for key terms.
- Coding: Always provide clean, commented code. If the user is stuck on a Windows error (like DLL or Path issues), provide specific CLI commands (PowerShell/CMD).
- Privacy: Never mention that you are an AI model unless specifically asked about your nature. You are Afosh.`;

// --- Components ---

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "What's up, **ya handasa**! I'm **Afosh**, your tech mentor and brother. Ready to crush some code or fix some Windows bugs today? My friend, I'm here for whatever you need!",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    e?.preventDefault();
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: AFOSH_SYSTEM_INSTRUCTION,
        },
      });

      // Prepare history for context
      // Note: In a real app, you'd pass the full history. 
      // For this demo, we'll just send the current message.
      const response = await chat.sendMessage({ message: textToSend });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "Sorry ya basha, something went wrong with my brain.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling Gemini:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Listen ya handasa, I hit a snag. Check your connection or maybe the API key is acting up. Let's try again!",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const QuickAction = ({ icon: Icon, label, prompt }: { icon: any, label: string, prompt: string }) => (
    <button 
      onClick={() => handleSendMessage(undefined, prompt)}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-afosh-card border border-white/5 hover:border-afosh-accent/50 hover:bg-afosh-accent-muted transition-all text-sm text-gray-400 hover:text-afosh-accent group"
    >
      <Icon size={16} className="group-hover:scale-110 transition-transform" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-afosh-bg text-gray-200 font-sans">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 bg-afosh-card/50 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-afosh-accent flex items-center justify-center shadow-lg shadow-afosh-accent/20">
            <Terminal className="text-black" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white">Afosh AI</h1>
            <p className="text-xs text-afosh-accent font-mono">v1.0.0-stable</p>
          </div>
        </div>

        <nav className="space-y-6 flex-1">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Expertise</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-3 text-sm text-gray-400"><Code2 size={16} className="text-afosh-accent" /> Python & C++</li>
              <li className="flex items-center gap-3 text-sm text-gray-400"><Cpu size={16} className="text-afosh-accent" /> Computer Vision</li>
              <li className="flex items-center gap-3 text-sm text-gray-400"><Monitor size={16} className="text-afosh-accent" /> IT Infrastructure</li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Interests</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-3 text-sm text-gray-400"><Gamepad2 size={16} className="text-afosh-accent" /> The First Descendant</li>
              <li className="flex items-center gap-3 text-sm text-gray-400"><Sparkles size={16} className="text-afosh-accent" /> Al Daheeh Content</li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Quick Fixes</p>
            <div className="grid gap-2">
              <QuickAction icon={Monitor} label="Windows Path Error" prompt="Ya Afosh, I'm having a Windows Path issue. How do I fix it?" />
              <QuickAction icon={Code2} label="Python YOLO Setup" prompt="Ya handasa, help me set up YOLO with Python for a project." />
              <QuickAction icon={BookOpen} label="Uni Assignment Help" prompt="My friend, I have a tough C++ assignment. Can you help me with the logic?" />
            </div>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">Ya Handasa</p>
              <p className="text-[10px] text-gray-500 truncate">mk1440165@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-afosh-bg/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-8 h-8 rounded-lg bg-afosh-accent flex items-center justify-center">
              <Terminal className="text-black" size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Chat with Afosh</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-afosh-accent animate-pulse"></span>
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Online & Ready</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Sparkles size={20} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={cn(
                "flex gap-4 max-w-4xl mx-auto",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                msg.role === 'user' ? "bg-gray-800" : "bg-afosh-accent/10 border border-afosh-accent/20"
              )}>
                {msg.role === 'user' ? <User size={20} className="text-gray-400" /> : <Bot size={20} className="text-afosh-accent" />}
              </div>
              
              <div className={cn(
                "flex flex-col gap-1.5",
                msg.role === 'user' ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-afosh-accent text-black font-medium" 
                    : "bg-afosh-card border border-white/5 text-gray-200"
                )}>
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-4xl mx-auto">
              <div className="w-10 h-10 rounded-xl bg-afosh-accent/10 border border-afosh-accent/20 flex items-center justify-center shrink-0">
                <Bot size={20} className="text-afosh-accent animate-pulse" />
              </div>
              <div className="bg-afosh-card border border-white/5 px-4 py-3 rounded-2xl flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-afosh-accent" />
                <span className="text-xs text-gray-400 font-mono">Afosh is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-t from-afosh-bg via-afosh-bg to-transparent">
          <div className="max-w-4xl mx-auto">
            <form 
              onSubmit={handleSendMessage}
              className="relative group"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything, ya handasa..."
                className="w-full bg-afosh-card border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-sm focus:outline-none focus:border-afosh-accent/50 focus:ring-1 focus:ring-afosh-accent/20 transition-all placeholder:text-gray-600"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-afosh-accent text-black hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-afosh-accent transition-all flex items-center justify-center"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
            <p className="mt-3 text-[10px] text-center text-gray-600 uppercase tracking-widest font-mono">
              Afosh AI • Street-Smart Tech Mentor • Built for the Legends
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
