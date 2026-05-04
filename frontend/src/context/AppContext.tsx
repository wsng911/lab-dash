import { createContext, Dispatch, SetStateAction } from 'react';

import { Config, 仪表盘Item, NewItem, Page } from '../types';

export interface IAppContext {
    dashboardLayout: 仪表盘Item[];
    set仪表盘Layout: Dispatch<SetStateAction<仪表盘Item[]>>;
    refresh仪表盘: () => Promise<void>;
    saveLayout: (items: 仪表盘Item[]) => void;
    addItem: (itemTo添加: NewItem) => Promise<void>;
    updateItem: (id: string, updatedData: Partial<NewItem>) => Promise<void>;
    editMode: boolean;
    set编辑Mode: Dispatch<SetStateAction<boolean>>;
    config: Config | undefined;
    updateConfig: (partialConfig: Partial<Config>) => Promise<void>;

    // Performance optimization - bulk loading
    iconCache: { [key: string]: string };
    widgetDataCache: { [key: string]: any };
    loadBulkData: (items: 仪表盘Item[]) => Promise<void>;
    isInitialLoading: boolean;

    // Page management
    currentPageId: string | null;
    setCurrentPageId: Dispatch<SetStateAction<string | null>>;
    pages: Page[];
    addPage: (name: string, adminOnly?: boolean) => Promise<string | null>;
    deletePage: (pageId: string) => Promise<void>;
    switchToPage: (pageId: string) => Promise<void>;
    page名称ToSlug: (page名称: string) => string;
    moveItemToPage: (itemId: string, targetPageId: string | null) => Promise<void>;
    // Authentication & setup states
    isLoggedIn: boolean;
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
    username: string | null;
    set用户名: Dispatch<SetStateAction<string | null>>;
    isAdmin: boolean;
    setIsAdmin: Dispatch<SetStateAction<boolean>>;
    isFirstTimeSetup: boolean | null;
    setIsFirstTimeSetup: Dispatch<SetStateAction<boolean | null>>;
    setupComplete: boolean;
    setSetupComplete: Dispatch<SetStateAction<boolean>>;
    checkIfUsersExist: () => Promise<void>;
    checkLogin状态: () => Promise<void>;
    // Update states
    updateAvailable: boolean;
    latestVersion: string | null;
    releaseUrl: string | null;
    checkForAppUpdates: () => Promise<void>;
    // Recently updated state
    recentlyUpdated: boolean;
    handleVersionViewed: () => Promise<void>;
}

export const AppContext = createContext<IAppContext>(null!);
