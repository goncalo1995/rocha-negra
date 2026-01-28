import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Contact, CreateContactDto, UpdateContactDto } from '@/types/network';
import { useCallback } from 'react';

export function useContact(id?: string) {
    const { data: contact, isLoading } = useQuery({
        queryKey: ['contact', id],
        enabled: !!id,
        queryFn: async () => {
            const res = await api.get<Contact>(`/contacts/${id}`);
            return res.data;
        },
    });

    return { contact, isLoading };
}

export function useNetwork() {
    const queryClient = useQueryClient();

    const { data: contacts = [], isLoading } = useQuery({
        queryKey: ['contacts'],
        queryFn: async () => {
            const res = await api.get<Contact[]>('/contacts');
            return res.data;
        },
    });

    const createContactMutation = useMutation({
        mutationFn: (payload: CreateContactDto) => api.post('/contacts', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        },
    });

    const updateContactMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: UpdateContactDto }) =>
            api.patch(`/contacts/${id}`, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        },
    });

    const deleteContactMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/contacts/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        },
    });

    const createContact = useCallback(async (data: CreateContactDto) => createContactMutation.mutateAsync(data), [createContactMutation]);
    const updateContact = useCallback(async (id: string, updates: UpdateContactDto) => updateContactMutation.mutateAsync({ id, updates }), [updateContactMutation]);
    const deleteContact = useCallback(async (id: string) => deleteContactMutation.mutateAsync(id), [deleteContactMutation]);

    return {
        contacts,
        isLoading,
        createContact,
        updateContact,
        deleteContact,
    };
}
