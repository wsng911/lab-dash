import { Box, useMediaQuery } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { 搜索Bar } from './搜索Bar';
import { useAppContext } from '../../context/useAppContext';
import { theme } from '../../theme/theme';
import { 仪表盘Item, ITEM_TYPE } from '../../types';
import { GroupItem } from '../../types/group';
import { getIconPath } from '../../utils/utils';

type 搜索Option = {
  label: string;
  icon?: string;
  url?: string;
};

export const Global搜索 = () => {
    const [searchOptions, set搜索Options] = useState<搜索Option[]>([]);
    const [searchValue, set搜索Value] = useState('');
    const { dashboardLayout, config, pages } = useAppContext();
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const processItemsFromLayout = (layout: 仪表盘Item[]): 搜索Option[] => {
            // Start with items that have direct URLs
            const directOptions = layout
                .filter((item: 仪表盘Item) => item.url)
                .map((item) => {
                    let finalUrl = item.url;

                    // For torrent client widgets, construct the proper URL from config
                    if (item.type === ITEM_TYPE.TORRENT_CLIENT && item.config) {
                        const protocol = item.config.ssl ? 'https' : 'http';
                        const host = item.config.host || 'localhost';
                        const port = item.config.port || '8080';
                        finalUrl = `${protocol}://${host}:${port}`;
                    }

                    return {
                        label: item.label,
                        icon: getIconPath(item.icon?.path as string),
                        url: finalUrl,
                    };
                });

            // Find group widgets and extract their items
            const groupWidgetItems: 搜索Option[] = [];

            layout.forEach((item: 仪表盘Item) => {
                // Check if this is a group widget with items
                if (item.type === ITEM_TYPE.GROUP_WIDGET &&
                    item.config?.items &&
                    Array.isArray(item.config.items)) {

                    // Extract items from the group
                    const groupItems = item.config.items as GroupItem[];

                    // Map group items to search options
                    const groupOptions = groupItems.map((groupItem: GroupItem) => ({
                        label: groupItem.name,
                        icon: getIconPath(groupItem.icon || ''),
                        url: groupItem.url,
                    }));

                    groupWidgetItems.push(...groupOptions);
                }
            });

            return [...directOptions, ...groupWidgetItems];
        };

        let allOptions: 搜索Option[] = [];

        if (isHomePage && config && pages) {
            // On home page, include items from all pages (current device type only)
            // First add items from current dashboard layout
            allOptions = processItemsFromLayout(dashboardLayout);

            // Then add items from all pages (current device type only)
            pages.forEach(page => {
                const pageItems = isMobile
                    ? processItemsFromLayout(page.layout.mobile)
                    : processItemsFromLayout(page.layout.desktop);

                // 添加 page items to allOptions
                allOptions.push(...pageItems);
            });

            // Deduplicate the entire array based on URL and label combination
            const seen = new Set<string>();
            allOptions = allOptions.filter(option => {
                // 创建 a unique key combining URL and label (in case URL is undefined)
                const key = `${option.url || 'no-url'}-${option.label}`;
                if (seen.has(key)) {
                    return false;
                }
                seen.add(key);
                return true;
            });
        } else {
            // On other pages, only show items from current page
            allOptions = processItemsFromLayout(dashboardLayout);
        }

        set搜索Options(allOptions);
    }, [dashboardLayout, isHomePage, config, pages, isMobile]);

    // 添加itional focus trigger for route changes
    useEffect(() => {
        // Check if device has coarse pointer (mobile/touch devices)
        const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

        // Don't auto-focus on mobile/touch devices
        if (hasCoarsePointer) {
            return;
        }

        // Small delay to ensure DOM is ready after route change
        const focusTimer = setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 250);

        return () => clearTimeout(focusTimer);
    }, [location.pathname]);

    // Global hotkey listener for Ctrl+K / Cmd+K
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Ctrl+K (Windows/Linux) or Cmd+K (Mac)
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                if (inputRef.current) {
                    inputRef.current.focus();
                    // Clear any existing selection
                    inputRef.current.select();
                }
            }
        };

        // 添加 event listener to document
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <Box sx={{ width: '100%' }}>
            <搜索Bar
                placeholder='搜索...'
                searchValue={searchValue}
                set搜索Value={set搜索Value}
                autocompleteOptions={searchOptions}
                inputRef={inputRef}
            />
        </Box>
    );
};
