import { useState } from "react";
import { useNetwork } from "@/hooks/useNetwork";
import { CreateContactDialog } from "@/components/network/CreateContactDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, User, MoreVertical, Linkedin } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

export default function Contacts() {
    const { contacts, isLoading, error, deleteContact } = useNetwork();
    const [search, setSearch] = useState("");
    const [editingContact, setEditingContact] = useState<any>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const filteredContacts = contacts.filter(c =>
        c.firstName.toLowerCase().includes(search.toLowerCase()) ||
        c.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.toLowerCase().includes(search.toLowerCase()) ||
        c.company?.toLowerCase().includes(search.toLowerCase()) ||
        c.role?.toLowerCase().includes(search.toLowerCase())
    );

    const getInitials = (first: string, last?: string) => {
        return (first[0] + (last?.[0] || "")).toUpperCase();
    };

    if (isLoading) {
        return <div className="p-8">Loading network...</div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
                <div className="rounded-full bg-destructive/10 p-3">
                    <User className="h-6 w-6 text-destructive" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Failed to load contacts</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        There was an error connecting to the server.
                    </p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Network</h1>
                    <p className="text-muted-foreground mt-1">Manage your professional and personal contacts</p>
                </div>
                <div className="flex gap-2">
                    <CreateContactDialog
                        open={isCreateOpen}
                        onOpenChange={(open) => {
                            setIsCreateOpen(open);
                            if (!open) setEditingContact(null);
                        }}
                        contact={editingContact}
                        trigger={
                            <Button onClick={() => setEditingContact(null)}>
                                <User className="mr-2 h-4 w-4" />
                                Add Contact
                            </Button>
                        }
                    />
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, company, or role..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {/* Could add Category filter dropdown here */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredContacts.map((contact) => (
                    <Link
                        to={`/contacts/${contact.id}`}
                        key={contact.id}
                        className="group relative flex flex-col rounded-xl border border-border/50 bg-card/50 p-5 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 cursor-pointer block"
                    >
                        <div className="absolute top-4 right-4 z-10">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => {
                                        e.preventDefault();
                                        setEditingContact(contact);
                                        setIsCreateOpen(true);
                                    }}>
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                        e.preventDefault();
                                        deleteContact(contact.id);
                                    }} className="text-destructive focus:text-destructive">
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/10">
                                {getInitials(contact.firstName, contact.lastName)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground truncate max-w-[150px]">
                                    {contact.firstName} {contact.lastName}
                                </h3>
                                {(contact.role || contact.company) ? (
                                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                        {contact.role} {contact.role && contact.company && "at"} {contact.company}
                                    </p>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground capitalize">
                                        {contact.category.replace('_', ' ')}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 text-sm mt-auto">
                            {contact.email && (
                                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors truncate">
                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{contact.email}</span>
                                </div>
                            )}
                            {contact.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <Phone className="h-3.5 w-3.5 shrink-0" />
                                    <span>{contact.phone}</span>
                                </div>
                            )}
                            {contact.linkedinUrl && (
                                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <Linkedin className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">LinkedIn Profile</span>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}

                <button onClick={() => {
                    setEditingContact(null);
                    setIsCreateOpen(true);
                }} className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted-foreground/30 bg-accent/10 p-6 transition-all hover:bg-accent/20 hover:border-primary/30 min-h-[200px]">
                    <div className="rounded-full bg-background p-3 shadow-sm">
                        <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-foreground">Add Contact</p>
                        <p className="text-sm text-muted-foreground">Expand your network</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
