import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowRight,
    Zap,
    BrainCircuit,
    Workflow,
    FolderGit2,
    Database,
    Bot,
    Sparkles,
    CheckCircle2,
    Copy,
    Cpu,
    Network
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Landing() {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const scrollToBeta = () => {
        const el = document.getElementById('beta-capture');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleBetaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        // Add actual submit logic here later
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-white">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/[0.05] bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                            <span className="text-background font-bold text-xl">RN</span>
                        </div>
                        <span className="font-semibold text-xl tracking-tight">Rocha Negra</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <Button className="bg-white text-background hover:bg-white/90" onClick={scrollToBeta}>
                            Join Beta
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="max-w-2xl relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span>Phase One Private Beta</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-gradient leading-[1.1]">
                            Your Second Brain,<br />
                            <span className="text-white">Now with a Workforce.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-xl">
                            Move beyond passive note-taking. Rocha Negra connects your projects, notes, and tasks to custom AI Agents that execute work based on your deep context.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="h-14 px-8 text-lg bg-white text-background hover:bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.3)]" onClick={scrollToBeta}>
                                Join the Private Beta
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                            <div className="flex items-center justify-center sm:justify-start px-4 text-sm text-muted-foreground font-medium">
                                Free for Early Testers
                            </div>
                        </div>
                    </div>

                    {/* Split Screen Vis */}
                    <div className="relative z-10">
                        <div className="flex flex-col gap-4">
                            {/* The Problem (Top) */}
                            <div className="w-full bg-[#111111] border border-white/5 rounded-2xl p-6 opacity-60">
                                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                                        <Database className="w-4 h-4" /> Wait... finding context
                                    </div>
                                    <span className="px-2 py-1 bg-destructive/20 text-destructive text-xs rounded-md font-mono">Manual labor</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 w-3/4 bg-white/10 rounded animate-pulse" />
                                    <div className="h-2 w-1/2 bg-white/10 rounded animate-pulse" />
                                    <div className="flex items-center gap-2 mt-4 text-xs font-mono text-white/40 bg-white/5 p-2 rounded">
                                        <Copy className="w-3 h-3" /> Copy-pasting to ChatGPT...
                                    </div>
                                </div>
                            </div>

                            {/* The Arrow (Middle) */}
                            <div className="flex justify-center -my-6 relative z-20">
                                <div className="w-10 h-10 bg-background border border-white/10 rounded-full flex items-center justify-center glass-card shadow-xl">
                                    <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90 md:rotate-0" />
                                </div>
                            </div>

                            {/* The Solution (Bottom) */}
                            <div className="w-full glass-card border border-white/20 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_80px_rgba(255,255,255,0.05)]">
                                <div className="absolute inset-0 bg-primary/5 vault-shimmer pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-bold">
                                            Project: Rebrand
                                        </div>
                                        <div className="flex items-center gap-2 opacity-60">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs font-mono text-muted-foreground">Connected</span>
                                        </div>
                                    </div>

                                    {/* Connection Lines (Simulated) */}
                                    <div className="flex items-center justify-between mt-8 mb-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="h-1.5 w-16 bg-white/20 rounded" />
                                            <div className="h-1.5 w-12 bg-white/20 rounded" />
                                            <div className="h-1.5 w-20 bg-white/20 rounded" />
                                        </div>
                                        <div className="h-[2px] flex-1 bg-gradient-to-r from-white/10 via-white/40 to-white/10 mx-4 relative overflow-hidden">
                                            <div className="absolute inset-0 w-1/2 bg-white h-full blur-sm opacity-50 animate-[shimmer_2s_infinite]" />
                                        </div>
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                            <Bot className="w-6 h-6 text-background" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl mt-4">
                                        <div className="flex items-start gap-3">
                                            <Sparkles className="w-4 h-4 text-emerald-400 mt-1" />
                                            <div>
                                                <div className="text-sm font-medium text-white mb-1">Perfect Strategy Doc</div>
                                                <div className="text-xs text-muted-foreground">Generated instantly using 42 connected context nodes.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative background class items */}
                <div className="absolute top-1/2 -right-64 w-[600px] h-[600px] bg-white/10 rounded-full blur-[128px] pointer-events-none opacity-20" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[128px] pointer-events-none opacity-10" />
            </section>

            {/* The Agitation */}
            <section className="py-24 border-y border-white/[0.05] bg-[#0a0a0a] relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-destructive/50 to-transparent opacity-50" />
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Generative AI is blind to your business.</h2>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        You spend hours organizing your life in tools like Notion, only to switch to ChatGPT and realize it knows nothing about your brand voice, your past projects, or your current goals. You aren't saving time; <span className="text-white font-medium">you're just doing data-entry for a chatbot.</span>
                    </p>
                </div>
            </section>

            {/* The Solution */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Give your AI a brain. <span className="text-gradient">Yours.</span></h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Stop repeating yourself. Rocha Negra ingests your world and runs agents natively where your context lives.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Network className="w-24 h-24" />
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 relative z-10 border border-white/5">
                                <FolderGit2 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 relative z-10">Context by Default</h3>
                            <p className="text-muted-foreground leading-relaxed relative z-10">
                                Built on the PARA method. Point an agent at a Project or Area, and it instantly absorbs all linked notes, tasks, and history. No manual prompting required.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors group">
                            <div className="absolute inset-0 bg-primary/5 vault-shimmer rounded-3xl" />
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Workflow className="w-24 h-24" />
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 relative z-10 border border-white/5">
                                <BrainCircuit className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Reusable Agents</h3>
                            <p className="text-muted-foreground leading-relaxed font-medium">
                                Build an "SEO Copywriter" agent once. Give it your brand guidelines. Run it forever on new product launches with one click.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap className="w-24 h-24" />
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 relative z-10 border border-white/5">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 relative z-10">Actionable Outputs</h3>
                            <p className="text-muted-foreground leading-relaxed relative z-10">
                                Don't just chat. Turn agent outputs directly into executable Tasks or organized Resources within your workspace instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-32 bg-[#0a0a0a] border-y border-white/[0.05]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                            <Bot className="w-4 h-4" />
                            <span>Coming in Phase Two</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                            Agents That <span className="text-gradient">Build Your Blueprint</span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Stop manually breaking down projects. Your agents will analyze goals, split steps into substeps, and verify completion—automatically.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                <BrainCircuit className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-bold mb-2">1. Set a Goal</h3>
                            <p className="text-sm text-muted-foreground">"Launch my SaaS landing page"</p>
                        </div>
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                <Workflow className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-bold mb-2">2. AI Generates Blueprint</h3>
                            <p className="text-sm text-muted-foreground">With dependencies, estimates, and context links</p>
                        </div>
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-bold mb-2">3. Verify & Execute</h3>
                            <p className="text-sm text-muted-foreground">Manual or automated verification before proceeding</p>
                        </div>
                    </div>
                    
                    {/* <div className="text-center mt-12">
                        <Button variant="outline" className="border-white/20 bg-white/5" onClick={scrollToBeta}>
                            Get early access to agent features
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div> */}
                </div>
            </section>


            {/* Future-Proof Teaser */}
            <section className="py-24 bg-gradient-to-b from-background to-white/[0.02] border-t border-white/[0.05]">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 mb-8">
                        <Cpu className="w-8 h-8 text-white/80" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-8">
                        Today: Your Assistants. <br className="hidden md:block"/> 
                        <span className="text-gradient font-bold">Tomorrow: Your Autonomous Team.</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
                        We are building an architecture where agents can trigger sub-agents, choose the best models for the job, and run asynchronously in the background. Join the beta to shape the future of autonomous work.
                    </p>
                </div>
            </section>

            {/* Beta Capture Form */}
            <section id="beta-capture" className="py-32 relative">
                <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none" />
                <div className="max-w-3xl mx-auto px-6 relative z-10">
                    <div className="glass-card border border-white/10 p-10 md:p-14 rounded-[2rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
                        
                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-bold mb-4 text-white">We are onboarding 100 power users.</h2>
                            <p className="text-lg text-muted-foreground">Get free early access and directly influence our roadmap.</p>
                        </div>

                        {isSubmitted ? (
                            <div className="text-center py-12 animate-fade-in">
                                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">You're on the list.</h3>
                                <p className="text-muted-foreground">Keep an eye on your inbox. We'll be in touch soon.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleBetaSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/80">Name</label>
                                        <Input required placeholder="Jane Doe" className="bg-black/50 border-white/10 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/80">Work Email</label>
                                        <Input required type="email" placeholder="jane@company.com" className="bg-black/50 border-white/10 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/80">What's your role?</label>
                                        <Select>
                                            <SelectTrigger className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white">
                                                <SelectValue placeholder="Select your role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="founder">Founder / Solo Creator</SelectItem>
                                                <SelectItem value="product">Product Manager</SelectItem>
                                                <SelectItem value="marketing">Marketing Lead</SelectItem>
                                                <SelectItem value="freelancer">Freelancer / Agency Owner</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                            
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                                        What is the most painful manual task you do every week?
                                        <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded border border-primary/20">Crucial</span>
                                    </label>
                                    <Textarea required placeholder="E.g., I spend 4 hours copying client notes into proposals..." className="bg-black/50 border-white/10 min-h-[120px] resize-y" />
                                </div>
                                <Button type="submit" size="lg" className="w-full h-14 text-lg bg-white text-background hover:bg-white/90 font-bold transition-all shadow-lg hover:shadow-white/20">
                                    Apply for Beta Access
                                </Button>
                                <p className="text-center text-xs text-muted-foreground mt-4">
                                    No credit card required. Spaces are strictly limited to ensure quality feedback.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/[0.05] bg-black">
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center gap-4">
                    <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
                            <span className="text-background font-bold text-xs">RN</span>
                        </div>
                        <span className="font-semibold tracking-tight">Rocha Negra</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">© {new Date().getFullYear()} Rocha Negra. Built to give you your time back.</p>
                </div>
            </footer>
        </div>
    );
}
