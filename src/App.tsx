import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
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
  BookOpen,
  Github,
  ExternalLink,
  Mail,
  Linkedin,
  Layers,
  Zap,
  MessageSquare,
  ArrowRight,
  Globe,
  Database
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

// Safe environment variable access
const getApiKey = () => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (key && typeof key === 'string' && key !== 'undefined') return key;
    return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  } catch {
    return '';
  }
};

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  github?: string;
  image: string;
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

const PROJECTS: Project[] = [
  {
    title: "YOLOv8 Real-time Detection",
    description: "Advanced computer vision system for real-time object detection and tracking in high-density environments.",
    tags: ["Python", "YOLOv8", "PyTorch", "OpenCV"],
    image: "https://picsum.photos/seed/vision/800/450",
    github: "#"
  },
  {
    title: "High-Performance C++ Engine",
    description: "Custom-built game engine core optimized for low-latency rendering and physics calculations.",
    tags: ["C++", "OpenGL", "DirectX", "Physics"],
    image: "https://picsum.photos/seed/engine/800/450",
    github: "#"
  },
  {
    title: "Enterprise IT Infrastructure",
    description: "Scalable cloud infrastructure design for high-traffic applications with automated failover systems.",
    tags: ["AWS", "Docker", "Kubernetes", "Terraform"],
    image: "https://picsum.photos/seed/cloud/800/450",
    link: "#"
  }
];

const SKILLS = [
  { name: "Python", level: 95, icon: Code2 },
  { name: "C++", level: 90, icon: Terminal },
  { name: "Computer Vision", level: 85, icon: Cpu },
  { name: "IT Infrastructure", level: 80, icon: Monitor },
  { name: "Data Science", level: 85, icon: Database },
  { name: "Game Dev", level: 75, icon: Gamepad2 },
];

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) scrollToBottom();
  }, [messages, isChatOpen]);

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
      const apiKey = getApiKey();
      if (!apiKey) {
        const isGitHubPages = window.location.hostname.includes('github.io');
        const errorMsg = isGitHubPages 
          ? "Ya basha, I'm running on GitHub Pages but I don't have my API Key! You need to configure GitHub Secrets or use the AI Studio preview to talk to me."
          : "Missing API Key, ya handasa! Check your environment variables.";
        throw new Error(errorMsg);
      }
      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: AFOSH_SYSTEM_INSTRUCTION,
        },
      });

      const response = await chat.sendMessage({ message: textToSend });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "Sorry ya basha, something went wrong with my brain.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error calling Gemini:", error);
      const errorMessage = error.message || "Listen ya handasa, I hit a snag. Check your connection or maybe the API key is acting up.";
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `${errorMessage} Let's try again!`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-afosh-bg text-gray-200 selection:bg-afosh-accent selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-afosh-bg/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-afosh-accent flex items-center justify-center shadow-lg shadow-afosh-accent/20 group-hover:scale-110 transition-transform">
              <Terminal className="text-black" size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">AFOSH<span className="text-afosh-accent">.AI</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#about" className="hover:text-afosh-accent transition-colors">About</a>
            <a href="#skills" className="hover:text-afosh-accent transition-colors">Skills</a>
            <a href="#projects" className="hover:text-afosh-accent transition-colors">Projects</a>
            <a href="#contact" className="hover:text-afosh-accent transition-colors">Contact</a>
            <button 
              onClick={() => setIsChatOpen(true)}
              className="px-5 py-2.5 rounded-full bg-afosh-accent/10 border border-afosh-accent/20 text-afosh-accent hover:bg-afosh-accent hover:text-black transition-all flex items-center gap-2"
            >
              <MessageSquare size={16} />
              <span>Ask My AI</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="about" className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-afosh-accent/10 border border-afosh-accent/20 text-afosh-accent text-xs font-bold uppercase tracking-widest mb-6">
              <Zap size={14} />
              <span>Available for new projects</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black text-white leading-[0.9] mb-8">
              I BUILD <br />
              <span className="text-afosh-accent">THINGS</span> THAT <br />
              WORK.
            </h1>
            <p className="text-xl text-gray-400 max-w-lg leading-relaxed mb-10">
              I'm Afosh, a street-smart tech mentor and developer. I specialize in <span className="text-white font-medium">Python, C++, and Computer Vision</span>. I don't just write code; I solve problems, ya handasa.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 rounded-2xl bg-afosh-accent text-black font-bold hover:bg-emerald-400 transition-all flex items-center gap-2">
                View My Work <ArrowRight size={20} />
              </button>
              <div className="flex items-center gap-4 px-4">
                <a href="#" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                  <Github size={24} />
                </a>
                <a href="#" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                  <Linkedin size={24} />
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-square rounded-[40px] bg-gradient-to-br from-afosh-accent/20 to-transparent border border-white/5 overflow-hidden relative group">
              <img 
                src="https://picsum.photos/seed/afosh/800/800" 
                alt="Afosh" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-afosh-bg via-transparent to-transparent"></div>
              
              {/* Floating Stats */}
              <div className="absolute bottom-8 left-8 right-8 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-afosh-card/80 backdrop-blur-md border border-white/10">
                  <p className="text-afosh-accent font-black text-2xl">50+</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Projects Done</p>
                </div>
                <div className="p-4 rounded-2xl bg-afosh-card/80 backdrop-blur-md border border-white/10">
                  <p className="text-afosh-accent font-black text-2xl">100%</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Client Satisfaction</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-6 bg-afosh-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-afosh-accent font-mono text-sm mb-2 uppercase tracking-widest">Expertise</p>
              <h2 className="text-4xl lg:text-5xl font-black text-white">TECH STACK</h2>
            </div>
            <p className="text-gray-500 max-w-md">
              From low-level C++ engine optimization to high-level Python AI models. I've got the tools to build anything, ya basha.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SKILLS.map((skill, idx) => (
              <motion.div 
                key={skill.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-afosh-card border border-white/5 hover:border-afosh-accent/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-afosh-accent/10 flex items-center justify-center text-afosh-accent group-hover:bg-afosh-accent group-hover:text-black transition-all">
                    <skill.icon size={24} />
                  </div>
                  <span className="text-2xl font-black text-white/20 group-hover:text-afosh-accent/40 transition-colors">0{idx + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{skill.name}</h3>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-afosh-accent"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Proficiency</span>
                  <span className="text-[10px] text-afosh-accent font-bold">{skill.level}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-afosh-accent font-mono text-sm mb-2 uppercase tracking-widest">Selected Works</p>
              <h2 className="text-4xl lg:text-5xl font-black text-white">PROJECTS</h2>
            </div>
            <button className="text-afosh-accent hover:text-white transition-colors flex items-center gap-2 font-bold">
              View All Projects <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {PROJECTS.map((project, idx) => (
              <motion.div 
                key={project.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 border border-white/5">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    {project.github && (
                      <a href={project.github} className="p-2 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-afosh-accent hover:text-black transition-all">
                        <Github size={18} />
                      </a>
                    )}
                    {project.link && (
                      <a href={project.link} className="p-2 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-afosh-accent hover:text-black transition-all">
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 py-1 rounded bg-white/5 border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-afosh-accent transition-colors">{project.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{project.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chat Section - The "Digital Twin" */}
      <section className="py-20 px-6 bg-afosh-accent/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 rounded-3xl bg-afosh-accent flex items-center justify-center mx-auto mb-8 shadow-xl shadow-afosh-accent/20">
            <Bot className="text-black" size={40} />
          </div>
          <h2 className="text-4xl font-black text-white mb-6">TALK TO MY DIGITAL TWIN</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            I built an AI version of myself to help you with code, IT bugs, or just to chat about gaming. Give it a try, ya handasa!
          </p>
          <button 
            onClick={() => setIsChatOpen(true)}
            className="px-10 py-5 rounded-2xl bg-afosh-accent text-black font-black hover:bg-emerald-400 transition-all shadow-lg shadow-afosh-accent/20 flex items-center gap-3 mx-auto"
          >
            <MessageSquare size={24} />
            Launch Afosh AI
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-afosh-accent flex items-center justify-center">
                <Terminal className="text-black" size={18} />
              </div>
              <span className="font-bold text-xl text-white">AFOSH<span className="text-afosh-accent">.AI</span></span>
            </div>
            <p className="text-gray-500 max-w-sm mb-8">
              Building the future of tech with a street-smart approach. Let's create something legendary together.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-3 rounded-xl bg-white/5 hover:bg-afosh-accent hover:text-black transition-all text-gray-400">
                <Github size={20} />
              </a>
              <a href="#" className="p-3 rounded-xl bg-white/5 hover:bg-afosh-accent hover:text-black transition-all text-gray-400">
                <Linkedin size={20} />
              </a>
              <a href="#" className="p-3 rounded-xl bg-white/5 hover:bg-afosh-accent hover:text-black transition-all text-gray-400">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Navigation</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#about" className="hover:text-afosh-accent transition-colors">About</a></li>
              <li><a href="#skills" className="hover:text-afosh-accent transition-colors">Skills</a></li>
              <li><a href="#projects" className="hover:text-afosh-accent transition-colors">Projects</a></li>
              <li><a href="#contact" className="hover:text-afosh-accent transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex items-center gap-3"><Mail size={16} className="text-afosh-accent" /> mk1440165@gmail.com</li>
              <li className="flex items-center gap-3"><Globe size={16} className="text-afosh-accent" /> Egypt / Remote</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600 font-mono uppercase tracking-widest">© 2026 AFOSH AI • ALL RIGHTS RESERVED</p>
          <p className="text-xs text-gray-600 font-mono uppercase tracking-widest">BUILT WITH PASSION, YA HANDASA</p>
        </div>
      </footer>

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-4xl h-[80vh] bg-afosh-bg border border-white/10 rounded-[32px] overflow-hidden flex flex-col shadow-2xl shadow-afosh-accent/10"
            >
              {/* Chat Header */}
              <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-afosh-card">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-afosh-accent/10 border border-afosh-accent/20 flex items-center justify-center">
                    <Bot className="text-afosh-accent" size={24} />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">Afosh AI Twin</h2>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-afosh-accent animate-pulse"></span>
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Online</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                >
                  <Zap size={20} className="rotate-45" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex gap-4",
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
                      "flex flex-col gap-1.5 max-w-[80%]",
                      msg.role === 'user' ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "px-5 py-4 rounded-2xl text-sm leading-relaxed",
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
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-afosh-accent/10 border border-afosh-accent/20 flex items-center justify-center shrink-0">
                      <Bot size={20} className="text-afosh-accent animate-pulse" />
                    </div>
                    <div className="bg-afosh-card border border-white/5 px-5 py-4 rounded-2xl flex items-center gap-3">
                      <Loader2 size={18} className="animate-spin text-afosh-accent" />
                      <span className="text-sm text-gray-400 font-mono">Afosh is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-8 bg-afosh-card border-t border-white/5">
                <form 
                  onSubmit={handleSendMessage}
                  className="relative"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything, ya handasa..."
                    className="w-full bg-afosh-bg border border-white/10 rounded-2xl py-5 pl-8 pr-20 text-sm focus:outline-none focus:border-afosh-accent/50 focus:ring-1 focus:ring-afosh-accent/20 transition-all placeholder:text-gray-700"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-3 top-3 bottom-3 px-6 rounded-xl bg-afosh-accent text-black hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-afosh-accent transition-all flex items-center justify-center"
                  >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
