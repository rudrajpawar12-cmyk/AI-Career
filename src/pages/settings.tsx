import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layouts";
import { User, Palette, Bell, Shield, Plug, Moon, Sun, Monitor, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";

export default function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem("career-os-theme") || "dark");
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();

  // Controlled fields for the Account tab, seeded from the real profile once it loads.
  const [accountForm, setAccountForm] = useState({
    fullName: "",
    email: "",
    college: "",
    degree: "",
    graduationYear: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setAccountForm({
      fullName: profile?.full_name ?? "",
      email: user?.email ?? "",
      college: profile?.college ?? "",
      degree: profile?.degree ?? "",
      graduationYear: profile?.graduation_year ? String(profile.graduation_year) : "",
    });
  }, [profile, user]);

  const handleSaveAccount = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: accountForm.fullName,
          college: accountForm.college,
          degree: accountForm.degree,
          graduation_year: accountForm.graduationYear ? Number(accountForm.graduationYear) : null,
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      setSaveMessage("Saved!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      setSaveMessage("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("career-os-theme", newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your account preferences and app settings.</p>
        </div>

        <Tabs defaultValue="appearance" className="flex flex-col md:flex-row gap-8">
          <TabsList className="flex flex-col bg-transparent h-auto w-full md:w-64 space-y-2">
            {[
              { id: "account", icon: User, label: "Account" },
              { id: "appearance", icon: Palette, label: "Appearance" },
              { id: "notifications", icon: Bell, label: "Notifications" },
              { id: "privacy", icon: Shield, label: "Privacy & Security" },
              { id: "integrations", icon: Plug, label: "Integrations" },
            ].map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="w-full justify-start gap-3 px-4 py-3 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/50"
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 glass-card p-6 md:p-8 rounded-3xl">
            
            <TabsContent value="appearance" className="space-y-8 mt-0">
              <div>
                <h3 className="text-xl font-bold mb-1">Theme Preferences</h3>
                <p className="text-sm text-muted-foreground mb-6">Customize the look and feel of CareerOS.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: "light", icon: Sun, label: "Light" },
                    { id: "dark", icon: Moon, label: "Dark" },
                    { id: "system", icon: Monitor, label: "System" },
                  ].map(t => (
                    <button 
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      className={`relative p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all
                        ${theme === t.id 
                          ? 'border-primary bg-primary/5 glow-primary' 
                          : 'border-white/10 bg-card hover:border-white/20'}`}
                    >
                      {theme === t.id && <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-primary" />}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === t.id ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <t.icon className="w-6 h-6" />
                      </div>
                      <span className="font-semibold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/5 pt-8">
                <h3 className="text-lg font-bold mb-4">Typography</h3>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Font Size</Label>
                      <span className="text-xs text-muted-foreground">Medium</span>
                    </div>
                    <input type="range" min="1" max="3" defaultValue="2" className="w-full accent-primary" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="account" className="space-y-6 mt-0">
              <div>
                <h3 className="text-xl font-bold mb-1">Profile Details</h3>
                <p className="text-sm text-muted-foreground mb-6">Update your personal and educational information.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <div className="space-y-2 md:col-span-2">
                  <Label>Full Name</Label>
                  <Input
                    value={accountForm.fullName}
                    onChange={e => setAccountForm({ ...accountForm, fullName: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Email Address</Label>
                  <Input value={accountForm.email} disabled className="bg-background/50" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>University</Label>
                  <Input
                    value={accountForm.college}
                    onChange={e => setAccountForm({ ...accountForm, college: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Degree</Label>
                  <Input
                    value={accountForm.degree}
                    onChange={e => setAccountForm({ ...accountForm, degree: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Graduation Year</Label>
                  <Input
                    value={accountForm.graduationYear}
                    onChange={e => setAccountForm({ ...accountForm, graduationYear: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleSaveAccount}
                  disabled={isSaving}
                  className="h-10 px-6 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
                {saveMessage && <span className="text-sm text-muted-foreground">{saveMessage}</span>}
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-0">
              <h3 className="text-xl font-bold mb-6">Notification Settings</h3>
              <div className="space-y-6 max-w-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Weekly Progress Report</Label>
                    <p className="text-sm text-muted-foreground">Get a summary of your skills and applications.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">AI Mentor Alerts</Label>
                    <p className="text-sm text-muted-foreground">Push notifications for urgent actions.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Application Deadlines</Label>
                    <p className="text-sm text-muted-foreground">Reminders before saved jobs expire.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-8 mt-0">
              <div>
                <h3 className="text-xl font-bold mb-6">Security</h3>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="••••••••" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="••••••••" className="bg-background/50" />
                  </div>
                  <button className="h-10 px-6 bg-card border border-white/10 rounded-lg font-medium hover:bg-muted mt-2">Update Password</button>
                </div>
              </div>
              
              <div className="border-t border-white/5 pt-8 max-w-lg">
                <h3 className="text-xl font-bold mb-6">Data Privacy</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base">Anonymous Analytics</Label>
                    <p className="text-sm text-muted-foreground">Help improve CareerOS by sharing usage data.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <button className="text-red-500 text-sm font-medium hover:underline mt-4">Delete Account & Data</button>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6 mt-0">
              <h3 className="text-xl font-bold mb-6">Connected Accounts</h3>
              <div className="grid gap-4 max-w-2xl">
                {[
                  {
                    name: "GitHub",
                    status: profile?.github_username ? "Connected" : "Not Connected",
                    user: profile?.github_username ?? "",
                    icon: "SiGithub",
                  },
                  { name: "LinkedIn", status: "Not Connected", user: "", icon: "SiLinkedin" },
                  { name: "LeetCode", status: "Not Connected", user: "", icon: "SiLeetcode" },
                ].map(integration => (
                  <div key={integration.name} className="p-4 rounded-xl border border-white/10 bg-background/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center border border-white/5">
                        <Plug className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold">{integration.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {integration.status === "Connected" ? integration.user : "Sync your profile"}
                        </div>
                      </div>
                    </div>
                    <button className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${integration.status === 'Connected' 
                        ? 'bg-card border border-white/10 text-muted-foreground hover:bg-muted' 
                        : 'bg-primary text-white hover:bg-primary/90'}`}>
                      {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}
