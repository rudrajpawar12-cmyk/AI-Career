import { useState } from "react";
import { AppLayout } from "@/components/layouts";
import { mockCertificates } from "@/data/mock";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Award, ExternalLink, CheckCircle, Search, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  issuer: z.string().min(2, "Issuer is required"),
  date: z.string().min(2, "Date is required"),
  credentialId: z.string().optional(),
});

export default function Certificates() {
  const [certs, setCerts] = useState(mockCertificates);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", issuer: "", date: "", credentialId: "" },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const newCert = {
      id: Date.now(),
      name: data.name,
      issuer: data.issuer,
      date: data.date,
      credentialId: data.credentialId || "Pending",
      verified: true,
    };
    setCerts([newCert, ...certs]);
    setIsOpen(false);
    form.reset();
  };

  const deleteCert = (id: number) => {
    setCerts(certs.filter(c => c.id !== id));
  };

  const filteredCerts = activeTab === "All" 
    ? certs 
    : certs.filter(c => c.issuer.includes(activeTab) || (activeTab === "Other" && !['Amazon', 'Coursera', 'Udemy'].some(i => c.issuer.includes(i))));

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Certificates</h1>
            <p className="text-muted-foreground mt-1 text-sm">Verified proof of your continuous learning.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button className="h-10 px-4 bg-primary text-white rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 glow-primary transition-all">
                <Plus className="w-4 h-4" /> Add Certificate
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border border-white/10 text-foreground">
              <DialogHeader>
                <DialogTitle>Add Certificate</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Course / Certification Name</FormLabel><FormControl><Input {...field} className="bg-background/50" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="issuer" render={({ field }) => (
                    <FormItem><FormLabel>Issuing Organization</FormLabel><FormControl><Input placeholder="e.g. Coursera, AWS" {...field} className="bg-background/50" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="date" render={({ field }) => (
                      <FormItem><FormLabel>Issue Date</FormLabel><FormControl><Input placeholder="YYYY-MM" {...field} className="bg-background/50" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="credentialId" render={({ field }) => (
                      <FormItem><FormLabel>Credential ID</FormLabel><FormControl><Input {...field} className="bg-background/50" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <button type="submit" className="w-full h-10 bg-primary text-white rounded-lg font-medium mt-4">Save Certificate</button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b border-border/50 w-full justify-start rounded-none p-0 h-auto gap-6 mb-8">
            {["All", "Amazon", "Coursera", "Udemy", "Other"].map(tab => (
              <TabsTrigger 
                key={tab} 
                value={tab} 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 data-[state=active]:text-primary"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {filteredCerts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No certificates found for this category.</div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredCerts.map((cert) => (
                  <motion.div variants={item} layout key={cert.id} className="glass-card p-6 rounded-3xl group relative">
                    <button 
                      onClick={() => deleteCert(cert.id)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="w-12 h-12 rounded-xl bg-card border border-white/10 flex items-center justify-center mb-6 shadow-sm">
                      <Award className={`w-6 h-6 ${cert.issuer.includes('Amazon') ? 'text-orange-500' : cert.issuer.includes('Coursera') ? 'text-blue-500' : 'text-purple-500'}`} />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-1 pr-8 leading-tight">{cert.name}</h3>
                    <p className="text-sm font-medium text-muted-foreground mb-6">{cert.issuer}</p>
                    
                    <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Issued</span>
                        <span className="font-medium text-foreground">{cert.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Credential ID</span>
                        <span className="font-mono text-foreground">{cert.credentialId}</span>
                      </div>
                      {cert.verified && (
                        <div className="flex items-center gap-1.5 text-green-500 font-medium mt-2 bg-green-500/10 w-fit px-2 py-1 rounded border border-green-500/20">
                          <CheckCircle className="w-3.5 h-3.5" /> Verified Credential
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}
