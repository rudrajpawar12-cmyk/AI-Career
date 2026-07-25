import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layouts";
import { mockInterviewQuestions } from "@/data/mock";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Timer, CheckCircle, Search, Bookmark, ChevronDown, Bot, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { analyzeInterview } from "@/services/interview.service";

export default function InterviewPractice() {
  const [activeTab, setActiveTab] = useState("mock");
  
  // Mock Interview State
  const [currentQ, setCurrentQ] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Question Bank State
  const [search, setSearch] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
  setIsTimerRunning(false);
  setIsAnalyzing(true);

  try {
    const ai = await analyzeInterview(
      activeQuestion.question,
      answer
    );

    setFeedback(ai);

  } catch {

    setFeedback(
      "AI evaluation failed."
    );

  } finally {

    setIsAnalyzing(false);

  }
};

  const nextQuestion = () => {
    setCurrentQ((prev) => (prev + 1) % mockInterviewQuestions.length);
    setAnswer("");
    setFeedback(null);
    setTimeLeft(120);
    setIsTimerRunning(false);
  };

  const activeQuestion = mockInterviewQuestions[currentQ];
  const filteredBank = mockInterviewQuestions.filter(q => 
    q.question.toLowerCase().includes(search.toLowerCase()) || 
    q.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold">Interview Practice</h1>
          <p className="text-muted-foreground mt-1 text-sm">Nail your interviews with AI-powered feedback.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-card/50 p-1 rounded-full mb-8">
            <TabsTrigger value="mock" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Mock Interview</TabsTrigger>
            <TabsTrigger value="bank" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Question Bank</TabsTrigger>
          </TabsList>

          <TabsContent value="mock">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Question Area */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                    <Bot className="w-32 h-32" />
                  </div>
                  
                  <div className="flex gap-3 mb-6">
                    <span className="px-3 py-1 bg-card border border-white/10 rounded-full text-xs font-semibold">{activeQuestion.company}</span>
                    <span className="px-3 py-1 bg-card border border-white/10 rounded-full text-xs font-semibold">{activeQuestion.topic}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border
                      ${activeQuestion.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        activeQuestion.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                        'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                      {activeQuestion.difficulty}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold leading-relaxed mb-8">{activeQuestion.question}</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-muted-foreground">Your Answer</span>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors
                        ${isTimerRunning ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' : 'bg-card border-white/10 text-muted-foreground'}`}>
                        <Timer className="w-4 h-4" /> {formatTime(timeLeft)}
                      </div>
                    </div>
                    
                    <textarea 
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onFocus={() => !isTimerRunning && !feedback && setIsTimerRunning(true)}
                      placeholder="Start typing your answer here... (Timer starts automatically)"
                      className="w-full h-48 bg-background/50 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none shadow-inner"
                      disabled={!!feedback || isAnalyzing}
                    />

                    {!feedback && !isAnalyzing && (
                      <div className="flex justify-end gap-3">
                        <button onClick={nextQuestion} className="px-6 py-2 rounded-full text-sm font-medium hover:bg-muted transition-colors">Skip</button>
                        <button onClick={handleSubmit} disabled={!answer.trim()} className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-colors">
                          Submit for Feedback
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feedback Area */}
                <AnimatePresence>
                  {(isAnalyzing || feedback) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6 rounded-3xl border-primary/30 bg-primary/5"
                    >
                      <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-primary" /> AI Evaluation
                      </h3>
                      
                      {isAnalyzing ? (
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" /> Analyzing your response using STAR method...
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <p className="text-sm leading-relaxed">{feedback}</p>
                          <div className="flex gap-4 border-t border-white/10 pt-4">
                            <div className="flex-1">
                              <div className="text-xs text-muted-foreground mb-1">Clarity</div>
                              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[80%]"></div></div>
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-muted-foreground mb-1">Impact</div>
                              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-orange-500 w-[40%]"></div></div>
                            </div>
                          </div>
                          <button onClick={nextQuestion} className="w-full py-3 bg-card border border-white/10 rounded-xl text-sm font-bold hover:bg-muted transition-colors flex items-center justify-center gap-2">
                            Next Question <ChevronDown className="w-4 h-4 -rotate-90" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-3xl">
                  <h3 className="font-semibold mb-4">Session Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Questions Answered</span>
                      <span className="font-bold">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg. Score</span>
                      <span className="font-bold text-green-400">8.2/10</span>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-6 rounded-3xl">
                  <h3 className="font-semibold mb-2">Pro Tip</h3>
                  <p className="text-sm text-muted-foreground">For behavioral questions, always use the STAR method. Keep the 'Situation' brief and focus 70% of your time on 'Action' and 'Result'.</p>
                </div>
              </div>

            </div>
          </TabsContent>

          <TabsContent value="bank">
            <div className="glass-card p-6 rounded-3xl space-y-6">
              <div className="flex gap-4 flex-col md:flex-row">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search by company or topic..." 
                    className="pl-9 h-11 bg-background/50 border-white/10 rounded-xl"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <button className="h-11 px-6 bg-card border border-white/10 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                  Filter
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBank.map(q => (
                  <div key={q.id} className="p-5 rounded-2xl border border-white/5 bg-background/50 hover:border-primary/30 transition-colors flex flex-col h-full group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-card border border-white/10 rounded-full text-[10px] font-semibold">{q.company}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border
                          ${q.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            q.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                            'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <button className="text-muted-foreground hover:text-primary transition-colors"><Bookmark className="w-4 h-4" /></button>
                    </div>
                    <p className="text-sm font-medium mb-6 flex-1 line-clamp-3">{q.question}</p>
                    <button 
                      onClick={() => { setActiveTab("mock"); setCurrentQ(mockInterviewQuestions.findIndex(mq => mq.id === q.id)); }}
                      className="w-full py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100"
                    >
                      <Play className="w-3.5 h-3.5" /> Practice Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </AppLayout>
  );
}
