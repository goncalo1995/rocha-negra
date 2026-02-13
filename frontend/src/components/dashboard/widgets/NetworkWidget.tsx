import { BentoCard } from "@/components/BentoCard";
import { Button } from "@/components/ui/button";
import { DashboardResponseDto } from "@/types/dashboard";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";

interface NetworkWidgetProps {
    data: DashboardResponseDto['network'];
}

export function NetworkWidget({ data }: NetworkWidgetProps) {
    if (!data) return null;

    return (
        <BentoCard
            title="Network"
            subtitle={`${data.totalContacts} contacts`}
            headerAction={
                <Link to="/contacts">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Users className="h-4 w-4" />
                    </Button>
                </Link>
            }
        >
            <div className="space-y-3">
                {data.contacts.slice(0, 3).map((contact) => (
                    <div key={contact.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {(contact.firstName[0] + (contact.lastName?.[0] || "")).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{contact.firstName} {contact.lastName}</p>
                            <p className="text-xs text-muted-foreground truncate">{contact.company || contact.role || contact.category}</p>
                        </div>
                    </div>
                ))}
                {data.contacts.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No contacts yet.</p>
                )}
            </div>
        </BentoCard>
    );
}
