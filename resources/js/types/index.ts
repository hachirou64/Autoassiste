export type * from './auth';
export type * from './navigation';
export type * from './ui';
export type * from './admin';

import type { Auth } from './auth';

export type FlashData = {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
};

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    flash?: FlashData;
    [key: string]: unknown;
};

