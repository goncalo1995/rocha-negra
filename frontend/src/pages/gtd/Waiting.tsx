import { motion } from "framer-motion";
import { Hourglass, Loader2 } from "lucide-react";
import { TaskCard, TaskStatus } from "@/components/tasks/TaskCard";
import { useTasks, useTaskMutations } from "@/hooks/useTasks";

const WaitingPage = () => {
    const { data: tasks = [], isLoading } = useTasks({ scope: 'waiting' });
    const { updateTask } = useTaskMutations();

    const handleToggleStatus = (id: string, nextStatus: TaskStatus) => {
        updateTask.mutate({ id, updates: { status: nextStatus } });
    };

    return (
        <div className="py-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Hourglass className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Waiting For</h1>
                        <p className="text-muted-foreground text-sm">Actions on hold for others or external events</p>
                    </div>
                </div>
            </motion.div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                        <p className="text-sm">Pending responses...</p>
                    </div>
                ) : tasks.length > 0 ? (
                    <div className="grid gap-3">
                        {tasks.map((task, i) => (
                            <TaskCard
                                key={task.id}
                                id={task.id}
                                title={task.title}
                                status={task.status as TaskStatus}
                                priority={task.priority}
                                dueDate={task.dueDate}
                                onToggleStatus={handleToggleStatus}
                                delay={i * 0.05}
                                project={task.nodeName}
                                projectColor={task.nodeColor}
                                subtasksCount={task.subtasks?.length}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-card/30 border border-dashed rounded-2xl p-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                            <Hourglass className="w-8 h-8" />
                        </div>
                        <div className="max-w-xs mx-auto space-y-2">
                            <h3 className="text-lg font-medium text-foreground">No pending responses</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Items that you've delegated or are waiting for external input will appear here.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WaitingPage;
