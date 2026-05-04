import { FormValues } from './types';
import { DashApi } from '../../../api/dash-api';
import { 仪表盘Item, DOWNLOAD_CLIENT_TYPE, ITEM_TYPE } from '../../../types';
import { isEncrypted } from '../../../utils/utils';

// Helper function to create widget configuration based on widget type
export const createWidgetConfig = async (
    widgetType: string,
    data: FormValues,
    existingItem?: 仪表盘Item | null,
    formContext?: any
): Promise<any> => {
    if (widgetType === ITEM_TYPE.WEATHER_WIDGET) {
        // Get the location data and ensure it's properly structured
        const location = data.location || null;

        // Ensure location has the correct structure with all properties
        let processedLocation = null;
        if (location) {
            processedLocation = {
                name: location.name || '',
                latitude: typeof location.latitude === 'number' ? location.latitude : parseFloat(location.latitude as any) || 0,
                longitude: typeof location.longitude === 'number' ? location.longitude : parseFloat(location.longitude as any) || 0
            };
        }

        return {
            temperatureUnit: data.temperatureUnit || 'fahrenheit',
            location: processedLocation
        };
    } else if (widgetType === ITEM_TYPE.DATE_TIME_WIDGET) {
        // Get the location data and ensure it's properly structured
        const location = data.location || null;

        // Ensure location has the correct structure with all properties
        let processedLocation = null;
        if (location) {
            processedLocation = {
                name: location.name || '',
                latitude: typeof location.latitude === 'number' ? location.latitude : parseFloat(location.latitude as any) || 0,
                longitude: typeof location.longitude === 'number' ? location.longitude : parseFloat(location.longitude as any) || 0
            };
        }

        // Ensure timezone is always a string, never null
        const timezone = data.timezone || '';

        return {
            location: processedLocation,
            timezone: timezone, // This is guaranteed to be a string
            use24Hour: data.use24Hour || false
        };
    } else if (widgetType === ITEM_TYPE.SYSTEM_MONITOR_WIDGET) {
        const config = {
            temperatureUnit: data.temperatureUnit || 'fahrenheit',
            gauges: [data.gauge1, data.gauge2, data.gauge3],
            showDiskUsage: data.showDiskUsage !== false, // Default to true
            showSystemInfo: data.showSystemInfo !== false, // Default to true
            showInternet状态: data.showInternet状态 !== false // Default to true
        };

        // 添加 network interface to config if a network gauge is included
        if ([data.gauge1, data.gauge2, data.gauge3].includes('network') && data.networkInterface) {
            (config as any).networkInterface = data.networkInterface;
        }

        return config;
    } else if (widgetType === ITEM_TYPE.DISK_MONITOR_WIDGET) {
        console.log('Creating disk monitor config with data:', {
            selectedDisks: data.selectedDisks,
            showIcons: data.showIcons,
            showMountPath: data.showMountPath,
            show名称: data.show名称,
            layout: data.layout
        });

        // Validate that at least one disk is selected
        if (!data.selectedDisks || !Array.isArray(data.selectedDisks) || data.selectedDisks.length === 0) {
            throw new Error('At least one disk must be selected for the Disk 监控 widget');
        }

        return {
            selectedDisks: data.selectedDisks || [],
            showIcons: data.showIcons !== false,
            show名称: data.show名称 !== false,
            layout: data.layout || '2x2'
        };
    } else if (widgetType === ITEM_TYPE.PIHOLE_WIDGET) {
        // Handle masked values - only encrypt if not masked
        let encryptedToken = '';
        let encrypted密码 = '';
        let hasExistingApiToken = false;
        let hasExisting密码 = false;

        // Check if we're editing an existing item with sensitive data
        if (existingItem?.config) {
            hasExistingApiToken = !!existingItem.config._hasApiToken;
            hasExisting密码 = !!existingItem.config._has密码;
        }

        // Only process API token if it's not the masked value
        if (data.piholeApiToken && data.piholeApiToken !== '**********') {
            if (!isEncrypted(data.piholeApiToken)) {
                try {
                    encryptedToken = await DashApi.encryptPiholeToken(data.piholeApiToken);
                } catch (error) {
                    console.error('Error encrypting Pi-hole API token:', error);
                }
            } else {
                encryptedToken = data.piholeApiToken;
            }
        }

        // Only process password if it's not the masked value
        if (data.pihole密码 && data.pihole密码 !== '**********') {
            if (!isEncrypted(data.pihole密码)) {
                try {
                    encrypted密码 = await DashApi.encryptPihole密码(data.pihole密码);
                } catch (error) {
                    console.error('Error encrypting Pi-hole password:', error);
                }
            } else {
                encrypted密码 = data.pihole密码;
            }
        }

        const baseConfig = {
            host: data.piholeHost,
            port: data.piholePort,
            ssl: data.piholeSsl,
            showLabel: data.showLabel,
            display名称: data.pihole名称 || 'Pi-hole'
        };

        // Include sensitive fields if they were actually changed (not masked)
        if (encryptedToken) {
            return { ...baseConfig, apiToken: encryptedToken };
        } else if (encrypted密码) {
            return { ...baseConfig, password: encrypted密码 };
        } else {
            // If no new sensitive data provided, include security flags for existing data
            const config: any = { ...baseConfig };
            if (hasExistingApiToken) {
                config._hasApiToken = true;
            }
            if (hasExisting密码) {
                config._has密码 = true;
            }
            return config;
        }
    } else if (widgetType === ITEM_TYPE.ADGUARD_WIDGET) {
        // Handle masked values - only encrypt if not masked
        let encrypted用户名 = '';
        let encrypted密码 = '';
        let hasExisting用户名 = false;
        let hasExisting密码 = false;

        // Check if we're editing an existing item with sensitive data
        if (existingItem?.config) {
            hasExisting用户名 = !!existingItem.config._has用户名;
            hasExisting密码 = !!existingItem.config._has密码;
        }

        // Only process username if it's not the masked value
        if (data.adguard用户名 && data.adguard用户名 !== '**********') {
            if (!isEncrypted(data.adguard用户名)) {
                try {
                    encrypted用户名 = await DashApi.encryptAdGuard用户名(data.adguard用户名);
                } catch (error) {
                    console.error('Error encrypting AdGuard username:', error);
                }
            } else {
                encrypted用户名 = data.adguard用户名;
            }
        }

        // Only process password if it's not the masked value
        if (data.adguard密码 && data.adguard密码 !== '**********') {
            if (!isEncrypted(data.adguard密码)) {
                try {
                    encrypted密码 = await DashApi.encryptAdGuard密码(data.adguard密码);
                } catch (error) {
                    console.error('Error encrypting AdGuard password:', error);
                }
            } else {
                encrypted密码 = data.adguard密码;
            }
        }

        const baseConfig = {
            host: data.adguardHost,
            port: data.adguardPort,
            ssl: data.adguardSsl,
            showLabel: data.showLabel,
            display名称: data.adguard名称 || 'AdGuard Home'
        };

        // Include sensitive fields if they were actually changed (not masked)
        if (encrypted用户名 && encrypted密码) {
            return {
                ...baseConfig,
                username: encrypted用户名,
                password: encrypted密码
            };
        } else {
            const config: any = { ...baseConfig };
            // If we have existing credentials but no new ones provided, set the flags
            if (hasExisting用户名) {
                config._has用户名 = true;
            }
            if (hasExisting密码) {
                config._has密码 = true;
            }
            return config;
        }
    } else if (widgetType === ITEM_TYPE.DOWNLOAD_CLIENT) {
        // Download client widget - use tc* fields for all client types
        let encrypted密码 = '';
        let hasExisting密码 = false;

        // Check if we're editing an existing item with a password
        if (existingItem?.config) {
            hasExisting密码 = !!existingItem.config._has密码;
        }

        // Only process password if it's not the masked value
        if (data.tc密码 && data.tc密码 !== '**********') {
            if (!isEncrypted(data.tc密码)) {
                try {
                    if (data.torrentClientType === DOWNLOAD_CLIENT_TYPE.SABNZBD) {
                        encrypted密码 = await DashApi.encryptSabnzbd密码(data.tc密码);
                    } else {
                        encrypted密码 = await DashApi.encrypt密码(data.tc密码);
                    }
                } catch (error) {
                    console.error('Error encrypting download client password:', error);
                }
            } else {
                encrypted密码 = data.tc密码;
            }
        }

        const config: any = {
            clientType: data.torrentClientType,
            host: data.tcHost,
            port: data.tcPort,
            ssl: data.tcSsl,
            showLabel: data.showLabel
        };

        // Include username for clients that need it (not SABnzbd)
        if (data.torrentClientType !== DOWNLOAD_CLIENT_TYPE.SABNZBD && data.tc用户名) {
            config.username = data.tc用户名;
        }

        // Include password if it was actually changed (not masked)
        if (encrypted密码) {
            config.password = encrypted密码;
        } else if (hasExisting密码) {
            // If we have an existing password but no new password provided, set the flag
            config._has密码 = true;
        }

        return config;
    } else if (widgetType === ITEM_TYPE.MEDIA_SERVER_WIDGET) {
        // Media server widget - use ms* fields for all server types
        const config: any = {
            clientType: data.mediaServerType || 'jellyfin',
            display名称: data.mediaServer名称 || '',
            host: data.msHost || '',
            port: data.msPort || '8096',
            ssl: data.msSsl || false,
            showLabel: data.showLabel !== undefined ? data.showLabel : true
        };

        // Handle API key - if masked, set flag for backend to preserve existing key
        if (data.msApiKey === '**********') {
            // API key is masked - tell backend to preserve existing key
            config._hasApiKey = true;
        } else if (data.msApiKey && data.msApiKey.trim() !== '') {
            // API key was changed - encrypt and include it
            if (!isEncrypted(data.msApiKey)) {
                try {
                    const encryptedApiKey = await DashApi.encrypt密码(data.msApiKey);
                    config.apiKey = encryptedApiKey;
                } catch (error) {
                    console.error('Error encrypting media server API key:', error);
                }
            } else {
                config.apiKey = data.msApiKey;
            }
        }

        return config;
    } else if (widgetType === ITEM_TYPE.MEDIA_REQUEST_MANAGER_WIDGET) {
        // Media request manager widget configuration
        const config: any = {
            service: data.mediaRequestManagerService || 'jellyseerr',
            display名称: data.mediaRequestManager名称 || (data.mediaRequestManagerService === 'jellyseerr' ? 'Jellyseerr' : 'Overseerr'),
            host: data.mediaRequestManagerHost || '',
            port: data.mediaRequestManagerPort || '5055',
            ssl: data.mediaRequestManagerSsl || false,
            showLabel: data.showLabel !== undefined ? data.showLabel : true
        };

        // Handle API key - if masked, set flag for backend to preserve existing key
        if (data.mediaRequestManagerApiKey === '**********') {
            // API key is masked - tell backend to preserve existing key
            config._hasApiKey = true;
        } else if (data.mediaRequestManagerApiKey && data.mediaRequestManagerApiKey.trim() !== '') {
            // API key was changed - encrypt and include it
            if (!isEncrypted(data.mediaRequestManagerApiKey)) {
                try {
                    const encryptedApiKey = await DashApi.encrypt密码(data.mediaRequestManagerApiKey);
                    config.apiKey = encryptedApiKey;
                } catch (error) {
                    console.error('Error encrypting media request manager API key:', error);
                }
            } else {
                config.apiKey = data.mediaRequestManagerApiKey;
            }
        }

        return config;
    } else if (widgetType === ITEM_TYPE.SONARR_WIDGET) {
        // Sonarr widget configuration
        const config: any = {
            display名称: data.sonarr名称 || 'Sonarr',
            host: data.sonarrHost || '',
            port: data.sonarrPort || '8989',
            ssl: data.sonarrSsl || false,
            showLabel: data.showLabel !== undefined ? data.showLabel : true,

        };

        // Handle API key - if masked, set flag for backend to preserve existing key
        if (data.sonarrApiKey === '**********') {
            // API key is masked - tell backend to preserve existing key
            config._hasApiKey = true;
        } else if (data.sonarrApiKey && data.sonarrApiKey.trim() !== '') {
            // API key was changed - encrypt and include it
            if (!isEncrypted(data.sonarrApiKey)) {
                try {
                    const encryptedApiKey = await DashApi.encrypt密码(data.sonarrApiKey);
                    config.apiKey = encryptedApiKey;
                } catch (error) {
                    console.error('Error encrypting Sonarr API key:', error);
                }
            } else {
                config.apiKey = data.sonarrApiKey;
            }
        }

        return config;
    } else if (widgetType === ITEM_TYPE.RADARR_WIDGET) {
        // Radarr widget configuration
        const config: any = {
            display名称: data.radarr名称 || 'Radarr',
            host: data.radarrHost || '',
            port: data.radarrPort || '7878',
            ssl: data.radarrSsl || false,
            showLabel: data.showLabel !== undefined ? data.showLabel : true,

        };

        // Handle API key - if masked, set flag for backend to preserve existing key
        if (data.radarrApiKey === '**********') {
            // API key is masked - tell backend to preserve existing key
            config._hasApiKey = true;
        } else if (data.radarrApiKey && data.radarrApiKey.trim() !== '') {
            // API key was changed - encrypt and include it
            if (!isEncrypted(data.radarrApiKey)) {
                try {
                    const encryptedApiKey = await DashApi.encrypt密码(data.radarrApiKey);
                    config.apiKey = encryptedApiKey;
                } catch (error) {
                    console.error('Error encrypting Radarr API key:', error);
                }
            } else {
                config.apiKey = data.radarrApiKey;
            }
        }

        return config;
    } else if (widgetType === ITEM_TYPE.DUAL_WIDGET) {
        // Check if DualWidgetConfig component has already built the config
        const existingConfig = (formContext as any).getValues('config');

        if (existingConfig && existingConfig.topWidget && existingConfig.bottomWidget) {
            // Use the config built by DualWidgetConfig component (preserves sensitive data flags)
            return existingConfig;
        } else {
            // Fallback to building config from form data (for backwards compatibility)

            // Ensure neither widget type is DOWNLOAD_CLIENT
            if (data.topWidgetType === ITEM_TYPE.DOWNLOAD_CLIENT ||
                    data.bottomWidgetType === ITEM_TYPE.DOWNLOAD_CLIENT) {
                console.error('DOWNLOAD_CLIENT widget is not supported in Dual Widget');
                // Replace DOWNLOAD_CLIENT with DATE_TIME_WIDGET as a fallback
                if (data.topWidgetType === ITEM_TYPE.DOWNLOAD_CLIENT) {
                    data.topWidgetType = ITEM_TYPE.DATE_TIME_WIDGET;
                }
                if (data.bottomWidgetType === ITEM_TYPE.DOWNLOAD_CLIENT) {
                    data.bottomWidgetType = ITEM_TYPE.DATE_TIME_WIDGET;
                }
            }

            // 创建 custom data objects for top and bottom widgets with proper field mapping
            const topWidgetData = {
                ...data,
                // Map position-specific fields to standard fields for the createWidgetConfig function
                temperatureUnit: data.top_temperatureUnit,
                location: data.top_location,
                timezone: data.top_timezone,
                use24Hour: data.top_use24Hour,
                gauge1: data.top_gauge1,
                gauge2: data.top_gauge2,
                gauge3: data.top_gauge3,
                networkInterface: data.top_networkInterface,
                piholeHost: data.top_piholeHost,
                piholePort: data.top_piholePort,
                piholeSsl: data.top_piholeSsl,
                piholeApiToken: data.top_piholeApiToken,
                pihole密码: data.top_pihole密码,
                pihole名称: data.top_pihole名称,
                adguardHost: data.top_adguardHost,
                adguardPort: data.top_adguardPort,
                adguardSsl: data.top_adguardSsl,
                adguard用户名: data.top_adguard用户名,
                adguard密码: data.top_adguard密码,
                adguard名称: data.top_adguard名称,
                showLabel: data.top_showLabel
            };

            const bottomWidgetData = {
                ...data,
                // Map position-specific fields to standard fields for the createWidgetConfig function
                temperatureUnit: data.bottom_temperatureUnit,
                location: data.bottom_location,
                timezone: data.bottom_timezone,
                use24Hour: data.bottom_use24Hour,
                gauge1: data.bottom_gauge1,
                gauge2: data.bottom_gauge2,
                gauge3: data.bottom_gauge3,
                networkInterface: data.bottom_networkInterface,
                piholeHost: data.bottom_piholeHost,
                piholePort: data.bottom_piholePort,
                piholeSsl: data.bottom_piholeSsl,
                piholeApiToken: data.bottom_piholeApiToken,
                pihole密码: data.bottom_pihole密码,
                pihole名称: data.bottom_pihole名称,
                adguardHost: data.bottom_adguardHost,
                adguardPort: data.bottom_adguardPort,
                adguardSsl: data.bottom_adguardSsl,
                adguard用户名: data.bottom_adguard用户名,
                adguard密码: data.bottom_adguard密码,
                adguard名称: data.bottom_adguard名称,
                showLabel: data.bottom_showLabel
            };

            const topConfig: any = await createWidgetConfig(data.topWidgetType || '', topWidgetData, existingItem, formContext);
            const bottomConfig: any = await createWidgetConfig(data.bottomWidgetType || '', bottomWidgetData, existingItem, formContext);

            return {
                topWidget: {
                    type: data.topWidgetType,
                    config: topConfig
                },
                bottomWidget: {
                    type: data.bottomWidgetType,
                    config: bottomConfig
                }
            };
        }
    } else if (widgetType === ITEM_TYPE.GROUP_WIDGET) {
        return {
            maxItems: data.maxItems || '3', // Default to 3 items layout
            showLabel: data.showLabel !== undefined ? data.showLabel : true, // Default to showing label
            items: existingItem?.config?.items || [] // Preserve existing items or start with empty array
        };
    } else if (widgetType === ITEM_TYPE.NOTES_WIDGET) {
        return {
            showLabel: data.showLabel !== undefined ? data.showLabel : true,
            display名称: data.display名称 || 'Notes',
            defaultNoteFontSize: data.defaultNoteFontSize || '16px'
        };
    }

    return {};
};
