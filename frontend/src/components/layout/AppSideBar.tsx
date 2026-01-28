import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Users,
    Wallet,
    Receipt,
    CalendarClock,
    ChevronLeft,
    ChevronsUpDown,
    LogOut,
    Settings
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, Link } from "react-router-dom";
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
import { cn } from "@/lib/utils";

const executionItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Projects", url: "/projects", icon: FolderKanban },
    { title: "Tasks", url: "/tasks", icon: CheckSquare },
];

const treasuryItems = [
    { title: "Wallet", url: "/wallet", icon: Wallet },
    { title: "Ledger", url: "/ledger", icon: Receipt },
    { title: "Fixed Costs", url: "/fixed-costs", icon: CalendarClock },
];

const otherItems = [
    { title: "Network", url: "/contacts", icon: Users }
];

interface NavGroup {
    label: string;
    items: typeof executionItems;
}

const navigationGroups: NavGroup[] = [
    { label: "Execution", items: executionItems },
    { label: "Treasury", items: treasuryItems },
    { label: "Others", items: otherItems },
];

export function AppSidebar() {
    const { supabaseUser, signOut } = useAuth();
    const { state, setOpenMobile } = useSidebar();
    const collapsed = state === "collapsed";
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <Sidebar collapsible="icon" className="border-r border-border">
            <SidebarHeader className="p-4">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center border border-zinc-700">
                        <span className="text-sm font-bold text-foreground">RN</span>
                    </div>
                    {!collapsed && (
                        <span className="font-semibold text-foreground text-lg tracking-tight">
                            RochaNegra
                        </span>
                    )}
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-2">
                {navigationGroups.map((group) => (
                    <SidebarGroup key={group.label} className={cn(group.label !== "Execution" && "mt-6")}>
                        <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-3 mb-2">
                            {!collapsed && group.label}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive(item.url)}
                                            tooltip={item.title}
                                            onClick={() => setOpenMobile(false)}
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
                ))}
            </SidebarContent>

            <SidebarFooter className="p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={supabaseUser?.user_metadata.avatar_url} alt={supabaseUser?.user_metadata.full_name} />
                                        <AvatarFallback className="rounded-lg">
                                            {supabaseUser?.user_metadata.full_name?.charAt(0) || supabaseUser?.user_metadata.email?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    {!collapsed && (
                                        <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                                            <span className="truncate font-semibold">
                                                {supabaseUser?.user_metadata.full_name || 'User'}
                                            </span>
                                            <span className="truncate text-xs text-muted-foreground">
                                                {supabaseUser?.email}
                                            </span>
                                        </div>
                                    )}
                                    {!collapsed && <ChevronsUpDown className="ml-auto size-4" />}
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem asChild>
                                    <Link to="/settings" className="flex items-center cursor-pointer w-full" onClick={() => setOpenMobile(false)}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>

                <SidebarTrigger className="mt-2 w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                    <ChevronLeft className={`h-4 w-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
                    {!collapsed && <span className="text-sm">Collapse Sidebar</span>}
                </SidebarTrigger>
            </SidebarFooter>
        </Sidebar>
    );
}
