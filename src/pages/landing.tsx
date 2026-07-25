import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { motion, useScroll, useTransform } from "framer-motion";
import { PublicLayout } from "@/components/layouts";
import { authService } from "@/services/auth.service";
import { ArrowRight, CheckCircle2, Sparkles, BrainCircuit, Target, Code, BarChart3, Lock, Zap, MessageSquare } from "lucide-react";

export default function LandingPage() {
  const { user, signOut } = useAuth();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <PublicLayout>
      <div className="relative w-full">
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-aurora opacity-50 z-0"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />

              {user ? (
                <span>Welcome back, {user.user_metadata?.full_name || user.email}</span>
              ) : (
                <span>Meet Your AI Career Mentor</span>
              )}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight"
            >
              Know Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-cyan-400">
                Career Move.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed"
            >
              The intelligent operating system that turns students into placement-ready professionals. Resumes, GitHub, Mock Interviews—all guided by AI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {user ? (
                <>
                  <Link href="/dashboard">
                    <button className="h-12 px-8 bg-white text-black hover:bg-white/90 text-base font-semibold rounded-full flex items-center justify-center gap-2 transition-all hover:scale-105">
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>

                  <button
                    onClick={async () => {
                      await authService.logout();
                      window.location.reload();
                    }}
                    className="h-12 px-8 bg-transparent text-white border border-white/20 hover:bg-white/5 text-base font-semibold rounded-full"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signup">
                    <button className="h-12 px-8 bg-white text-black hover:bg-white/90 text-base font-semibold rounded-full flex items-center justify-center gap-2 transition-all hover:scale-105">
                      Start Building Free
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>

                  <Link href="/login">
                    <button className="h-12 px-8 bg-transparent text-white border border-white/20 hover:bg-white/5 text-base font-semibold rounded-full">
                      Sign In
                    </button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>

          {/* Hero Image / Mockup */}
          <motion.div
            style={{ y, opacity }}
            className="w-full max-w-6xl mt-20 relative z-10"
          >
            <div className="aspect-[16/9] rounded-2xl border border-white/10 bg-card/40 backdrop-blur-2xl shadow-2xl shadow-primary/20 overflow-hidden relative">
              <div className="absolute top-0 w-full h-12 bg-black/40 border-b border-white/5 flex items-center px-4 gap-2 backdrop-blur-md z-20">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <img
                src="/attached_assets/generated_images/dashboard-mockup.png"
                alt="CareerOS Dashboard"
                className="w-full h-full object-cover object-top opacity-90 mt-12"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1618401471353-b98a5233c591?q=80&w=2800&auto=format&fit=crop';
                }}
              />
            </div>
          </motion.div>
        </section>

        {/* LOGO CLOUD */}
        <section className="py-12 border-y border-white/5 bg-black/20">
          <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider font-semibold">Alumni hired at</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Stripe'].map((company) => (
                <div key={company} className="text-xl font-bold font-serif">{company}</div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-32 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 max-w-2xl">Everything you need to land the offer.</h2>
              <p className="text-lg text-muted-foreground max-w-xl">CareerOS replaces ten different tools with one cohesive intelligence layer for your entire career journey.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: BrainCircuit, title: "Resume Intelligence", desc: "ATS scoring, dynamic improvements, and line-by-line feedback tailored to specific job descriptions." },
                { icon: Code, title: "GitHub Analyzer", desc: "We read your repos, evaluate your code quality, and tell you exactly what recruiters will see." },
                { icon: Target, title: "Skill Gap Mapping", desc: "Select a target role. We map your current skills against market requirements and provide learning paths." },
                { icon: MessageSquare, title: "AI Mock Interviews", desc: "Practice behavioral and technical rounds with an AI that mimics real recruiters from top companies." },
                { icon: BarChart3, title: "Kanban Tracker", desc: "Never lose track of an application. Move cards from 'Applied' to 'Offer' and track your conversion rate." },
                { icon: Zap, title: "24/7 AI Mentor", desc: "Stuck on a decision? Need a cold email template? Chat with your AI mentor who knows your entire profile." }
              ].map((feature, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="p-8 rounded-3xl bg-card border border-white/5 hover:border-primary/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white text-primary transition-colors">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WORKFLOW SECTION */}
        <section className="py-32 px-6 bg-black/40 border-t border-white/5">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold">From clueless to confident in 4 steps.</h2>

              <div className="space-y-6">
                {[
                  { title: "1. Build your Brain", desc: "Upload your resume, connect GitHub, and set your career goals." },
                  { title: "2. Discover the Gaps", desc: "CareerOS analyzes where you fall short for your target roles." },
                  { title: "3. Take Action", desc: "Complete targeted projects and mock interviews recommended by AI." },
                  { title: "4. Track & Land", desc: "Manage applications and negotiate offers with AI guidance." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1"><CheckCircle2 className="text-primary w-6 h-6" /></div>
                    <div>
                      <h4 className="text-lg font-semibold">{step.title}</h4>
                      <p className="text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="aspect-square rounded-3xl border border-white/10 bg-card overflow-hidden relative group">
                <img
                  src="/attached_assets/generated_images/hero-ai-brain.png"
                  alt="AI Brain"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2800&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 border-[20px] border-background/20 mix-blend-overlay rounded-3xl pointer-events-none"></div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-40 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/20 z-0"></div>
          <div className="absolute inset-0 bg-mesh mix-blend-overlay z-0"></div>

          <div className="max-w-4xl mx-auto text-center relative z-10 glass p-16 rounded-[3rem]">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Stop guessing. Start building.</h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              Join thousands of students who have optimized their path to top tech companies.
            </p>
            <Link href="/signup">
              <button className="h-14 px-10 bg-white text-black hover:bg-white/90 text-lg font-bold rounded-full transition-all hover:scale-105 active:scale-95">
                Create Free Account
              </button>
            </Link>
            <p className="mt-6 text-sm text-white/50 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" /> No credit card required. Secure data.
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-background pt-16 pb-8 px-6 text-sm text-muted-foreground">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-foreground font-bold text-lg">
              <Sparkles className="w-5 h-5 text-primary" /> CareerOS
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground">Twitter</a>
              <a href="#" className="hover:text-foreground">LinkedIn</a>
              <a href="#" className="hover:text-foreground">GitHub</a>
            </div>
            <div>
              &copy; {new Date().getFullYear()} CareerOS. Built for the ambitious.
            </div>
          </div>
        </footer>
      </div>
    </PublicLayout>
  );
}
