import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    ChevronLeft, 
    Briefcase, 
    Settings2, 
    Database, 
    Plus,
    Activity,
    FolderGit2,
    Target,
    FileText,
    BrainCircuit,
    TerminalSquare,
    Play,
    ChevronRight
} from "lucide-react";
import { MOCK_PERSONAS } from "./AgentsHub";
import { AgentWorker } from "@/types/agents";

const MOCK_WORKERS: AgentWorker[] = [
    { id: 'w1', persona_id: 'p1', title: 'Drafting Q3 Marketing Plan', status: 'ACTIVE', created_at: '2024-10-25T10:00:00Z', last_activity: '10 mins ago' },
    { id: 'w2', persona_id: 'p1', title: 'Competitor Analysis - ACME Corp', status: 'ACTIVE', created_at: '2024-10-28T09:00:00Z', last_activity: '2 hours ago' },
    { id: 'w3', persona_id: 'p1', title: 'November Blog Posts', status: 'ARCHIVED', created_at: '2024-11-01T14:00:00Z', last_activity: '1 month ago' },
];

const MOCK_GLOBAL_CONTEXT = [
    { id: 1, type: 'RESOURCE', name: 'Brand Guidelines 2026', icon: <FileText className="w-4 h-4 text-emerald-400" /> },
    { id: 2, type: 'AREA', name: 'Marketing Dept.', icon: <Target className="w-4 h-4 text-purple-400" /> },
];

export default function PersonaDashboard() {
    const { personaId } = useParams();
    const persona = MOCK_PERSONAS.find(p => p.id === personaId) || MOCK_PERSONAS[0];

    const activeWorkers = MOCK_WORKERS.filter(w => w.status === 'ACTIVE');
    const archivedWorkers = MOCK_WORKERS.filter(w => w.status === 'ARCHIVED');

    return (
        <div className="h-[calc(100vh-[var(--header-height,4rem)])] min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-background overflow-hidden relative">
            
            {/* LEFT SIDEBAR: The Persona "Dossier" */}
            <div className="w-full md:w-[400px] border-r border-white/5 bg-black/40 flex flex-col h-full relative z-10 shrink-0">
                <ScrollArea className="flex-1 p-6 md:p-8">
                    <Link to="/agents" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-white transition-colors mb-8 group">
                        <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                        Back to Hub
                    </Link>

                    {/* Badge/Header */}
                    <div className="flex items-start gap-4 mb-8 pb-8 border-b border-white/5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center relative shadow-lg">
                            <span className="text-2xl font-black bg-gradient-to-br from-white to-white/50 text-transparent bg-clip-text tracking-tighter">
                                {persona.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-white/90">{persona.name}</h2>
                            <p className="text-sm text-primary/80 font-medium mt-1">{persona.role_description}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="inline-flex items-center px-2 py-1 rounded bg-white/5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase border border-white/5">
                                    <Briefcase className="w-3 h-3 mr-1" /> {persona.default_model.split('/')[1] || 'Model'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* The "Employee Handbook" (Global Context) */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-bold text-white/90 tracking-wide">
                                    <Database className="w-4 h-4" /> Global Context
                                </div>
                                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-white/10" title="Attach Node">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed px-1 font-medium">
                                Elements attached here form the <span className="text-white">"Employee Handbook"</span>. This Persona will inject this knowledge into every single task it runs natively.
                            </p>
                            
                            <div className="space-y-2">
                                {MOCK_GLOBAL_CONTEXT.map(node => (
                                    <div key={node.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors cursor-pointer group">
                                        <div className="p-1.5 rounded-md bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                                            {node.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-white/90">{node.name}</div>
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{node.type}</div>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Settings Preview */}
                        <div className="space-y-4 pt-4 mt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 text-sm font-bold text-white/90 tracking-wide pb-2">
                                <Settings2 className="w-4 h-4" /> Blueprint Configuration
                            </div>
                            <div className="p-4 rounded-xl bg-black/50 border border-white/5 font-mono text-xs leading-relaxed text-muted-foreground relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-50">
                                    <TerminalSquare className="w-4 h-4" />
                                </div>
                                <span className="text-white/70">system_prompt:</span> "{persona.system_prompt_template.length > 60 ? persona.system_prompt_template.substring(0, 60) + '...' : persona.system_prompt_template}"
                                <br/><br/>
                                <span className="text-white/70">temperature:</span> {persona.temperature}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                
                {/* Persona Footbar */}
                <div className="p-6 border-t border-white/5 bg-black/60 backdrop-blur-md">
                    <Button variant="outline" className="w-full bg-transparent border-white/10 hover:bg-white/5">
                        Edit Persona
                    </Button>
                </div>
            </div>

            {/* RIGHT MAIN AREA: Workers Grid */}
            <div className="flex-1 overflow-y-auto bg-[#0a0a0a] relative">
                <div className="absolute inset-0 bg-primary/5 blur-[100px] pointer-events-none opacity-20" />
                
                <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-12">
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Active Tasks</h1>
                            <p className="text-muted-foreground">Manage the specific instances this Persona is currently executing.</p>
                        </div>
                        <Button className="shrink-0 gap-2 font-semibold h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all rounded-full">
                            <Plus className="w-4 h-4" /> Assign New Task
                        </Button>
                    </div>

                    {/* Active Workers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeWorkers.map(worker => (
                            <Link to={`/agents/${personaId}/worker/${worker.id}`} key={worker.id}>
                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-primary/50 hover:bg-white/[0.04] transition-all cursor-pointer group flex flex-col justify-between h-[160px] relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                <BrainCircuit className="w-4 h-4" />
                                            </div>
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                Active
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white/90 group-hover:text-primary transition-colors line-clamp-1">
                                            {worker.title}
                                        </h3>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                                        <span className="flex items-center gap-1.5">
                                            <Activity className="w-3.5 h-3.5" /> {worker.last_activity}
                                        </span>
                                        <span className="flex items-center gap-1 text-primary/70 font-medium group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 duration-300">
                                            Open Workspace <ChevronRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Archived Tasks */}
                    {archivedWorkers.length > 0 && (
                        <div className="space-y-4 pt-8 border-t border-white/5">
                            <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                                <TerminalSquare className="w-5 h-5 text-muted-foreground" />
                                Completed History
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {archivedWorkers.map(worker => (
                                    <div key={worker.id} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                                        <h4 className="text-sm font-medium text-white/80">{worker.title}</h4>
                                        <div className="text-xs text-muted-foreground">{new Date(worker.created_at).toLocaleDateString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
