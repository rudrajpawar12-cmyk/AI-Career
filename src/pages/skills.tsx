import { useState } from "react";
import { AppLayout } from "@/components/layouts";
import { mockSkills, mockMissingSkills } from "@/data/mock";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { motion } from "framer-motion";
import { Target, AlertTriangle, BookOpen, ChevronDown, CheckCircle2, ExternalLink } from "lucide-react";

const ROLES = ["Software Engineer", "Data Scientist", "Product Manager"];

export default function SkillGap() {
  const [role, setRole] = useState(ROLES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  // Mock comparison data
  const comparisonData = mockSkills.slice(0, 6).map(skill => ({
    name: skill.name,
    current: skill.level,
    required: Math.min(100, skill.level + Math.floor(Math.random() * 30)),
  }));

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Skill Gap Analysis</h1>
            <p className="text-muted-foreground mt-1 text-sm">Compare your skills against market requirements.</p>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="h-10 px-4 bg-card border border-white/10 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors min-w-[200px] justify-between shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                {role}
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
                {ROLES.map(r => (
                  <button
                    key={r}
                    onClick={() => { setRole(r); setIsDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
                  >
                    {r === role ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <div className="w-4 h-4" />}
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-3xl p-6 h-[400px] flex flex-col">
            <h3 className="font-semibold text-lg mb-4 text-center">Your Current Skills</h3>
            <div className="flex-1 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={comparisonData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Current" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass-card rounded-3xl p-6 h-[400px] flex flex-col border-primary/20 bg-primary/5">
            <h3 className="font-semibold text-lg mb-4 text-center flex items-center justify-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Required for {role}
            </h3>
            <div className="flex-1 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={comparisonData}>
                  <PolarGrid stroke="rgba(99,102,241,0.2)" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(99,102,241,0.8)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Required" dataKey="required" stroke="#6366f1" strokeDasharray="5 5" fill="transparent" />
                  <Radar name="Current" dataKey="current" stroke="rgba(255,255,255,0.5)" fill="rgba(255,255,255,0.1)" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Gap Analysis Table */}
        <motion.div variants={item} className="glass-card rounded-3xl p-6">
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" /> Actionable Gaps
          </h3>
          
          <div className="space-y-6">
            {mockMissingSkills.map((gap, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-6 p-4 rounded-2xl bg-background/50 border border-white/5 hover:bg-muted/30 transition-colors">
                <div className="md:w-1/3 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg">{gap.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider
                      ${gap.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        gap.priority === 'Medium' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                      {gap.priority} Priority
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Current: 20%</span>
                      <span>Target: 80%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden relative">
                      <div className="absolute top-0 left-0 h-full w-[80%] bg-primary/20 border-r border-primary border-dashed"></div>
                      <div className="absolute top-0 left-0 h-full w-[20%] bg-red-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                  <h5 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> Suggested Resources
                  </h5>
                  <div className="space-y-2">
                    {gap.resources.map((res, j) => (
                      <a href="#" key={j} className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-white/5 hover:border-primary/30 transition-colors group">
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">{res}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </AppLayout>
  );
}
