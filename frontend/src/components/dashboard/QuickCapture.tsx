import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickCaptureProps {
    onCapture?: (text: string) => void;
}

export const QuickCapture = ({ onCapture }: QuickCaptureProps) => {
    const [value, setValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onCapture?.(value);
            setValue("");
        }
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "relative flex items-center gap-3 p-4 rounded-xl border bg-card transition-all duration-300",
                isFocused && "border-primary shadow-lg shadow-primary/5 ring-1 ring-primary/20"
            )}
        >
            <div className="p-2 rounded-lg bg-primary/10">
                <Plus className="w-4 h-4 text-primary" />
            </div>

            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Capture a thought, task, or idea..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
            />

            <motion.button
                type="submit"
                disabled={!value.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "p-2 rounded-lg transition-all",
                    value.trim()
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
            >
                <Send className="w-4 h-4" />
            </motion.button>
        </motion.form>
    );
};
