import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BentoCardProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    className?: string;
    headerAction?: ReactNode;
}

export function BentoCard({ title, subtitle, children, className, headerAction }: BentoCardProps) {
    return (
        <div className={cn("bento-card animate-fade-in", className)}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
                </div>
                {headerAction}
            </div>
            {children}
        </div>
    );
}
