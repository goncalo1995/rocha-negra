import { motion } from "framer-motion";
import { Zap, Sun, CalendarDays, CheckCircle2, Loader2, LayoutDashboard } from "lucide-react";
import { TaskCard, TaskStatus } from "@/components/tasks/TaskCard";
import { useTasks, useTaskMutations } from "@/hooks/useTasks";

interface TodayPageProps {
    scope?: 'today' | 'all';
}

const TodayPage = ({ scope = 'today' }: TodayPageProps) => {
    const { data: tasks = [], isLoading } = useTasks({ scope });
    const { updateTask } = useTaskMutations();

    const handleToggleStatus = (id: string, nextStatus: TaskStatus) => {
        updateTask.mutate({ id, updates: { status: nextStatus } });
    };

    const activeTasks = tasks.filter(t => t.status !== 'DONE');
    const completedTasks = tasks.filter(t => t.status === 'DONE');
    const totalCount = tasks.length;
    const progress = totalCount > 0 ? Math.round((completedTasks.length / totalCount) * 100) : 0;

    const isAllScope = scope === 'all';

    return (
        <div className="py-2 space-y-10">
            <header className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            {isAllScope ? <LayoutDashboard className="w-6 h-6 text-primary-foreground" /> : <Zap className="w-6 h-6 text-primary-foreground fill-current" />}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{isAllScope ? 'All Tasks' : 'Today'}</h1>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mt-1">
                                <CalendarDays className="w-4 h-4" />
                                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-sm font-bold text-foreground">{progress}%</span>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Progress</p>
                    </div>
                </div>

                {/* Modern Progress Bar */}
                <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                    />
                </div>
            </header>

            <div className="space-y-8">
                {/* Active Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{isAllScope ? 'Active Tasks' : 'Focused Actions'}</h2>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                            {activeTasks.length} Remaining
                        </span>
                    </div>

                    <div className="grid gap-3">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                                <p className="text-sm animate-pulse">Loading tasks...</p>
                            </div>
                        ) : activeTasks.length > 0 ? (
                            activeTasks.map((task, i) => (
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
                            ))
                        ) : (
                            <div className="text-center py-12 border border-dashed rounded-2xl border-border/50">
                                <Sun className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-20" />
                                <p className="text-muted-foreground font-medium">{isAllScope ? "You're all caught up!" : "Clear skies! No pending tasks for today."}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Completed Section */}
                {completedTasks.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-success/60">Done</h2>
                        </div>

                        <div className="grid gap-3 opacity-60 grayscale-[0.5]">
                            {completedTasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    id={task.id}
                                    title={task.title}
                                    status={task.status as TaskStatus}
                                    priority={task.priority}
                                    dueDate={task.dueDate}
                                    onToggleStatus={handleToggleStatus}
                                    project={task.nodeName}
                                    projectColor={task.nodeColor}
                                    subtasksCount={task.subtasks?.length}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodayPage;
