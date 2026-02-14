import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    Search,
    Link2,
    Clock,
    Users,
    Zap,
    Shield,
    Inbox,
    LayoutDashboard,
    Calendar,
    MessageSquare,
    DollarSign,
    Heart
} from "lucide-react";

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-white/10 selection:text-white">
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
                        <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
                        <Button className="bg-white text-background hover:bg-white/90" onClick={() => navigate("/login")}>
                            Get Started
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl">
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 text-gradient">
                            Your life doesn't live in one app. <br />
                            <span className="opacity-40">Neither should your second brain.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-2xl">
                            Notes in one place. Tasks in another. Finances somewhere else.
                            Rocha Negra brings it all together into one quiet, connected space.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="h-14 px-8 text-lg bg-white text-background hover:bg-white/90" onClick={() => navigate("/login")}>
                                Start today
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/10 hover:bg-white/5">
                                See how it works
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Decorative background glass items */}
                <div className="absolute top-1/2 -right-64 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[128px] pointer-events-none opacity-20" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-[128px] pointer-events-none opacity-10" />
            </section>

            {/* Core Philosophy */}
            <section className="py-24 border-y border-white/[0.05] bg-white/[0.01]">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-muted-foreground mb-12">Core Philosophy</h2>
                    <p className="text-4xl md:text-5xl font-medium max-w-4xl mx-auto leading-tight italic">
                        "Your life isn't a collection of separate apps. It's a web of connected information.
                        Vault reflects that reality."
                    </p>
                    <p className="mt-8 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Vault doesn't force you to change how you work. It adapts to your life
                        and quietly weaves everything together.
                    </p>
                </div>
            </section>

            {/* Features (Magic Connections) */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-8">
                            <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center border border-white/10">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h2 className="text-5xl font-bold tracking-tight">Smart Connections</h2>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Every piece of information automatically connects to every other piece.
                                A task to pay a bill connects to that transaction. A person's email links to shared expenses.
                                <span className="text-white"> You never manually organize. You just search.</span>
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                                {[
                                    { icon: <DollarSign className="w-4 h-4 text-emerald-400" />, text: "Bill → Transaction" },
                                    { icon: <Users className="w-4 h-4 text-blue-400" />, text: "Contact → Shared Asset" },
                                    { icon: <MessageSquare className="w-4 h-4 text-purple-400" />, text: "Note → Meeting" },
                                    { icon: <Calendar className="w-4 h-4 text-orange-400" />, text: "Task → Deadline" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl glass-card">
                                        {item.icon}
                                        <span className="text-sm font-medium">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-full border border-white/10 flex items-center justify-center">
                                <div className="absolute inset-0 bg-primary/5 blur-[128px] rounded-full" />
                                <div className="relative z-10 w-3/4 h-3/4 rounded-3xl glass-card overflow-hidden p-8 flex flex-col gap-6">
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 vault-shimmer">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                            <Search className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-2 w-3/4 bg-white/20 rounded" />
                                            <div className="h-2 w-1/2 bg-white/10 rounded" />
                                        </div>
                                    </div>
                                    <div className="flex-1 border border-white/5 rounded-2xl bg-black/40 p-6 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                            <Heart className="w-8 h-8 text-white/40" />
                                        </div>
                                        <p className="text-sm text-muted-foreground font-mono opacity-50">GRAPH ENGINE ACTIVE</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-32 bg-white/[0.01] border-y border-white/[0.05]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24 space-y-4">
                        <h2 className="text-5xl font-bold tracking-tight">The Timeline</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Scroll through your life in order. Every day becomes a searchable, connected story.
                            Not just data. Memory.
                        </p>
                    </div>
                    <div className="relative max-w-3xl mx-auto">
                        <div className="absolute left-[18px] top-0 bottom-0 w-px bg-white/10" />
                        <div className="space-y-16">
                            {[
                                { date: "March 2026", title: "Bought a car", details: "Linked to loan, insurance, and maintenance logs" },
                                { date: "February 2026", title: "Dinner with Maria", details: "Linked to split transaction, her contact" },
                                { date: "January 2026", title: "Signed apartment lease", details: "Linked to monthly rent, landlord contact" }
                            ].map((item, i) => (
                                <div key={i} className="relative pl-12">
                                    <div className="absolute left-0 top-1.5 w-9 h-9 rounded-full bg-background border border-white/20 flex items-center justify-center z-10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground">{item.date}</span>
                                        <h3 className="text-2xl font-semibold">{item.title}</h3>
                                        <p className="text-muted-foreground">{item.details}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Grid Features */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Inbox className="w-6 h-6" />,
                                title: "Unified Inbox",
                                description: "Notes, tasks, receipts, documents. Stop switching apps. Start capturing life."
                            },
                            {
                                icon: <LayoutDashboard className="w-6 h-6" />,
                                title: "Your Commander Center",
                                description: "A calm home screen showing priorities, upcoming bills, and recent captures. No noise."
                            },
                            {
                                icon: <Users className="w-6 h-6" />,
                                title: "People & Relationships",
                                description: "Every person is a hub. Conversations, shared assets, and important dates."
                            },
                            {
                                icon: <DollarSign className="w-6 h-6" />,
                                title: "Financial Context",
                                description: "Spending in context of life events. See money flow between people and projects."
                            },
                            {
                                icon: <Search className="w-6 h-6" />,
                                title: "Vault Search",
                                description: "One bar. Everything. Try it and wonder how you lived without it."
                            },
                            {
                                icon: <Shield className="w-6 h-6" />,
                                title: "Private. Quiet. Yours.",
                                description: "No notifications. No gamification. No ads. Just clarity."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-3xl glass-card flex flex-col gap-6 hover:bg-white/[0.05] transition-colors group">
                                <div className="w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed italic opacity-80">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-32 bg-white/[0.01] border-t border-white/[0.05]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-bold tracking-tight">Pricing</h2>
                        <p className="text-xl text-muted-foreground italic">
                            "What's the cost of mental clutter? Vault Plus costs less than one coffee per week."
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="p-10 rounded-3xl glass-card space-y-8 flex flex-col">
                            <div>
                                <h3 className="text-2xl font-bold">Free</h3>
                                <p className="text-muted-foreground mt-2">Basic capture for your life</p>
                            </div>
                            <div className="text-5xl font-bold">€0</div>
                            <ul className="space-y-4 flex-1">
                                <li className="flex items-center gap-3 text-sm">
                                    <div className="w-1 h-1 rounded-full bg-white opacity-40" />
                                    Basic capture (notes, tasks, contacts)
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <div className="w-1 h-1 rounded-full bg-white opacity-40" />
                                    1 device
                                </li>
                            </ul>
                            <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => navigate("/login")}>Get Started</Button>
                        </div>

                        <div className="p-10 rounded-3xl bg-white text-background space-y-8 flex flex-col relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 vault-shimmer pointer-events-none" />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold">Plus</h3>
                                <p className="text-background/60 mt-2">Unlimited context and sync</p>
                            </div>
                            <div className="text-5xl font-bold relative z-10">€8<span className="text-xl font-medium opacity-60">/mo</span></div>
                            <ul className="space-y-4 flex-1 relative z-10">
                                <li className="flex items-center gap-3 text-sm font-medium">
                                    <Zap className="w-4 h-4 fill-background" />
                                    Everything unlimited
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium">
                                    <Zap className="w-4 h-4 fill-background" />
                                    Smart connections
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium">
                                    <Zap className="w-4 h-4 fill-background" />
                                    All device sync
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium">
                                    <Zap className="w-4 h-4 fill-background" />
                                    Full timeline history
                                </li>
                            </ul>
                            <Button className="w-full h-12 rounded-xl bg-background text-white hover:bg-background/90 font-bold relative z-10" onClick={() => navigate("/login")}>
                                Go Plus
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-48 text-center relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <h2 className="text-6xl md:text-8xl font-bold tracking-tight text-gradient mb-8">Your life, organized.</h2>
                    <Button size="lg" className="h-16 px-12 text-xl bg-white text-background hover:bg-white/90 rounded-2xl shadow-2xl" onClick={() => navigate("/login")}>
                        Open your Vault
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/[0.05]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
                            <span className="text-background font-bold text-xs">RN</span>
                        </div>
                        <span className="font-semibold tracking-tight">Rocha Negra</span>
                    </div>
                    <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Rocha Negra. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
