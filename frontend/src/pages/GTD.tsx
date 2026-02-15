import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Inbox as InboxIcon,
    Zap,
    CalendarIcon,
    Hourglass,
    Cloud,
    LayoutDashboard,
    ChevronRight,
    Search,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import InboxPage from "./gtd/Inbox";
import TodayPage from "./gtd/Today";
import UpcomingPage from "./gtd/Upcoming";
import WaitingPage from "./gtd/Waiting";
import SomedayPage from "./gtd/Someday";
import AllTasksPage from "./gtd/AllTasks";
import { useLocation, useNavigate } from "react-router-dom";

const GTD_TABS = [
    { id: 'inbox', label: 'Inbox', icon: InboxIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'today', label: 'Today', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'upcoming', label: 'Upcoming', icon: CalendarIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'waiting', label: 'Waiting', icon: Hourglass, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'someday', label: 'Someday', icon: Cloud, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'all', label: 'All Tasks', icon: LayoutDashboard, color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
];

const GTD = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('inbox');

    useEffect(() => {
        const path = location.pathname.split('/').pop();
        if (path && GTD_TABS.find(t => t.id === path)) {
            setActiveTab(path);
        }
    }, [location]);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        navigate(`/gtd/${tabId}`);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'inbox': return <InboxPage />;
            case 'today': return <TodayPage />;
            case 'upcoming': return <UpcomingPage />;
            case 'waiting': return <WaitingPage />;
            case 'someday': return <SomedayPage />;
            case 'all': return <AllTasksPage />;
            default: return <InboxPage />;
        }
    };

    return (
        <div className="min-h-screen bg-background/50">
            {/* Horizontal Sub-navigation */}
            <div className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-md px-2 md:px-6 py-2">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    {GTD_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={cn(
                                    "relative flex items-center gap-2 px-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap",
                                    isActive
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                )}
                            >
                                <div className={cn(
                                    "w-7 h-7 rounded-lg flex items-center justify-center transition-transform",
                                    isActive ? tab.bg : "bg-transparent",
                                    isActive && "scale-110"
                                )}>
                                    <Icon className={cn("w-4 h-4", isActive ? tab.color : "currentColor")} />
                                </div>
                                {/* show if not mobile */}
                                <span className={cn(
                                    "hidden md:block transition-all duration-300",
                                    isActive ? "translate-x-0 opacity-100" : "opacity-0 md:opacity-70 w-0 md:w-auto overflow-hidden md:inline"
                                )}>
                                    {tab.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-gtd-tab"
                                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="pt-4 pb-20">
                <div className="max-w-5xl mx-auto px-4 md:px-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default GTD;
