import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronLeft, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
// import { useUser } from '@/hooks/useUser'; // Your user hook

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    showBackButton?: boolean;
}

export function PageHeader({ title, subtitle = "Rocha Negra", icon, showBackButton = true }: PageHeaderProps) {
    const { supabaseUser, signOut } = useAuth();

    return (
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-3">
                    {showBackButton && (
                        <Link to="/">
                            <Button variant="ghost" size="icon" className="mr-2">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                    )}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                            {icon}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">{title}</h1>
                            <p className="text-xs text-muted-foreground">{subtitle}</p>
                        </div>
                    </Link>

                </div>

                {/* --- USER MENU --- */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar className="cursor-pointer h-9 w-9">
                            <AvatarImage src={supabaseUser?.user_metadata.avatar_url} alt={supabaseUser?.user_metadata.full_name} />
                            <AvatarFallback>{supabaseUser?.user_metadata.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { signOut(); }}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}