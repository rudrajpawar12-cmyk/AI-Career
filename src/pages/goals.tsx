import { useState } from "react";
import { AppLayout } from "@/components/layouts";
import { mockGoals } from "@/data/mock";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Target, Trophy, Flag, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  title: z.string().min(3, "Goal title is required"),
  type: z.string(),
  deadline: z.string().min(1, "Deadline is required"),
});

export default function Goals() {
  const [goals, setGoals] = useState(mockGoals);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", type: "Short-term", deadline: "" },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const newGoal = {
      id: Date.now(),
      title: data.title,
      type: data.type,
      progress: 0,
      deadline: data.deadline,
    };
    setGoals([...goals, newGoal]);
    setIsOpen(false);
    form.reset();
  };

  const markComplete = (id: number) => {
    setGoals(goals.map(g => g.id === id ? { ...g, progress: 100 } : g));
    setTimeout(() => {
      setGoals(prev => prev.filter(g => g.id !== id));
    }, 800);
  };

  const columns = [
    { title: "Short-term", icon: Target, items: goals.filter(g => g.type === "Short-term") },
    { title: "Mid-term", icon: Flag, items: goals.filter(g => g.type === "Mid-term") },
    { title: "Long-term", icon: Trophy, items: goals.filter(g => g.type === "Long-term") },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 h-full flex flex-col">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Goals</h1>
            <p className="text-muted-foreground mt-1 text-sm">Set targets and track your growth.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button className="h-10 px-4 bg-primary text-white rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 glow-primary transition-all">
                <Plus className="w-4 h-4" /> Add Goal
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border border-white/10 text-foreground">
              <DialogHeader>
                <DialogTitle>Add New Goal</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Goal Title</FormLabel><FormControl><Input placeholder="e.g. Master React Hooks" {...field} className="bg-background/50" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Short-term">Short-term (&lt; 3 months)</SelectItem>
                          <SelectItem value="Mid-term">Mid-term (3-6 months)</SelectItem>
                          <SelectItem value="Long-term">Long-term (1+ year)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="deadline" render={({ field }) => (
                    <FormItem><FormLabel>Target Date</FormLabel><FormControl><Input type="date" {...field} className="bg-background/50" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <button type="submit" className="w-full h-10 bg-primary text-white rounded-lg font-medium mt-4">Create Goal</button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start">
          {columns.map(col => (
            <div key={col.title} className="glass-card rounded-3xl p-6 min-h-[400px]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-card border border-white/10 flex items-center justify-center shadow-sm">
                  <col.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">{col.title}</h2>
              </div>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {col.items.map(goal => (
                    <motion.div 
                      key={goal.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5, y: -20 }}
                      className="p-4 rounded-2xl bg-background/50 border border-white/5 relative overflow-hidden group"
                    >
                      {goal.progress === 100 && (
                        <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                          className="absolute inset-0 bg-green-500/20 z-10 flex items-center justify-center backdrop-blur-[2px]"
                        >
                          <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </motion.div>
                      )}
                      
                      <h4 className="font-semibold text-sm mb-1">{goal.title}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                        <Clock className="w-3 h-3" /> Due {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                      
                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-xs font-medium">
                          <span>Progress</span>
                          <span className="text-primary">{goal.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary" 
                            initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }} 
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => markComplete(goal.id)}
                        className="w-full py-1.5 rounded-lg border border-white/10 text-xs font-medium hover:bg-card transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Mark Complete
                      </button>
                    </motion.div>
                  ))}
                  {col.items.length === 0 && (
                    <div className="text-center py-10 text-sm text-muted-foreground border border-dashed border-white/10 rounded-2xl">
                      No goals set yet.
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}
