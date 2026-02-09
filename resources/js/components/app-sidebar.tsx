import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, Wrench, MapPin, FileText, Hammer, DollarSign, BarChart3, Settings, Home } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, home, meca } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

// Navigation pour le dashboard admin
const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },
    {
        title: 'Clients',
        href: '/admin/clients',
        icon: Users,
    },
    {
        title: 'Dépanneurs',
        href: '/admin/depanneurs',
        icon: Wrench,
    },
    {
        title: 'Zones',
        href: '/admin/zones',
        icon: MapPin,
    },
    {
        title: 'Demandes',
        href: '/admin/demandes',
        icon: FileText,
    },
    {
        title: 'Interventions',
        href: '/admin/interventions',
        icon: Hammer,
    },
    {
        title: 'Finances',
        href: '/admin/factures',
        icon: DollarSign,
    },
    {
        title: 'Analytiques',
        href: '/admin/analytics',
        icon: BarChart3,
    },
    {
        title: 'Paramètres',
        href: '/admin/settings',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Accueil',
        href: home().url,
        icon: Home,
    },
    {
        title: 'MECA',
        href: meca().url,
        icon: Hammer,
    },
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={adminNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
