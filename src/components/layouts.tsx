import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  FileText, 
  Github, 
  Target, 
  Map, 
  MessageSquare, 
  Briefcase, 
  FolderGit2, 
  Award, 
  CheckSquare, 
  User, 
  Settings,
  LogOut,
  Sparkles
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { getInitials } from "@/lib/profile-utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Resume", href: "/resume", icon: FileText },
  { name: "GitHub Analyzer", href: "/github", icon: Github },
  { name: "Skill Gap", href: "/skills", icon: Target },
  { name: "Roadmap", href: "/roadmap", icon: Map },
  { name: "Interview Prep", href: "/interview", icon: MessageSquare },
  { name: "AI Mentor", href: "/mentor", icon: Sparkles },
  { name: "Applications", href: "/applications", icon: Briefcase },
  { name: "Projects", href: "/projects", icon: FolderGit2 },
  { name: "Certificates", href: "/certificates", icon: Award },
  { name: "Goals", href: "/goals", icon: CheckSquare },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const displayName = profile?.full_name || user?.email || "there";
  const initials = getInitials(profile?.full_name, user?.email);

  const handleLogout = async () => {
    await signOut();
    setLocation("/");
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/20">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border/50 bg-card/30 backdrop-blur-xl flex flex-col hidden md:flex z-10 relative">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>
        
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">CareerOS</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <motion.div 
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm">{item.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50 mt-auto">
          <div className="space-y-1">
            <Link href="/profile">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${location === '/profile' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                <User className="w-5 h-5" />
                <span className="text-sm">Profile</span>
              </div>
            </Link>
            <Link href="/settings">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${location === '/settings' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                <Settings className="w-5 h-5" />
                <span className="text-sm">Settings</span>
              </div>
            </Link>
            <div
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Log out</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-mesh relative">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            {/* Contextual Header Title */}
            <h2 className="text-sm font-medium text-muted-foreground hidden sm:block">
              {navItems.find(i => i.href === location)?.name || location.substring(1).replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium group-hover:text-primary transition-colors">{displayName}</div>
                  <div className="text-xs text-muted-foreground">Pro Tier</div>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/20 group-hover:border-primary transition-colors">
                  {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={displayName} />}
                  <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function PublicLayout({ children, showNav = true }: { children: ReactNode, showNav?: boolean }) {
  return (
    <div className="min-h-[100dvh] bg-background bg-mesh text-foreground flex flex-col relative overflow-hidden">
      {showNav && (
        <header className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6 border-b border-white/5 bg-background/50 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">CareerOS</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/login">
              <button className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors">Sign in</button>
            </Link>
            <Link href="/signup">
              <button className="px-4 py-2 text-sm font-medium bg-white text-black hover:bg-white/90 rounded-full transition-colors hidden sm:block">
                Get Started
              </button>
            </Link>
          </div>
        </header>
      )}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
