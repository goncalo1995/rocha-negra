import { useState, useEffect } from "react";
import { useNetwork } from "@/hooks/useNetwork";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Contact, ContactCategory } from "@/types/network";

interface CreateContactDialogProps {
    contact?: Contact; // If provided, we are in Edit mode
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CreateContactDialog({ contact, trigger, open: controlledOpen, onOpenChange }: CreateContactDialogProps) {
    const { createContact, updateContact } = useNetwork();
    const [internalOpen, setInternalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange! : setInternalOpen;
    const isEdit = !!contact;

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        role: "",
        category: "professional" as ContactCategory,
        notes: "",
        linkedinUrl: "",
    });

    useEffect(() => {
        if (contact) {
            setFormData({
                firstName: contact.firstName,
                lastName: contact.lastName || "",
                email: contact.email || "",
                phone: contact.phone || "",
                company: contact.company || "",
                role: contact.role || "",
                category: contact.category,
                notes: contact.notes || "",
                linkedinUrl: contact.linkedinUrl || "",
            });
        }
    }, [contact]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName || undefined,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                company: formData.company || undefined,
                role: formData.role || undefined,
                category: formData.category,
                notes: formData.notes || undefined,
                linkedinUrl: formData.linkedinUrl || undefined,
            };

            if (isEdit && contact) {
                await updateContact(contact.id, payload);
                toast.success("Contact updated");
            } else {
                await createContact(payload);
                toast.success("Contact created");
            }

            setOpen(false);
            if (!isEdit) {
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    company: "",
                    role: "",
                    category: "professional",
                    notes: "",
                    linkedinUrl: "",
                });
            }
        } catch (error) {
            console.error(error);
            toast.error(isEdit ? "Failed to update contact" : "Failed to create contact");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Contact
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>{isEdit ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    <ScrollArea className="flex-1 p-6 pt-2">
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(val) => setFormData({ ...formData, category: val as ContactCategory })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="professional">Professional</SelectItem>
                                            <SelectItem value="personal">Personal</SelectItem>
                                            <SelectItem value="service_provider">Service Provider</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Input
                                        id="company"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role / Job Title</Label>
                                    <Input
                                        id="role"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                                    <Input
                                        id="linkedin"
                                        value={formData.linkedinUrl}
                                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="How do you know them? Key details..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="flex justify-end gap-2 p-6 pt-2 border-t mt-auto">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : (isEdit ? "Save Changes" : "Create Contact")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
