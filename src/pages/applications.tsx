import { useState } from "react";
import { AppLayout } from "@/components/layouts";
import { motion, Reorder } from "framer-motion";
import { Plus, Search, Building2, Calendar, MapPin, ExternalLink, GripVertical } from "lucide-react";
import { mockApplications } from "@/data/mock";
import { Input } from "@/components/ui/input";

const COLUMNS = ["Saved", "Applied", "Screening", "Interview", "Offer", "Rejected"];

type App = typeof mockApplications[0];

export default function Applications() {
  const [apps, setApps] = useState(mockApplications);
  const [search, setSearch] = useState("");

  const filteredApps = apps.filter(a => 
    a.company.toLowerCase().includes(search.toLowerCase()) || 
    a.role.toLowerCase().includes(search.toLowerCase())
  );

  // A simple drag-and-drop implementation using state for a kanban board
  // Moving between columns via buttons since full multi-list dnd requires complex libraries
  
  const moveApp = (id: number, direction: 1 | -1) => {
    setApps(apps.map(a => {
      if (a.id === id) {
        const currentIndex = COLUMNS.indexOf(a.status);
        const nextIndex = Math.max(0, Math.min(COLUMNS.length - 1, currentIndex + direction));
        return { ...a, status: COLUMNS[nextIndex] };
      }
      return a;
    }));
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-100px)]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Applications</h1>
            <p className="text-muted-foreground mt-1 text-sm">Track and manage your job hunt pipeline.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative w-64 hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search applications..." 
                className="pl-9 h-10 bg-card border-white/10 rounded-full"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="h-10 px-4 bg-primary text-white rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 glow-primary">
              <Plus className="w-4 h-4" /> Add Manual
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-6 h-full min-w-max px-1">
            {COLUMNS.map(col => {
              const columnApps = filteredApps.filter(a => a.status === col);
              return (
                <div key={col} className="w-80 flex flex-col h-full bg-black/10 rounded-3xl border border-white/5">
                  <div className="p-4 flex items-center justify-between border-b border-white/5">
                    <h3 className="font-semibold flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full
                        ${col === 'Offer' ? 'bg-green-500' : 
                          col === 'Rejected' ? 'bg-red-500' : 
                          col === 'Interview' ? 'bg-purple-500' : 
                          'bg-blue-500'}`}
                      />
                      {col}
                    </h3>
                    <span className="bg-background/80 px-2 py-0.5 rounded-full text-xs font-medium border border-white/5">
                      {columnApps.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
                    {columnApps.map(app => (
                      <motion.div 
                        layoutId={`app-${app.id}`}
                        key={app.id} 
                        className="glass-card p-4 rounded-2xl group relative"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-xl bg-card border border-white/10 flex items-center justify-center font-bold font-serif text-lg shadow-sm group-hover:border-primary/50 transition-colors">
                              {app.company[0]}
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm leading-tight">{app.role}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">{app.company}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mt-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> 
                            {new Date(app.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                          </div>
                          {col === 'Interview' && (
                            <div className="flex items-center gap-2 text-primary font-medium">
                              <ExternalLink className="w-3.5 h-3.5" /> Google Meet link sent
                            </div>
                          )}
                        </div>

                        {/* Quick Move Actions */}
                        <div className="mt-4 pt-3 border-t border-white/5 flex justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            disabled={COLUMNS.indexOf(col) === 0}
                            onClick={() => moveApp(app.id, -1)}
                            className="flex-1 py-1.5 rounded-lg bg-background hover:bg-muted text-xs font-medium disabled:opacity-30 transition-colors"
                          >
                            ← Back
                          </button>
                          <button 
                            disabled={COLUMNS.indexOf(col) === COLUMNS.length - 1}
                            onClick={() => moveApp(app.id, 1)}
                            className="flex-1 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium disabled:opacity-30 transition-colors"
                          >
                            Next →
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
