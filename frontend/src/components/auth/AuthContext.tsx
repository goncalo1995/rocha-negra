import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { UserProfile, UserPreferences } from '@/types/user'; // Your custom backend types
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// The data fetched from GET /users/me
interface BackendUserData {
    profile: UserProfile;
    preferences: UserPreferences;
}

interface AuthContextType {
    session: Session | null;
    supabaseUser: SupabaseUser | null;
    profile: UserProfile | null; // From your backend
    preferences: UserPreferences | null; // From your backend
    isLoading: boolean; // A single loading flag
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();
    const [session, setSession] = useState<Session | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);

    // --- Step 1: Listen to Supabase Auth state ---
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setInitialLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // When the user logs out, clear all cached data
            if (!session) {
                queryClient.clear();
            }
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, [queryClient]);

    // --- Step 2: Use React Query to fetch backend data WHEN the session is available ---
    const { data: backendUserData, isLoading: isProfileLoading } = useQuery<BackendUserData>({
        // The query key includes the user's ID, so it's unique per user
        queryKey: ['user', 'me', session?.user?.id],
        queryFn: async () => (await api.get('/users/me')).data,
        // This query will only run if 'session' exists
        enabled: !!session,
    });

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        session,
        supabaseUser: session?.user ?? null,
        profile: backendUserData?.profile ?? null,
        preferences: backendUserData?.preferences ?? null,
        isLoading: initialLoading || (!!session && isProfileLoading),
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
