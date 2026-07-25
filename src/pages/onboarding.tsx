import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, ChevronRight, UploadCloud, FileText, User, 
  GraduationCap, Target, Github, Sparkles, Loader2, Play
} from "lucide-react";
import { PublicLayout } from "@/components/layouts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { profileService } from "@/services/profile.service";

const SKILL_SUGGESTIONS = ["React", "Python", "Java", "Machine Learning", "SQL", "Node.js", "C++", "AWS", "Docker", "Figma", "System Design"];
const ROLE_SUGGESTIONS = ["Software Engineer", "Data Scientist", "Product Manager", "Frontend Developer", "Backend Developer", "UI/UX Designer"];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { refreshProfile } = useProfile();
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  const [isFinishing, setIsFinishing] = useState(false);

  // Form State — keys map onto real `profiles` columns via profileService.saveProfile
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    degree: "",
    gradYear: "",
    skills: [] as string[],
    otherSkills: "",
    targetRole: "",
    githubUser: "",
  });

  useEffect(() => {
  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.user_metadata.full_name || "",
      }));
    }
  }

  loadUser();
}, []);

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

 const handleFinish = async () => {
  try {
    setIsFinishing(true);

    await profileService.saveProfile(formData);

    // Refresh the cached profile so onboarding_completed reflects the row
    // we just wrote — without this, ProtectedRoute would still see the
    // stale (pre-onboarding) profile and bounce the user right back here.
    await refreshProfile();

    setLocation("/dashboard");
  } catch (err) {
    console.error(err);
    setIsFinishing(false);
    alert("Failed to save profile");
  }
};

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const currentIcon = [User, GraduationCap, Target, Target, Github, FileText, Sparkles][step - 1];

  return (
    <PublicLayout showNav={false}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-mesh opacity-40"></div>
        
        {/* Main Content */}
        <div className="w-full max-w-2xl relative z-10">
          
          {/* Progress Bar */}
          {!isFinishing && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Step {step} of {totalSteps}</span>
                <button 
                  className="text-sm text-primary hover:underline"
                  onClick={() => step < totalSteps ? handleNext() : handleFinish()}
                >
                  Skip
                </button>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!isFinishing ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl"
              >
                {/* Step Content */}
                {step === 1 && (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
                      <Sparkles className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold">Welcome to CareerOS, {formData.name}</h2>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                      Let's build your personalized AI career brain. It only takes 2 minutes.
                    </p>
                    <button 
                      onClick={handleNext}
                      className="mt-8 w-full md:w-auto px-8 h-12 bg-primary text-white rounded-full font-semibold flex items-center justify-center gap-2 mx-auto hover:bg-primary/90 glow-primary transition-all"
                    >
                      Let's go <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Education Background</h2>
                      <p className="text-muted-foreground">Tell us where and what you're studying.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>University / College</Label>
                        <Input placeholder="e.g. IIT Bombay" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} className="bg-background/50" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Degree & Major</Label>
                        <Input placeholder="e.g. B.Tech Computer Science" value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})} className="bg-background/50" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Graduation Year</Label>
                        <Input placeholder="2025" value={formData.gradYear} onChange={e => setFormData({...formData, gradYear: e.target.value})} className="bg-background/50" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Your Skills</h2>
                      <p className="text-muted-foreground">Select the technologies you know best.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {SKILL_SUGGESTIONS.map(skill => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`px-4 py-2 rounded-full border text-sm transition-all ${
                            formData.skills.includes(skill)
                              ? "bg-primary/20 border-primary text-primary"
                              : "border-border/50 bg-background/50 hover:border-primary/50"
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                    <div className="pt-4 space-y-2">
                      <Label>Add other skills (comma separated)</Label>
                      <Input
                        placeholder="e.g. Kubernetes, Ruby"
                        value={formData.otherSkills}
                        onChange={e => setFormData({...formData, otherSkills: e.target.value})}
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Career Goal</h2>
                      <p className="text-muted-foreground">What role are you aiming for?</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {ROLE_SUGGESTIONS.map(role => (
                        <button
                          key={role}
                          onClick={() => setFormData({...formData, targetRole: role})}
                          className={`p-4 text-left rounded-xl border transition-all ${
                            formData.targetRole === role
                              ? "bg-primary/10 border-primary text-primary"
                              : "border-border/50 bg-background/50 hover:bg-muted/50"
                          }`}
                        >
                          <div className="font-medium">{role}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Connect GitHub</h2>
                      <p className="text-muted-foreground">We'll analyze your code to highlight your strengths.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <div className="h-11 px-4 bg-muted flex items-center justify-center rounded-l-lg border-y border-l border-border/50 text-muted-foreground font-mono">
                          github.com/
                        </div>
                        <Input 
                          placeholder="username" 
                          value={formData.githubUser}
                          onChange={e => setFormData({...formData, githubUser: e.target.value})}
                          className="rounded-l-none h-11 bg-background/50 flex-1" 
                        />
                      </div>
                      
                      {formData.githubUser.length > 2 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 rounded-lg bg-black/20 border border-white/5 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 animate-pulse"></div>
                          <div>
                            <div className="text-sm font-medium">Analyzing repositories...</div>
                            <div className="text-xs text-muted-foreground">Found 24 public repos</div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Upload Resume</h2>
                      <p className="text-muted-foreground">We'll parse it and find immediate improvements.</p>
                    </div>
                    
                    <div className="border-2 border-dashed border-border/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group bg-background/30">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <p className="font-medium mb-1">Click or drag file to upload</p>
                      <p className="text-xs text-muted-foreground mb-4">PDF, DOCX up to 5MB</p>
                      <button className="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg">
                        Select File
                      </button>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50"></div></div>
                      <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">OR</span></div>
                    </div>

                    <button 
                      onClick={handleNext}
                      className="w-full h-12 bg-background border border-border/50 hover:bg-muted rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" /> Build from scratch instead
                    </button>
                  </div>
                )}

                {step === 7 && (
                  <div className="text-center space-y-6 py-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                      <Target className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold">Ready to launch.</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Your Career Brain is configured. Let's head to your dashboard.
                    </p>
                  </div>
                )}

                {/* Footer Controls */}
                {step > 1 && (
                  <div className="mt-10 flex justify-between items-center border-t border-border/50 pt-6">
                    <button 
                      onClick={() => setStep(step - 1)}
                      className="px-6 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={step === totalSteps ? handleFinish : handleNext}
                      className="px-8 py-2.5 bg-primary text-white rounded-full text-sm font-bold flex items-center gap-2 hover:bg-primary/90 glow-primary transition-all shadow-lg"
                    >
                      {step === totalSteps ? "Finish" : "Next Step"}
                      {step !== totalSteps && <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="finishing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 glass p-16 rounded-3xl"
              >
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="w-full h-full border-[6px] border-primary/20 rounded-full border-t-primary animate-spin"></div>
                  <BrainCircuit className="absolute inset-0 m-auto w-12 h-12 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2 text-gradient-primary">Generating Career Brain...</h2>
                  <p className="text-muted-foreground">Analyzing market data for Software Engineer roles...</p>
                </div>
                <div className="space-y-3 max-w-xs mx-auto text-left">
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <Check className="w-4 h-4 text-green-500" /> Parsed Education Data
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <Check className="w-4 h-4 text-green-500" /> Evaluated Skill Matrix
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" /> Fetching latest job postings...
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PublicLayout>
  );
}

// Keep the import happy
function BrainCircuit(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08 2.5 2.5 0 0 0 4.91.05L12 20V4.5Z"/>
      <path d="M16 8V5c0-1.1.9-2 2-2"/>
      <path d="M12 13h4"/>
      <path d="M12 17h6"/>
      <path d="M19 13v4"/>
      <path d="M21 12h-3"/>
      <circle cx="18" cy="8" r="1"/>
      <circle cx="18" cy="17" r="1"/>
    </svg>
  );
}
