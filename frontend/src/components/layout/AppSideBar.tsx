import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Users,
    Wallet,
    Receipt,
    CalendarClock,
    ChevronLeft
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "../auth/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";

const executionItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Projects", url: "/projects", icon: FolderKanban },
    { title: "Tasks", url: "/tasks", icon: CheckSquare },
    // { title: "Team", url: "/team", icon: Users },
];

const treasuryItems = [
    { title: "Wallet", url: "/wallet", icon: Wallet },
    { title: "Ledger", url: "/ledger", icon: Receipt },
    { title: "Fixed Costs", url: "/fixed-costs", icon: CalendarClock },
];

export function AppSidebar() {
    const { supabaseUser, signOut } = useAuth();
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <Sidebar collapsible="icon" className="border-r border-border">
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center border border-zinc-700">
                        <span className="text-sm font-bold text-foreground">RN</span>
                    </div>
                    {!collapsed && (
                        <span className="font-semibold text-foreground text-lg tracking-tight">
                            RochaNegra
                        </span>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-3 mb-2">
                        {!collapsed && "Execution"}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {executionItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.url)}
                                        tooltip={item.title}
                                    >
                                        <NavLink
                                            to={item.url}
                                            end
                                            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-accent"
                                            activeClassName="bg-accent glow-active"
                                        >
                                            <item.icon className="h-4 w-4 shrink-0" />
                                            {!collapsed && <span>{item.title}</span>}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-6">
                    <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-3 mb-2">
                        {!collapsed && "Treasury"}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {treasuryItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.url)}
                                        tooltip={item.title}
                                    >
                                        <NavLink
                                            to={item.url}
                                            end
                                            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-accent"
                                            activeClassName="bg-accent glow-active"
                                        >
                                            <item.icon className="h-4 w-4 shrink-0" />
                                            {!collapsed && <span>{item.title}</span>}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar className="cursor-pointer h-9 w-9">
                            <AvatarImage src={supabaseUser?.user_metadata.avatar_url} alt={supabaseUser?.user_metadata.full_name} />
                            <AvatarFallback>{supabaseUser?.user_metadata.full_name?.charAt(0) || supabaseUser?.user_metadata.email?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => signOut()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <SidebarTrigger className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent hover:bg-zinc-700 transition-colors">
                    <ChevronLeft className={`h-4 w-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
                    {!collapsed && <span className="text-sm">Collapse</span>}
                </SidebarTrigger>
            </SidebarFooter>
        </Sidebar>
    );
}
