import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { getDashboardStats } from "@/services/dashboard.service";
import { 
  TrendingUp, Activity, Code, Target, 
  ChevronRight, Award, Flame, Calendar, Sparkles,
  Github
} from "lucide-react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, Tooltip as RechartsTooltip, Cell
} from "recharts";

import { AppLayout } from "@/components/layouts";
import {
  mockActivity,
  mockApplications,
  mockSkills,
  mockGithubStats,
  mockGoals
} from "@/data/mock";

import { useProfile } from "@/hooks/useProfile";
import { getFirstName } from "@/lib/profile-utils";

export default function Dashboard() {
  const { profile } = useProfile();

const [stats, setStats] = useState({
  resumeScore: 0,
  githubScore: 0,
  profileCompletion: 0,
  readinessScore: 0,
});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(setStats);
    // Simulate loading data
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="h-12 w-64 bg-card rounded-lg animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-card rounded-3xl animate-pulse"></div>
            <div className="h-48 bg-card rounded-3xl animate-pulse md:col-span-2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-card rounded-3xl animate-pulse"></div>
            <div className="h-64 bg-card rounded-3xl animate-pulse"></div>
            <div className="h-64 bg-card rounded-3xl animate-pulse"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const activeApplications = mockApplications.filter(a => a.status !== "Rejected" && a.status !== "Saved");

  return (
    <AppLayout>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6 pb-12"
      >
        {/* Header section */}
        <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Good morning, {getFirstName(profile?.full_name)} 👋
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="px-4 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium flex items-center gap-2 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]">
            <Sparkles className="w-4 h-4" />
            AI Insight: Apply to Google within 48 hrs to match hiring cycle.
          </div>
        </motion.div>

        {/* Top Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Readiness Score */}
          <motion.div variants={item} className="glass-card rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-24 h-24" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Placement Readiness</h3>
            <p className="text-sm text-muted-foreground mb-6">Based on skills, resume, and market.</p>
            
            <div className="flex items-end gap-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * stats.readinessScore) / 100} className="text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-1000" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold">
  {stats.readinessScore}
</span>
                </div>
              </div>
              <div className="pb-1">
                <div className="text-sm font-medium text-green-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +4 this week
                </div>
                <div className="text-xs text-muted-foreground mt-1">Top 15% of peers</div>
              </div>
            </div>
          </motion.div>

          {/* AI Mentor Mission */}
          <motion.div variants={item} className="md:col-span-2 glass-card rounded-3xl p-6 border-primary/20 bg-primary/5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Today's Mission
                </h3>
                <p className="text-sm text-primary/80">3 high-impact actions curated for you</p>
              </div>
              <Link href="/mentor">
                <button className="text-sm text-primary hover:underline flex items-center gap-1">
                  Chat with Mentor <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="bg-background/60 p-4 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center mb-3">
                  <Flame className="w-4 h-4" />
                </div>
                <h4 className="font-medium text-sm">Practice Arrays</h4>
                <p className="text-xs text-muted-foreground mt-1 text-ellipsis line-clamp-2">Google interviews focus heavily on arrays.</p>
              </div>
              <div className="bg-background/60 p-4 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mb-3">
                  <Code className="w-4 h-4" />
                </div>
                <h4 className="font-medium text-sm">Fix Resume Typos</h4>
                <p className="text-xs text-muted-foreground mt-1 text-ellipsis line-clamp-2">2 grammar issues found in experience section.</p>
              </div>
              <div className="bg-background/60 p-4 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-3">
                  <Activity className="w-4 h-4" />
                </div>stats.readinessScore
                <h4 className="font-medium text-sm">Follow up on Application</h4>
                <p className="text-xs text-muted-foreground mt-1 text-ellipsis line-clamp-2">It's been 7 days since Microsoft screening.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Skill Radar */}
          <motion.div variants={item} className="glass-card rounded-3xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">Skill Radar</h3>
              <Link href="/skills">
                <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button>
              </Link>
            </div>
            <div className="flex-1 w-full h-[220px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockSkills.slice(0, 6)}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Skills" dataKey="level" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* GitHub Activity */}
          <motion.div variants={item} className="glass-card rounded-3xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Github className="w-5 h-5" /> Code Activity</h3>
              <Link href="/github">
                <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button>
              </Link>
            </div>
            
            <div className="flex gap-4 mb-6">
              <div>
                <div className="text-2xl font-bold">{mockGithubStats.totalCommits}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Commits (yr)</div>
              </div>
              <div className="w-px h-10 bg-border/50"></div>
              <div>
                <div className="text-2xl font-bold text-orange-500">{mockGithubStats.streak} 🔥</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Day Streak</div>
              </div>
            </div>

            <div className="h-32 mt-auto">
              <div className="text-xs text-muted-foreground mb-2">Top Languages</div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockGithubStats.languages} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#000', borderColor: '#333'}} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                    {mockGithubStats.languages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-3 text-[10px] mt-2 justify-between">
                {mockGithubStats.languages.map(l => (
                  <div key={l.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }}></div>
                    <span className="text-muted-foreground">{l.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Active Applications */}
          <motion.div variants={item} className="glass-card rounded-3xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Active Applications</h3>
              <Link href="/applications">
                <span className="text-xs text-primary font-medium hover:underline cursor-pointer">View All</span>
              </Link>
            </div>
            <div className="space-y-4 flex-1 overflow-auto pr-2 scrollbar-hide">
              {activeApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-white/5 hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-card border border-white/10 flex items-center justify-center font-bold font-serif shadow-sm">
                      {app.company[0]}
                    </div>
                    <div>
                      <div className="font-medium text-sm group-hover:text-primary transition-colors">{app.company}</div>
                      <div className="text-xs text-muted-foreground">{app.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium px-2 py-1 rounded-md mb-1 inline-block
                      ${app.status === 'Interview' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 
                        app.status === 'Applied' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                        'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}`}
                    >
                      {app.status}
                    </div>
                    <div className="text-[10px] text-muted-foreground block">{new Date(app.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Goals */}
          <motion.div variants={item} className="glass-card rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Current Goals</h3>
              <Link href="/goals">
                <button className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">+</button>
              </Link>
            </div>
            <div className="space-y-5">
              {mockGoals.slice(0,2).map(goal => (
                <div key={goal.id}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <div className="text-sm font-medium">{goal.title}</div>
                      <div className="text-xs text-muted-foreground">{goal.type} • Due {new Date(goal.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</div>
                    </div>
                    <div className="text-xs font-bold text-primary">{goal.progress}%</div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${goal.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={item} className="glass-card rounded-3xl p-6">
            <h3 className="font-semibold text-lg mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {mockActivity.slice(0,3).map((act, i) => (
                <div key={act.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary/50 ring-4 ring-primary/10 mt-1.5"></div>
                    {i !== 2 && <div className="w-px h-full bg-border/50 my-1"></div>}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm">{act.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </motion.div>
    </AppLayout>
  );
}
