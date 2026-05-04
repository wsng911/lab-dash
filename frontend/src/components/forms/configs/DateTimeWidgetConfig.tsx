import ClearIcon from '@mui/icons-material/Clear';
import { Autocomplete, Grid2 as Grid, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { CheckboxElement, UseFormReturn } from 'react-hook-form-mui';

import { DashApi } from '../../../api/dash-api';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { theme } from '../../../theme/theme';
import { FormValues } from '../添加编辑Form/types';

interface LocationOption {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

interface DateTimeWidgetConfigProps {
    formContext: UseFormReturn<FormValues>;
    field名称Prefix?: string;
}

export const DateTimeWidgetConfig = ({ formContext, field名称Prefix = '' }: DateTimeWidgetConfigProps) => {
    // Helper to get field name with optional prefix
    const getField名称 = (base名称: string) => {
        return field名称Prefix ? `${field名称Prefix}${base名称}` : base名称;
    };
    const isMobile = useIsMobile();
    const [location搜索, setLocation搜索] = useState('');
    const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
    const [is搜索ing, setIs搜索ing] = useState(false);
    const [isFetchingTimezone, setIsFetchingTimezone] = useState(false);
    const [timezoneError, setTimezoneError] = useState<string | null>(null);

    // Initialize location state if it exists in form values
    useEffect(() => {
        const locationValue = formContext.getValues(getField名称('location') as any);
        if (locationValue) {
            setSelectedLocation(locationValue as LocationOption);
            setLocation搜索(locationValue.name || '');

            // If location exists but no timezone, try to fetch it
            const timezone = formContext.getValues(getField名称('timezone') as any);
            if (locationValue && !timezone && locationValue.latitude && locationValue.longitude) {
                fetchTimezoneForLocation(locationValue.latitude, locationValue.longitude);
            }
        }
    }, [formContext]);

    // Function to fetch timezone for a location
    const fetchTimezoneForLocation = async (latitude: number, longitude: number) => {
        setIsFetchingTimezone(true);
        setTimezoneError(null);

        try {
            const response = await DashApi.getTimezone(latitude, longitude);

            if (response && response.data && response.data.timezone) {
                // Set the timezone in the form
                const timezone = response.data.timezone;
                formContext.setValue(getField名称('timezone') as any, timezone, { shouldDirty: true });
            } else {
                setTimezoneError('Failed to fetch timezone: Invalid response format');

                // Set an empty string timezone to ensure the property exists
                formContext.setValue(getField名称('timezone') as any, '', { shouldDirty: true });
            }
        } catch (error) {
            // More detailed error handling
            if (error instanceof Error) {
                setTimezoneError(`Error: ${error.message}`);
            } else {
                setTimezoneError('Unknown error fetching timezone');
            }

            // Set an empty string timezone to ensure the property exists
            formContext.setValue(getField名称('timezone') as any, '', { shouldDirty: true });
        } finally {
            setIsFetchingTimezone(false);
        }
    };

    // Debounce location search and fetch results
    useEffect(() => {
        const fetchLocations = async () => {
            if (location搜索.length < 2) {
                setLocationOptions([]);
                return;
            }

            setIs搜索ing(true);
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location搜索)}&limit=5`);
                const data = await response.json();

                // 创建 a Map to track seen names and ensure uniqueness
                const uniqueLocations = new Map();

                // Process each location, ensuring uniqueness
                data.forEach((item: any) => {
                    const name = item.display_name;
                    // Use a combination of place_id and name as the unique key
                    const uniqueId = `${item.place_id}_${name}`;

                    if (!uniqueLocations.has(name)) {
                        uniqueLocations.set(name, {
                            id: uniqueId,
                            name: name,
                            latitude: parseFloat(item.lat),
                            longitude: parseFloat(item.lon)
                        });
                    }
                });

                // Convert the Map values to an array
                const results = Array.from(uniqueLocations.values());

                setLocationOptions(results);
            } catch (error) {
                console.error('Error fetching locations:', error);
                setLocationOptions([]);
            } finally {
                setIs搜索ing(false);
            }
        };

        const timer = setTimeout(() => {
            if (location搜索) {
                fetchLocations();
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [location搜索]);

    // When a location is selected, update the form values and fetch timezone
    const handleLocationSelected = (newLocation: LocationOption | null) => {
        if (!newLocation) {
            setSelectedLocation(null);
            formContext.setValue(getField名称('location') as any, null);
            formContext.setValue(getField名称('timezone') as any, '');
            return;
        }

        // Update selected location state
        setSelectedLocation(newLocation);

        // Update form with location data
        formContext.setValue(getField名称('location') as any, {
            name: newLocation.name,
            latitude: newLocation.latitude,
            longitude: newLocation.longitude
        });

        // Fetch and set timezone for this location
        fetchTimezoneForLocation(newLocation.latitude, newLocation.longitude);
    };

    return (
        <>
            <Grid>
                <Autocomplete
                    options={locationOptions}
                    getOptionLabel={(option) => {
                        // Handle both string and LocationOption types
                        if (typeof option === 'string') {
                            return option;
                        }
                        return option.name;
                    }}
                    inputValue={location搜索}
                    onInputChange={(_, newValue) => {
                        setLocation搜索(newValue);
                    }}
                    onChange={(_, newValue) => {
                        // Handle both string and LocationOption types
                        if (typeof newValue === 'string' || !newValue) {
                            handleLocationSelected(null);
                        } else {
                            handleLocationSelected(newValue);
                        }
                    }}
                    loading={is搜索ing}
                    loadingText={
                        <Typography style={{ color: theme.palette.text.primary }}>
                            搜索ing...
                        </Typography>
                    }
                    noOptionsText={
                        <Typography style={{ color: theme.palette.text.primary }}>
                            {location搜索.length < 2 ? 'Type to search...' : 'No locations found'}
                        </Typography>
                    }
                    fullWidth
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    clearOnBlur={false}
                    clearOnEscape
                    value={selectedLocation}
                    freeSolo
                    clearIcon={<ClearIcon style={{ color: theme.palette.text.primary }} />}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label='搜索 location'
                            variant='outlined'
                            helperText={isFetchingTimezone ? 'Fetching timezone...' : (timezoneError || 'Enter a zip code or city')}
                            FormHelperTextProps={{
                                style: {
                                    color: timezoneError
                                        ? 'rgba(255, 0, 0, 0.7)'
                                        : theme.palette.text.primary
                                }
                            }}
                            sx={{
                                width: '100%',
                                minWidth: isMobile ? '65vw' : '20vw',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'text.primary',
                                    },
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                    '&.Mui-focused fieldset': { borderColor: 'primary.main', },
                                }
                            }}
                            InputLabelProps={{
                                style: { color: theme.palette.text.primary }
                            }}
                        />
                    )}
                />
            </Grid>
            <Grid>
                <CheckboxElement
                    label='Use 24-hour format'
                    name={getField名称('use24Hour')}
                    sx={{
                        ml: 1,
                        color: 'white',
                        '& .MuiSvgIcon-root': { fontSize: 30 }
                    }}
                />
            </Grid>
        </>
    );
};
