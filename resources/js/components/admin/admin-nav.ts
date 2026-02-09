import {
    LayoutDashboard, Users, Wrench, MapPin, FileText, Tool,
    DollarSign, BarChart3, Bell, Settings, TrendingUp
} from 'lucide-react';
import type { NavItem } from '@/types';

export const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Statistiques',
        href: '/admin/dashboard#stats',
        icon: TrendingUp,
    },
    {
        title: 'Clients',
        href: '/admin/clients',
        icon: Users,
    },
    {
        title: 'Depanneurs',
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
        icon: Tool,
    },
    {
        title: 'Factures',
        href: '/admin/factures',
        icon: DollarSign,
    },
    {
        title: 'Rapports',
        href: '/admin/rapports',
        icon: BarChart3,
    },
    {
        title: 'Notifications',
        href: '/admin/dashboard#notifications',
        icon: Bell,
    },
    {
        title: 'Parametres',
        href: '/admin/settings',
        icon: Settings,
    },
];
