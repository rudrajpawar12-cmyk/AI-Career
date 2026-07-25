import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layouts";
import { Send, Bot, Sparkles, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { askMentor } from "@/services/mentor.service";
import type { MentorMessage } from "@/types/mentor";

type Message = MentorMessage;

export default function MentorChat() {
  const [messages, setMessages] = useState<Message[]>([
  {
    id: crypto.randomUUID(),
    role: "assistant",
    content:
      "Hi! 👋 I'm CareerOS AI Mentor. Ask me anything about resumes, GitHub, DSA, interviews or internships.",
    createdAt: new Date().toISOString(),
  },
]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
  e?.preventDefault();

  if (!input.trim()) return;

  const userMessage: Message = {
    id: crypto.randomUUID(),
    role: "user",
    content: input,
    createdAt: new Date().toISOString(),
  };

  const updatedMessages = [...messages, userMessage];

  setMessages(updatedMessages);
  setInput("");
  setIsTyping(true);

  try {
    const reply = await askMentor(updatedMessages);

    setMessages([
      ...updatedMessages,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        createdAt: new Date().toISOString(),
      },
    ]);
  } catch {
    setMessages([
      ...updatedMessages,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, something went wrong.",
        createdAt: new Date().toISOString(),
      },
    ]);
  } finally {
    setIsTyping(false);
  }
};

  const quickReplies = [
    "Review my resume",
    "Suggest internships",
    "Prep for Google interview",
    "How to learn System Design?"
  ];

  return (
    <AppLayout>
      <div className="h-[calc(100vh-120px)] flex flex-col glass-card rounded-3xl overflow-hidden border border-white/5">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-white/5 bg-black/20 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              Career AI <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-primary/20 text-primary">Active</span>
            </h2>
            <p className="text-xs text-muted-foreground">Context: Your Resume, GitHub, & Goals</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {msg.role === "assistant" ? (
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                ) : (
                  <Avatar className="h-8 w-8 mt-1 border border-border">
                    <AvatarFallback className="bg-muted text-xs">AS</AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-card border border-white/5 rounded-tl-sm text-foreground leading-relaxed shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 max-w-[80%]"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="p-4 rounded-2xl bg-card border border-white/5 rounded-tl-sm flex items-center gap-1.5 h-12">
                  <motion.div className="w-2 h-2 rounded-full bg-primary/60" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                  <motion.div className="w-2 h-2 rounded-full bg-primary/60" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                  <motion.div className="w-2 h-2 rounded-full bg-primary/60" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-2 px-2">
            {quickReplies.map((reply, i) => (
              <button 
                key={i}
                onClick={() => setInput(reply)}
                className="px-3 py-1.5 rounded-full bg-background border border-white/10 text-xs text-muted-foreground whitespace-nowrap hover:border-primary/50 hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3 h-3 text-yellow-500" /> {reply}
              </button>
            ))}
          </div>
          
          <form onSubmit={handleSend} className="relative flex items-center mx-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your career..." 
              className="h-14 pr-14 bg-background/50 border-white/10 rounded-2xl focus-visible:ring-primary/50 text-base shadow-inner"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 w-10 h-10 bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-primary"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>

      </div>
    </AppLayout>
  );
}
