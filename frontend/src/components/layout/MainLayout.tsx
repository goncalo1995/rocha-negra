import { Link, Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { AppSidebar } from './AppSideBar';
import { PanelLeft } from 'lucide-react';

export function MainLayout() {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex flex-col md:flex-row w-full bg-background">
                <AppSidebar />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Mobile Header */}
                    <header className="md:hidden flex items-center h-14 px-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-30">
                        <SidebarTrigger>
                            <div className="flex items-center gap-2 p-2 hover:bg-accent rounded-md transition-colors">
                                <PanelLeft className="h-5 w-5" />
                                <span className="text-sm font-semibold">Menu</span>
                            </div>
                        </SidebarTrigger>
                        <Link to="/dashboard">
                            <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-accent/30 rounded-full border border-border/50">
                                <div className="w-6 h-6 rounded bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center border border-zinc-700">
                                    <span className="text-[10px] font-bold text-foreground">RN</span>
                                </div>
                                <span className="text-xs font-semibold tracking-tight">RochaNegra</span>
                            </div>
                        </Link>

                    </header>

                    <main className="flex-1 overflow-auto">
                        <div className="container py-6 px-4 md:px-8 max-w-7xl">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}