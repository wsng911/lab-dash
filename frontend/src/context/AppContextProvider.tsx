import { useMediaQuery } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import shortid from 'shortid';

import { AppContext } from './AppContext';
import { DashApi } from '../api/dash-api';
import { PopupManager } from '../components/modals/PopupManager';
import { ToastManager } from '../components/toast/ToastManager';
import { initialItems } from '../constants/constants';
import { theme } from '../theme/theme';
import { Config, 仪表盘Item, 仪表盘Layout, NewItem, Page } from '../types';
import { checkForUpdates } from '../utils/updateChecker';
import { getAppVersion } from '../utils/version';

type Props = {
    children: ReactNode
};

export const AppContextProvider = ({ children }: Props) => {
    const [config, setConfig] = useState<Config>();
    const [dashboardLayout, set仪表盘Layout] = useState<仪表盘Item[]>([]);
    const [editMode, set编辑Mode] = useState(false);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();

    // Page management state
    const [currentPageId, setCurrentPageId] = useState<string | null>(null);
    const [pages, setPages] = useState<Page[]>([]);

    // Track if we're in the middle of a move operation to prevent race conditions
    const [isMoveInProgress, setIsMoveInProgress] = useState<boolean>(false);

    // Authentication & setup states
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [username, set用户名] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isFirstTimeSetup, setIsFirstTimeSetup] = useState<boolean | null>(null);
    const [setupComplete, setSetupComplete] = useState<boolean>(false);

    // Update checker states
    const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
    const [latestVersion, setLatestVersion] = useState<string | null>(null);
    const [releaseUrl, setReleaseUrl] = useState<string | null>(null);

    // Recently updated states
    const [recentlyUpdated, setRecentlyUpdated] = useState<boolean>(false);

    // Performance optimization states
    const [iconCache, setIconCache] = useState<{ [key: string]: string }>({});
    const [widgetDataCache, setWidgetDataCache] = useState<{ [key: string]: any }>({});
    const [isInitialLoading, setIsInitialLoading] = useState<boolean>(false);

    // Bulk data loading function
    const loadBulkData = async (items: 仪表盘Item[]) => {
        if (items.length === 0) return;

        setIsInitialLoading(true);
        try {
            // Load icons and widget data in parallel
            const [icons, widgetData] = await Promise.all([
                DashApi.getAllActiveIcons(items),
                DashApi.getBulkWidgetData(items)
            ]);

            setIconCache(prev => ({ ...prev, ...icons }));
            setWidgetDataCache(prev => ({ ...prev, ...widgetData }));
        } catch (error) {
            console.error('Failed to load bulk data:', error);
        } finally {
            setIsInitialLoading(false);
        }
    };

    // Initialize authentication state and check if first time setup
    useEffect(() => {
        const initializeAuth = async () => {
            await checkIfUsersExist();
            await checkLogin状态();
            // Don't load layout here - let URL-based initialization handle it
        };

        initializeAuth();
        // Setup API interceptors
        DashApi.setupAxiosInterceptors();
    }, []);

    // Handle URL-based page initialization on app load/refresh
    useEffect(() => {
        const initializePageFromURL = async () => {
            const pathname = location.pathname;

            // Always load config first to get pages
            const freshConfig = await DashApi.getConfig();
            if (freshConfig) {
                setConfig(freshConfig);
                // Store theme color in localStorage for immediate access
                if (freshConfig.themeColor) {
                    localStorage.setItem('dashConfig', JSON.stringify({ themeColor: freshConfig.themeColor }));
                }
                if (freshConfig.pages) {
                    setPages(freshConfig.pages);
                }

                // Determine the target page ID based on URL
                let targetPageId: string | null = null;
                let selectedLayout: 仪表盘Item[] = [];

                if (pathname === '/') {
                    // Home page
                    targetPageId = null;
                    selectedLayout = isMobile ? freshConfig.layout.mobile : freshConfig.layout.desktop;
                } else if (pathname.startsWith('/') && !pathname.includes('/settings') && !pathname.includes('/login')) {
                    // Page route
                    const page名称 = pathname.slice(1); // 移除 leading slash

                    // Find the page by slug
                    const page = freshConfig.pages?.find(p =>
                        p.name.toLowerCase().replace(/\s+/g, '-') === page名称.toLowerCase()
                    );

                    if (page) {
                        targetPageId = page.id;
                        selectedLayout = isMobile ? page.layout.mobile : page.layout.desktop;
                    } else {
                        // Page doesn't exist, redirect to home
                        navigate('/', { replace: true });
                        targetPageId = null;
                        selectedLayout = isMobile ? freshConfig.layout.mobile : freshConfig.layout.desktop;
                    }
                }

                // Set the page ID and layout
                setCurrentPageId(targetPageId);
                set仪表盘Layout(selectedLayout || []);

                // Load bulk data for performance optimization
                if (selectedLayout && selectedLayout.length > 0) {
                    await loadBulkData(selectedLayout);
                }
            }
        };

        // Only run this after initial auth setup and if we haven't initialized yet
        if (isFirstTimeSetup !== null && config === undefined) {
            initializePageFromURL();
        }
    }, [isFirstTimeSetup, config, navigate, isMobile]);

    // Handle URL changes after initial setup (for navigation between pages)
    useEffect(() => {
        const handleURLChange = () => {
            // Only handle URL changes after config is loaded
            if (!config || !pages.length || isFirstTimeSetup === null) return;

            // Don't override layout if we're in the middle of a move operation
            if (isMoveInProgress) return;

            const pathname = location.pathname;

            if (pathname === '/') {
                // Home page
                if (currentPageId !== null) {
                    setCurrentPageId(null);
                    const selectedLayout = isMobile ? config.layout.mobile : config.layout.desktop;
                    set仪表盘Layout(selectedLayout || []);
                    // Load bulk data for home page
                    if (selectedLayout && selectedLayout.length > 0) {
                        loadBulkData(selectedLayout);
                    }
                }
            } else if (pathname.startsWith('/') && !pathname.includes('/settings') && !pathname.includes('/login')) {
                // Page route
                const page名称 = pathname.slice(1); // 移除 leading slash

                // Find the page by slug
                const page = pages.find(p =>
                    p.name.toLowerCase().replace(/\s+/g, '-') === page名称.toLowerCase()
                );

                if (page && currentPageId !== page.id) {
                    setCurrentPageId(page.id);
                    const selectedLayout = isMobile ? page.layout.mobile : page.layout.desktop;
                    set仪表盘Layout(selectedLayout || []);
                    // Load bulk data for page
                    if (selectedLayout && selectedLayout.length > 0) {
                        loadBulkData(selectedLayout);
                    }
                } else if (!page) {
                    // Page doesn't exist, redirect to home
                    navigate('/', { replace: true });
                }
            }
        };

        handleURLChange();
    }, [location.pathname, config, pages, currentPageId, isFirstTimeSetup, isMobile, navigate, isMoveInProgress]);

    // Handle dashboard state based on login status
    useEffect(() => {
        // Don't override layout if we're in the middle of a move operation
        if (isMoveInProgress) return;

        if (!isLoggedIn) {
            // Ensure admin status is reset
            setIsAdmin(false);

            // Load config items but filter out admin-only items when logged out
            if (config !== undefined) {
                const loadLayoutForCurrentPage = () => {
                    if (currentPageId && config.pages) {
                        const currentPage = config.pages.find(page => page.id === currentPageId);
                        if (currentPage) {
                            const selectedLayout = isMobile ? currentPage.layout.mobile : currentPage.layout.desktop;
                            set仪表盘Layout(selectedLayout || []);
                            return;
                        }
                    }
                    // Load main dashboard layout
                    const selectedLayout = isMobile ? config.layout.mobile : config.layout.desktop;
                    set仪表盘Layout(selectedLayout || []);
                };

                loadLayoutForCurrentPage();
            } else {
                // If no config is loaded yet, show empty layout while loading
                set仪表盘Layout([]);
            }
        } else if (config !== undefined && isLoggedIn) {
            // When user logs in, load the dashboard for the current page
            // Only if config has been loaded to avoid race conditions
            const loadLayoutForCurrentPage = () => {
                if (currentPageId && config.pages) {
                    const currentPage = config.pages.find(page => page.id === currentPageId);
                    if (currentPage) {
                        const selectedLayout = isMobile ? currentPage.layout.mobile : currentPage.layout.desktop;
                        set仪表盘Layout(selectedLayout || []);
                        return;
                    }
                }
                // Load main dashboard layout
                const selectedLayout = isMobile ? config.layout.mobile : config.layout.desktop;
                set仪表盘Layout(selectedLayout || []);
            };

            loadLayoutForCurrentPage();
        }
    }, [isLoggedIn, currentPageId, config, isMobile, isMoveInProgress]);

    // Check for updates on initial load and every 6 hours
    useEffect(() => {
        const checkUpdatesPeriodically = async () => {
            await checkForAppUpdates();

            // Set interval to check every 6 hours (6 * 60 * 60 * 1000 ms)
            const intervalId = setInterval(checkForAppUpdates, 6 * 60 * 60 * 1000);

            // Clear interval on component unmount
            return () => clearInterval(intervalId);
        };

        checkUpdatesPeriodically();
    }, []);

    // Check if the app was recently updated
    useEffect(() => {
        const checkForRecentUpdate = async () => {
            // Only proceed if we have the config
            if (!config) return;

            const currentVersion = getAppVersion();

            // Get the last seen version from config, may be undefined
            const lastSeenVersion = config.lastSeenVersion;

            // If no stored version, or versions differ, the app was updated
            if (!lastSeenVersion || lastSeenVersion !== currentVersion) {
                console.log('App was updated from', lastSeenVersion, 'to', currentVersion);
                setRecentlyUpdated(true);
            } else {
                setRecentlyUpdated(false);
            }
        };

        checkForRecentUpdate();
    }, [config]);

    // Function to check for updates
    const checkForAppUpdates = async () => {
        try {
            const { updateAvailable: hasUpdate, latestVersion: version, releaseUrl: url } = await checkForUpdates();

            setUpdateAvailable(hasUpdate);
            setLatestVersion(version);
            setReleaseUrl(url);

        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    };

    // Function to mark the current version as viewed
    const handleVersionViewed = async (): Promise<void> => {
        if (!isAdmin) return; // Only admins can update config

        try {
            const currentVersion = getAppVersion();

            // Update config with the current version as last seen
            await updateConfig({ lastSeenVersion: currentVersion });

            // Update local state
            setRecentlyUpdated(false);
        } catch (error) {
            console.error('Error updating last seen version:', error);
        }
    };

    // Check if users exist in the system
    const checkIfUsersExist = async () => {
        try {
            const hasUsers = await DashApi.checkIfUsersExist();
            setIsFirstTimeSetup(!hasUsers);
        } catch (error) {
            console.error('Error checking for existing users:', error);
            // If there's an error, assume it's not first time setup
            setIsFirstTimeSetup(false);
        }
    };

    // Check if user is logged in based on cookies
    const checkLogin状态 = async () => {

        try {
            // HTTP-only cookies won't show in document.cookie
            // Use the backend endpoint to check cookies
            const cookies = await DashApi.checkCookies();

            // Check if access_token cookie exists from the server response
            const hasAccessToken = cookies && cookies.hasAccessToken;

            if (hasAccessToken) {
                // If we have an access token, try to use it
                try {
                    // Check if user is admin to verify token is still valid
                    const isAdminRes = await DashApi.checkIsAdmin();
                    const stored用户名 = localStorage.getItem('username');
                    set用户名(stored用户名);
                    setIsAdmin(isAdminRes);
                    setIsLoggedIn(true);
                } catch (error) {
                    console.error('Access token validation failed:', error);
                    // Try to refresh the token
                    await refreshTokenAndValidate();
                }
            } else {
                // No access token, but we might have a refresh token
                // Server-side token refresh attempt
                await refreshTokenAndValidate();
            }
        } catch (error) {
            console.error('Error checking login status:', error);
            setIsLoggedIn(false);
            set用户名(null);
            setIsAdmin(false);
        }
    };

    // Helper function to refresh token and validate login
    const refreshTokenAndValidate = async () => {
        try {
            // Try to refresh the token
            const refreshResult = await DashApi.refreshToken();

            if (refreshResult.success) {
                // If token refreshed successfully, get the stored username
                const stored用户名 = localStorage.getItem('username');

                // Update state based on new token, using isAdmin from refresh response
                set用户名(stored用户名);
                setIsAdmin(refreshResult.isAdmin || false);
                setIsLoggedIn(true);

                // Refresh dashboard to load admin-only items if user is admin
                // Use a small delay to ensure state updates have completed
                setTimeout(async () => {
                    try {
                        await getLayout();
                    } catch (error) {
                        console.error('Failed to refresh dashboard after token refresh:', error);
                    }
                }, 100);
            } else {
                // If refresh failed, user is not logged in
                setIsLoggedIn(false);
                set用户名(null);
                setIsAdmin(false);
                // Turn off edit mode if it was active
                if (editMode) {
                    set编辑Mode(false);
                }
            }
        } catch (error) {
            console.error('Error during token refresh:', error);
            setIsLoggedIn(false);
            set用户名(null);
            setIsAdmin(false);
            // Turn off edit mode if it was active
            if (editMode) {
                set编辑Mode(false);
            }
        }
    };

    const getLayout = async (pageId?: string | null) => {
        const res = await DashApi.getConfig(); // Retrieves { desktop: [], mobile: [] }

        if (res) {
            setConfig(res);

            // Set pages from config
            if (res.pages) {
                setPages(res.pages);
            }

            // Don't update layout if we're in the middle of a move operation
            if (isMoveInProgress) {
                return [];
            }

            // Use provided pageId or fall back to currentPageId
            const targetPageId = pageId !== undefined ? pageId : currentPageId;

            // If we're on a specific page, load that page's layout
            if (targetPageId) {
                const currentPage = res.pages?.find(page => page.id === targetPageId);
                if (currentPage) {
                    const selectedLayout = isMobile ? currentPage.layout.mobile : currentPage.layout.desktop;
                    set仪表盘Layout(selectedLayout);
                    return selectedLayout;
                }
            }

            // Otherwise load the main dashboard layout
            const selectedLayout = isMobile ? res.layout.mobile : res.layout.desktop;
            set仪表盘Layout(selectedLayout || []);
            return selectedLayout || [];
        }
        return [];
    };

    const saveLayout = async (items: 仪表盘Item[]) => {
        // Use existing config state instead of fetching again
        if (!config) {
            console.error('No config available for saving layout');
            return;
        }

        // If we're on a specific page, save to that page
        if (currentPageId) {
            const updatedPages = config.pages?.map(page => {
                if (page.id === currentPageId) {
                    return {
                        ...page,
                        layout: isMobile
                            ? { ...page.layout, mobile: items }
                            : { ...page.layout, desktop: items }
                    };
                }
                return page;
            }) || [];

            await DashApi.saveConfig({ pages: updatedPages });

            // Update the config state with the new pages data
            setConfig(prevConfig => ({
                ...prevConfig!,
                pages: updatedPages
            }));

            // Update pages state as well
            setPages(updatedPages);
            return;
        }

        // Otherwise save to main dashboard
        let updatedLayout: 仪表盘Layout;

        if (config.layout.mobile.length > 3) {
            // has no prev mobile layout, duplicate desktop
            updatedLayout = isMobile
                ? { layout: { ...config.layout, mobile: items } }
                : { layout: { ...config.layout, desktop: items } };
        } else {
            updatedLayout = { layout: { desktop: items, mobile: items } };
        }

        await DashApi.saveConfig(updatedLayout);

        // Update the config state with the new layout data
        setConfig(prevConfig => ({
            ...prevConfig!,
            layout: updatedLayout.layout
        }));
    };

    const refresh仪表盘 = async () => {
        try {
            // getLayout() already calls getConfig() and setConfig(), so we don't need to call it again
            await getLayout();
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
        }
    };

    const addItem = async (itemTo添加: NewItem) => {

        const newItem: 仪表盘Item = {
            id: `item-${shortid.generate()}`,
            label: itemTo添加.label,
            icon: itemTo添加.icon,
            url: itemTo添加.url,
            type: itemTo添加.type,
            showLabel: itemTo添加.showLabel,
            adminOnly: itemTo添加.adminOnly,
            config: itemTo添加.config
        };

        // 添加 to current view's layout (affects UI immediately)
        set仪表盘Layout((prevItems) => [...prevItems, newItem]);

        try {
            // Refresh config state to ensure we have the latest state including any recent group changes
            const freshConfig = await DashApi.getConfig();
            if (!freshConfig) {
                console.error('Failed to get fresh config for adding item');
                return;
            }

            // Update config state with fresh data
            setConfig(freshConfig);
            if (freshConfig.pages) {
                setPages(freshConfig.pages);
            }

            // If we're on a specific page, add to that page
            if (currentPageId) {
                const updatedPages = freshConfig.pages?.map(page => {
                    if (page.id === currentPageId) {
                        return {
                            ...page,
                            layout: {
                                desktop: [...page.layout.desktop, newItem],
                                mobile: [...page.layout.mobile, newItem]
                            }
                        };
                    }
                    return page;
                }) || [];

                await DashApi.saveConfig({ pages: updatedPages });
                return;
            }

            // Otherwise add to main dashboard
            // Use fresh config layout and add the new item
            const updatedLayout = {
                layout: {
                    desktop: [...freshConfig.layout.desktop, newItem],
                    mobile: [...freshConfig.layout.mobile, newItem]
                }
            };

            // 保存 the updated layout to the backend
            await DashApi.saveConfig(updatedLayout);
        } catch (error) {
            console.error('Failed to add item to both layouts:', error);
        }
    };

    const updateItem = async (id: string, updatedData: Partial<NewItem>) => {

        try {
            // Use existing config state instead of fetching again
            if (!config) {
                console.error('No config available for updating item');
                return;
            }

            // If we're on a specific page, update that page
            if (currentPageId) {
                const updatedPages = config.pages?.map(page => {
                    if (page.id === currentPageId) {
                        const desktopLayout = page.layout.desktop.map(item =>
                            item.id === id ? { ...item, ...updatedData } : item
                        );
                        const mobileLayout = page.layout.mobile.map(item =>
                            item.id === id ? { ...item, ...updatedData } : item
                        );

                        // Update local dashboard layout for immediate UI update
                        set仪表盘Layout(isMobile ? mobileLayout : desktopLayout);

                        return {
                            ...page,
                            layout: {
                                desktop: desktopLayout,
                                mobile: mobileLayout
                            }
                        };
                    }
                    return page;
                }) || [];

                await DashApi.saveConfig({ pages: updatedPages });

                // Update the config state with the new pages data
                setConfig(prevConfig => ({
                    ...prevConfig!,
                    pages: updatedPages
                }));

                // Update pages state as well
                setPages(updatedPages);
                return;
            }

            // Otherwise update main dashboard
            const desktopLayout = config.layout.desktop.map(item =>
                item.id === id ? { ...item, ...updatedData } : item
            );

            const mobileLayout = config.layout.mobile.map(item =>
                item.id === id ? { ...item, ...updatedData } : item
            );

            // Update local dashboard layout for immediate UI update
            set仪表盘Layout(isMobile ? mobileLayout : desktopLayout);

            // 保存 both updated layouts to the server
            const updatedConfigData = {
                layout: {
                    desktop: desktopLayout,
                    mobile: mobileLayout
                }
            };

            await DashApi.saveConfig(updatedConfigData);

            // Update the config state with the new layout data
            setConfig(prevConfig => ({
                ...prevConfig!,
                layout: {
                    desktop: desktopLayout,
                    mobile: mobileLayout
                }
            }));
        } catch (error) {
            console.error('Failed to update item:', error);
        }
    };

    // Helper function to save layout changes to the server
    const saveLayoutToServer = async (items: 仪表盘Item[]) => {
        try {
            // Use existing config state instead of fetching again
            if (!config) {
                console.error('No config available for saving layout to server');
                return;
            }

            // For layout rearrangements, only update the current device's layout
            const updatedLayout = {
                layout: {
                    desktop: isMobile ? config.layout.desktop : items,
                    mobile: isMobile ? items : config.layout.mobile
                }
            };

            // 保存 the updated layout to the backend
            await DashApi.saveConfig(updatedLayout);
        } catch (error) {
            console.error('Failed to save layout to server:', error);
        }
    };

    const updateConfig = async (partialConfig: Partial<Config>) => {
        try {

            const updatedConfig: Partial<Config> = { ...partialConfig };

            // Ensure backgroundImage is a File before uploading
            if (partialConfig.backgroundImage && typeof partialConfig.backgroundImage === 'object' && 'name' in partialConfig.backgroundImage) {
                const res = await DashApi.upload返回groundImage(partialConfig.backgroundImage);


                if (res?.filePath) {
                    updatedConfig.backgroundImage = res.filePath;
                } else {
                    console.error('Failed to upload background image');
                    return;
                }
            }

            // 保存 updated config to API
            await DashApi.saveConfig(updatedConfig);

            // Update state with only the provided values, ensuring layout is always defined
            setConfig((prev) => {
                if (!prev) {
                    const newConfig = { ...updatedConfig, layout: { desktop: [], mobile: [] } };
                    // Store theme color in localStorage for immediate access on reload
                    if (newConfig.themeColor) {
                        localStorage.setItem('dashConfig', JSON.stringify({ themeColor: newConfig.themeColor }));
                    }
                    return newConfig;
                }

                const mergedConfig = {
                    ...prev,
                    ...updatedConfig,
                    layout: prev.layout ?? { desktop: [], mobile: [] } // Ensures layout is always defined
                };

                // Store theme color in localStorage for immediate access on reload
                if (mergedConfig.themeColor) {
                    const storedConfig = { themeColor: mergedConfig.themeColor };
                    localStorage.setItem('dashConfig', JSON.stringify(storedConfig));
                }

                return mergedConfig;
            });

        } catch (error) {
            console.error('Error updating config:', error);
        }
    };

    // Page management functions
    const addPage = async (name: string, adminOnly?: boolean): Promise<string | null> => {
        try {
            // Use existing config state instead of fetching again
            if (!config) {
                console.error('No config available for adding page');
                return null;
            }

            // Check for duplicate page names (case-insensitive)
            const existingPages = config.pages || [];
            const isDuplicate = existingPages.some(page =>
                page.name.toLowerCase() === name.toLowerCase()
            );

            if (isDuplicate) {
                console.error('Page name already exists:', name);
                throw new Error(`A page named "${name}" already exists. Please choose a different name.`);
            }

            const newPage: Page = {
                id: `page-${shortid.generate()}`,
                name,
                adminOnly,
                layout: {
                    desktop: [],
                    mobile: []
                }
            };

            const updatedPages = [...existingPages, newPage];

            await DashApi.saveConfig({ pages: updatedPages });

            // Update both pages state and config state to ensure consistency
            setPages(updatedPages);
            setConfig(prevConfig => ({
                ...prevConfig!,
                pages: updatedPages
            }));

            return newPage.id;
        } catch (error) {
            console.error('Failed to add page:', error);
            throw error; // Re-throw to let the caller handle the error
        }
    };

    const deletePage = async (pageId: string) => {
        // Find the page to get its name for the confirmation dialog
        const pageTo删除 = pages.find(page => page.id === pageId);
        const page名称 = pageTo删除?.name || 'this page';

        PopupManager.delete确认ation({
            title: `删除 "${page名称}"?`,
            text: 'This action cannot be undone. All items on this page will be permanently deleted.',
            confirmAction: async () => {
                try {
                    // Use existing config state instead of fetching again
                    if (!config) {
                        console.error('No config available for deleting page');
                        ToastManager.error('Failed to delete page. Please try again.');
                        return;
                    }

                    const updatedPages = (config.pages || []).filter(page => page.id !== pageId);

                    // Update the full config with the new pages array
                    const updatedConfig = { ...config, pages: updatedPages };

                    await DashApi.saveConfig({ pages: updatedPages });

                    // Update both config and pages state to ensure synchronization
                    setConfig(updatedConfig);
                    setPages(updatedPages);

                    // If we're currently on the deleted page, switch to main dashboard
                    if (currentPageId === pageId) {
                        setCurrentPageId(null);
                        navigate('/', { replace: true });
                        await refresh仪表盘();
                    }

                    ToastManager.success(`Page "${page名称}" deleted successfully`);
                } catch (error) {
                    console.error('Failed to delete page:', error);
                    ToastManager.error('Failed to delete page. Please try again.');
                }
            }
        });
    };

    // Helper function to convert page name to URL slug
    const page名称ToSlug = (page名称: string): string => {
        return page名称.toLowerCase().replace(/\s+/g, '-');
    };

    // Function to move an item from one page to another
    const moveItemToPage = async (itemId: string, targetPageId: string | null) => {
        try {
            // Set move in progress flag to prevent race conditions with URL changes
            setIsMoveInProgress(true);

            // Get fresh config from server
            const serverConfig = await DashApi.getConfig();

            // Helper function to search for item in a layout array (including within group widgets)
            const searchInLayout = (items: any[]): { item: 仪表盘Item | null, parentGroupId?: string } => {
                for (const item of items) {
                    // Direct match
                    if (item.id === itemId) {
                        return { item };
                    }

                    // Check group widgets
                    if (item.type === 'group-widget' && item.config?.items) {
                        const foundGroupItem = item.config.items.find((groupItem: any) => groupItem.id === itemId);
                        if (foundGroupItem) {
                            // Convert group item to dashboard item format
                            const dashboardItem: 仪表盘Item = {
                                id: foundGroupItem.id,
                                label: foundGroupItem.name,
                                url: foundGroupItem.url,
                                icon: { path: foundGroupItem.icon, name: foundGroupItem.name },
                                type: 'app-shortcut' as any,
                                showLabel: true,
                                adminOnly: foundGroupItem.adminOnly || false,
                                config: {}
                            };

                            // 添加 WoL properties if they exist
                            if (foundGroupItem.isWol) {
                                dashboardItem.config = {
                                    ...dashboardItem.config,
                                    isWol: foundGroupItem.isWol,
                                    mac添加ress: foundGroupItem.mac添加ress,
                                    broadcast添加ress: foundGroupItem.broadcast添加ress,
                                    port: foundGroupItem.port
                                };
                            }

                            // 添加 health check properties if they exist
                            if (foundGroupItem.healthUrl) {
                                dashboardItem.config = {
                                    ...dashboardItem.config,
                                    healthUrl: foundGroupItem.healthUrl,
                                    healthCheckType: foundGroupItem.healthCheckType
                                };
                            }

                            return { item: dashboardItem, parentGroupId: item.id };
                        }
                    }
                }
                return { item: null };
            };

            // Find the item in the current layout
            let itemToMove: 仪表盘Item | null = null;
            let parentGroupId: string | undefined = undefined;

            // Check if item is in main dashboard
            if (currentPageId === null) {
                const desktopResult = searchInLayout(serverConfig.layout.desktop);
                const mobileResult = searchInLayout(serverConfig.layout.mobile);

                if (desktopResult.item) {
                    itemToMove = desktopResult.item;
                    parentGroupId = desktopResult.parentGroupId;
                } else if (mobileResult.item) {
                    itemToMove = mobileResult.item;
                    parentGroupId = mobileResult.parentGroupId;
                }
            } else {
                // Check if item is in current page
                const currentPage = serverConfig.pages?.find(page => page.id === currentPageId);
                if (currentPage) {
                    const desktopResult = searchInLayout(currentPage.layout.desktop);
                    const mobileResult = searchInLayout(currentPage.layout.mobile);

                    if (desktopResult.item) {
                        itemToMove = desktopResult.item;
                        parentGroupId = desktopResult.parentGroupId;
                    } else if (mobileResult.item) {
                        itemToMove = mobileResult.item;
                        parentGroupId = mobileResult.parentGroupId;
                    }
                }
            }

            if (!itemToMove) {
                console.error('Item not found');
                PopupManager.failure('Item not found');
                return;
            }

            // 创建 a deep copy of the item to move
            const itemCopy = JSON.parse(JSON.stringify(itemToMove));

            // Ensure security flags are preserved for sensitive data restoration
            if (itemCopy.config) {
                // Check if the item has security flags and preserve them
                if (itemToMove.config?._hasApiToken) {
                    itemCopy.config._hasApiToken = true;
                }
                if (itemToMove.config?._has密码) {
                    itemCopy.config._has密码 = true;
                }

                // Handle dual widget security flags
                if (itemToMove.type === 'dual-widget') {
                    if (itemToMove.config?.topWidget?.config?._hasApiToken) {
                        if (!itemCopy.config.topWidget) itemCopy.config.topWidget = {};
                        if (!itemCopy.config.topWidget.config) itemCopy.config.topWidget.config = {};
                        itemCopy.config.topWidget.config._hasApiToken = true;
                    }
                    if (itemToMove.config?.topWidget?.config?._has密码) {
                        if (!itemCopy.config.topWidget) itemCopy.config.topWidget = {};
                        if (!itemCopy.config.topWidget.config) itemCopy.config.topWidget.config = {};
                        itemCopy.config.topWidget.config._has密码 = true;
                    }
                    if (itemToMove.config?.bottomWidget?.config?._hasApiToken) {
                        if (!itemCopy.config.bottomWidget) itemCopy.config.bottomWidget = {};
                        if (!itemCopy.config.bottomWidget.config) itemCopy.config.bottomWidget.config = {};
                        itemCopy.config.bottomWidget.config._hasApiToken = true;
                    }
                    if (itemToMove.config?.bottomWidget?.config?._has密码) {
                        if (!itemCopy.config.bottomWidget) itemCopy.config.bottomWidget = {};
                        if (!itemCopy.config.bottomWidget.config) itemCopy.config.bottomWidget.config = {};
                        itemCopy.config.bottomWidget.config._has密码 = true;
                    }
                }
            }

            // Prepare the update payload
            let updatePayload: any = {};

            // Helper function to remove item from layout (including from within group widgets)
            const removeItemFromLayout = (items: any[]): any[] => {
                return items.map(item => {
                    // If this is the item to remove and it's not in a group
                    if (item.id === itemId && !parentGroupId) {
                        return null; // Mark for removal
                    }

                    // If this is a group widget and we need to remove an item from it
                    if (item.type === 'group-widget' && item.id === parentGroupId && item.config?.items) {
                        return {
                            ...item,
                            config: {
                                ...item.config,
                                items: item.config.items.filter((groupItem: any) => groupItem.id !== itemId)
                            }
                        };
                    }

                    return item;
                }).filter(item => item !== null); // 移除 null items
            };

            // 移除 item from source and add to target
            if (currentPageId === null) {
                // Moving from main dashboard
                const updatedDesktop = removeItemFromLayout(serverConfig.layout.desktop);
                const updatedMobile = removeItemFromLayout(serverConfig.layout.mobile);

                if (targetPageId === null) {
                    // Moving within main dashboard (shouldn't happen, but handle it)
                    updatePayload.layout = {
                        desktop: [...updatedDesktop, itemCopy],
                        mobile: [...updatedMobile, itemCopy]
                    };
                } else {
                    // Moving from main dashboard to a page
                    const updatedPages = (serverConfig.pages || []).map((page: any) => {
                        if (page.id === targetPageId) {
                            return {
                                ...page,
                                layout: {
                                    desktop: [...page.layout.desktop, itemCopy],
                                    mobile: [...page.layout.mobile, itemCopy]
                                }
                            };
                        }
                        return page;
                    });

                    updatePayload = {
                        layout: {
                            desktop: updatedDesktop,
                            mobile: updatedMobile
                        },
                        pages: updatedPages
                    };
                }
            } else {
                // Moving from a page
                if (targetPageId === null) {
                    // Moving from page to main dashboard
                    const updatedPages = (serverConfig.pages || []).map((page: any) => {
                        if (page.id === currentPageId) {
                            return {
                                ...page,
                                layout: {
                                    desktop: removeItemFromLayout(page.layout.desktop),
                                    mobile: removeItemFromLayout(page.layout.mobile)
                                }
                            };
                        }
                        return page;
                    });

                    updatePayload = {
                        layout: {
                            desktop: [...serverConfig.layout.desktop, itemCopy],
                            mobile: [...serverConfig.layout.mobile, itemCopy]
                        },
                        pages: updatedPages
                    };
                } else {
                    // Moving from one page to another page
                    const updatedPages = (serverConfig.pages || []).map((page: any) => {
                        if (page.id === currentPageId) {
                            // 移除 from source page
                            return {
                                ...page,
                                layout: {
                                    desktop: removeItemFromLayout(page.layout.desktop),
                                    mobile: removeItemFromLayout(page.layout.mobile)
                                }
                            };
                        } else if (page.id === targetPageId) {
                            // 添加 to target page
                            return {
                                ...page,
                                layout: {
                                    desktop: [...page.layout.desktop, itemCopy],
                                    mobile: [...page.layout.mobile, itemCopy]
                                }
                            };
                        }
                        return page;
                    });

                    updatePayload = {
                        pages: updatedPages
                    };
                }
            }

            // 保存 the updated config
            await DashApi.saveConfig(updatePayload);

            // Update local state immediately - remove from current view
            set仪表盘Layout(prevLayout => {
                const filtered = prevLayout.filter(item => item.id !== itemId);
                return filtered;
            });

            // Use getLayout() which already fetches config and updates state
            await getLayout();

            const target名称 = targetPageId === null ? 'Home' : pages.find(p => p.id === targetPageId)?.name || 'Unknown Page';
            const item名称 = itemToMove?.label || itemToMove?.type || 'Item';

            // 创建 navigation action for the toast
            const navigationAction = {
                label: targetPageId === null ? 'Open Home' : `Open ${target名称}`,
                onClick: () => {
                    if (targetPageId === null) {
                        // Navigate to home
                        navigate('/');
                    } else {
                        // Find the page and navigate to its URL
                        const targetPage = pages.find(p => p.id === targetPageId);
                        if (targetPage) {
                            const slug = page名称ToSlug(targetPage.name);
                            navigate(`/${slug}`);
                        }
                    }
                }
            };

            ToastManager.success(`${item名称} moved to page - ${target名称}`, 5000, navigationAction);

        } catch (error) {
            console.error('Failed to move item:', error);
            ToastManager.error('Failed to move item. Please try again.');
        } finally {
            // Clear move in progress flag
            setIsMoveInProgress(false);
        }
    };

    const switchToPage = async (pageId: string) => {
        const targetPageId = pageId === '' ? null : pageId;

        // Update URL based on page
        if (targetPageId === null) {
            // Navigate to home
            if (location.pathname !== '/') {
                navigate('/', { replace: true });
            }
        } else {
            // Find the page and navigate to its URL
            const page = pages.find(p => p.id === targetPageId);
            if (page) {
                const slug = page名称ToSlug(page.name);
                if (location.pathname !== `/${slug}`) {
                    navigate(`/${slug}`, { replace: true });
                }
            }
        }

        // Update the current page ID
        setCurrentPageId(targetPageId);

        // Load the layout for the target page using the updated getLayout function
        await getLayout(targetPageId);
    };

    const { Provider } = AppContext;

    return (
        <Provider value={{
            dashboardLayout,
            set仪表盘Layout,
            refresh仪表盘,
            saveLayout,
            addItem,
            updateItem,
            editMode,
            set编辑Mode,
            config,
            updateConfig,
            // Page management
            currentPageId,
            setCurrentPageId,
            pages,
            addPage,
            deletePage,
            switchToPage,
            page名称ToSlug,
            moveItemToPage,
            // Performance optimization
            iconCache,
            widgetDataCache,
            loadBulkData,
            isInitialLoading,
            // Authentication states
            isLoggedIn,
            setIsLoggedIn,
            username,
            set用户名,
            isAdmin,
            setIsAdmin,
            isFirstTimeSetup,
            setIsFirstTimeSetup,
            setupComplete,
            setSetupComplete,
            checkIfUsersExist,
            checkLogin状态,
            // Update states
            updateAvailable,
            latestVersion,
            releaseUrl,
            checkForAppUpdates,
            // Recently updated states
            recentlyUpdated,
            handleVersionViewed
        }}>
            {children}
        </Provider>
    );
};
