import ClearIcon from '@mui/icons-material/Clear';
import { Autocomplete, Box, FormControlLabel, Grid2 as Grid, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { useIsMobile } from '../../../hooks/useIsMobile';
import { theme } from '../../../theme/theme';
import { FormValues } from '../添加编辑Form/types';

const TEMPERATURE_UNIT_OPTIONS = [
    { id: 'fahrenheit', label: 'Fahrenheit (°F)' },
    { id: 'celsius', label: 'Celsius (°C)' }
];

interface LocationOption {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

interface WeatherWidgetConfigProps {
    formContext: UseFormReturn<FormValues>;
}

export const WeatherWidgetConfig = ({ formContext }: WeatherWidgetConfigProps) => {
    const isMobile = useIsMobile();
    const [location搜索, setLocation搜索] = useState('');
    const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
    const [is搜索ing, setIs搜索ing] = useState(false);

    // Watch the temperature unit directly from the form
    const watchedTemperatureUnit = formContext.watch('temperatureUnit');
    const [temperatureUnit, setTemperatureUnit] = useState<string>(
        watchedTemperatureUnit || formContext.getValues('temperatureUnit') || 'fahrenheit'
    );

    // Initialize location state if it exists in form values
    useEffect(() => {
        const locationValue = formContext.getValues('location');
        if (locationValue) {
            setSelectedLocation(locationValue as LocationOption);
            setLocation搜索(locationValue.name || '');
        }
    }, [formContext]);

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

    // When a location is selected, update the form values
    useEffect(() => {
        if (selectedLocation) {
            formContext.setValue('location', {
                name: selectedLocation.name,
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude
            });
        }
    }, [selectedLocation, formContext]);

    return (
        <>
            <Grid>
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
                        name='temperatureUnit'
                        value={temperatureUnit}
                        onChange={(e) => {
                            setTemperatureUnit(e.target.value);
                            formContext.setValue('temperatureUnit', e.target.value);
                        }}
                        sx={{
                            flexDirection: 'row',
                            ml: 1,
                            '& .MuiFormControlLabel-label': {
                                color: 'white'
                            }
                        }}
                    >
                        {TEMPERATURE_UNIT_OPTIONS.map((option) => (
                            <FormControlLabel
                                key={option.id}
                                value={option.id}
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
                                label={option.label}
                            />
                        ))}
                    </RadioGroup>
                </Box>
            </Grid>
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
                            setSelectedLocation(null);
                            formContext.setValue('location', null);
                        } else {
                            setSelectedLocation(newValue);
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
                            helperText='Enter a zip code or city'
                            FormHelperTextProps={{
                                style: { color: theme.palette.text.primary }
                            }}
                            sx={{
                                width: '100%',
                                minWidth: isMobile ? '65vw' : '20vw',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'text.primary',
                                    },
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                                }
                            }}
                            InputLabelProps={{
                                style: { color: theme.palette.text.primary }
                            }}
                        />
                    )}
                />
            </Grid>
        </>
    );
};
