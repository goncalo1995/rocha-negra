import { useParams, Link, useNavigate } from "react-router-dom";
import { useContact, useNetwork } from "@/hooks/useNetwork";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, Phone, Briefcase, Linkedin, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { CreateContactDialog } from "@/components/network/CreateContactDialog";
import { useState } from "react";

export default function ContactDetail() {
    const { contactId } = useParams<{ contactId: string }>();
    const { contact, isLoading } = useContact(contactId);
    const { deleteContact } = useNetwork();
    const navigate = useNavigate();
    const [isEditOpen, setIsEditOpen] = useState(false);

    if (isLoading) {
        return <div className="p-8">Loading contact details...</div>;
    }

    if (!contact) {
        return <div className="p-8">Contact not found</div>;
    }

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this contact?")) {
            await deleteContact(contact.id);
            navigate("/contacts");
        }
    };

    const getInitials = (first: string, last?: string) => {
        return (first[0] + (last?.[0] || "")).toUpperCase();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link to="/contacts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Network
            </Link>

            <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-3xl border border-primary/10">
                        {getInitials(contact.firstName, contact.lastName)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{contact.firstName} {contact.lastName}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            {(contact.role || contact.company) && (
                                <span className="text-lg text-muted-foreground">
                                    {contact.role} {contact.role && contact.company && "at"} {contact.company}
                                </span>
                            )}
                        </div>
                        <Badge variant="secondary" className="mt-2 capitalize">
                            {contact.category.replace('_', ' ')}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                Edit Contact
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                                Delete Contact
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="space-y-6">
                    <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Contact Info
                        </h3>
                        <div className="space-y-3 text-sm">
                            {contact.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <a href={`mailto:${contact.email}`} className="text-foreground hover:underline">{contact.email}</a>
                                </div>
                            )}
                            {contact.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <a href={`tel:${contact.phone}`} className="text-foreground hover:underline">{contact.phone}</a>
                                </div>
                            )}
                            {contact.linkedinUrl && (
                                <div className="flex items-center gap-3">
                                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                                    <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">LinkedIn Profile</a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
                        <h3 className="font-semibold text-sm text-foreground">Metadata</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Added</span>
                                <span>{format(new Date(contact.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="rounded-xl border border-border/50 bg-card p-6 min-h-[200px]">
                        <h3 className="font-semibold mb-4">Notes</h3>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {contact.notes || "No notes added."}
                        </div>
                    </div>
                </div>
            </div>

            <CreateContactDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                contact={contact}
            />
        </div>
    );
}
