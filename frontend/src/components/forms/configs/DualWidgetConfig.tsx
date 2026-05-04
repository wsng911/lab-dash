import { Box, FormControlLabel, Grid2 as Grid, Radio, RadioGroup, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CheckboxElement, SelectElement, TextFieldElement } from 'react-hook-form-mui';

import { DateTimeWidgetConfig } from './DateTimeWidgetConfig';
import { Disk监控WidgetConfig } from './Disk监控WidgetConfig';
import { WeatherWidgetConfig } from './WeatherWidgetConfig';
import { DashApi } from '../../../api/dash-api';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { COLORS } from '../../../theme/styles';
import { theme } from '../../../theme/theme';
import { ITEM_TYPE } from '../../../types';
import { FormValues } from '../添加编辑Form/types';

const WIDGET_OPTIONS = [
    { id: ITEM_TYPE.DATE_TIME_WIDGET, label: 'Date & Time' },
    { id: ITEM_TYPE.WEATHER_WIDGET, label: 'Weather' },
    { id: ITEM_TYPE.SYSTEM_MONITOR_WIDGET, label: 'System 监控' },
    { id: ITEM_TYPE.DISK_MONITOR_WIDGET, label: 'Disk 监控' },
    { id: ITEM_TYPE.PIHOLE_WIDGET, label: 'Pi-hole' },
    { id: ITEM_TYPE.ADGUARD_WIDGET, label: 'AdGuard Home' }
];

interface DualWidgetConfigProps {
    formContext: UseFormReturn<FormValues>;
    existingItem?: any;
}

// State wrapper for top and bottom widget configs
interface WidgetState {
    topWidgetFields: Record<string, any>;
    bottomWidgetFields: Record<string, any>;
    activePosition: 'top' | 'bottom';
}

// 创建 a position-aware form context type
type PositionFormContext = Omit<UseFormReturn<FormValues>, 'register' | 'watch' | 'setValue' | 'getValues'> & {
    register: (name: string, options?: any) => any;
    watch: (name?: string) => any;
    setValue: (name: string, value: any, options?: any) => void;
    getValues: (name?: string) => any;
};

export const DualWidgetConfig = ({ formContext, existingItem }: DualWidgetConfigProps) => {
    const isMobile = useIsMobile();
    const initializedRef = useRef(false);

    // State to track which position's config is currently being edited
    const [widgetState, setWidgetState] = useState<WidgetState>({
        topWidgetFields: {},
        bottomWidgetFields: {},
        activePosition: 'top'
    });

    // State to track current page - 0 for top, 1 for bottom
    const [currentPage, setCurrentPage] = useState(0);

    // Track widget types using state instead of formContext.watch to prevent re-renders
    const [topWidgetType, setTopWidgetType] = useState<string>('');
    const [bottomWidgetType, setBottomWidgetType] = useState<string>('');

    // Subscribe to widget type changes without causing re-renders
    useEffect(() => {
        const subscription = formContext.watch((value, { name }) => {
            if (name === 'topWidgetType') {
                setTopWidgetType(value.topWidgetType || '');
            }
            if (name === 'bottomWidgetType') {
                setBottomWidgetType(value.bottomWidgetType || '');
            }
        });
        return () => subscription.unsubscribe();
    }, [formContext]);

    // Initialize widget types from form values
    useEffect(() => {
        const currentTopType = formContext.getValues('topWidgetType');
        const currentBottomType = formContext.getValues('bottomWidgetType');
        if (currentTopType) setTopWidgetType(currentTopType);
        if (currentBottomType) setBottomWidgetType(currentBottomType);
    }, [formContext]);

    const selectStyling = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'text.primary',
            },
            '.MuiSvgIcon-root ': {
                fill: theme.palette.text.primary,
            },
            '&:hover fieldset': { borderColor: 'primary.main' },
            '&.Mui-focused fieldset': { borderColor: 'primary.main', },
        },
        width: '100%',
        minWidth: isMobile ? '50vw' : '20vw',
        '& .MuiMenuItem-root:hover': {
            backgroundColor: `${COLORS.LIGHT_GRAY_HOVER} !important`,
        },
        '& .MuiMenuItem-root.Mui-selected': {
            backgroundColor: `${'primary.main'} !important`,
            color: 'white',
        },
        '& .MuiMenuItem-root.Mui-selected:hover': {
            backgroundColor: `${'primary.main'} !important`,
            color: 'white',
        }
    };

    // Get position-specific field name
    const getField名称 = (position: 'top' | 'bottom', base名称: string): keyof FormValues => {
        return `${position}_${base名称}` as keyof FormValues;
    };

    // Initialize widget configs from existing data
    useEffect(() => {
        if (initializedRef.current) return;

        // Don't mark as initialized until we're done loading
        // This will prevent premature navigation between tabs

        // Initialize from existing item if editing
        const existingConfig = existingItem?.config || {};



        let topWidgetFields: Record<string, any> = {};
        let bottomWidgetFields: Record<string, any> = {};

        // Extract top widget configuration
        if (existingConfig.topWidget?.config) {
            const existingTopWidgetType = existingConfig.topWidget.type;
            const topConfig = existingConfig.topWidget.config;

            if (existingTopWidgetType) {
                formContext.setValue('topWidgetType', existingTopWidgetType);

                // Map configuration based on widget type
                if (existingTopWidgetType === ITEM_TYPE.WEATHER_WIDGET) {
                    topWidgetFields = {
                        temperatureUnit: topConfig.temperatureUnit || 'fahrenheit',
                        location: topConfig.location || null
                    };
                    formContext.setValue('top_temperatureUnit', topConfig.temperatureUnit || 'fahrenheit');
                    formContext.setValue('top_location', topConfig.location || null);
                }
                else if (existingTopWidgetType === ITEM_TYPE.DATE_TIME_WIDGET) {
                    topWidgetFields = {
                        location: topConfig.location || null,
                        timezone: topConfig.timezone || ''
                    };
                    formContext.setValue('top_location', topConfig.location || null);
                    formContext.setValue('top_timezone', topConfig.timezone || '');
                }
                else if (existingTopWidgetType === ITEM_TYPE.SYSTEM_MONITOR_WIDGET) {
                    const gauges = topConfig.gauges || ['cpu', 'temp', 'ram'];
                    topWidgetFields = {
                        temperatureUnit: topConfig.temperatureUnit || 'fahrenheit',
                        gauge1: gauges[0] || 'cpu',
                        gauge2: gauges[1] || 'temp',
                        gauge3: gauges[2] || 'ram',
                        networkInterface: topConfig.networkInterface || '',
                        showDiskUsage: topConfig.showDiskUsage !== false,
                        showSystemInfo: topConfig.showSystemInfo !== false,
                        showInternet状态: topConfig.showInternet状态 !== false,
                        showIP: topConfig.showIP ?? topConfig.showPublicIP ?? false,
                        ipDisplayType: topConfig.ipDisplayType || 'wan'
                    };
                    formContext.setValue('top_temperatureUnit', topConfig.temperatureUnit || 'fahrenheit');
                    formContext.setValue('top_gauge1', gauges[0] || 'cpu');
                    formContext.setValue('top_gauge2', gauges[1] || 'temp');
                    formContext.setValue('top_gauge3', gauges[2] || 'ram');
                    formContext.setValue('top_networkInterface', topConfig.networkInterface || '');
                    formContext.setValue('top_showDiskUsage', topConfig.showDiskUsage !== false);
                    formContext.setValue('top_showSystemInfo', topConfig.showSystemInfo !== false);
                    formContext.setValue('top_showInternet状态', topConfig.showInternet状态 !== false);
                    formContext.setValue('top_showIP', topConfig.showIP ?? topConfig.showPublicIP ?? false);
                    formContext.setValue('top_ipDisplayType', topConfig.ipDisplayType || 'wan');
                }
                else if (existingTopWidgetType === ITEM_TYPE.DISK_MONITOR_WIDGET) {
                    topWidgetFields = {
                        selectedDisks: topConfig.selectedDisks || [],
                        showIcons: topConfig.showIcons !== false,
                        show名称: topConfig.show名称 !== false,
                        layout: '2x2' // Force 2x2 for dual widgets
                    };
                    formContext.setValue('top_selectedDisks', topConfig.selectedDisks || []);
                    formContext.setValue('top_showIcons', topConfig.showIcons !== false);
                    formContext.setValue('top_show名称', topConfig.show名称 !== false);
                    formContext.setValue('top_layout', '2x2');
                }
                else if (existingTopWidgetType === ITEM_TYPE.PIHOLE_WIDGET) {
                    // Use masked values for sensitive fields if they exist
                    const maskedApiToken = topConfig._hasApiToken ? '**********' : '';
                    const masked密码 = topConfig._has密码 ? '**********' : '';

                    topWidgetFields = {
                        piholeHost: topConfig.host || '',
                        piholePort: topConfig.port || '',
                        piholeSsl: topConfig.ssl || false,
                        piholeApiToken: maskedApiToken,
                        pihole密码: masked密码,
                        pihole名称: topConfig.display名称 || '',
                        showLabel: topConfig.showLabel !== undefined ? topConfig.showLabel : true
                    };
                    formContext.setValue('top_piholeHost', topConfig.host || '');
                    formContext.setValue('top_piholePort', topConfig.port !== undefined ? topConfig.port : '');
                    formContext.setValue('top_piholeSsl', topConfig.ssl || false);
                    formContext.setValue('top_piholeApiToken', maskedApiToken);
                    formContext.setValue('top_pihole密码', masked密码);
                    formContext.setValue('top_pihole名称', topConfig.display名称 || '');
                    formContext.setValue('top_showLabel', topConfig.showLabel !== undefined ? topConfig.showLabel : true);
                }
                else if (existingTopWidgetType === ITEM_TYPE.ADGUARD_WIDGET) {
                    // Use masked values for sensitive fields if they exist
                    const masked用户名 = topConfig._has用户名 ? '**********' : '';
                    const masked密码 = topConfig._has密码 ? '**********' : '';

                    topWidgetFields = {
                        adguardHost: topConfig.host || '',
                        adguardPort: topConfig.port || '80',
                        adguardSsl: topConfig.ssl || false,
                        adguard用户名: masked用户名,
                        adguard密码: masked密码,
                        adguard名称: topConfig.display名称 || '',
                        showLabel: topConfig.showLabel !== undefined ? topConfig.showLabel : true
                    };
                    formContext.setValue('top_adguardHost', topConfig.host || '');
                    formContext.setValue('top_adguardPort', topConfig.port !== undefined ? topConfig.port : '80');
                    formContext.setValue('top_adguardSsl', topConfig.ssl || false);
                    formContext.setValue('top_adguard用户名', masked用户名);
                    formContext.setValue('top_adguard密码', masked密码);
                    formContext.setValue('top_adguard名称', topConfig.display名称 || '');
                    formContext.setValue('top_showLabel', topConfig.showLabel !== undefined ? topConfig.showLabel : true);
                }
            }
        }

        // Extract bottom widget configuration
        if (existingConfig.bottomWidget?.config) {
            const existingBottomWidgetType = existingConfig.bottomWidget.type;
            const bottomConfig = existingConfig.bottomWidget.config;

            if (existingBottomWidgetType) {
                // Set the bottomWidgetType directly
                formContext.setValue('bottomWidgetType', existingBottomWidgetType);

                // Map configuration based on widget type
                if (existingBottomWidgetType === ITEM_TYPE.WEATHER_WIDGET) {
                    const temperatureUnit = bottomConfig.temperatureUnit || 'fahrenheit';
                    const location = bottomConfig.location || null;

                    bottomWidgetFields = {
                        temperatureUnit,
                        location
                    };

                    formContext.setValue('bottom_temperatureUnit', temperatureUnit);

                    // Special handling for location to ensure it's properly preserved
                    if (location) {
                        formContext.setValue('bottom_location', location);
                    } else {
                        formContext.setValue('bottom_location', null);
                    }
                }
                else if (existingBottomWidgetType === ITEM_TYPE.DATE_TIME_WIDGET) {
                    const location = bottomConfig.location || null;
                    const timezone = bottomConfig.timezone || '';

                    bottomWidgetFields = {
                        location,
                        timezone
                    };

                    // Special handling for location to ensure it's properly preserved
                    if (location) {
                        formContext.setValue('bottom_location', location);
                    } else {
                        formContext.setValue('bottom_location', null);
                    }

                    formContext.setValue('bottom_timezone', timezone);
                }
                else if (existingBottomWidgetType === ITEM_TYPE.SYSTEM_MONITOR_WIDGET) {
                    const gauges = bottomConfig.gauges || ['cpu', 'temp', 'ram'];
                    bottomWidgetFields = {
                        temperatureUnit: bottomConfig.temperatureUnit || 'fahrenheit',
                        gauge1: gauges[0] || 'cpu',
                        gauge2: gauges[1] || 'temp',
                        gauge3: gauges[2] || 'ram',
                        networkInterface: bottomConfig.networkInterface || '',
                        showDiskUsage: bottomConfig.showDiskUsage !== false,
                        showSystemInfo: bottomConfig.showSystemInfo !== false,
                        showInternet状态: bottomConfig.showInternet状态 !== false,
                        showIP: bottomConfig.showIP ?? bottomConfig.showPublicIP ?? false,
                        ipDisplayType: bottomConfig.ipDisplayType || 'wan'
                    };
                    formContext.setValue('bottom_temperatureUnit', bottomConfig.temperatureUnit || 'fahrenheit');
                    formContext.setValue('bottom_gauge1', gauges[0] || 'cpu');
                    formContext.setValue('bottom_gauge2', gauges[1] || 'temp');
                    formContext.setValue('bottom_gauge3', gauges[2] || 'ram');
                    formContext.setValue('bottom_networkInterface', bottomConfig.networkInterface || '');
                    formContext.setValue('bottom_showDiskUsage', bottomConfig.showDiskUsage !== false);
                    formContext.setValue('bottom_showSystemInfo', bottomConfig.showSystemInfo !== false);
                    formContext.setValue('bottom_showInternet状态', bottomConfig.showInternet状态 !== false);
                    formContext.setValue('bottom_showIP', bottomConfig.showIP ?? bottomConfig.showPublicIP ?? false);
                    formContext.setValue('bottom_ipDisplayType', bottomConfig.ipDisplayType || 'wan');
                }
                else if (existingBottomWidgetType === ITEM_TYPE.DISK_MONITOR_WIDGET) {
                    bottomWidgetFields = {
                        selectedDisks: bottomConfig.selectedDisks || [],
                        showIcons: bottomConfig.showIcons !== false,
                        show名称: bottomConfig.show名称 !== false,
                        layout: '2x2' // Force 2x2 for dual widgets
                    };
                    formContext.setValue('bottom_selectedDisks', bottomConfig.selectedDisks || []);
                    formContext.setValue('bottom_showIcons', bottomConfig.showIcons !== false);
                    formContext.setValue('bottom_show名称', bottomConfig.show名称 !== false);
                    formContext.setValue('bottom_layout', '2x2');
                }
                else if (existingBottomWidgetType === ITEM_TYPE.PIHOLE_WIDGET) {
                    // Use masked values for sensitive fields if they exist
                    const maskedApiToken = bottomConfig._hasApiToken ? '**********' : '';
                    const masked密码 = bottomConfig._has密码 ? '**********' : '';

                    bottomWidgetFields = {
                        piholeHost: bottomConfig.host || '',
                        piholePort: bottomConfig.port || '',
                        piholeSsl: bottomConfig.ssl || false,
                        piholeApiToken: maskedApiToken,
                        pihole密码: masked密码,
                        pihole名称: bottomConfig.display名称 || '',
                        showLabel: bottomConfig.showLabel !== undefined ? bottomConfig.showLabel : true
                    };
                    formContext.setValue('bottom_piholeHost', bottomConfig.host || '');
                    formContext.setValue('bottom_piholePort', bottomConfig.port !== undefined ? bottomConfig.port : '');
                    formContext.setValue('bottom_piholeSsl', bottomConfig.ssl || false);
                    formContext.setValue('bottom_piholeApiToken', maskedApiToken);
                    formContext.setValue('bottom_pihole密码', masked密码);
                    formContext.setValue('bottom_pihole名称', bottomConfig.display名称 || '');
                    formContext.setValue('bottom_showLabel', bottomConfig.showLabel !== undefined ? bottomConfig.showLabel : true);
                }
                else if (existingBottomWidgetType === ITEM_TYPE.ADGUARD_WIDGET) {
                    // Use masked values for sensitive fields if they exist
                    const masked用户名 = bottomConfig._has用户名 ? '**********' : '';
                    const masked密码 = bottomConfig._has密码 ? '**********' : '';

                    bottomWidgetFields = {
                        adguardHost: bottomConfig.host || '',
                        adguardPort: bottomConfig.port || '80',
                        adguardSsl: bottomConfig.ssl || false,
                        adguard用户名: masked用户名,
                        adguard密码: masked密码,
                        adguard名称: bottomConfig.display名称 || '',
                        showLabel: bottomConfig.showLabel !== undefined ? bottomConfig.showLabel : true
                    };
                    formContext.setValue('bottom_adguardHost', bottomConfig.host || '');
                    formContext.setValue('bottom_adguardPort', bottomConfig.port !== undefined ? bottomConfig.port : '80');
                    formContext.setValue('bottom_adguardSsl', bottomConfig.ssl || false);
                    formContext.setValue('bottom_adguard用户名', masked用户名);
                    formContext.setValue('bottom_adguard密码', masked密码);
                    formContext.setValue('bottom_adguard名称', bottomConfig.display名称 || '');
                    formContext.setValue('bottom_showLabel', bottomConfig.showLabel !== undefined ? bottomConfig.showLabel : true);
                }
            }
        }

        // Initialize state with existing configurations
        setWidgetState({
            topWidgetFields,
            bottomWidgetFields,
            activePosition: 'top'
        });

        // Now mark as initialized
        initializedRef.current = true;

        // 添加 a delayed check to verify widget state after initialization
        setTimeout(() => {
            // Verification happens silently now
        }, 500);
    }, [existingItem]);

    // Apply saved fields to form
    const applyWidgetFieldsToForm = (position: 'top' | 'bottom', fields: Record<string, any>) => {
        // Apply fields based on widget type
        const widgetType = formContext.getValues(`${position}WidgetType`);

        if (widgetType && widgetType === ITEM_TYPE.WEATHER_WIDGET) {
            // Handle temperature unit - ensure it has a default value
            const tempUnit = fields.temperatureUnit || 'fahrenheit';
            formContext.setValue(getField名称(position, 'temperatureUnit'), tempUnit);

            // Handle location with special care
            try {
                if (fields.location !== undefined) {
                    formContext.setValue(getField名称(position, 'location'), fields.location);
                }
            } catch (error) {
                console.error(`Error setting ${position} location`);
            }
        }
        else if (widgetType && widgetType === ITEM_TYPE.DATE_TIME_WIDGET) {
            try {
                if (fields.location !== undefined) {
                    formContext.setValue(getField名称(position, 'location'), fields.location);
                }
            } catch (error) {
                console.error(`Error setting ${position} location`);
            }

            // Handle timezone
            if (fields.timezone !== undefined) {
                formContext.setValue(getField名称(position, 'timezone'), fields.timezone);
            }

            // Handle use24Hour
            if (fields.use24Hour !== undefined) {
                formContext.setValue(getField名称(position, 'use24Hour'), fields.use24Hour);
            }
        }
        else if (widgetType && widgetType === ITEM_TYPE.SYSTEM_MONITOR_WIDGET) {
            if (fields.temperatureUnit) {
                formContext.setValue(getField名称(position, 'temperatureUnit'), fields.temperatureUnit);
            }

            if (fields.gauge1) {
                formContext.setValue(getField名称(position, 'gauge1'), fields.gauge1);
            }

            if (fields.gauge2) {
                formContext.setValue(getField名称(position, 'gauge2'), fields.gauge2);
            }

            if (fields.gauge3) {
                formContext.setValue(getField名称(position, 'gauge3'), fields.gauge3);
            }

            if (fields.networkInterface !== undefined) {
                formContext.setValue(getField名称(position, 'networkInterface'), fields.networkInterface);
            }
        }
        else if (widgetType && widgetType === ITEM_TYPE.DISK_MONITOR_WIDGET) {
            if (fields.selectedDisks !== undefined) {
                formContext.setValue(getField名称(position, 'selectedDisks'), fields.selectedDisks);
            }

            if (fields.showIcons !== undefined) {
                formContext.setValue(getField名称(position, 'showIcons'), fields.showIcons);
            }

            if (fields.show名称 !== undefined) {
                formContext.setValue(getField名称(position, 'show名称'), fields.show名称);
            }

            // Always force 2x2 layout for dual widgets
            formContext.setValue(getField名称(position, 'layout'), '2x2');
        }
        else if (widgetType && widgetType === ITEM_TYPE.PIHOLE_WIDGET) {
            if (fields.piholeHost !== undefined) {
                formContext.setValue(getField名称(position, 'piholeHost'), fields.piholeHost);
            }

            if (fields.piholePort !== undefined) {
                formContext.setValue(getField名称(position, 'piholePort'), fields.piholePort);
            }

            if (fields.piholeSsl !== undefined) {
                formContext.setValue(getField名称(position, 'piholeSsl'), fields.piholeSsl);
            }

            if (fields.piholeApiToken !== undefined) {
                formContext.setValue(getField名称(position, 'piholeApiToken'), fields.piholeApiToken);
            }

            if (fields.pihole密码 !== undefined) {
                formContext.setValue(getField名称(position, 'pihole密码'), fields.pihole密码);
            }

            if (fields.pihole名称 !== undefined) {
                formContext.setValue(getField名称(position, 'pihole名称'), fields.pihole名称);
            }

            if (fields.showLabel !== undefined) {
                formContext.setValue(getField名称(position, 'showLabel'), fields.showLabel);
            }
        }
        else if (widgetType && widgetType === ITEM_TYPE.ADGUARD_WIDGET) {
            if (fields.adguardHost !== undefined) {
                formContext.setValue(getField名称(position, 'adguardHost'), fields.adguardHost);
            }

            if (fields.adguardPort !== undefined) {
                formContext.setValue(getField名称(position, 'adguardPort'), fields.adguardPort);
            }

            if (fields.adguardSsl !== undefined) {
                formContext.setValue(getField名称(position, 'adguardSsl'), fields.adguardSsl);
            }

            if (fields.adguard用户名 !== undefined) {
                formContext.setValue(getField名称(position, 'adguard用户名'), fields.adguard用户名);
            }

            if (fields.adguard密码 !== undefined) {
                formContext.setValue(getField名称(position, 'adguard密码'), fields.adguard密码);
            }

            if (fields.adguard名称 !== undefined) {
                formContext.setValue(getField名称(position, 'adguard名称'), fields.adguard名称);
            }

            if (fields.showLabel !== undefined) {
                formContext.setValue(getField名称(position, 'showLabel'), fields.showLabel);
            }
        }

        // Don't trigger validation here as it can cause flashing
        // formContext.trigger();
    };

    // Reset form fields to defaults for a position
    const resetFormFields = (position: 'top' | 'bottom') => {
        const widgetType = formContext.getValues(`${position}WidgetType`);
        if (!widgetType) return;

        let defaultFields: Record<string, any> = {};

        // Apply default fields based on widget type
        if (widgetType === ITEM_TYPE.WEATHER_WIDGET) {
            defaultFields = {
                temperatureUnit: 'fahrenheit',
                location: null
            };
            formContext.setValue(getField名称(position, 'temperatureUnit'), 'fahrenheit');
            formContext.setValue(getField名称(position, 'location'), null);
        }
        else if (widgetType === ITEM_TYPE.DATE_TIME_WIDGET) {
            defaultFields = {
                location: null,
                timezone: '',
                use24Hour: false
            };
            formContext.setValue(getField名称(position, 'location'), null);
            formContext.setValue(getField名称(position, 'timezone'), '');
            formContext.setValue(getField名称(position, 'use24Hour'), false);
        }
        else if (widgetType === ITEM_TYPE.SYSTEM_MONITOR_WIDGET) {
            defaultFields = {
                temperatureUnit: 'fahrenheit',
                gauge1: 'cpu',
                gauge2: 'temp',
                gauge3: 'ram',
                networkInterface: '',
                showDiskUsage: true,
                showSystemInfo: true,
                showInternet状态: true,
                showIP: false,
                ipDisplayType: 'wan'
            };
            formContext.setValue(getField名称(position, 'temperatureUnit'), 'fahrenheit');
            formContext.setValue(getField名称(position, 'gauge1'), 'cpu');
            formContext.setValue(getField名称(position, 'gauge2'), 'temp');
            formContext.setValue(getField名称(position, 'gauge3'), 'ram');
            formContext.setValue(getField名称(position, 'networkInterface'), '');
            formContext.setValue(getField名称(position, 'showDiskUsage'), true);
            formContext.setValue(getField名称(position, 'showSystemInfo'), true);
            formContext.setValue(getField名称(position, 'showInternet状态'), true);
            formContext.setValue(getField名称(position, 'showIP'), false);
            formContext.setValue(getField名称(position, 'ipDisplayType'), 'wan');
        }
        else if (widgetType === ITEM_TYPE.DISK_MONITOR_WIDGET) {
            defaultFields = {
                selectedDisks: [],
                showIcons: true,
                show名称: true,
                layout: '2x2'
            };
            formContext.setValue(getField名称(position, 'selectedDisks'), []);
            formContext.setValue(getField名称(position, 'showIcons'), true);
            formContext.setValue(getField名称(position, 'show名称'), true);
            formContext.setValue(getField名称(position, 'layout'), '2x2');
        }
        else if (widgetType === ITEM_TYPE.PIHOLE_WIDGET) {
            defaultFields = {
                piholeHost: '',
                piholePort: '',
                piholeSsl: false,
                piholeApiToken: '',
                pihole密码: '',
                pihole名称: '',
                showLabel: true
            };
            formContext.setValue(getField名称(position, 'piholeHost'), '');
            formContext.setValue(getField名称(position, 'piholePort'), '');
            formContext.setValue(getField名称(position, 'piholeSsl'), false);
            formContext.setValue(getField名称(position, 'piholeApiToken'), '');
            formContext.setValue(getField名称(position, 'pihole密码'), '');
            formContext.setValue(getField名称(position, 'pihole名称'), '');
            formContext.setValue(getField名称(position, 'showLabel'), true);
        }
        else if (widgetType === ITEM_TYPE.ADGUARD_WIDGET) {
            defaultFields = {
                adguardHost: '',
                adguardPort: '80',
                adguardSsl: false,
                adguard用户名: '',
                adguard密码: '',
                adguard名称: '',
                showLabel: true
            };
            formContext.setValue(getField名称(position, 'adguardHost'), '');
            formContext.setValue(getField名称(position, 'adguardPort'), '80');
            formContext.setValue(getField名称(position, 'adguardSsl'), false);
            formContext.setValue(getField名称(position, 'adguard用户名'), '');
            formContext.setValue(getField名称(position, 'adguard密码'), '');
            formContext.setValue(getField名称(position, 'adguard名称'), '');
            formContext.setValue(getField名称(position, 'showLabel'), true);
        }

        // Update widget state with default fields
        setWidgetState(prevState => ({
            ...prevState,
            [`${position}WidgetFields`]: { ...defaultFields }
        }));

        // Don't trigger validation here as it can cause flashing
        // formContext.trigger();
    };

    // Capture form values to state based on widget type
    const captureFormValuesToState = (position: 'top' | 'bottom') => {
        const widgetType = formContext.getValues(`${position}WidgetType`);
        if (!widgetType) return;

        const fields: Record<string, any> = {};

        if (widgetType === ITEM_TYPE.WEATHER_WIDGET) {
            // Get temperature unit value
            const tempUnit = formContext.getValues(getField名称(position, 'temperatureUnit'));
            fields.temperatureUnit = tempUnit || 'fahrenheit';

            // Get location data and ensure it has proper structure
            const locationValue = formContext.getValues(getField名称(position, 'location'));

            // Ensure location object is properly structured
            if (locationValue && typeof locationValue === 'object' && 'name' in locationValue) {
                const locationObj = locationValue as {
                    name: string;
                    latitude: number | string;
                    longitude: number | string;
                };

                fields.location = {
                    name: locationObj.name || '',
                    latitude: typeof locationObj.latitude === 'number' ?
                        locationObj.latitude :
                        parseFloat(String(locationObj.latitude)) || 0,
                    longitude: typeof locationObj.longitude === 'number' ?
                        locationObj.longitude :
                        parseFloat(String(locationObj.longitude)) || 0
                };
            } else {
                fields.location = null;
            }
        }
        else if (widgetType === ITEM_TYPE.DATE_TIME_WIDGET) {
            // Get timezone value
            const timezone = formContext.getValues(getField名称(position, 'timezone'));

            // Ensure timezone is properly stored as a string, never null
            fields.timezone = timezone || '';

            // Get use24Hour value
            const use24Hour = formContext.getValues(getField名称(position, 'use24Hour'));
            fields.use24Hour = use24Hour || false;

            // Get location data and ensure it has proper structure
            const locationValue = formContext.getValues(getField名称(position, 'location'));

            // Ensure location object is properly structured
            if (locationValue && typeof locationValue === 'object' && 'name' in locationValue) {
                const locationObj = locationValue as {
                    name: string;
                    latitude: number | string;
                    longitude: number | string;
                };

                fields.location = {
                    name: locationObj.name || '',
                    latitude: typeof locationObj.latitude === 'number' ?
                        locationObj.latitude :
                        parseFloat(String(locationObj.latitude)) || 0,
                    longitude: typeof locationObj.longitude === 'number' ?
                        locationObj.longitude :
                        parseFloat(String(locationObj.longitude)) || 0
                };
            } else {
                fields.location = null;
            }
        }
        else if (widgetType === ITEM_TYPE.SYSTEM_MONITOR_WIDGET) {
            fields.temperatureUnit = formContext.getValues(getField名称(position, 'temperatureUnit'));
            fields.gauge1 = formContext.getValues(getField名称(position, 'gauge1'));
            fields.gauge2 = formContext.getValues(getField名称(position, 'gauge2'));
            fields.gauge3 = formContext.getValues(getField名称(position, 'gauge3'));
            fields.networkInterface = formContext.getValues(getField名称(position, 'networkInterface'));
            fields.showDiskUsage = formContext.getValues(getField名称(position, 'showDiskUsage'));
            fields.showSystemInfo = formContext.getValues(getField名称(position, 'showSystemInfo'));
            fields.showInternet状态 = formContext.getValues(getField名称(position, 'showInternet状态'));
            fields.showIP = formContext.getValues(getField名称(position, 'showIP'));
            fields.ipDisplayType = formContext.getValues(getField名称(position, 'ipDisplayType'));
        }
        else if (widgetType === ITEM_TYPE.DISK_MONITOR_WIDGET) {
            fields.selectedDisks = formContext.getValues(getField名称(position, 'selectedDisks'));
            fields.showIcons = formContext.getValues(getField名称(position, 'showIcons'));
            fields.show名称 = formContext.getValues(getField名称(position, 'show名称'));
            fields.layout = '2x2'; // Always 2x2 for dual widgets
        }
        else if (widgetType === ITEM_TYPE.PIHOLE_WIDGET) {
            fields.piholeHost = formContext.getValues(getField名称(position, 'piholeHost'));
            fields.piholePort = formContext.getValues(getField名称(position, 'piholePort'));
            fields.piholeSsl = formContext.getValues(getField名称(position, 'piholeSsl'));
            fields.piholeApiToken = formContext.getValues(getField名称(position, 'piholeApiToken'));
            fields.pihole密码 = formContext.getValues(getField名称(position, 'pihole密码'));
            fields.pihole名称 = formContext.getValues(getField名称(position, 'pihole名称'));
            fields.showLabel = formContext.getValues(getField名称(position, 'showLabel'));
        }
        else if (widgetType === ITEM_TYPE.ADGUARD_WIDGET) {
            fields.adguardHost = formContext.getValues(getField名称(position, 'adguardHost'));
            fields.adguardPort = formContext.getValues(getField名称(position, 'adguardPort'));
            fields.adguardSsl = formContext.getValues(getField名称(position, 'adguardSsl'));
            fields.adguard用户名 = formContext.getValues(getField名称(position, 'adguard用户名'));
            fields.adguard密码 = formContext.getValues(getField名称(position, 'adguard密码'));
            fields.adguard名称 = formContext.getValues(getField名称(position, 'adguard名称'));
            fields.showLabel = formContext.getValues(getField名称(position, 'showLabel'));
        }

        // Update the state with captured values
        setWidgetState(prevState => {
            const newState = {
                ...prevState,
                [`${position}WidgetFields`]: { ...fields }
            };
            return newState;
        });
    };

    // Handle tab change (replacing handlePageChange)
    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        // Use the same logic as the original handlePageChange
        if (newValue !== currentPage) {
            // Capture current form values to state
            const currentPosition = currentPage === 0 ? 'top' : 'bottom';

            // Explicitly check for timezone values before switching tabs
            const currentWidgetType = currentPosition === 'top' ? topWidgetType : bottomWidgetType;
            if (currentWidgetType === ITEM_TYPE.DATE_TIME_WIDGET) {
                const timezoneField名称 = getField名称(currentPosition, 'timezone');
                const timezone = formContext.getValues(timezoneField名称);

                // Explicitly set the timezone in the widget state
                setWidgetState(prevState => {
                    const positionKey = `${currentPosition}WidgetFields` as 'topWidgetFields' | 'bottomWidgetFields';
                    const updatedFields = {
                        ...prevState[positionKey],
                        timezone: timezone || ''
                    };

                    return {
                        ...prevState,
                        [positionKey]: updatedFields
                    };
                });
            }

            captureFormValuesToState(currentPosition);

            // Change the page
            setCurrentPage(newValue);

            // Update active position
            setWidgetState(prevState => ({
                ...prevState,
                activePosition: newValue === 0 ? 'top' : 'bottom'
            }));

            // Apply form values for the new position after a short delay
            setTimeout(() => {
                const newPosition = newValue === 0 ? 'top' : 'bottom';
                const fields = newPosition === 'top' ?
                    widgetState.topWidgetFields :
                    widgetState.bottomWidgetFields;

                // Apply the fields
                applyWidgetFieldsToForm(newPosition, fields);

                // Don't trigger validation during tab changes as it can cause flashing
                // formContext.trigger();
            }, 50);
        }
    };

    // 添加 a useEffect to sync form values with widget state when page changes
    useEffect(() => {
        const position = currentPage === 0 ? 'top' : 'bottom';
        const fields = position === 'top' ?
            widgetState.topWidgetFields :
            widgetState.bottomWidgetFields;

        if (fields && Object.keys(fields).length > 0) {
            // Just log the values, don't trigger more updates
            if (widgetState.activePosition !== position) {
                setTimeout(() => {
                    // Don't call applyWidgetFieldsToForm which calls formContext.trigger()
                    // Just directly apply critical fields if needed
                }, 100);
            }
        }
    }, [currentPage]); // Only depend on currentPage, not on widgetState which changes frequently

    // Watch for changes to widget types - use separate subscriptions to avoid triggering on every form change
    useEffect(() => {
        const subscription = formContext.watch((value, { name }) => {
            if (name === 'topWidgetType' && currentPage === 0 && value.topWidgetType) {
                // When top widget type changes, apply default values
                if (Object.keys(widgetState.topWidgetFields).length === 0) {
                    resetFormFields('top');
                }
            }

            if (name === 'bottomWidgetType' && currentPage === 1 && value.bottomWidgetType) {
                // When bottom widget type changes, apply default values
                if (Object.keys(widgetState.bottomWidgetFields).length === 0) {
                    resetFormFields('bottom');
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [currentPage, widgetState.topWidgetFields, widgetState.bottomWidgetFields]);

    // 保存 final configurations when form is submitted
    useEffect(() => {
        const handleForm提交 = async () => {
            // Capture widget types immediately before they can be lost
            const currentTopWidgetType = formContext.getValues('topWidgetType');
            const currentBottomWidgetType = formContext.getValues('bottomWidgetType');

            // Grab the current page's state first
            const currentPosition = currentPage === 0 ? 'top' : 'bottom';
            captureFormValuesToState(currentPosition);

            // Ensure we capture both positions regardless of which page we're on
            captureFormValuesToState('top');
            captureFormValuesToState('bottom');

            // Build individual widget configs using captured types
            const topWidget = currentTopWidgetType ? await buildWidgetConfigWithType('top', currentTopWidgetType) : undefined;
            const bottomWidget = currentBottomWidgetType ? await buildWidgetConfigWithType('bottom', currentBottomWidgetType) : undefined;

            // 创建 the final dual widget config
            const dualWidgetConfig = {
                topWidget,
                bottomWidget
            };

            // Set the config value for submission
            (formContext as any).setValue('config', dualWidgetConfig);
        };

        // 添加 event listener to form submit
        const formElement = document.querySelector('form');
        if (formElement) {
            formElement.addEventListener('submit', handleForm提交);
            return () => {
                formElement.removeEventListener('submit', handleForm提交);
            };
        }
    }, [formContext, currentPage]); // 移除d widgetState dependency to prevent unnecessary re-renders

    // Build widget config with explicit widget type (to avoid form reset issues)
    const buildWidgetConfigWithType = async (position: 'top' | 'bottom', widgetType: string) => {
        if (!widgetType) {
            return undefined;
        }

        return await buildWidgetConfigInternal(position, widgetType);
    };

    // Update buildWidgetConfig to not depend on active position state
    const buildWidgetConfig = async (position: 'top' | 'bottom') => {
        const widgetType = formContext.getValues(`${position}WidgetType`);
        if (!widgetType) {
            return undefined;
        }

        return await buildWidgetConfigInternal(position, widgetType);
    };

    // Internal function to build widget config with given type
    const buildWidgetConfigInternal = async (position: 'top' | 'bottom', widgetType: string) => {

        const fields = position === 'top' ?
            widgetState.topWidgetFields :
            widgetState.bottomWidgetFields;

        let config: Record<string, any> = {};

        if (widgetType === ITEM_TYPE.WEATHER_WIDGET) {
            // Get values directly from form for critical fields
            // Force get the temperature unit from the form directly
            const temperatureUnitField = getField名称(position, 'temperatureUnit');
            const temperatureUnit = formContext.getValues(temperatureUnitField);

            // Get it from fields object as fallback
            const finalTempUnit = temperatureUnit || (fields && fields.temperatureUnit) || 'fahrenheit';

            const location = formContext.getValues(getField名称(position, 'location'));

            // Ensure location has the correct structure
            let processedLocation = null;
            if (location && typeof location === 'object' && 'name' in location) {
                const locationObj = location as {
                    name: string;
                    latitude: number | string;
                    longitude: number | string;
                };

                processedLocation = {
                    name: locationObj.name || '',
                    latitude: typeof locationObj.latitude === 'number' ?
                        locationObj.latitude :
                        parseFloat(String(locationObj.latitude)) || 0,
                    longitude: typeof locationObj.longitude === 'number' ?
                        locationObj.longitude :
                        parseFloat(String(locationObj.longitude)) || 0
                };
            }

            config = {
                temperatureUnit: finalTempUnit,
                location: processedLocation
            };
        }
        else if (widgetType === ITEM_TYPE.DATE_TIME_WIDGET) {
            // Get location directly from form
            const location = formContext.getValues(getField名称(position, 'location'));

            // Explicitly retrieve timezone with a fallback empty string
            const timezone = formContext.getValues(getField名称(position, 'timezone')) || '';

            // Ensure location has the correct structure
            let processedLocation = null;
            if (location && typeof location === 'object' && 'name' in location) {
                const locationObj = location as {
                    name: string;
                    latitude: number | string;
                    longitude: number | string;
                };

                processedLocation = {
                    name: locationObj.name || '',
                    latitude: typeof locationObj.latitude === 'number' ?
                        locationObj.latitude :
                        parseFloat(String(locationObj.latitude)) || 0,
                    longitude: typeof locationObj.longitude === 'number' ?
                        locationObj.longitude :
                        parseFloat(String(locationObj.longitude)) || 0
                };
            }

            // Get use24Hour value
            const use24Hour = formContext.getValues(getField名称(position, 'use24Hour')) || false;

            // Always include the timezone field, even if it's an empty string (never undefined or null)
            config = {
                location: processedLocation,
                timezone: timezone, // This is already guaranteed to be a string (empty if not set)
                use24Hour: use24Hour
            };
        }
        else if (widgetType === ITEM_TYPE.SYSTEM_MONITOR_WIDGET) {
            // Get values directly from form for critical fields
            const temperatureUnit = formContext.getValues(getField名称(position, 'temperatureUnit'));
            const gauge1 = formContext.getValues(getField名称(position, 'gauge1'));
            const gauge2 = formContext.getValues(getField名称(position, 'gauge2'));
            const gauge3 = formContext.getValues(getField名称(position, 'gauge3'));
            const networkInterface = formContext.getValues(getField名称(position, 'networkInterface'));
            const showDiskUsage = formContext.getValues(getField名称(position, 'showDiskUsage'));
            const showSystemInfo = formContext.getValues(getField名称(position, 'showSystemInfo'));
            const showInternet状态 = formContext.getValues(getField名称(position, 'showInternet状态'));
            const showIP = formContext.getValues(getField名称(position, 'showIP'));
            const ipDisplayType = formContext.getValues(getField名称(position, 'ipDisplayType'));

            config = {
                temperatureUnit: temperatureUnit || 'fahrenheit',
                gauges: [
                    gauge1 || fields.gauge1 || 'cpu',
                    gauge2 || fields.gauge2 || 'temp',
                    gauge3 || fields.gauge3 || 'ram'
                ],
                networkInterface: networkInterface || fields.networkInterface || '',
                showDiskUsage: showDiskUsage !== false,
                showSystemInfo: showSystemInfo !== false,
                showInternet状态: showInternet状态 !== false,
                showIP: showIP || false,
                ipDisplayType: ipDisplayType || 'wan'
            };
        }
        else if (widgetType === ITEM_TYPE.PIHOLE_WIDGET) {
            // Get values directly from form for critical fields
            const host = formContext.getValues(getField名称(position, 'piholeHost'));
            const port = formContext.getValues(getField名称(position, 'piholePort'));
            const ssl = formContext.getValues(getField名称(position, 'piholeSsl'));
            const apiToken = formContext.getValues(getField名称(position, 'piholeApiToken'));
            const password = formContext.getValues(getField名称(position, 'pihole密码'));
            const display名称 = formContext.getValues(getField名称(position, 'pihole名称'));
            const showLabel = formContext.getValues(getField名称(position, 'showLabel'));



            // Check if we have existing sensitive data from the original config
            let hasExistingApiToken = false;
            let hasExisting密码 = false;

            // For dual widgets, we need to check the position-specific config
            if (existingItem && existingItem.config) {
                const dualConfig = existingItem.config;
                const positionWidget = position === 'top' ? dualConfig.topWidget : dualConfig.bottomWidget;
                if (positionWidget?.config) {
                    hasExistingApiToken = !!positionWidget.config._hasApiToken;
                    hasExisting密码 = !!positionWidget.config._has密码;
                }
            }

            // Also check if the current form values are masked (indicating existing data)
            if (apiToken === '**********') {
                hasExistingApiToken = true;
            }
            if (password === '**********') {
                hasExisting密码 = true;
            }



            // Base configuration
            const configObj: any = {
                host: host || '',
                port: port || '',
                ssl: ssl || false,
                display名称: display名称 || '',
                showLabel: showLabel !== undefined ? showLabel : true
            };

            // Handle credential encryption - only encrypt if not masked
            let encryptedApiToken = '';
            let encrypted密码 = '';

            // Only process API token if it's not the masked value
            if (apiToken && typeof apiToken === 'string' && apiToken !== '**********') {
                try {
                    encryptedApiToken = await DashApi.encryptPiholeToken(apiToken);
                } catch (error) {
                    console.error('Error encrypting Pi-hole API token:', error);
                }
            }

            // Only process password if it's not the masked value
            if (password && typeof password === 'string' && password !== '**********') {
                try {
                    encrypted密码 = await DashApi.encryptPihole密码(password);
                } catch (error) {
                    console.error('Error encrypting Pi-hole password:', error);
                }
            }

            // Include encrypted credentials if they were provided
            if (encryptedApiToken) {
                configObj.apiToken = encryptedApiToken;
            } else if (hasExistingApiToken) {
                // If we have an existing API token but no new token provided, set the flag
                configObj._hasApiToken = true;
            }

            if (encrypted密码) {
                configObj.password = encrypted密码;
            } else if (hasExisting密码) {
                // If we have an existing password but no new password provided, set the flag
                configObj._has密码 = true;
            }
            config = configObj;
        }
        else if (widgetType === ITEM_TYPE.ADGUARD_WIDGET) {
            // Get values directly from form for critical fields
            const host = formContext.getValues(getField名称(position, 'adguardHost'));
            const port = formContext.getValues(getField名称(position, 'adguardPort'));
            const ssl = formContext.getValues(getField名称(position, 'adguardSsl'));
            const username = formContext.getValues(getField名称(position, 'adguard用户名'));
            const password = formContext.getValues(getField名称(position, 'adguard密码'));
            const display名称 = formContext.getValues(getField名称(position, 'adguard名称'));
            const showLabel = formContext.getValues(getField名称(position, 'showLabel'));

            // Check if we have existing sensitive data from the original config
            let hasExisting用户名 = false;
            let hasExisting密码 = false;

            // For dual widgets, we need to check the position-specific config
            if (existingItem && existingItem.config) {
                const dualConfig = existingItem.config;
                const positionWidget = position === 'top' ? dualConfig.topWidget : dualConfig.bottomWidget;
                if (positionWidget?.config) {
                    hasExisting用户名 = !!positionWidget.config._has用户名;
                    hasExisting密码 = !!positionWidget.config._has密码;
                }
            }

            // Also check if the current form values are masked (indicating existing data)
            if (username === '**********') {
                hasExisting用户名 = true;
            }
            if (password === '**********') {
                hasExisting密码 = true;
            }

            // Handle credential encryption - only encrypt if not masked
            let encrypted用户名 = '';
            let encrypted密码 = '';

            // Only process username if it's not the masked value
            if (username && typeof username === 'string' && username !== '**********') {
                try {
                    encrypted用户名 = await DashApi.encryptAdGuard用户名(username);
                } catch (error) {
                    console.error('Error encrypting AdGuard username:', error);
                }
            }

            // Only process password if it's not the masked value
            if (password && typeof password === 'string' && password !== '**********') {
                try {
                    encrypted密码 = await DashApi.encryptAdGuard密码(password);
                } catch (error) {
                    console.error('Error encrypting AdGuard password:', error);
                }
            }

            // Base configuration
            const configObj: any = {
                host: host || '',
                port: port || '80',
                ssl: ssl || false,
                display名称: display名称 || '',
                showLabel: showLabel !== undefined ? showLabel : true
            };

            // Include encrypted credentials if they were provided
            if (encrypted用户名 && encrypted密码) {
                configObj.username = encrypted用户名;
                configObj.password = encrypted密码;
            } else {
                // If we have existing credentials but no new ones provided, set the flags
                if (hasExisting用户名) {
                    configObj._has用户名 = true;
                }
                if (hasExisting密码) {
                    configObj._has密码 = true;
                }
            }
            config = configObj;
        }
        else if (widgetType === ITEM_TYPE.DISK_MONITOR_WIDGET) {
            // Get values directly from form for critical fields
            const selectedDisks = formContext.getValues(getField名称(position, 'selectedDisks')) as Array<{ mount: string; custom名称: string; showMountPath?: boolean }> | undefined;
            const showIcons = formContext.getValues(getField名称(position, 'showIcons'));
            const show名称 = formContext.getValues(getField名称(position, 'show名称'));

            // Validate that at least one disk is selected
            if (!selectedDisks || !Array.isArray(selectedDisks) || selectedDisks.length === 0) {
                formContext.setError(getField名称(position, 'selectedDisks'), {
                    type: 'required',
                    message: 'At least one disk must be selected'
                });
                throw new Error(`At least one disk must be selected for ${position} widget`);
            }

            config = {
                selectedDisks: selectedDisks || [],
                showIcons: showIcons !== false,
                show名称: show名称 !== false,
                layout: '2x2' // Always 2x2 for dual widgets
            };
        }

        return {
            type: widgetType,
            config
        };
    };

    // When active position changes, update the form
    useEffect(() => {
        const position = widgetState.activePosition;
        const fields = position === 'top' ?
            widgetState.topWidgetFields :
            widgetState.bottomWidgetFields;

        applyWidgetFieldsToForm(position, fields);
    }, [widgetState.activePosition]);

    // 创建 position-aware wrappers for each widget configuration component
    const createPositionedFormContext = (position: 'top' | 'bottom'): PositionFormContext => {
        return {
            ...formContext,
            register: (name: string, options?: any) => {
                const field名称 = getField名称(position, name);
                return formContext.register(field名称, options);
            },
            watch: (name?: string) => {
                if (!name) return formContext.watch();
                const field名称 = getField名称(position, name);
                return formContext.watch(field名称);
            },
            setValue: (name: string, value: any, options?: any) => {
                const field名称 = getField名称(position, name);
                return formContext.setValue(field名称, value, options);
            },
            getValues: (name?: string) => {
                if (!name) return formContext.getValues();
                const field名称 = getField名称(position, name);
                return formContext.getValues(field名称);
            }
        };
    };

    // 创建 a special location-aware context for the WeatherWidgetConfig
    const createLocationAwareContext = (position: 'top' | 'bottom'): PositionFormContext => {
        const baseContext = createPositionedFormContext(position);
        return {
            ...baseContext,
            setValue: (name: string, value: any, options?: any) => {
                if (name === 'location') {
                    return formContext.setValue(getField名称(position, 'location'), value, options);
                }
                else if (name === 'temperatureUnit') {
                    formContext.setValue(getField名称(position, 'temperatureUnit'), value, options);

                    // Also update the widgetState directly to keep everything in sync
                    setWidgetState(prevState => {
                        const positionKey = `${position}WidgetFields` as 'topWidgetFields' | 'bottomWidgetFields';
                        return {
                            ...prevState,
                            [positionKey]: {
                                ...prevState[positionKey],
                                temperatureUnit: value
                            }
                        };
                    });

                    return undefined; // setValue doesn't expect a return value
                }
                return baseContext.setValue(name, value, options);
            },
            watch: (name?: string) => {
                if (name === 'location') {
                    return formContext.watch(getField名称(position, 'location'));
                }
                else if (name === 'temperatureUnit') {
                    const fieldValue = formContext.watch(getField名称(position, 'temperatureUnit'));
                    return fieldValue || 'fahrenheit';
                }
                return baseContext.watch(name);
            },
            getValues: (name?: string) => {
                if (name === 'location') {
                    return formContext.getValues(getField名称(position, 'location'));
                }
                else if (name === 'temperatureUnit') {
                    const fieldValue = formContext.getValues(getField名称(position, 'temperatureUnit'));
                    return fieldValue || 'fahrenheit';
                }
                return baseContext.getValues(name);
            }
        };
    };

    // 创建 a custom component for System 监控 fields to properly use hooks
    const System监控Fields = ({ position }: { position: 'top' | 'bottom' }) => {
        // Access the widget state and form context from parent component
        const fields = position === 'top' ?
            widgetState.topWidgetFields :
            widgetState.bottomWidgetFields;

        // Store field names in variables to ensure stability
        const gauge1Field名称 = getField名称(position, 'gauge1');
        const gauge2Field名称 = getField名称(position, 'gauge2');
        const gauge3Field名称 = getField名称(position, 'gauge3');
        const networkInterfaceField名称 = getField名称(position, 'networkInterface');
        const temperatureUnitField名称 = getField名称(position, 'temperatureUnit');

        // Watch the temperature unit directly from the form
        const watchedTemperatureUnit = formContext.watch(temperatureUnitField名称);
        const [temperatureUnit, setTemperatureUnit] = useState<string>(() => {
            const currentValue = formContext.getValues(temperatureUnitField名称);
            return typeof currentValue === 'string' ? currentValue : 'fahrenheit';
        });

        // Sync local state with form value when it changes
        useEffect(() => {
            if (typeof watchedTemperatureUnit === 'string') {
                setTemperatureUnit(watchedTemperatureUnit);
            }
        }, [watchedTemperatureUnit]);

        // State for network interfaces
        const [networkInterfaces, setNetworkInterfaces] = useState<Array<{id: string, label: string}>>([]);

        // Immediately check form values for pre-existing network gauge selections
        const initialGauge1 = formContext.getValues(gauge1Field名称);
        const initialGauge2 = formContext.getValues(gauge2Field名称);
        const initialGauge3 = formContext.getValues(gauge3Field名称);

        // Use state to store the gauge values locally
        const [gaugeValues, setGaugeValues] = useState({
            gauge1: initialGauge1 || 'cpu',
            gauge2: initialGauge2 || 'temp',
            gauge3: initialGauge3 || 'ram'
        });

        // Force immediate network interface field display if any gauge is already set to network
        const [shouldShowNetworkField, setShouldShowNetworkField] = useState(() => {
            const hasNetworkGauge =
                initialGauge1 === 'network' ||
                initialGauge2 === 'network' ||
                initialGauge3 === 'network';

            return hasNetworkGauge;
        });

        // Check if any gauge is currently set to network
        const isNetworkSelected =
            gaugeValues.gauge1 === 'network' ||
            gaugeValues.gauge2 === 'network' ||
            gaugeValues.gauge3 === 'network';

        // Update the network field display state whenever gauge values change
        useEffect(() => {
            setShouldShowNetworkField(isNetworkSelected);
        }, [gaugeValues.gauge1, gaugeValues.gauge2, gaugeValues.gauge3]);

        // Handler for gauge changes
        const handleGaugeChange = (gauge: string) => (event: any) => {
            // Safely access value from event
            const value = event?.target?.value || event;
            if (!value) return;

            // Update form value
            const field名称 = getField名称(position, gauge);
            formContext.setValue(field名称, value);

            // Update local state
            setGaugeValues(prev => ({
                ...prev,
                [gauge]: value
            }));
        };

        // Fetch network interfaces immediately when component mounts or network is selected
        useEffect(() => {
            if (shouldShowNetworkField) {
                const fetchNetworkInterfaces = async () => {
                    try {
                        const systemInfo = await DashApi.getSystemInformation();
                        if (systemInfo && systemInfo.networkInterfaces && Array.isArray(systemInfo.networkInterfaces)) {
                            const interfaces = systemInfo.networkInterfaces.map((iface: { iface: string }) => ({
                                id: iface.iface,
                                label: iface.iface
                            }));

                            setNetworkInterfaces(interfaces);

                            // Get the current network interface value from form
                            const currentInterface = formContext.getValues(networkInterfaceField名称);

                            // If there's no current interface selected but we need one, set it
                            if (!currentInterface && interfaces.length > 0) {
                                const activeInterface = systemInfo.network?.iface;

                                if (activeInterface && interfaces.some((iface: { id: string }) => iface.id === activeInterface)) {
                                    formContext.setValue(networkInterfaceField名称, activeInterface);
                                } else {
                                    formContext.setValue(networkInterfaceField名称, interfaces[0].id);
                                }
                            }
                        }
                    } catch (error) {
                        setNetworkInterfaces([]);
                    }
                };

                fetchNetworkInterfaces();
            }
        }, [shouldShowNetworkField]);

        return (
            <>
                {/* Temperature Unit Radio Buttons */}
                <Box sx={{ mb: 2, mt: 1 }}>
                    <Typography
                        variant='body2'
                        sx={{
                            color: 'white',
                            mb: 1,
                            ml: 1
                        }}
                    >
                        Temperature Unit:
                    </Typography>
                    <RadioGroup
                        name={temperatureUnitField名称}
                        value={temperatureUnit}
                        onChange={(e) => {
                            setTemperatureUnit(e.target.value);
                            formContext.setValue(temperatureUnitField名称, e.target.value);
                        }}
                        sx={{
                            flexDirection: 'row',
                            ml: 1,
                            '& .MuiFormControlLabel-label': {
                                color: 'white'
                            }
                        }}
                    >
                        <FormControlLabel
                            value='fahrenheit'
                            control={
                                <Radio
                                    sx={{
                                        color: 'white',
                                        '&.Mui-checked': {
                                            color: 'primary.main'
                                        }
                                    }}
                                />
                            }
                            label='Fahrenheit (°F)'
                        />
                        <FormControlLabel
                            value='celsius'
                            control={
                                <Radio
                                    sx={{
                                        color: 'white',
                                        '&.Mui-checked': {
                                            color: 'primary.main'
                                        }
                                    }}
                                />
                            }
                            label='Celsius (°C)'
                        />
                    </RadioGroup>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <SelectElement
                        label='Left Gauge'
                        name={gauge1Field名称}
                        options={[
                            { id: 'cpu', label: 'CPU Usage' },
                            { id: 'temp', label: 'CPU Temperature' },
                            { id: 'ram', label: 'RAM Usage' },
                            { id: 'network', label: 'Network' },
                            { id: 'none', label: 'None' }
                        ]}
                        required
                        fullWidth
                        sx={selectStyling}
                        slotProps={{
                            inputLabel: { style: { color: theme.palette.text.primary } }
                        }}
                        onChange={handleGaugeChange('gauge1')}
                        value={gaugeValues.gauge1}
                    />
                </Box>
                <Box sx={{ mt: 2 }}>
                    <SelectElement
                        label='Middle Gauge'
                        name={gauge2Field名称}
                        options={[
                            { id: 'cpu', label: 'CPU Usage' },
                            { id: 'temp', label: 'CPU Temperature' },
                            { id: 'ram', label: 'RAM Usage' },
                            { id: 'network', label: 'Network' },
                            { id: 'none', label: 'None' }
                        ]}
                        required
                        fullWidth
                        sx={selectStyling}
                        slotProps={{
                            inputLabel: { style: { color: theme.palette.text.primary } }
                        }}
                        onChange={handleGaugeChange('gauge2')}
                        value={gaugeValues.gauge2}
                    />
                </Box>
                <Box sx={{ mt: 2 }}>
                    <SelectElement
                        label='Right Gauge'
                        name={gauge3Field名称}
                        options={[
                            { id: 'cpu', label: 'CPU Usage' },
                            { id: 'temp', label: 'CPU Temperature' },
                            { id: 'ram', label: 'RAM Usage' },
                            { id: 'network', label: 'Network' },
                            { id: 'none', label: 'None' }
                        ]}
                        required
                        fullWidth
                        sx={selectStyling}
                        slotProps={{
                            inputLabel: { style: { color: theme.palette.text.primary } }
                        }}
                        onChange={handleGaugeChange('gauge3')}
                        value={gaugeValues.gauge3}
                    />
                </Box>

                {/* Network Interface Selection - use shouldShowNetworkField for initial render */}
                {shouldShowNetworkField && (
                    <Box sx={{ mt: 2 }}>
                        <SelectElement
                            label='Network Interface'
                            name={networkInterfaceField名称}
                            options={networkInterfaces.length > 0 ? networkInterfaces : [{ id: '', label: 'No network interfaces available' }]}
                            required
                            fullWidth
                            disabled={networkInterfaces.length === 0}
                            sx={selectStyling}
                            slotProps={{
                                inputLabel: { style: { color: theme.palette.text.primary } }
                            }}
                        />
                    </Box>
                )}

                {/* Display Options */}
                <Box sx={{ mt: 3, mb: 2 }}>
                    <Typography variant='h6' sx={{ color: 'text.primary', mb: 2 }}>
                        Display Options
                    </Typography>
                </Box>

                <Box sx={{ width: '100%', mb: 2 }}>
                    <CheckboxElement
                        label='Show Disk Usage'
                        name={getField名称(position, 'showDiskUsage')}
                        sx={{
                            ml: 1,
                            color: 'white',
                            '& .MuiSvgIcon-root': { fontSize: 30 }
                        }}
                    />
                </Box>

                <Box sx={{ width: '100%', mb: 2 }}>
                    <CheckboxElement
                        label='Show System Info Button'
                        name={getField名称(position, 'showSystemInfo')}
                        sx={{
                            ml: 1,
                            color: 'white',
                            '& .MuiSvgIcon-root': { fontSize: 30 }
                        }}
                    />
                </Box>

                <Box sx={{ width: '100%', mb: 2 }}>
                    <CheckboxElement
                        label='Show Internet 状态'
                        name={getField名称(position, 'showInternet状态')}
                        sx={{
                            ml: 1,
                            color: 'white',
                            '& .MuiSvgIcon-root': { fontSize: 30 }
                        }}
                    />
                </Box>

                <Box sx={{ width: '100%', mb: 2 }}>
                    <CheckboxElement
                        label='Show IP in Tooltip'
                        name={getField名称(position, 'showIP')}
                        sx={{
                            ml: 1,
                            color: 'white',
                            '& .MuiSvgIcon-root': { fontSize: 30 }
                        }}
                    />
                </Box>

                {formContext.watch(getField名称(position, 'showIP')) && (
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <SelectElement
                            label='IP Display Type'
                            name={getField名称(position, 'ipDisplayType')}
                            options={[
                                { id: 'wan', label: 'WAN (Public IP)' },
                                { id: 'lan', label: 'LAN (Local IP)' },
                                { id: 'both', label: 'Both WAN & LAN' }
                            ]}
                            required
                            fullWidth
                            sx={selectStyling}
                            slotProps={{
                                inputLabel: { style: { color: theme.palette.text.primary } }
                            }}
                        />
                    </Box>
                )}
            </>
        );
    };

    // 创建 a custom wrapper for WeatherWidgetConfig to ensure temperature unit is properly set
    const WeatherConfigWrapper = ({ position }: { position: 'top' | 'bottom' }) => {
        // 创建 a context with only location handling, we'll handle temperature ourselves
        const positionContext = createLocationAwareContext(position);

        // 创建 local state that tracks the temperature unit value
        const [tempUnit, setTempUnit] = useState(() => {
            const value = formContext.getValues(getField名称(position, 'temperatureUnit')) || 'fahrenheit';
            return value as string;
        });

        // Handle temperature unit change
        const handleTempUnitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value as string;

            // Update local state
            setTempUnit(newValue);

            // Update form context
            formContext.setValue(getField名称(position, 'temperatureUnit'), newValue);

            // Update widget state
            setWidgetState(prev => {
                const positionKey = `${position}WidgetFields` as 'topWidgetFields' | 'bottomWidgetFields';
                return {
                    ...prev,
                    [positionKey]: {
                        ...prev[positionKey],
                        temperatureUnit: newValue
                    }
                };
            });
        };

        // 创建 a modified version of formContext for WeatherWidgetConfig that omits temperature unit handling
        const modifiedContext = {
            ...positionContext,
            // Override register to not handle temperatureUnit
            register: (name: string, options?: any) => {
                if (name === 'temperatureUnit') {
                    // Return a dummy registration that won't be used
                    return { name: 'dummy' };
                }
                return positionContext.register(name, options);
            },
            // Override setValue to not handle temperatureUnit
            setValue: (name: string, value: any, options?: any) => {
                if (name === 'temperatureUnit') {
                    return; // Don't do anything, we handle it ourselves
                }
                return positionContext.setValue(name, value, options);
            },
            // Override watch to not watch temperatureUnit
            watch: (name?: string) => {
                if (name === 'temperatureUnit') {
                    return tempUnit;
                }
                return positionContext.watch(name);
            },
            // Override getValues to not get temperatureUnit
            getValues: (name?: string) => {
                if (name === 'temperatureUnit') {
                    return tempUnit;
                }
                return positionContext.getValues(name);
            }
        };

        return (
            <Box sx={{ width: '100%' }}>
                {/* Our own temperature unit selector using radio buttons */}
                <Box sx={{ mb: 2, mt: 1 }}>
                    <Typography
                        variant='body2'
                        sx={{
                            color: 'white',
                            mb: 1,
                            ml: 1
                        }}
                    >
                        Temperature Unit:
                    </Typography>
                    <RadioGroup
                        name={getField名称(position, 'temperatureUnit')}
                        value={tempUnit}
                        onChange={handleTempUnitChange}
                        sx={{
                            flexDirection: 'row',
                            ml: 1,
                            '& .MuiFormControlLabel-label': {
                                color: 'white'
                            }
                        }}
                    >
                        <FormControlLabel
                            value='fahrenheit'
                            control={
                                <Radio
                                    sx={{
                                        color: 'white',
                                        '&.Mui-checked': {
                                            color: 'primary.main'
                                        }
                                    }}
                                />
                            }
                            label='Fahrenheit (°F)'
                        />
                        <FormControlLabel
                            value='celsius'
                            control={
                                <Radio
                                    sx={{
                                        color: 'white',
                                        '&.Mui-checked': {
                                            color: 'primary.main'
                                        }
                                    }}
                                />
                            }
                            label='Celsius (°C)'
                        />
                    </RadioGroup>
                </Box>

                {/* Pass only the location handling to WeatherWidgetConfig */}
                <Box sx={{ '& .MuiGrid2-root:first-of-type': { display: 'none' } }}>
                    <WeatherWidgetConfig formContext={modifiedContext as any} />
                </Box>
            </Box>
        );
    };

    // Wrapper for DateTime widget config with position-specific field names
    const DateTimeConfigWrapper = ({ position }: { position: 'top' | 'bottom' }) => {
        // Wrap with consistent styling to match single widget display
        return (
            <Box sx={{ width: '100%' }}>
                <DateTimeWidgetConfig
                    formContext={formContext as any}
                    field名称Prefix={position === 'top' ? 'top_' : 'bottom_'}
                />
            </Box>
        );
    };

    // 创建 a custom wrapper for PiholeWidgetConfig to ensure API token and password fields work correctly
    const PiholeConfigWrapper = ({ position }: { position: 'top' | 'bottom' }) => {
        // Track field values with local state
        const [host, setHost] = useState('');
        const [port, setPort] = useState('');
        const [apiToken, setApiToken] = useState('');
        const [password, set密码] = useState('');
        const [formInitialized, setFormInitialized] = useState(false);

        // Track if we have existing sensitive data (similar to regular PiholeWidgetConfig)
        const [hasExistingApiToken, setHasExistingApiToken] = useState(false);
        const [hasExisting密码, setHasExisting密码] = useState(false);

        // Field names for easier reference
        const hostField = getField名称(position, 'piholeHost');
        const portField = getField名称(position, 'piholePort');
        const apiTokenField = getField名称(position, 'piholeApiToken');
        const passwordField = getField名称(position, 'pihole密码');

        // Initialize masked values for existing items (similar to regular PiholeWidgetConfig)
        useEffect(() => {
            if (existingItem?.config) {
                const dualConfig = existingItem.config;
                const positionWidget = position === 'top' ? dualConfig.topWidget : dualConfig.bottomWidget;

                if (positionWidget?.config) {
                    const config = positionWidget.config;

                    // Check if existing item has sensitive data using security flags
                    if (config._hasApiToken) {
                        setHasExistingApiToken(true);
                        // Set masked value in form if not already set
                        const currentApiToken = formContext.getValues(apiTokenField);
                        if (!currentApiToken) {
                            formContext.setValue(apiTokenField, '**********');
                            setApiToken('**********');
                        } else {
                            setApiToken(typeof currentApiToken === 'string' ? currentApiToken : '');
                        }
                    }

                    if (config._has密码) {
                        setHasExisting密码(true);
                        // Set masked value in form if not already set
                        const current密码 = formContext.getValues(passwordField);
                        if (!current密码) {
                            formContext.setValue(passwordField, '**********');
                            set密码('**********');
                        } else {
                            set密码(typeof current密码 === 'string' ? current密码 : '');
                        }
                    }
                }
            }
        }, [existingItem, position, apiTokenField, passwordField]);

        // Initialize the component with values from the form
        useEffect(() => {
            if (formInitialized) return;

            // Get initial values from form context
            const initialHost = formContext.getValues(hostField);
            const initialPort = formContext.getValues(portField);
            const initialApiToken = formContext.getValues(apiTokenField);
            const initial密码 = formContext.getValues(passwordField);

            // Convert to strings, handling any non-string values
            const hostStr = typeof initialHost === 'string' ? initialHost : '';
            const portStr = typeof initialPort === 'string' ? initialPort : '';
            // For sensitive fields, use the values as they are (already masked from form initialization)
            const tokenStr = typeof initialApiToken === 'string' ? initialApiToken : '';
            const passwordStr = typeof initial密码 === 'string' ? initial密码 : '';

            // Set local state
            setHost(hostStr);
            setPort(portStr);

            // Handle mutual exclusivity for token/password at initialization
            // Only clear if both are non-masked values
            if (tokenStr && passwordStr && tokenStr !== '**********' && passwordStr !== '**********') {
                // If both have non-masked values, prioritize the token
                formContext.setValue(apiTokenField, tokenStr);
                formContext.setValue(passwordField, '');
                setApiToken(tokenStr);
                set密码('');
            } else {
                // Otherwise use whatever values we have (including masked values)
                setApiToken(tokenStr);
                set密码(passwordStr);
            }

            // Clear any validation errors since we've just loaded the values
            formContext.clearErrors(hostField);
            formContext.clearErrors(portField);
            formContext.clearErrors(apiTokenField);
            formContext.clearErrors(passwordField);

            // Mark as initialized so we don't run this again
            setFormInitialized(true);
        }, [hostField, portField, apiTokenField, passwordField, formInitialized]);

        // Handle host change
        const handleHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setHost(newValue);
            formContext.setValue(hostField, newValue, {
                shouldValidate: false,
                shouldDirty: true
            });
            formContext.clearErrors(hostField);
        };

        // Handle port change
        const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setPort(newValue);
            formContext.setValue(portField, newValue, {
                shouldValidate: false,
                shouldDirty: true
            });
            formContext.clearErrors(portField);
        };

        // Handle API token change
        const handleApiTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;

            setApiToken(newValue);
            formContext.setValue(apiTokenField, newValue, {
                shouldValidate: false,
                shouldDirty: true
            });

            // If token has a non-masked value, clear password and its validation errors
            if (newValue && newValue !== '**********') {
                set密码('');
                formContext.setValue(passwordField, '', {
                    shouldValidate: false,
                    shouldDirty: true
                });
                formContext.clearErrors(passwordField);
            }

            // Clear validation errors on this field
            formContext.clearErrors(apiTokenField);
        };

        // Handle password change
        const handle密码Change = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;

            set密码(newValue);
            formContext.setValue(passwordField, newValue, {
                shouldValidate: false,
                shouldDirty: true
            });

            // If password has a non-masked value, clear token and its validation errors
            if (newValue && newValue !== '**********') {
                setApiToken('');
                formContext.setValue(apiTokenField, '', {
                    shouldValidate: false,
                    shouldDirty: true
                });
                formContext.clearErrors(apiTokenField);
            }

            // Clear validation errors on this field
            formContext.clearErrors(passwordField);
        };

        // Clear validation errors when component unmounts to prevent stale errors
        useEffect(() => {
            return () => {
                formContext.clearErrors(hostField);
                formContext.clearErrors(portField);
                formContext.clearErrors(apiTokenField);
                formContext.clearErrors(passwordField);
            };
        }, [hostField, portField, apiTokenField, passwordField]);

        // Return the custom form with our controlled inputs
        return (
            <Box sx={{ width: '100%' }}>
                <Grid sx={{ width: '100%', mb: 2 }}>
                    <TextField
                        name={hostField}
                        label='Pi-hole Host'
                        variant='outlined'
                        fullWidth
                        autoComplete='off'
                        required
                        value={host}
                        onChange={handleHostChange}
                        error={!host}
                        helperText={!host ? 'Host is required' : ''}
                        sx={{
                            width: '100%',
                            minWidth: isMobile ? '65vw' : '20vw',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'text.primary',
                                },
                                '&:hover fieldset': { borderColor: 'primary.main' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main', },
                            },
                            '& .MuiFormHelperText-root': {
                                color: 'rgba(255, 0, 0, 0.7)'
                            }
                        }}
                        InputLabelProps={{
                            style: { color: theme.palette.text.primary }
                        }}
                    />
                </Grid>
                <Grid sx={{ width: '100%', mb: 2 }}>
                    <TextField
                        name={portField}
                        label='Port'
                        variant='outlined'
                        fullWidth
                        autoComplete='off'
                        required
                        value={port}
                        onChange={handlePortChange}
                        error={!port}
                        helperText={!port ? 'Port is required' : ''}
                        sx={{
                            width: '100%',
                            minWidth: isMobile ? '65vw' : '20vw',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'text.primary',
                                },
                                '&:hover fieldset': { borderColor: 'primary.main' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main', },
                            },
                            '& .MuiFormHelperText-root': {
                                color: 'rgba(255, 0, 0, 0.7)'
                            }
                        }}
                        InputLabelProps={{
                            style: { color: theme.palette.text.primary }
                        }}
                    />
                </Grid>
                <Grid sx={{ width: '100%', mb: 2 }}>
                    <TextFieldElement
                        name={getField名称(position, 'pihole名称')}
                        label='Display 名称'
                        variant='outlined'
                        placeholder='Pi-hole'
                        fullWidth
                        sx={{
                            width: '100%',
                            minWidth: isMobile ? '65vw' : '20vw',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'text.primary',
                                },
                                '&:hover fieldset': { borderColor: 'primary.main' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main', },
                            },
                        }}
                        slotProps={{
                            inputLabel: { style: { color: theme.palette.text.primary } }
                        }}
                    />
                </Grid>
                <Grid sx={{ width: '100%', mb: 2 }}>
                    {/* Use a regular TextField for better control */}
                    <TextField
                        name={apiTokenField}
                        label='API Token (Pi-hole v5)'
                        type='password'
                        variant='outlined'
                        fullWidth
                        autoComplete='off'
                        required={!password && !hasExistingApiToken}
                        disabled={Boolean(password && password !== '**********')}
                        error={!apiToken && !password && !hasExistingApiToken && !hasExisting密码}
                        value={apiToken}
                        onChange={handleApiTokenChange}
                        helperText={
                            password && password !== '**********' ? '密码 already provided' :
                                hasExistingApiToken && apiToken === '**********' ? 'Current API token is set (shown as ********). Clear field to remove or enter new token to replace.' :
                                    !apiToken && !password && !hasExistingApiToken && !hasExisting密码 ? 'Enter API token or password below' :
                                        'Enter the API token from Pi-hole 设置 > API/Web interface'
                        }
                        sx={{
                            width: '100%',
                            minWidth: isMobile ? '65vw' : '20vw',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'text.primary',
                                },
                                '&:hover fieldset': { borderColor: 'primary.main' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main', },
                            },
                            '& .MuiFormHelperText-root': {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }}
                        InputLabelProps={{
                            style: { color: theme.palette.text.primary }
                        }}
                    />
                </Grid>
                <Grid sx={{ width: '100%', mb: 2 }}>
                    {/* Use a regular TextField for better control */}
                    <TextField
                        name={passwordField}
                        label='密码 (Pi-hole v6)'
                        type='password'
                        variant='outlined'
                        fullWidth
                        autoComplete='off'
                        required={!apiToken && !hasExisting密码}
                        disabled={Boolean(apiToken && apiToken !== '**********')}
                        error={!apiToken && !password && !hasExistingApiToken && !hasExisting密码}
                        value={password}
                        onChange={handle密码Change}
                        helperText={
                            apiToken && apiToken !== '**********' ? 'API Token already provided' :
                                hasExisting密码 && password === '**********' &&
                                    !apiToken && !password && !hasExistingApiToken && !hasExisting密码 ? 'Enter password or API token above' :
                                    'Enter your Pi-hole admin password'
                        }
                        sx={{
                            width: '100%',
                            minWidth: isMobile ? '65vw' : '20vw',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'text.primary',
                                },
                                '&:hover fieldset': { borderColor: 'primary.main' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main', },
                            },
                            '& .MuiFormHelperText-root': {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }}
                        InputLabelProps={{
                            style: { color: theme.palette.text.primary }
                        }}
                    />
                </Grid>
                <Grid sx={{ width: '100%', mb: 2 }}>
                    <CheckboxElement
                        label='Use SSL'
                        name={getField名称(position, 'piholeSsl')}
                        sx={{
                            ml: 1,
                            color: 'white',
                            '& .MuiSvgIcon-root': { fontSize: 30 }
                        }}
                    />
                </Grid>
                <Grid sx={{ width: '100%', mb: 2 }}>
                    <CheckboxElement
                        label='Show 名称'
                        name={getField名称(position, 'showLabel')}
                        sx={{
                            ml: 1,
                            color: 'white',
                            '& .MuiSvgIcon-root': { fontSize: 30 }
                        }}
                    />
                </Grid>
            </Box>
        );
    };

    // 创建 a custom wrapper for AdGuardWidgetConfig to ensure username and password fields work correctly
    const AdGuardConfigWrapper = ({ position }: { position: 'top' | 'bottom' }) => {
        // Track field values with local state
        const [host, setHost] = useState('');
        const [port, setPort] = useState('');
        const [username, set用户名] = useState('');
        const [password, set密码] = useState('');
        const [formInitialized, setFormInitialized] = useState(false);

        // Track if we have existing sensitive data (similar to regular AdGuardWidgetConfig)
        const [hasExisting用户名, setHasExisting用户名] = useState(false);
        const [hasExisting密码, setHasExisting密码] = useState(false);

        // Field names for easier reference
        const hostField = getField名称(position, 'adguardHost');
        const portField = getField名称(position, 'adguardPort');
        const usernameField = getField名称(position, 'adguard用户名');
        const passwordField = getField名称(position, 'adguard密码');

        // Initialize masked values for existing items (similar to regular AdGuardWidgetConfig)
        useEffect(() => {
            if (existingItem?.config) {
                const dualConfig = existingItem.config;
                const positionWidget = position === 'top' ? dualConfig.topWidget : dualConfig.bottomWidget;

                if (positionWidget?.config) {
                    const config = positionWidget.config;

                    // Check if existing item has sensitive data using security flags
                    if (config._has用户名) {
                        setHasExisting用户名(true);
                        // Set masked value in form if not already set
                        const current用户名 = formContext.getValues(usernameField);
                        if (!current用户名) {
                            formContext.setValue(usernameField, '**********');
                            set用户名('**********');
                        } else {
                            set用户名(typeof current用户名 === 'string' ? current用户名 : '');
                        }
                    }

                    if (config._has密码) {
                        setHasExisting密码(true);
                        // Set masked value in form if not already set
                        const current密码 = formContext.getValues(passwordField);
                        if (!current密码) {
                            formContext.setValue(passwordField, '**********');
                            set密码('**********');
                        } else {
                            set密码(typeof current密码 === 'string' ? current密码 : '');
                        }
                    }
                }
            }
        }, [existingItem, position, usernameField, passwordField]);

        // Initialize the component with values from the form
        useEffect(() => {
            if (formInitialized) return;

            // Get initial values from form context
            const initialHost = formContext.getValues(hostField);
            const initialPort = formContext.getValues(portField);
            const initial用户名 = formContext.getValues(usernameField);
            const initial密码 = formContext.getValues(passwordField);

            // Convert to strings, handling any non-string values
            const hostStr = typeof initialHost === 'string' ? initialHost : '';
            const portStr = typeof initialPort === 'string' ? initialPort : '80';
            // For sensitive fields, use the values as they are (already masked from form initialization)
            const usernameStr = typeof initial用户名 === 'string' ? initial用户名 : '';
            const passwordStr = typeof initial密码 === 'string' ? initial密码 : '';

            // Set local state
            setHost(hostStr);
            setPort(portStr);
            set用户名(usernameStr);
            set密码(passwordStr);

            // Clear any validation errors since we've just loaded the values
            formContext.clearErrors(hostField);
            formContext.clearErrors(portField);
            formContext.clearErrors(usernameField);
            formContext.clearErrors(passwordField);

            // Mark as initialized so we don't run this again
            setFormInitialized(true);
        }, [hostField, portField, usernameField, passwordField, formInitialized]);

        // Handle host change
        const handleHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setHost(newValue);
            formContext.setValue(hostField, newValue, {
                shouldValidate: false,
                shouldDirty: true
            });
            formContext.clearErrors(hostField);
        };

        // Handle port change
        const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setPort(newValue);
            formContext.setValue(portField, newValue, {
                shouldValidate: false,
                shouldDirty: true
            });
            formContext.clearErrors(portField);
        };

        // Handle username change
        const handle用户名Change = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            set用户名(newValue);
            formContext.setValue(usernameField, newValue, {
                shouldValidate: false,
                shouldDirty: true
            });
            formContext.clearErrors(usernameField);
        };

        // Handle password change
        const handle密码Change = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            set密码(newValue);
            formContext.setValue(passwordField, newValue, {
                shouldValidate: false,
                shouldDirty: true
            });
            formContext.clearErrors(passwordField);
        };

        // Helper function to determine if field should be required
        const is用户名Required = () => {
            // 用户名 is required if password is provided (both are needed for Basic Auth)
            return Boolean(password && password !== '**********') || hasExisting密码;
        };

        const is密码Required = () => {
            // 密码 is required if username is provided (both are needed for Basic Auth)
            return Boolean(username && username !== '**********') || hasExisting用户名;
        };

        // Clear validation errors when component unmounts to prevent stale errors
        useEffect(() => {
            return () => {
                formContext.clearErrors(hostField);
                formContext.clearErrors(portField);
                formContext.clearErrors(usernameField);
                formContext.clearErrors(passwordField);
            };
        }, [hostField, portField, usernameField, passwordField]);

        // Return the custom form with our controlled inputs
        return (
            <Box sx={{ width: '100%' }}>
                <Grid sx={{ width: '100%', mb: 2 }}>
                    <TextField
                        name={hostField}
                        label='AdGuard Home Host'
                        variant='outlined'
                        fullWidth
                        autoComplete='off'
                        required
                        value={host}
                        onChange={handleHostChange}
                        error={!host}
                        helperText={!host ? 'Host is required' : ''}
                        sx={{
                            width: '100%',
                            minWidth: isMobile ? '65vw' : '20vw',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'text.primary',
                                },
                                '&:hover fieldset': { borderColor: 'primary.main' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main', },
                            },
                            '& .MuiFormHelperText-root': {
                                color: 'rgba(255, 0, 0, 0.7)'
                            }
                        }}
                        InputLabelProps={{
                            style: { color: theme.palette.text.primary }
                        }}
                    />
                </Grid>
                <Grid sx={{ width: '100%', mb: 2 }}>
                    <TextField
                        name={portField}
                        label='Port'
                        variant='outlined'
                        fullWidth
                        autoComplete='off'
                        required
                        value={port}
                        onChange={handlePortChange}
                        error={!port}
                        helperText={!port ? 'Port is required' : ''}
                        sx={{
                            width: '100%',
                            minWidth: isMobile ? '65vw' : '20vw',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'text.primary',
                                },
                                '&:hover fieldset': { borderColor: 'primary.main' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main', },
                            },
                            '& .MuiFormHelperText-root': {
                                color: 'rgba(255, 0, 0, 0.7)'
                            }
                        }}
                        InputLabelProps={{
                            style: { color: theme.palette.text.primary }
                        }}
                    />
                </Grid>
                <Grid sx={{ width: '100%', mb: 2 }}>
                    <TextFieldElement
                        name={getField名称(position, 'adguard名称')}
                        label='Display 名称'
                        variant='outlined'
                        placeholder='AdGuard Home'
                        fullWidth
                        sx={{
                            width: '100%',
                            minWidth: isMobile ? '65vw' : '20vw',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'text.primary',
                                },
                                '&:hover fieldset': { borderColor: 'primary.main' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main', },
                            },
                        }}
                        slotProps={{
                            inputLabel: { style: { color: theme.palette.text.primary } }
                        }}
                    />
                </Grid>
                <Grid sx={{ width: '100%', mb: 2 }}>
                    <TextField
                        name={usernameField}
                        label='用户名'
                        variant='outlined'
                        fullWidth
                        autoComplete='off'
                        required={is用户名Required()}
                        value={username}
                        onChange={handle用户名Change}
                        error={is用户名Required() && !username}
                        helperText={
                            hasExisting用户名 && username === '**********' ? 'Current username is set (shown as ********). Clear field to remove or enter new username to replace.' :
                                'Enter your AdGuard Home admin username'
                        }
                        sx={{
                            width: '100%',
                            minWidth: isMobile ? '65vw' : '20vw',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'text.primary',
                                },
                                '&:hover fieldset': { borderColor: 'primary.main' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main', },
                            },
                            '& .MuiFormHelperText-root': {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }}
                        InputLabelProps={{
                            style: { color: theme.palette.text.primary }
                        }}
                    />
                </Grid>
                <Grid sx={{ width: '100%', mb: 2 }}>
                    <TextField
                        name={passwordField}
                        label='密码'
                        type='password'
                        variant='outlined'
                        fullWidth
                        autoComplete='off'
                        required={is密码Required()}
                        value={password}
                        onChange={handle密码Change}
                        error={is密码Required() && !password}
                        helperText={
                            hasExisting密码 && password === '**********' ? 'Current password is set (shown as ********). Clear field to remove or enter new password to replace.' :
                                'Enter your AdGuard Home admin password'
                        }
                        sx={{
                            width: '100%',
                            minWidth: isMobile ? '65vw' : '20vw',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'text.primary',
                                },
                                '&:hover fieldset': { borderColor: 'primary.main' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main', },
                            },
                            '& .MuiFormHelperText-root': {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }}
                        InputLabelProps={{
                            style: { color: theme.palette.text.primary }
                        }}
                    />
                </Grid>
                <Grid sx={{ width: '100%', mb: 2 }}>
                    <CheckboxElement
                        label='Use SSL'
                        name={getField名称(position, 'adguardSsl')}
                        sx={{
                            ml: 1,
                            color: 'white',
                            '& .MuiSvgIcon-root': { fontSize: 30 }
                        }}
                    />
                </Grid>
                <Grid sx={{ width: '100%', mb: 2 }}>
                    <CheckboxElement
                        label='Show 名称'
                        name={getField名称(position, 'showLabel')}
                        sx={{
                            ml: 1,
                            color: 'white',
                            '& .MuiSvgIcon-root': { fontSize: 30 }
                        }}
                    />
                </Grid>
            </Box>
        );
    };

    const Disk监控ConfigWrapper = ({ position }: { position: 'top' | 'bottom' }) => {
        return (
            <Box sx={{ width: '100%' }}>
                <Disk监控WidgetConfig
                    formContext={formContext as any}
                    field名称Prefix={position === 'top' ? 'top_' : 'bottom_'}
                />
            </Box>
        );
    };

    // Render the appropriate widget config component with position-specific field names
    const renderWidgetConfig = (widgetType: string | undefined, position: 'top' | 'bottom') => {
        if (!widgetType) return null;

        switch (widgetType) {
        case ITEM_TYPE.DATE_TIME_WIDGET:
            // Date & Time widget now has additional configuration
            return <DateTimeConfigWrapper position={position} />;
        case ITEM_TYPE.WEATHER_WIDGET:
            return <WeatherConfigWrapper position={position} />;
        case ITEM_TYPE.SYSTEM_MONITOR_WIDGET:
            return (
                <Box sx={{ width: '100%' }}>
                    {/* Use the custom component for system monitor fields */}
                    <System监控Fields position={position} />
                </Box>
            );
        case ITEM_TYPE.PIHOLE_WIDGET:
            return <PiholeConfigWrapper position={position} />;
        case ITEM_TYPE.ADGUARD_WIDGET:
            return <AdGuardConfigWrapper position={position} />;
        case ITEM_TYPE.DISK_MONITOR_WIDGET:
            return <Disk监控ConfigWrapper position={position} />;
        default:
            return null;
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%'
        }}>
            {/* Replace pagination header with Tabs */}
            <Box sx={{
                width: '100%',
                borderBottom: `1px solid ${COLORS.BORDER}`,
                mb: 3
            }}>
                <Tabs
                    value={currentPage}
                    onChange={handleTabChange}
                    centered
                    indicatorColor='primary'
                    textColor='primary'
                    variant='fullWidth'
                    sx={{
                        minHeight: isMobile ? '42px' : '48px',
                        width: '100%',
                        '& .MuiTab-root': {
                            color: theme.palette.text.primary,
                            fontWeight: 'medium',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            padding: isMobile ? '6px 4px' : '12px 16px',
                            minWidth: isMobile ? '50%' : '90px',
                            flex: isMobile ? 1 : 'initial',
                            minHeight: isMobile ? '42px' : '48px',
                            '&:hover': {
                                color: 'primary.main',
                                opacity: 0.8
                            },
                            '&.Mui-selected': {
                                color: 'primary.main',
                                fontWeight: 'bold'
                            }
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: 'primary.main',
                            height: 3
                        }
                    }}
                >
                    <Tab label={'Top Widget'} />
                    <Tab label={'Bottom Widget'} />
                </Tabs>
            </Box>

            {/* Current Page Content */}
            <Grid container spacing={2} sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%'
            }}>
                {/* Top Widget Configuration Page */}
                {currentPage === 0 && (
                    <>
                        <Grid style={{ width: '100%' }}>
                            <SelectElement
                                label='Widget Type'
                                name='topWidgetType'
                                options={WIDGET_OPTIONS}
                                required
                                fullWidth
                                sx={selectStyling}
                                slotProps={{
                                    inputLabel: { style: { color: theme.palette.text.primary } }
                                }}
                            />
                        </Grid>

                        {topWidgetType && (
                            <Grid container sx={{
                                marginTop: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                width: '100%'
                            }}>
                                {renderWidgetConfig(topWidgetType, 'top')}
                            </Grid>
                        )}
                    </>
                )}

                {/* Bottom Widget Configuration Page */}
                {currentPage === 1 && (
                    <>
                        <Grid style={{ width: '100%' }}>
                            <SelectElement
                                label='Widget Type'
                                name='bottomWidgetType'
                                options={WIDGET_OPTIONS}
                                required
                                fullWidth
                                sx={selectStyling}
                                slotProps={{
                                    inputLabel: { style: { color: theme.palette.text.primary } }
                                }}
                            />
                        </Grid>

                        {bottomWidgetType && (
                            <Grid container sx={{
                                marginTop: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                width: '100%'
                            }}>
                                {renderWidgetConfig(bottomWidgetType, 'bottom')}
                            </Grid>
                        )}
                    </>
                )}
            </Grid>
        </Box>
    );
};
