import {
    LayoutDashboard,
    Users,
    Receipt,
    CalendarClock,
    ChevronLeft,
    ChevronsUpDown,
    LogOut,
    Settings,
    PieChart,
    Archive,
    Inbox,
    Car
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, Link } from "react-router-dom";
import { NodeTreeItem, useNodesTree } from "@/hooks/useNodesTree";
import { SidebarTreeItem } from "./SidebarTreeItem";
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

const executionItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Tasks", url: "/gtd/all", icon: Inbox },
];

const treasuryItems = [
    { title: "Ledger", url: "/ledger", icon: Receipt },
    { title: "Portfolio", url: "/portfolio", icon: PieChart },
    { title: "Vehicles", url: "/vehicles", icon: Car },
    { title: "Fixed Costs", url: "/fixed-costs", icon: CalendarClock },
    { title: "Categories", url: "/categories", icon: PieChart },
];

const otherItems = [
    // { title: "Agenda", url: "/agenda", icon: CalendarIcon },
    { title: "Network", url: "/contacts", icon: Users }
];

interface NavGroup {
    label: string;
    items: typeof executionItems;
}

const navigationGroups: NavGroup[] = [
    { label: "Treasury", items: treasuryItems },
    { label: "Others", items: otherItems },
];

export function AppSidebar() {
    const { supabaseUser, signOut } = useAuth();
    const { state, setOpenMobile } = useSidebar();
    const collapsed = state === "collapsed";
    const location = useLocation();

    const { data: tree = [], isLoading: isLoadingTree } = useNodesTree();

    const isActive = (path: string) => location.pathname === path;

    // Construct virtual root items for the PARA categories
    const virtualRoots: (NodeTreeItem & { isVirtual?: boolean })[] = [
        {
            id: 'root-projects',
            name: 'Projects',
            type: 'PROJECT' as any,
            href: '/projects',
            children: tree.filter(n => n.type === 'PROJECT'),
            count: tree.filter(n => n.type === 'PROJECT').length,
            isVirtual: true
        },
        {
            id: 'root-areas',
            name: 'Areas',
            type: 'AREA' as any,
            href: '/areas',
            children: tree.filter(n => n.type === 'AREA'),
            count: tree.filter(n => n.type === 'AREA').length,
            isVirtual: true
        },
        {
            id: 'root-resources',
            name: 'Resources',
            type: 'RESOURCE' as any,
            href: '/resources',
            children: tree.filter(n => n.type === 'RESOURCE'),
            count: tree.filter(n => n.type === 'RESOURCE').length,
            isVirtual: true
        },
        {
            id: 'root-goals',
            name: 'Goals',
            type: 'GOAL' as any,
            href: '/goals',
            children: tree.filter(n => n.type === 'GOAL'),
            count: tree.filter(n => n.type === 'GOAL').length,
            isVirtual: true
        }
    ];

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
                {/* Execution Group */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-3 mb-2">
                        {!collapsed && "Execution"}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {executionItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title} onClick={() => setOpenMobile(false)}>
                                        <NavLink to={item.url} end className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-accent" activeClassName="bg-accent glow-active">
                                            <item.icon className="h-4 w-4 shrink-0" />
                                            {!collapsed && <span>{item.title}</span>}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Second Brain Group */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-3 mb-2">
                        {!collapsed && "Second Brain"}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {virtualRoots.map(root => (
                                <SidebarTreeItem
                                    key={root.id}
                                    item={root}
                                />
                            ))}

                            {/* Archive Link (Static) */}
                            <SidebarMenuItem className="mt-2">
                                <SidebarMenuButton asChild tooltip="Archive" onClick={() => setOpenMobile(false)}>
                                    <Link to="/archive" className="flex items-center gap-2 px-3">
                                        <Archive className="h-4 w-4 text-node-archive" />
                                        {!collapsed && <span className="text-sm">Archive</span>}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Other Groups */}
                {navigationGroups.map((group) => (
                    <SidebarGroup key={group.label} className="mt-2">
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

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground ml-2"
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

                <SidebarTrigger className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                    <ChevronLeft className={`h-4 w-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
                    {!collapsed && <span className="text-sm">Collapse Sidebar</span>}
                </SidebarTrigger>
            </SidebarFooter>
        </Sidebar>
    );
}
