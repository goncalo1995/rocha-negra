import { useState } from "react";
import { motion } from "framer-motion";
import { Inbox as InboxIcon, Filter, SortAsc, Search, Loader2 } from "lucide-react";
import { TaskCard, TaskStatus } from "@/components/tasks/TaskCard";
import { QuickCapture } from "@/components/dashboard/QuickCapture";
import { Input } from "@/components/ui/input";
import { useTasks, useTaskMutations } from "@/hooks/useTasks";
import { toast } from "sonner";

const InboxPage = () => {
    const [search, setSearch] = useState("");
    const { data: items = [], isLoading } = useTasks({ scope: 'inbox' });
    const { createTask, updateTask } = useTaskMutations();

    const handleToggleStatus = (id: string, nextStatus: TaskStatus) => {
        updateTask.mutate({ id, updates: { status: nextStatus } });
    };

    const handleCapture = (text: string) => {
        createTask.mutate({
            title: text,
            status: "TODO" as TaskStatus,
            priority: 3,
        }, {
            onSuccess: () => toast.success("Captured to Inbox"),
        });
    };

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) && item.status !== 'DONE'
    );

    return (
        <div className="py-2 space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <InboxIcon className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Inbox</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Capture everything that comes to mind. Process it later.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search inbox..."
                            className="pl-9 w-64 bg-card/50 border-white/5 focus:border-primary/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </motion.div>

            <QuickCapture onCapture={handleCapture} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 flex gap-2 items-center">
                        To Process <span className="bg-muted px-2 py-0.5 rounded text-[10px] text-muted-foreground">{filteredItems.length}</span>
                    </h2>
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all">
                            <Filter className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all">
                            <SortAsc className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="grid gap-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                            <p className="text-sm animate-pulse">Loading inbox...</p>
                        </div>
                    ) : filteredItems.length > 0 ? (
                        filteredItems.map((item, i) => (
                            <TaskCard
                                key={item.id}
                                id={item.id}
                                title={item.title}
                                status={item.status as TaskStatus}
                                priority={item.priority}
                                dueDate={item.dueDate}
                                onToggleStatus={handleToggleStatus}
                                delay={i * 0.05}
                                project={item.nodeName}
                                projectColor={item.nodeColor}
                                subtasksCount={item.subtasks?.length}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-card/30 border border-dashed border-border/50 rounded-2xl p-12 text-center space-y-3"
                        >
                            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto grayscale opacity-20">
                                <InboxIcon className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold text-foreground/50">Inbox Zero</p>
                                <p className="text-sm text-muted-foreground">You've processed all your thoughts. Great job!</p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InboxPage;
