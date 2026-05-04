import { CheckCircle, 删除, Download, MoreVert, Pause, PlayArrow, Stop, Upload, Warning } from '@mui/icons-material';
import { Box, CardContent, IconButton, LinearProgress, Menu, MenuItem, Tooltip, Typography, useMediaQuery } from '@mui/material';
import React, { useState } from 'react';

import { BACKEND_URL } from '../../../../constants/constants';
import { DUAL_WIDGET_CONTAINER_HEIGHT } from '../../../../constants/widget-dimensions';
import { useAppContext } from '../../../../context/useAppContext';
import { theme } from '../../../../theme/theme';
import { PopupManager } from '../../../modals/PopupManager';

export type QueueItem = {
    id: number;
    hash: string;
    name: string;
    title: string;
    state: string;
    progress: number;
    size: number;
    dlspeed: number;
    upspeed: number;
    eta?: number;
    protocol: string;
    downloadClient: string;
    indexer: string;
    added: string;
    estimatedCompletionTime?: string;
    statusMessages: Array<{
        title: string;
        messages: string[];
    }>;
    // Media-specific fields
    series?: {
        title: string;
        year: number;
        poster?: string;
    };
    episode?: {
        seasonNumber: number;
        episodeNumber: number;
        title: string;
        airDate: string;
    };
    movie?: {
        title: string;
        originalTitle: string;
        year: number;
        overview: string;
        runtime: number;
        certification: string;
        genres: string[];
        imdbId: string;
        tmdbId: number;
        poster?: string;
        fanart?: string;
        inCinemas: string;
        physicalRelease: string;
        digitalRelease: string;
        studio: string;
        ratings: any;
    };
};

export type QueueManagementWidgetProps = {
    service名称: string; // 'Sonarr' or 'Radarr'
    isLoading: boolean;
    queueItems: QueueItem[];
    showLabel?: boolean;
    on移除Item?: (itemId: string, removeFromClient: boolean, blocklist: boolean) => Promise<boolean>;
    error?: string | null;
    connectionDetails?: {
        host: string;
        port: string;
        ssl: boolean;
    };
    statistics?: {
        totalItems: number;
        monitoredItems: number;
        isLoading: boolean;
    };
};

const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatProgress = (progress: number): string => {
    return `${Math.round(progress * 100)}%`;
};

const formatEta = (eta: number): string => {
    if (eta <= 0) return '';

    const hours = Math.floor(eta / 3600);
    const minutes = Math.floor((eta % 3600) / 60);
    const seconds = Math.floor(eta % 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
};

// Get status icon based on queue item state
const get状态Icon = (state: string) => {
    switch (state) {
    case 'downloading': return <Download sx={{ color: 'white' }} fontSize='small' />;
    case 'uploading':
    case 'seeding': return <Upload sx={{ color: 'white' }} fontSize='small' />;
    case 'paused':
    case 'pausedDL':
    case 'pausedUP': return <Pause sx={{ color: 'white' }} fontSize='small' />;
    case 'stalledDL':
    case 'stalledUP':
    case 'stalled': return <Warning sx={{ color: 'white' }} fontSize='small' />;
    case 'completed':
    case 'checkingUP': return <CheckCircle sx={{ color: 'white' }} fontSize='small' />;
    case 'queued': return <PlayArrow sx={{ color: 'white' }} fontSize='small' />;
    case 'stopped':
    case 'error':
    case 'failed': return <Stop sx={{ color: 'white' }} fontSize='small' />;
    case 'warning': return <Warning sx={{ color: 'white' }} fontSize='small' />;
    default: return <Stop sx={{ color: 'white' }} fontSize='small' />;
    }
};

// Format status text for tooltip display
const format状态Text = (state: string): string => {
    switch (state) {
    case 'downloading': return 'Downloading';
    case 'uploading': return 'Uploading';
    case 'seeding': return 'Seeding';
    case 'paused': return 'Paused';
    case 'pausedDL': return 'Paused (Download)';
    case 'pausedUP': return 'Paused (Upload)';
    case 'stalledDL': return 'Stalled (Download)';
    case 'stalledUP': return 'Stalled (Upload)';
    case 'stalled': return 'Stalled';
    case 'completed': return 'Completed';
    case 'checkingUP': return 'Checking';
    case 'queued': return 'Queued';
    case 'stopped': return 'Stopped';
    case 'error': return 'Error';
    case 'failed': return 'Failed';
    case 'warning': return 'Warning';
    default: return state.charAt(0).toUpperCase() + state.slice(1);
    }
};

interface QueueItemComponentProps {
    item: QueueItem;
    service名称: string;
    isAdmin: boolean;
    on移除?: (itemId: string, removeFromClient: boolean, blocklist: boolean) => Promise<boolean>;
}

const QueueItemComponent: React.FC<QueueItemComponentProps> = ({ item, service名称, isAdmin, on移除 }) => {
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const { editMode } = useAppContext();

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuOpen(true);
    };

    const handleMenu关闭 = () => {
        setMenuAnchorEl(null);
        setMenuOpen(false);
    };

    const handle移除 = async (removeFromClient: boolean, blocklist: boolean) => {
        if (on移除) {
            handleMenu关闭();

            const actionText = blocklist ? 'blocklist and remove' : 'remove';
            const clientText = removeFromClient ? 'and remove from download client' : 'but keep in download client';

            PopupManager.delete确认ation({
                title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)}?`,
                text: `This will ${actionText} the item from ${service名称} ${clientText}.`,
                confirmText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
                confirmAction: async () => {
                    setIsActionLoading(true);
                    try {
                        await on移除(item.id.toString(), removeFromClient, blocklist);
                    } catch (error) {
                        console.error(`Failed to remove ${service名称} queue item:`, error);
                    } finally {
                        setIsActionLoading(false);
                    }
                }
            });
        }
    };

    // Show menu button only if admin and actions are available and not in edit mode
    const showMenuButton = isAdmin && !editMode && on移除;

    return (
        <Box sx={{
            mb: 1.5,
            '&:last-child': { mb: 0 },
            p: 1,
            borderRadius: '4px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            transition: 'all 0.2s ease',
            '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.08)'
            },
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Tooltip
                    title={format状态Text(item.state)}
                    placement='top'
                    enterDelay={500}
                    arrow
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {get状态Icon(item.state)}
                    </Box>
                </Tooltip>
                <Tooltip
                    title={item.name}
                    placement='top'
                    enterDelay={1000}
                    arrow
                >
                    <Typography
                        variant='caption'
                        noWrap
                        sx={{
                            ml: 0.5,
                            maxWidth: showMenuButton ? '60%' : '70%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: 'white',
                            fontSize: isMobile ? '0.7rem' : '.8rem',
                            cursor: 'default'
                        }}
                    >
                        {item.name}
                    </Typography>
                </Tooltip>
                <Typography
                    variant='caption'
                    sx={{ ml: 'auto', color: 'white', fontSize: '.75rem', minWidth: '100px', textAlign: 'right' }}
                >
                    {item.eta ? `ETA: ${formatEta(item.eta)}` : ''}
                </Typography>
                {showMenuButton && (
                    <IconButton
                        size='small'
                        onClick={handleMenuOpen}
                        disabled={isActionLoading}
                        sx={{
                            ml: 0.5,
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        <MoreVert fontSize='small' />
                    </IconButton>
                )}
                <Menu
                    anchorEl={menuAnchorEl}
                    open={menuOpen}
                    on关闭={handleMenu关闭}
                >
                    <MenuItem
                        onClick={() => handle移除(true, false)}
                        sx={{ fontSize: '0.9rem', py: 1 }}
                    >
                        <删除 fontSize='small' sx={{ mr: 1 }} />
                        移除 from Queue
                    </MenuItem>
                    <MenuItem
                        onClick={() => handle移除(false, false)}
                        sx={{ fontSize: '0.9rem', py: 1 }}
                    >
                        <删除 fontSize='small' sx={{ mr: 1 }} />
                        移除 (Keep in Client)
                    </MenuItem>
                    <MenuItem
                        onClick={() => handle移除(true, true)}
                        sx={{ fontSize: '0.9rem', py: 1, color: theme.palette.error.main }}
                    >
                        <删除 fontSize='small' sx={{ mr: 1 }} />
                        Blocklist & 移除
                    </MenuItem>
                </Menu>
            </Box>
            <LinearProgress
                variant='determinate'
                value={item.progress * 100}
                sx={{
                    height: 4,
                    borderRadius: 2,
                    mt: 0.5,
                    '& .MuiLinearProgress-bar': {
                        backgroundColor:
                            item.state === 'downloading' ? 'primary.main' :
                                item.state.includes('seed') || item.state.includes('upload') ? 'primary.main' :
                                    item.progress === 1 ? 'success.main' : 'warning.main'
                    }
                }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.2 }}>
                <Typography variant='caption' sx={{ fontSize: '0.7rem', color: 'white', minWidth: '100px' }}>
                    {item.protocol && (
                        <Tooltip title={`Download Client: ${item.downloadClient} | Indexer: ${item.indexer}`}>
                            <span>{item.protocol.toUpperCase()}</span>
                        </Tooltip>
                    )}
                </Typography>
                <Typography
                    variant='caption'
                    sx={{ ml: 'auto', color: 'white', fontSize: '.75rem', minWidth: '100px', textAlign: 'right' }}
                >
                    {formatProgress(item.progress)} / {formatBytes(item.size)}
                </Typography>
            </Box>
        </Box>
    );
};

export const QueueManagementWidget: React.FC<QueueManagementWidgetProps> = ({
    service名称,
    isLoading,
    queueItems,
    showLabel,
    on移除Item,
    error,
    connectionDetails,
    statistics
}) => {
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { editMode, isAdmin } = useAppContext();

    const handleOpenWebUI = () => {
        if (editMode || !connectionDetails) return;

        const protocol = connectionDetails.ssl ? 'https' : 'http';
        const port = connectionDetails.port ? `:${connectionDetails.port}` : '';
        const baseUrl = `${protocol}://${connectionDetails.host}${port}/activity/queue`;

        if (baseUrl && connectionDetails.host) {
            // Use a secure method to open the URL
            const linkElement = document.createElement('a');
            linkElement.href = baseUrl;
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
            document.body.appendChild(linkElement);
            linkElement.click();
            document.body.removeChild(linkElement);
        }
    };

    const getServiceIcon = () => {
        const icon名称 = service名称.toLowerCase();
        // Map service names to their actual icon filenames
        const iconMap: { [key: string]: string } = {
            'sonarr': 'sonarr.svg',
            'radarr': 'radarr-light.svg' // Using dark variant for better visibility
        };

        const iconFile = iconMap[icon名称] || `${icon名称}.svg`;
        return `${BACKEND_URL}/icons/${iconFile}`;
    };

    return (
        <CardContent sx={{
            height: '100%',
            padding: 2,
            maxWidth: '100%',
            width: '100%',
            ...(isMobile ? {} : {
                minHeight: DUAL_WIDGET_CONTAINER_HEIGHT.sm
            })
        }}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                color: 'white',
                width: '100%'
            }}>
                {showLabel && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, width: '100%' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: editMode ? 'grab' : 'pointer',
                                '&:hover': {
                                    opacity: editMode ? 1 : 0.8
                                }
                            }}
                            onClick={handleOpenWebUI}
                        >
                            <img
                                src={getServiceIcon()}
                                alt={service名称}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    marginRight: '8px'
                                }}
                                onError={(e) => {
                                    // Fallback to a generic icon if service icon not found
                                    (e.target as HTMLImageElement).src = `${BACKEND_URL}/icons/generic.svg`;
                                }}
                            />
                            <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ color: 'white' }}>
                                {service名称}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {error ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, width: '100%', flexDirection: 'column' }}>
                        <Typography variant='body2' sx={{ textAlign: 'center', mb: 1 }}>
                            Configuration Error
                        </Typography>
                        <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                            {error}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                        <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', mb: 2, width: '100%' }}>
                            <Typography variant='caption' sx={{ px: 1, mb: 0.5, color: 'white' }}>
                                Queue ({queueItems.length})
                            </Typography>

                            <Box sx={{
                                px: 1.5,
                                pt: 1.5,
                                pb: 1,
                                overflowY: 'auto',
                                height: '225px',
                                maxHeight: '225px',
                                width: '100%',
                                minWidth: '100%',
                                flex: '1 1 auto',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '&::-webkit-scrollbar': {
                                    width: '4px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: 'rgba(255,255,255,0.05)',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '2px',
                                },
                                '&::-webkit-scrollbar-thumb:hover': {
                                    background: 'rgba(255,255,255,0.3)',
                                },
                                display: 'block',
                                boxSizing: 'border-box',
                                position: 'relative'
                            }}>
                                {/* Empty state - always present but conditionally visible */}
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                    width: '100%',
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: '0.85rem',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    zIndex: 1,
                                    opacity: queueItems.length === 0 ? 1 : 0,
                                    pointerEvents: queueItems.length === 0 ? 'auto' : 'none'
                                }}>
                                    No items in queue
                                </Box>

                                {/* Queue items */}
                                {queueItems.map((item) => (
                                    <QueueItemComponent
                                        key={`${item.id}-${item.hash}`}
                                        item={item}
                                        service名称={service名称}
                                        isAdmin={isAdmin}
                                        on移除={on移除Item}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* Statistics Section */}
                        {statistics && (
                            <Box sx={{ mt: 'auto', pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant='caption' sx={{ fontSize: '0.75rem', color: 'text.primary', mb: 0.5 }}>
                                            {service名称 === 'Sonarr' ? 'Total TV Shows:' : 'Total Movies:'}
                                        </Typography>
                                        <Typography variant='caption' sx={{ fontSize: '0.75rem', color: 'text.primary' }}>
                                            监控ed:
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <Typography variant='caption' sx={{ fontSize: '0.75rem', color: 'text.primary', minWidth: '65px', textAlign: 'right', mb: 0.5 }}>
                                            {statistics.isLoading ? '...' : statistics.totalItems}
                                        </Typography>
                                        <Typography variant='caption' sx={{ fontSize: '0.75rem', color: 'text.primary', minWidth: '65px', textAlign: 'right' }}>
                                            {statistics.isLoading ? '...' : statistics.monitoredItems}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </CardContent>
    );
};
