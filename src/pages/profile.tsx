import { AppLayout } from "@/components/layouts";
import { mockStats, mockProjects, mockCertificates } from "@/data/mock";
import { motion } from "framer-motion";
import { Edit2, MapPin, GraduationCap, Github, Target, Award, FolderGit2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { getInitials } from "@/lib/profile-utils";

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();

  const fullName = profile?.full_name || user?.email || "Your Name";
  const initials = getInitials(profile?.full_name, user?.email);
  const skills = [
    ...(profile?.skills_languages ?? []),
    ...(profile?.skills_frameworks ?? []),
    ...(profile?.skills_databases ?? []),
    ...(profile?.skills_tools ?? []),
    ...(profile?.skills_other ?? []),
  ];

  const stats = [
    { label: "Readiness Score", value: stats.readinessScore, icon: Target, color: "text-primary" },
    { label: "GitHub Streak", value: "15", icon: Github, color: "text-orange-500" },
    { label: "Certificates", value: mockCertificates.length, icon: Award, color: "text-green-500" },
    { label: "Projects", value: mockProjects.length, icon: FolderGit2, color: "text-blue-500" },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
          <div className="h-64 bg-card rounded-3xl animate-pulse"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-card rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        
        {/* Cover & Profile Header */}
        <div className="relative rounded-3xl overflow-hidden glass-card border-none bg-card">
          <div className="h-48 bg-aurora w-full relative">
            <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center hover:bg-black/60 transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="px-8 pb-8 pt-0 relative flex flex-col md:flex-row gap-6 items-end md:items-start">
            <div className="w-32 h-32 rounded-full border-4 border-card bg-card -mt-16 relative z-10 flex-shrink-0 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={fullName} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                  {initials}
                </div>
              )}
            </div>
            
            <div className="flex-1 mt-4 md:mt-2 text-center md:text-left">
              <h1 className="text-3xl font-bold">{fullName}</h1>
              <p className="text-lg text-muted-foreground">
                {[profile?.degree, profile?.college].filter(Boolean).join(" | ") || "Add your education in Settings"}
              </p>
              
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                {profile?.graduation_year && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><GraduationCap className="w-4 h-4" /> Class of {profile.graduation_year}</span>
                )}
                {profile?.target_role && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Target className="w-4 h-4" /> {profile.target_role}</span>
                )}
                {profile?.preferred_location && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="w-4 h-4" /> {profile.preferred_location}</span>
                )}
              </div>
            </div>
            
            <div className="mt-4 md:mt-6 w-full md:w-auto">
              <button className="w-full md:w-auto px-6 py-2.5 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-card border border-white/5 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="glass-card rounded-3xl p-2 min-h-[400px]">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-transparent border-b border-white/5 w-full justify-start rounded-none p-0 h-auto gap-8 px-6 mb-6">
              {["Overview", "Skills", "Experience", "Projects"].map(tab => (
                <TabsTrigger 
                  key={tab} 
                  value={tab.toLowerCase()} 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 data-[state=active]:text-primary text-base"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="p-6 pt-0">
              <TabsContent value="overview" className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold mb-3">About</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {[profile?.target_role, profile?.college].filter(Boolean).length > 0
                      ? `Working towards ${profile?.target_role ?? "a new role"}${profile?.college ? ` after studying at ${profile.college}` : ""}.`
                      : "You haven't completed your profile yet. Head to Settings to add more details."}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-card border border-white/5">
                    <h4 className="font-semibold mb-4 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> Education</h4>
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold">{profile?.college || "Not set"}</div>
                      {profile?.graduation_year && <div className="text-sm text-primary">{profile.graduation_year}</div>}
                    </div>
                    <div className="text-sm text-muted-foreground">{profile?.degree || "Add your degree in Settings"}</div>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-card border border-white/5">
                    <h4 className="font-semibold mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Career Goal</h4>
                    <div className="font-bold mb-2">{profile?.target_role || "Not set"}</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      {profile?.experience_level || "Targeting full-time roles or 6-month internships."}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile?.preferred_location ? (
                        <span className="px-3 py-1 bg-background rounded-full border border-white/5 text-xs font-medium">{profile.preferred_location}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Add your preferred location in Settings</span>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="skills" className="space-y-6">
                {skills.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Your Skills</h4>
                    <div className="flex flex-wrap gap-3">
                      {skills.map(skill => (
                        <div key={skill} className="px-4 py-2 rounded-xl bg-card border border-white/5">
                          <span className="font-medium text-sm">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No skills added yet. You can add them from the onboarding or settings page.</p>
                )}
              </TabsContent>

              <TabsContent value="experience" className="space-y-8">
                <div className="relative pl-6 border-l-2 border-white/10 space-y-8 ml-2">
                  <div className="relative">
                    <div className="absolute w-4 h-4 rounded-full bg-primary -left-[33px] top-1 border-4 border-background"></div>
                    <h4 className="text-lg font-bold">Software Engineer Intern</h4>
                    <div className="text-primary text-sm font-medium mb-2">Tech Startup Inc. • May 2023 - Aug 2023</div>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4 marker:text-white/20">
                      <li>Developed a full-stack dashboard using React and Node.js.</li>
                      <li>Optimized database queries, reducing load times by 30%.</li>
                      <li>Collaborated with design team to implement responsive UI components.</li>
                    </ul>
                  </div>
                  <div className="relative">
                    <div className="absolute w-4 h-4 rounded-full bg-muted -left-[33px] top-1 border-4 border-background"></div>
                    <h4 className="text-lg font-bold">Open Source Contributor</h4>
                    <div className="text-primary text-sm font-medium mb-2">Various Projects • Jan 2023 - Present</div>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4 marker:text-white/20">
                      <li>Merged 15+ pull requests in popular React libraries.</li>
                      <li>Fixed bug #1234 in the core routing package.</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="projects">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockProjects.map(project => (
                    <div key={project.id} className="p-6 rounded-2xl bg-card border border-white/5 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-lg">{project.name}</h4>
                        <a href={project.github} className="text-muted-foreground hover:text-primary"><Github className="w-5 h-5" /></a>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 flex-1">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((t, i) => (
                          <span key={i} className="px-2 py-1 bg-background rounded-md border border-white/5 text-[10px] uppercase font-bold tracking-wider">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

      </div>
    </AppLayout>
  );
}
