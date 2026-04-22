import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Bot, 
    Settings2, 
    Database, 
    Plus, 
    Send, 
    History,
    Sparkles,
    FileText,
    Target,
    FolderGit2,
    RefreshCw,
    Save,
    CheckSquare,
    Loader2,
    ChevronLeft,
    Network
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

// Dummy data
const DUMMY_NODES = [
    { id: 1, type: 'PROJECT', name: 'Rebrand 2026', icon: <FolderGit2 className="w-4 h-4 text-blue-400" /> },
    { id: 2, type: 'AREA', name: 'Marketing', icon: <Target className="w-4 h-4 text-purple-400" /> },
    { id: 3, type: 'RESOURCE', name: 'Brand Guidelines', icon: <FileText className="w-4 h-4 text-emerald-400" /> },
];

const DUMMY_HISTORY = [
    { id: 'h1', prompt: 'Draft a short intro for the landing page.', response: 'Here is a drafted intro based on the Brand Guidelines:\n\n"Welcome to the future of our product..."' },
    { id: 'h2', prompt: 'Analyze target audience.', response: 'The target audience according to the Marketing area includes...' },
    { id: 'h3', prompt: 'List 3 goals for Rebrand 2026', response: '1. Modernize logo\n2. Update color palette\n3. Redefine tone of voice.' },
    { id: 'h4', prompt: 'Create social media post.', response: 'Just launched our new rebrand! 🚀 Check out the fresh look.' },
    { id: 'h5', prompt: 'Summarize past meetings.', response: 'You have 3 recorded meetings concerning the identity shift. Key takeaways: Keep it minimal.' },
];

export default function AgentStudio() {
    const { personaId, workerId } = useParams();
    
    // UI State
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Generation State
    const [activeResponse, setActiveResponse] = useState("");
    const [streamComplete, setStreamComplete] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeResponse, isGenerating]);

    const handleRun = async () => {
        if (!prompt.trim() || isGenerating) return;
        
        setIsGenerating(true);
        setActiveResponse("");
        setStreamComplete(false);
        
        try {
            const { data } = await api.post("/agents/generate-test", {
                prompt,
                model: "anthropic/claude-3-haiku" // Mock config grab
            });
            
            setActiveResponse(data.response || "No response received.");
        } catch (error) {
            console.error(error);
            setActiveResponse("An error occurred while calling the agent context.");
        } finally {
            setIsGenerating(false);
            setStreamComplete(true);
        }
    };

    const handleHistoryClick = (text: string) => {
        setPrompt(text);
    };

    return (
        <div className="h-[calc(100vh-4rem)] bg-background flex overflow-hidden">
            
            {/* LEFT SIDEBAR: Worker Info & Context */}
            <div className="w-[380px] border-r border-border bg-black/20 flex flex-col h-full shrink-0 relative z-10">
                <ScrollArea className="flex-1 p-6">
                    <Link to={`/agents/${personaId}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-white transition-colors mb-6 group">
                        <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                        Back to Persona
                    </Link>

                    <div className="mb-8">
                        <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-lg">
                                <Bot className="w-5 h-5" />
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Active
                            </span>
                        </div>
                        <h2 className="font-bold text-xl leading-tight text-white/90">Drafting Q3 Marketing Plan</h2>
                        <p className="text-xs font-medium mt-1 text-primary/80">Worker ID: {workerId || '123'}</p>
                    </div>

                    <div className="space-y-6">
                        {/* Worker Context (The Brief) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                <div className="flex items-center gap-2 text-sm font-bold text-white/90">
                                    <Target className="w-4 h-4 text-primary" /> Task Context (The Brief)
                                </div>
                                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-white/10" title="Add Node">
                                    <Plus className="w-4 h-4 text-muted-foreground hover:text-white" />
                                </Button>
                            </div>
                            
                            <p className="text-xs text-muted-foreground leading-relaxed px-1">
                                Add data specifically needed for this task. Context added here does not leak to other workers.
                            </p>
                            
                            <div className="space-y-2">
                                {/* Dummy specific node */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-colors cursor-pointer group">
                                    <div className="p-1.5 rounded-md bg-white/5 border border-white/5">
                                        <FolderGit2 className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Q3 Launch Assets</div>
                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">PROJECT</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inherited Persona Context */}
                        <div className="space-y-4 pt-6">
                            <div className="flex items-center gap-2 text-sm font-semibold text-white/70 pb-2 border-b border-white/5">
                                <Network className="w-4 h-4" /> Inherited Persona Context
                            </div>
                            <p className="text-xs text-white/40 italic px-1">
                                Loaded from "Sarah - Lead SEO" Blueprint.
                            </p>
                            
                            <div className="space-y-2 opacity-60">
                                {DUMMY_NODES.map(node => (
                                    <div key={node.id} className="flex items-center gap-3 p-3 rounded-lg bg-black/40 border border-white/5 cursor-not-allowed">
                                        {node.icon}
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{node.name}</div>
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{node.type}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* RIGHT MAIN AREA: Execution Arena */}
            <div className="flex-1 flex flex-col relative grid-pattern bg-black/40">
                {/* Background effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-30 pointer-events-none" />

                {/* History / Outputs (Top) */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12"
                >
                    {/* Execution History */}
                    <div className="space-y-6 max-w-4xl mx-auto w-full">
                        <div className="flex items-center gap-2 text-muted-foreground pb-4 border-b border-white/5">
                            <History className="w-4 h-4" />
                            <span className="text-sm font-medium uppercase tracking-wider">Past Executions</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {DUMMY_HISTORY.map(history => (
                                <div 
                                    key={history.id} 
                                    onClick={() => handleHistoryClick(history.prompt)}
                                    className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group flex flex-col gap-2"
                                >
                                    <div className="text-sm text-white/90 font-medium line-clamp-1 group-hover:text-primary transition-colors">
                                        "{history.prompt}"
                                    </div>
                                    <div className="text-xs text-muted-foreground line-clamp-2">
                                        {history.response}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Generation Space */}
                    {(activeResponse || isGenerating) && (
                        <div className="max-w-4xl mx-auto w-full pt-10 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 transition-all duration-500",
                                    isGenerating ? "bg-primary/20 text-primary animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.5)]" : "bg-white/10 text-white"
                                )}>
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-xl whitespace-pre-wrap leading-relaxed text-sm text-white/90">
                                        {activeResponse}
                                        {isGenerating && (
                                            <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse translate-y-1" />
                                        )}
                                    </div>
                                    
                                    {/* Action Menu (Visible on Complete) */}
                                    {streamComplete && (
                                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Button size="sm" variant="outline" className="h-8 bg-white/5 hover:bg-white/10 border-white/10 gap-2">
                                                <Save className="w-3.5 h-3.5" /> Save as Resource
                                            </Button>
                                            <Button size="sm" variant="outline" className="h-8 bg-white/5 hover:bg-white/10 border-white/10 gap-2">
                                                <CheckSquare className="w-3.5 h-3.5" /> Create Task
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="h-8 hover:bg-white/5 text-muted-foreground hover:text-white ml-auto gap-2"
                                                onClick={() => setPrompt(activeResponse)}
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" /> Refine
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Command Bar (Bottom) */}
                <div className="p-6 bg-black/20 border-t border-white/5 backdrop-blur-md">
                    <div className="max-w-4xl mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                        <div className="relative flex items-end gap-3 p-2 rounded-2xl bg-black border border-white/20 shadow-2xl focus-within:border-primary/50 transition-colors">
                            <Textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Draft a project plan based on these notes..."
                                className="min-h-[80px] max-h-[300px] border-0 focus-visible:ring-0 bg-transparent resize-none p-4 text-base md:text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleRun();
                                    }
                                }}
                            />
                            <div className="pb-2 pr-2">
                                <Button 
                                    size="icon" 
                                    className={cn(
                                        "w-10 h-10 rounded-xl transition-all",
                                        prompt.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25" : "bg-white/10 text-white/40 cursor-not-allowed"
                                    )}
                                    onClick={handleRun}
                                    disabled={!prompt.trim() || isGenerating}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="mt-2 text-center">
                            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
                                <Bot className="w-3 h-3" /> Agent Execution Engine Active
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
