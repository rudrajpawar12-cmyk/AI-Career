import { useState } from "react";
import { AppLayout } from "@/components/layouts";
import { mockProjects } from "@/data/mock";

type Project = {
  id: number;
  name: string;
  description: string;
  tech: string[];
  status: string;
  github: string | null;
  live: string | null;
};
import { motion } from "framer-motion";
import { Plus, Github, ExternalLink, Code2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  description: z.string().min(10, "Description is required"),
  tech: z.string().min(2, "Add at least one tech stack (comma separated)"),
  status: z.string(),
  github: z.string().url().optional().or(z.literal("")),
  live: z.string().url().optional().or(z.literal("")),
});

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", tech: "", status: "Active", github: "", live: "" },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const newProject = {
      id: Date.now(),
      name: data.name,
      description: data.description,
      tech: data.tech.split(",").map(s => s.trim()),
      status: data.status,
      github: data.github || null,
      live: data.live || null,
    };
    setProjects([newProject, ...projects]);
    setIsOpen(false);
    form.reset();
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground mt-1 text-sm">Showcase your best work to recruiters.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button className="h-10 px-4 bg-primary text-white rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 glow-primary transition-all">
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border border-white/10 text-foreground">
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input {...field} className="bg-background/50" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} className="bg-background/50" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="tech" render={({ field }) => (
                    <FormItem><FormLabel>Tech Stack (comma separated)</FormLabel><FormControl><Input placeholder="React, Node, MongoDB" {...field} className="bg-background/50" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="github" render={({ field }) => (
                      <FormItem><FormLabel>GitHub URL</FormLabel><FormControl><Input {...field} className="bg-background/50" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="live" render={({ field }) => (
                      <FormItem><FormLabel>Live URL</FormLabel><FormControl><Input {...field} className="bg-background/50" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <button type="submit" className="w-full h-10 bg-primary text-white rounded-lg font-medium mt-4">Save Project</button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length === 0 ? (
          <div className="h-64 glass-card rounded-3xl flex flex-col items-center justify-center text-center">
            <Code2 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No projects yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">Add your side projects, hackathon builds, or coursework to strengthen your profile.</p>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div variants={item} key={project.id} className="glass-card p-6 rounded-3xl flex flex-col group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border
                    ${project.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      project.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                      'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                    {project.status}
                  </div>
                  <div className="flex gap-2 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                    {project.github && <a href={project.github} target="_blank" rel="noreferrer" className="hover:text-primary"><Github className="w-4 h-4" /></a>}
                    {project.live && <a href={project.live} target="_blank" rel="noreferrer" className="hover:text-primary"><ExternalLink className="w-4 h-4" /></a>}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tech.map((t, i) => (
                    <span key={i} className="px-2.5 py-1 bg-card border border-white/5 rounded-full text-xs font-medium text-foreground/80">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
