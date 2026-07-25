import { useState } from "react";
import { AppLayout } from "@/components/layouts";
import { mockRoadmap } from "@/data/mock";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Target, ChevronDown } from "lucide-react";

export default function Roadmap() {
  const [expandedNode, setExpandedNode] = useState<number | null>(2);
  const [tasks, setTasks] = useState<Record<number, boolean[]>>({});

  const completedStages = mockRoadmap.filter(s => s.status === 'Completed').length;
  const progress = Math.round((completedStages / mockRoadmap.length) * 100);

  const toggleTask = (stageId: number, taskIndex: number) => {
    setTasks(prev => {
      const stageTasks = prev[stageId] || Array(mockRoadmap.find(s => s.id === stageId)?.tasks.length).fill(false);
      const newTasks = [...stageTasks];
      newTasks[taskIndex] = !newTasks[taskIndex];
      return { ...prev, [stageId]: newTasks };
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header & Progress */}
        <div>
          <h1 className="text-3xl font-bold">Career Roadmap</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your step-by-step path to placement readiness.</p>
          
          <div className="mt-6 glass-card p-6 rounded-3xl">
            <div className="flex justify-between items-end mb-2">
              <div className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Overall Progress
              </div>
              <div className="text-2xl font-bold text-primary">{progress}%</div>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <motion.div 
          variants={container} 
          initial="hidden" 
          animate="show" 
          className="relative pl-6 md:pl-12"
        >
          {/* Vertical Line */}
          <div className="absolute top-0 bottom-0 left-[35px] md:left-[59px] w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted z-0"></div>

          {mockRoadmap.map((stage, i) => {
            const isCompleted = stage.status === 'Completed';
            const isInProgress = stage.status === 'In Progress';
            const isPending = stage.status === 'Pending';
            const isExpanded = expandedNode === stage.id;
            
            return (
              <motion.div variants={item} key={stage.id} className="relative mb-12 z-10">
                
                {/* Node Marker */}
                <div className="absolute -left-[35px] md:-left-[59px] mt-1.5 flex items-center justify-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 bg-background
                    ${isCompleted ? 'text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 
                      isInProgress ? 'text-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 
                      'text-muted-foreground border-2 border-muted'}`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-6 h-6 bg-background rounded-full" /> : 
                     isInProgress ? <div className="w-3 h-3 bg-primary rounded-full animate-pulse" /> : 
                     <div className="w-2 h-2 bg-muted rounded-full" />}
                  </div>
                </div>

                {/* Content Card */}
                <div 
                  className={`glass-card rounded-2xl border transition-all cursor-pointer overflow-hidden
                    ${isInProgress ? 'border-primary/30 bg-primary/5' : 
                      isCompleted ? 'border-green-500/20 bg-green-500/5' : 'border-white/5 bg-card/50 hover:bg-muted/50'}`}
                  onClick={() => setExpandedNode(isExpanded ? null : stage.id)}
                >
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stage {i + 1}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider
                          ${isCompleted ? 'bg-green-500/10 text-green-400' : 
                            isInProgress ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
                        >
                          {stage.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold">{stage.stage}</h3>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/5"
                      >
                        <div className="p-5 bg-background/50 space-y-3">
                          {stage.tasks.map((task, tIdx) => {
                            const isTaskDone = tasks[stage.id]?.[tIdx] || isCompleted;
                            return (
                              <div 
                                key={tIdx} 
                                className="flex items-start gap-3 group cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); toggleTask(stage.id, tIdx); }}
                              >
                                <button className="mt-0.5 text-muted-foreground group-hover:text-primary transition-colors">
                                  {isTaskDone ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5" />}
                                </button>
                                <span className={`text-sm ${isTaskDone ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}>
                                  {task}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </AppLayout>
  );
}
