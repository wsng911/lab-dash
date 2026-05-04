import { 添加 } from '@mui/icons-material';
import 关闭Icon from '@mui/icons-material/关闭';
import MenuIcon from '@mui/icons-material/Menu';
import { Avatar, Badge, Button, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, styled } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react';
import { Fa编辑, FaHeart, FaInfoCircle, FaSync } from 'react-icons/fa';
import { FaArrowRightFromBracket, FaGear, FaHouse, FaTrashCan, FaUser } from 'react-icons/fa6';
import { PiGlobeSimple, PiGlobeSimpleX } from 'react-icons/pi';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

import { DashApi } from '../../api/dash-api';
import { useAppContext } from '../../context/useAppContext';
import { useInternet状态 } from '../../hooks/useInternet状态';
import { COLORS, styles } from '../../theme/styles';
import { theme } from '../../theme/theme';
import { 仪表盘Item, ITEM_TYPE } from '../../types';
import { getAppVersion } from '../../utils/version';
import { 添加编辑Form } from '../forms/添加编辑Form/添加编辑Form';
import { Logo } from '../Logo';
import { CenteredModal } from '../modals/CenteredModal';
import { UpdateModal } from '../modals/UpdateModal';
import { VersionModal } from '../modals/VersionModal';
import { Global搜索 } from '../search/Global搜索';
import { ToastManager } from '../toast/ToastManager';

const DrawerHeader = styled('div')(({ theme: muiTheme }) => ({
    display: 'flex',
    alignItems: 'center',
    ...muiTheme.mixins.toolbar,
    justifyContent: 'flex-end',
    paddingLeft: muiTheme.spacing(2),
    paddingRight: muiTheme.spacing(1.5), // Increased padding to move close icon more to the right on mobile
    [muiTheme.breakpoints.up('sm')]: {
        paddingRight: muiTheme.spacing(4), // Match menu button margin on desktop (sm: 2) + some alignment
    },
}));

type Props = {
    children: React.ReactNode;
}

export const ResponsiveAppBar = ({ children }: Props) => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [open添加Modal, setOpen添加Modal] = useState(false);
    const [open编辑PageModal, setOpen编辑PageModal] = useState(false);
    const [selectedPageFor编辑, setSelectedPageFor编辑] = useState<any>(null);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [openVersionModal, setOpenVersionModal] = useState(false);
    const [internetTooltipOpen, setInternetTooltipOpen] = useState(false);
    const [ip添加ress, setIP添加ress] = useState<{ wan?: string | null; lan?: string | null } | string | null>(null);
    const [originalLayoutSnapshot, setOriginalLayoutSnapshot] = useState<仪表盘Item[] | null>(null);

    const { internet状态 } = useInternet状态();

    const {
        dashboardLayout,
        saveLayout,
        refresh仪表盘,
        editMode,
        set编辑Mode,
        config,
        updateConfig,
        isLoggedIn,
        username,
        setIsLoggedIn,
        set用户名,
        isAdmin,
        setIsAdmin,
        updateAvailable,
        latestVersion,
        recentlyUpdated,
        handleVersionViewed,
        pages,
        currentPageId,
        switchToPage,
        deletePage
    } = useAppContext();

    const showInternetIndicator = config?.showInternetIndicator !== false;
    const showIP = config?.showIP ?? (config as any)?.showPublicIP ?? false;
    const ipDisplayType = config?.ipDisplayType || 'wan';

    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    // 关闭 internet tooltip when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (internetTooltipOpen) {
                setInternetTooltipOpen(false);
            }
        };

        if (internetTooltipOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [internetTooltipOpen]);

    // Reset internet tooltip when edit mode changes
    useEffect(() => {
        setInternetTooltipOpen(false);
    }, [editMode]);

    // Fetch IP addresses when showIP is enabled
    useEffect(() => {
        if (showIP && internet状态 === 'online') {
            const fetchIPs = async () => {
                const ips = await DashApi.getIP添加resses();
                const ipType = config?.ipDisplayType || 'wan';

                if (ipType === 'both') {
                    setIP添加ress({ wan: ips.wan, lan: ips.lan });
                } else if (ipType === 'lan') {
                    setIP添加ress(ips.lan);
                } else {
                    setIP添加ress(ips.wan);
                }
            };
            fetchIPs();
        } else {
            setIP添加ress(null);
        }
    }, [showIP, internet状态, config?.ipDisplayType]);

    const handle关闭 = () => setOpen添加Modal(false);
    const handle关闭编辑Page = () => {
        setOpen编辑PageModal(false);
        setSelectedPageFor编辑(null);
    };
    const handleOpen编辑Page = (page: any) => {
        setSelectedPageFor编辑(page);
        setOpen编辑PageModal(true);
        handle关闭Drawer();
    };
    const handle关闭UpdateModal = () => setOpenUpdateModal(false);
    const handle关闭VersionModal = async () => {
        setOpenVersionModal(false);
        if (isAdmin && recentlyUpdated) {
            await handleVersionViewed();
        }
    };

    const handle编辑取消 = () => {
        handle关闭Drawer();
        set编辑Mode(false);
        refresh仪表盘();
    };

    const handle保存 = async () => {
        handle关闭Drawer();
        set编辑Mode(false);
        setOpen添加Modal(false);

        // Only save if there were actual changes made
        if (originalLayoutSnapshot) {
            const hasChanges = JSON.stringify(originalLayoutSnapshot) !== JSON.stringify(dashboardLayout);

            if (hasChanges) {
                console.log('Layout changes detected, saving...');
                saveLayout(dashboardLayout);
            } else {
                console.log('No layout changes detected, skipping save');
            }

            // Clear the snapshot
            setOriginalLayoutSnapshot(null);
        } else {
            // Fallback - save if we don't have a snapshot (shouldn't happen)
            console.log('No original layout snapshot found, saving as fallback');
            saveLayout(dashboardLayout);
        }
    };

    const handleOpenDrawer = () => {
        setOpenDrawer(true);
    };

    const handle关闭Drawer = () => {
        setOpenDrawer(false);
    };

    const handleMenu关闭 = () => {
        // Menu close logic if needed
    };

    const handleLogin = () => {
        handleMenu关闭();
        navigate('/login', { state: { from: location.pathname } });
    };

    const handleLogout = async () => {
        try {
            // Turn off edit mode if it's active
            if (editMode) {
                set编辑Mode(false);
            }

            await DashApi.logout();

            // Reset all auth-related state variables in the correct order
            setIsAdmin(false);
            set用户名(null);
            setIsLoggedIn(false);

            localStorage.removeItem('username');
            handleMenu关闭();

            // Force refresh dashboard
            refresh仪表盘();

            // Navigate to home page
            navigate('/');
            handle关闭Drawer();
            ToastManager.success('Logged out');
        } catch (error) {
            console.error('Logout error:', error);
            ToastManager.error('Logout error');
        }
    };

    const handleProfile = () => {
        handleMenu关闭();
        // Navigate to user profile page if you have one
        // navigate('/profile');
    };

    const handleOpenUpdateModal = () => {
        setOpenUpdateModal(true);
        handle关闭Drawer();
    };

    const handleOpenVersionModal = () => {
        setOpenVersionModal(true);
        handle关闭Drawer();
    };

    const handleSet编辑Mode = (value: boolean) => {
        set编辑Mode(value);
        handle关闭Drawer();

        if (window.location.pathname.includes('/settings')) {
            navigate('/');
        }

        // When entering edit mode, capture the current layout as a snapshot
        if (value) {
            setOriginalLayoutSnapshot(JSON.parse(JSON.stringify(dashboardLayout)));
        } else {
            // When exiting edit mode, clear the snapshot
            setOriginalLayoutSnapshot(null);
        }
    };

    const handlePageUpdate = async (updatedItem: any) => {
        if (!selectedPageFor编辑 || !config) return;

        try {
            // Get the new page name and adminOnly from the form data
            const newPage名称 = updatedItem.label;
            const newAdminOnly = updatedItem.adminOnly;

            // Update the page in the config
            const updatedPages = pages.map(page =>
                page.id === selectedPageFor编辑.id
                    ? { ...page, name: newPage名称, adminOnly: newAdminOnly }
                    : page
            );

            // Update the config with the new pages array
            await updateConfig({ pages: updatedPages });

            // Refresh the dashboard to reflect changes
            await refresh仪表盘();

            handle关闭编辑Page();
            ToastManager.success('Page updated successfully');
        } catch (error) {
            console.error('Error updating page:', error);
            ToastManager.error('Failed to update page');
        }
    };

    // Helper function to convert page name to URL slug
    const page名称ToSlug = (page名称: string): string => {
        return page名称.toLowerCase().replace(/\s+/g, '-');
    };

    return (
        <>
            <AppBar position='fixed' sx={{
                backgroundColor: COLORS.TRANSPARENT_GRAY,
                backdropFilter: 'blur(6px)',
                width: '100vw', // Use full viewport width to cover scrollbar area
                maxWidth: 'none', // Override any max-width constraints
                left: 0, // Ensure it starts from the left edge
                right: 0, // Ensure it extends to the right edge
                overflowX: 'hidden',
                // Always use fixed positioning to ensure AppBar stays visible
                position: 'fixed',
                top: 0,
                zIndex: theme.zIndex.appBar
            }}>
                <Container maxWidth={false} sx={{
                    margin: 0,
                    padding: { xs: '0 16px', sm: '0 16px' }, // 添加ed padding on mobile
                    width: '100%',
                    minWidth: '100%',
                    maxWidth: 'none' // Override any max-width constraints
                }}>
                    <Toolbar disableGutters sx={{
                        justifyContent: 'space-between',
                        width: '100%',
                        minHeight: { xs: 56, sm: 64 }, // Standard AppBar heights
                        px: 0, // 移除 default padding since Container handles it
                        // Ensure proper spacing on mobile
                        alignItems: 'center'
                    }}>
                        <Link to='/'>
                            {/* Desktop */}
                            <Box sx={{
                                width: { xs: 'auto', md: '300px', lg: '350px' },
                                flex: { xs: '1', md: 'none' }, // On mobile, allow to grow and push right content to edge
                                ...styles.center,
                                overflow: 'hidden',
                                minWidth: 0,
                                justifyContent: { xs: 'flex-start', md: 'center' } // Left align on mobile, center on desktop
                            }}>
                                <Logo sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}/>
                                <Typography
                                    variant='h5'
                                    noWrap
                                    sx={{
                                        flexGrow: 1,
                                        display: { xs: 'none', md: 'block' },
                                        fontFamily: 'Earth Orbiter',
                                        letterSpacing: '.1rem',
                                        color: 'inherit',
                                        textDecoration: 'none',
                                        minWidth: '120px',
                                        textAlign: 'left',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                    key={`app-title-${config?.title}-${nanoid()}`}
                                >
                                    {config?.title || 'Lab Dash'}
                                </Typography>
                                {/* Mobile */}
                                <Logo sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                                <Typography
                                    variant='h5'
                                    sx={{
                                        mr: 0, // 移除 right margin to allow more space
                                        flexGrow: 0,
                                        flexShrink: 1,
                                        display: { xs: 'block', md: 'none' },
                                        fontFamily: 'Earth Orbiter',
                                        letterSpacing: '.1rem',
                                        color: 'inherit',
                                        textDecoration: 'none',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: 'calc(100vw - 180px)', // Reduced further to prevent icon shifting
                                        minWidth: 0
                                    }}
                                    key={`app-title-mobile-${config?.title}-${nanoid()}`}
                                >
                                    {config?.title || 'Lab Dash'}
                                </Typography>
                            </Box>
                        </Link>
                        { !currentPath.includes('/settings') && !currentPath.includes('/login') && !currentPath.includes('/signup') && config?.search &&
                            <Box sx={{ width: '100%', display: { xs: 'none', sm: 'flex' }, justifyContent: 'center', flexGrow: 1 }}>
                                <Global搜索 />
                            </Box>
                        }

                        <Box sx={{ display: 'flex' }}>
                            <Box sx={{
                                display: 'flex',
                                width: { xs: 'auto', md: '300px', lg: '350px' },
                                flexGrow: { xs: 0, md: 1 },
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                // On mobile, remove any width constraints to allow icons to go to the edge
                                minWidth: { xs: 'auto', md: 'auto' }
                            }}>
                                {editMode && (
                                    <>
                                        {/* Done button for sm screens and higher */}
                                        <Button
                                            variant='contained'
                                            onClick={handle保存}
                                            sx={{
                                                display: { xs: 'none', sm: 'flex' },
                                                backgroundColor: COLORS.LIGHT_GRAY_TRANSPARENT,
                                                color: 'black',
                                                borderRadius: '999px',
                                                height: '2rem',
                                                minWidth: '4.5rem',
                                                mr: 1,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.3)'
                                                }
                                            }}
                                        >
                                            Done
                                        </Button>
                                        {/* 添加 Item button */}
                                        <Tooltip title='添加 Item' placement='bottom' arrow>
                                            <IconButton onClick={() => setOpen添加Modal(true)}>
                                                <添加 sx={{ color: 'white', fontSize: '2rem' }}/>
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}
                                {!editMode && showInternetIndicator && (
                                    <Tooltip
                                        key='internet-tooltip'
                                        title={
                                            <Box>
                                                <Typography variant='body2' sx={{ textAlign: 'center' }}>
                                                    {internet状态 === 'online' ? 'Internet Connected' : internet状态 === 'offline' ? 'No Internet Connection' : 'Checking Internet...'}
                                                </Typography>
                                                {showIP && ip添加ress && internet状态 === 'online' && (
                                                    <Box sx={{ mt: 0.5 }}>
                                                        {typeof ip添加ress === 'object' ? (
                                                            <>
                                                                {ip添加ress.wan && (
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                                                        <Typography variant='caption'>WAN:</Typography>
                                                                        <Typography variant='caption'>{ip添加ress.wan}</Typography>
                                                                    </Box>
                                                                )}
                                                                {ip添加ress.lan && (
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                                                        <Typography variant='caption'>LAN:</Typography>
                                                                        <Typography variant='caption'>{ip添加ress.lan}</Typography>
                                                                    </Box>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <Typography variant='caption' sx={{ display: 'block', textAlign: 'right' }}>
                                                                {(config?.ipDisplayType || 'wan') === 'wan' ? 'WAN: ' : 'LAN: '}{ip添加ress}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        }
                                        placement='left'
                                        arrow
                                        open={Boolean(internetTooltipOpen)}
                                        on关闭={() => {
                                            // 添加 a small delay to prevent immediate closing
                                            setTimeout(() => setInternetTooltipOpen(false), 100);
                                        }}
                                        disableHoverListener
                                        disableFocusListener
                                        disableTouchListener
                                        PopperProps={{
                                            disablePortal: false,
                                        }}
                                        slotProps={{
                                            tooltip: {
                                                sx: {
                                                    fontSize: 14,
                                                },
                                            },
                                        }}
                                    >
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setInternetTooltipOpen(!internetTooltipOpen);
                                            }}
                                        >
                                            {internet状态 === 'online' ? (
                                                <PiGlobeSimple style={{ color: 'white', fontSize: '1.7rem' }} />
                                            ) : internet状态 === 'offline' ? (
                                                <PiGlobeSimpleX style={{ color: 'white', fontSize: '1.7rem' }} />
                                            ) : (
                                                <PiGlobeSimple style={{ color: 'gray', fontSize: '1.7rem' }} />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                )}

                                {/* Hamburger Menu Button */}
                                <IconButton
                                    onClick={handleOpenDrawer}
                                    sx={{
                                        ml: { xs: 0, sm: 1 }, // Consistent left margin
                                        mr: { xs: 0, sm: 2 }, // No right margin on mobile, normal on desktop
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: '50%'
                                    }}
                                >
                                    {updateAvailable ? (
                                        // Only update available badge (red) - given priority
                                        <Badge
                                            color='error'
                                            variant='dot'
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    top: 0,
                                                    right: -5
                                                }
                                            }}
                                        >
                                            <MenuIcon sx={{ color: 'white', fontSize: '2rem' }}/>
                                        </Badge>
                                    ) : recentlyUpdated ? (
                                        // Only recently updated badge (blue)
                                        <Badge
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    backgroundColor: '#2196f3', // Blue color
                                                    top: 0,
                                                    right: -5
                                                }
                                            }}
                                            variant='dot'
                                        >
                                            <MenuIcon sx={{ color: 'white', fontSize: '2rem' }}/>
                                        </Badge>
                                    ) : (
                                        // No badges
                                        <MenuIcon sx={{ color: 'white', fontSize: '2rem' }}/>
                                    )}
                                </IconButton>
                            </Box>

                            <Drawer
                                open={openDrawer}
                                on关闭={handle关闭Drawer}
                                anchor='right'
                                sx={{
                                    '& .MuiDrawer-paper': {
                                        width: 225,
                                        boxSizing: 'border-box',
                                        right: 0,
                                        marginRight: 0,
                                        borderRight: 'none',
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                    role='presentation'
                                >
                                    <DrawerHeader>
                                        <IconButton onClick={handle关闭Drawer}>
                                            <关闭Icon sx={{ fontSize: 34, color: 'text.primary' }} />
                                        </IconButton>
                                    </DrawerHeader>
                                    <Divider />

                                    {/* Main Navigation */}
                                    <List>
                                        <ListItem disablePadding>
                                            <ListItemButton
                                                onClick={() => {
                                                    navigate('/');
                                                    handle关闭Drawer();
                                                }}
                                                sx={{
                                                    backgroundColor: (currentPageId === null || currentPageId === '') ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                                                }}
                                            >
                                                <ListItemIcon>
                                                    {<FaHouse style={{ color: theme.palette.text.primary, fontSize: 22 }}/> }
                                                </ListItemIcon>
                                                <ListItemText primary={'Home'} />
                                            </ListItemButton>
                                        </ListItem>

                                        {isLoggedIn && isAdmin && (
                                            <ListItem disablePadding>
                                                <ListItemButton onClick={() => {
                                                    handleSet编辑Mode(true);
                                                    handle关闭Drawer();
                                                }}>
                                                    <ListItemIcon>
                                                        {<Fa编辑 style={{ color: theme.palette.text.primary, fontSize: 22 }}/> }
                                                    </ListItemIcon>
                                                    <ListItemText primary={'编辑 仪表盘'} />
                                                </ListItemButton>
                                            </ListItem>
                                        )}
                                        {/* Pages Section */}
                                        {pages.length > 0 && (
                                            <>
                                                <Divider sx={{ my: 1 }} />
                                                {pages.map((page) => (
                                                    <ListItem key={page.id} disablePadding>
                                                        <ListItemButton
                                                            onClick={() => {
                                                                const slug = page名称ToSlug(page.name);
                                                                navigate(`/${slug}`);
                                                                handle关闭Drawer();
                                                            }}
                                                            sx={{
                                                                backgroundColor: currentPageId === page.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                                                            }}
                                                        >
                                                            <ListItemText primary={page.name} />
                                                            {isLoggedIn && isAdmin && editMode && (
                                                                <>
                                                                    <IconButton
                                                                        size='small'
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleOpen编辑Page(page);
                                                                        }}
                                                                        sx={{ ml: 1 }}
                                                                    >
                                                                        <Fa编辑 style={{ fontSize: 18, color: 'white' }} />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        size='small'
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            deletePage(page.id);
                                                                        }}
                                                                        sx={{ ml: 1 }}
                                                                    >
                                                                        <FaTrashCan style={{ fontSize: 18, color: 'white' }} />
                                                                    </IconButton>
                                                                </>
                                                            )}
                                                        </ListItemButton>
                                                    </ListItem>
                                                ))}
                                            </>
                                        )}
                                    </List>

                                    {/* Spacer to push account info to bottom */}
                                    <Box sx={{ flexGrow: 1 }} />

                                    {/* Bottom */}
                                    <List sx={{ mt: 'auto', mb: 1 }}>
                                        <Divider />

                                        {isLoggedIn && isAdmin && (
                                            <NavLink to='/settings' style={{ width: '100%', color: 'white' }} onClick={() => {handle关闭Drawer(); set编辑Mode(false);}}>
                                                <ListItem disablePadding>
                                                    <ListItemButton>
                                                        <ListItemIcon>
                                                            {<FaGear style={{ color: theme.palette.text.primary, fontSize: 22 }}/> }
                                                        </ListItemIcon>
                                                        <ListItemText primary={'设置'} />
                                                    </ListItemButton>
                                                </ListItem>
                                            </NavLink>
                                        )}

                                        {/* Donate Option */}
                                        <ListItem disablePadding>
                                            <ListItemButton
                                                onClick={() => {
                                                    handle关闭Drawer();
                                                    window.open('https://buymeacoffee.com/anthonygress', '_blank', 'noopener,noreferrer');
                                                }}
                                            >
                                                <ListItemIcon>
                                                    <FaHeart style={{ color: 'red', fontSize: 22 }} />
                                                </ListItemIcon>
                                                <ListItemText primary={'Donate'} secondary={'Support this project'} slotProps={{
                                                    secondary: {
                                                        color: 'text.primary'
                                                    }
                                                }}/>
                                            </ListItemButton>
                                        </ListItem>

                                        {/* Update Available Item */}
                                        {updateAvailable && (
                                            <ListItem disablePadding>
                                                <ListItemButton onClick={isLoggedIn ? handleOpenUpdateModal : () => {}}>
                                                    <ListItemIcon>
                                                        <FaSync style={{ color: theme.palette.text.primary, fontSize: 22 }}/>
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={'Update Available'}
                                                        secondary={`Version ${latestVersion}`}
                                                        slotProps={{
                                                            secondary: {
                                                                color: 'text.primary'
                                                            }
                                                        }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        )}
                                        {/* Version Info */}
                                        <ListItem disablePadding>
                                            <ListItemButton onClick={handleOpenVersionModal}>
                                                <ListItemIcon>
                                                    {recentlyUpdated ? (
                                                        <Badge
                                                            sx={{
                                                                '& .MuiBadge-badge': {
                                                                    backgroundColor: '#2196f3', // Blue color
                                                                    top: -2,
                                                                    right: -3
                                                                }
                                                            }}
                                                            variant='dot'
                                                            overlap='circular'
                                                        >
                                                            <FaInfoCircle style={{ color: theme.palette.text.primary, fontSize: 22 }} />
                                                        </Badge>
                                                    ) : (
                                                        <FaInfoCircle style={{ color: theme.palette.text.primary, fontSize: 22 }} />
                                                    )}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Typography>
                                                            {recentlyUpdated ? 'Recently Updated' : 'Version'}
                                                        </Typography>
                                                    }
                                                    secondary={`v${getAppVersion()}`}
                                                    slotProps={{
                                                        secondary: {
                                                            color: 'text.primary'
                                                        }
                                                    }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                        {/* Conditional Account Info */}
                                        {isLoggedIn ? (
                                            <>
                                                {/* User Info */}
                                                <ListItem
                                                    disablePadding
                                                >
                                                    <ListItemButton onClick={handleProfile}>
                                                        <ListItemIcon>
                                                            <Avatar
                                                                sx={{
                                                                    width: 26,
                                                                    height: 26,
                                                                    bgcolor: 'primary.main',
                                                                    fontSize: 18,
                                                                    ml: '-1px'
                                                                }}
                                                            >
                                                                {username ? username.charAt(0).toUpperCase() : <FaUser style={{ fontSize: 16 }} />}
                                                            </Avatar>
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={username || 'User'}
                                                            secondary={isAdmin ? 'Administrator' : 'User'}
                                                            slotProps={{
                                                                secondary: {
                                                                    color: 'text.primary'
                                                                }
                                                            }}
                                                        />
                                                    </ListItemButton>
                                                </ListItem>

                                                {/* Logout Button */}
                                                <ListItem disablePadding>
                                                    <ListItemButton onClick={() => {handle关闭Drawer(); handleLogout();}}>
                                                        <ListItemIcon>
                                                            <FaArrowRightFromBracket style={{ color: theme.palette.text.primary, fontSize: 22 }} />
                                                        </ListItemIcon>
                                                        <ListItemText primary='Logout' />
                                                    </ListItemButton>
                                                </ListItem>
                                            </>
                                        ) : (
                                            // Login Button for Non-Logged in Users
                                            <ListItem disablePadding>
                                                <ListItemButton onClick={() => {handle关闭Drawer(); set编辑Mode(false); handleLogin();}}>
                                                    <ListItemIcon>
                                                        <FaUser style={{ color: theme.palette.text.primary, fontSize: 22 }}/>
                                                    </ListItemIcon>
                                                    <ListItemText primary={'Login'} />
                                                </ListItemButton>
                                            </ListItem>
                                        )}
                                    </List>
                                </Box>
                            </Drawer>
                        </Box>
                    </Toolbar>
                </Container>
                <CenteredModal open={open添加Modal} handle关闭={handle关闭} title='添加 Item'>
                    <添加编辑Form handle关闭={handle关闭}/>
                </CenteredModal>
                <CenteredModal open={open编辑PageModal} handle关闭={handle关闭编辑Page} title='编辑 Page'>
                    <添加编辑Form
                        handle关闭={handle关闭编辑Page}
                        existingItem={selectedPageFor编辑 ? {
                            id: selectedPageFor编辑.id,
                            type: ITEM_TYPE.PAGE,
                            label: selectedPageFor编辑.name,
                            url: '',
                            icon: undefined,
                            config: {},
                            adminOnly: selectedPageFor编辑.adminOnly || false
                        } : null}
                        on提交={handlePageUpdate}
                    />
                </CenteredModal>
                {/* Update Modal - Replaced with component */}
                <UpdateModal
                    open={openUpdateModal}
                    handle关闭={handle关闭UpdateModal}
                    latestVersion={latestVersion}
                    isAdmin={isAdmin}
                />
                {/* Version Modal */}
                <VersionModal
                    open={openVersionModal}
                    handle关闭={handle关闭VersionModal}
                />
            </AppBar>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                paddingTop: '64px'
            }}
            >
                <Box component='main' sx={{
                    flexGrow: 1,
                    mt: { xs:-1, sm: 0 },
                    paddingTop: { xs: '3.5rem', sm: '1rem' },
                }}>
                </Box>
                {
                    editMode
                        ? <Box position='absolute' sx={{
                            // For mobile: position relative to navbar since it's always fixed now
                            top: '66px', // Just below the fixed navbar
                            zIndex: 99,
                            display: { xs: 'flex', sm: 'none' },
                            justifyContent: 'flex-end',
                            width: '100%',
                            px: 3,
                            gap: 2
                        }}>
                            <Button variant='contained' onClick={handle保存}  sx={{ backgroundColor: COLORS.LIGHT_GRAY_TRANSPARENT, color: 'black', borderRadius: '999px', height: '1.7rem', width: '4.5rem' }}>Done</Button>
                        </Box>
                        : null
                }
                {!currentPath.includes('/settings') && !currentPath.includes('/login') && !currentPath.includes('/signup') && config?.search && !editMode && (
                    <Box position='absolute' sx={{
                        top: '49px',
                        zIndex: 99,
                        display: { xs: 'flex', sm: 'none' },
                        justifyContent: 'center',
                        width: '100%',
                    }} mt={.5}>
                        <Global搜索 />
                    </Box>
                )}

                {children}
            </Box>
        </>
    );
};
