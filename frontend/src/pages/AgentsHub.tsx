import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Briefcase, Activity, ChevronRight, TerminalSquare, BrainCircuit, Network } from "lucide-react";
import { AgentPersona } from "@/types/agents";

// Mock Data
export const MOCK_PERSONAS: AgentPersona[] = [
    {
        id: "p1",
        name: "Sarah - Lead SEO",
        role_description: "Senior Content Strategist & SEO Specialist",
        system_prompt_template: "You are the Lead SEO...",
        default_model: "anthropic/claude-3-5-sonnet",
        temperature: 0.7,
        created_at: "2024-10-24T10:00:00Z",
        stats: { active_tasks: 3, completed_tasks: 45 }
    },
    {
        id: "p2",
        name: "DevBot - Principle Engineer",
        role_description: "Lead Python Developer and Architect",
        system_prompt_template: "You are a senior python dev...",
        default_model: "openai/gpt-4o",
        temperature: 0.2,
        created_at: "2024-11-05T12:00:00Z",
        stats: { active_tasks: 1, completed_tasks: 120 }
    },
    {
        id: "p3",
        name: "Nova - Data Analyst",
        role_description: "Financial modeling and generic data parsing",
        system_prompt_template: "You are a quantitative analyst...",
        default_model: "anthropic/claude-3-haiku",
        temperature: 0.1,
        created_at: "2024-12-11T09:00:00Z",
        stats: { active_tasks: 0, completed_tasks: 12 }
    }
];

export default function AgentsHub() {
    return (
        <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Network className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Your Workforce</h1>
                    </div>
                    <p className="text-muted-foreground max-w-xl leading-relaxed">
                        Manage your autonomous team. Personas act as blueprints that dictate tone, expertise, and global context. Spawn workers from them to execute specific tasks.
                    </p>
                </div>
                
                <Button className="shrink-0 gap-2 font-semibold h-11 px-6 bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10 hover:shadow-white/20 transition-all rounded-full">
                    <UserPlus className="w-4 h-4" /> Hire New Persona
                </Button>
            </div>

            {/* The Roster Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_PERSONAS.map(persona => (
                    <Link to={`/agents/${persona.id}`} key={persona.id}>
                        <div className="group relative rounded-[2rem] bg-black/40 border border-white/5 hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 overflow-hidden cursor-pointer shadow-2xl flex flex-col h-[320px]">
                            
                            {/* Decorative Background Mesh / ID Badge feel */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50 overlay-mesh pointer-events-none" />
                            
                            {/* Card Content Top (Abstract Icon & Name) */}
                            <div className="p-8 pb-4 flex-1">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center relative z-10 shadow-lg backdrop-blur-md overflow-hidden">
                                            {/* Abstract Monogram */}
                                            <span className="text-2xl font-black bg-gradient-to-br from-white to-white/50 text-transparent bg-clip-text tracking-tighter">
                                                {persona.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold shadow-[0_0_10px_rgba(var(--primary),0.2)]">
                                        <Activity className="w-3 h-3" />
                                        {persona.stats?.active_tasks} Active
                                    </div>
                                </div>
                                
                                <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors text-white/90">
                                    {persona.name.split('-')[0].trim()}
                                </h3>
                                <p className="text-sm text-primary/80 font-medium tracking-wide pb-3 border-b border-white/10 w-fit">
                                    {persona.role_description.split(' ').slice(0, 4).join(' ')}...
                                </p>
                            </div>

                            {/* Card Footer (Stats & Hired Date) */}
                            <div className="px-8 py-5 bg-black/50 border-t border-white/5 flex items-center justify-between mt-auto backdrop-blur-md relative z-10">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" /> Hired
                                    </span>
                                    <div className="text-xs font-medium text-white/80">
                                        {new Date(persona.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                                
                                <div className="space-y-1 text-right">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1 justify-end">
                                        <TerminalSquare className="w-3 h-3" /> Completed
                                    </span>
                                    <div className="text-xs font-medium text-white/80">
                                        {persona.stats?.completed_tasks} Tasks
                                    </div>
                                </div>
                            </div>

                            {/* Hover effect indicator */}
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-primary/50 pointer-events-none">
                                <ChevronRight className="w-8 h-8" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Empty state alternative layout concept */}
            {MOCK_PERSONAS.length === 0 && (
                <div className="text-center py-32 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BrainCircuit className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Personas Hired</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                        Your workforce is currently empty. Design your first blueprint and start delegating work implicitly through contextual agents.
                    </p>
                    <Button className="h-11 px-8 rounded-full">
                        <UserPlus className="w-4 h-4 mr-2" /> Hire Persona
                    </Button>
                </div>
            )}
        </div>
    );
}
