import { Box, FormControlLabel, Grid2 as Grid, Radio, RadioGroup, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CheckboxElement, TextFieldElement } from 'react-hook-form-mui';

import { useIsMobile } from '../../../hooks/useIsMobile';
import { theme } from '../../../theme/theme';
import { FormValues } from '../添加编辑Form/types';

const MEDIA_SERVER_OPTIONS = [
    { id: 'jellyfin', label: 'Jellyfin' },
    { id: 'emby', label: 'Emby' },
    // { id: 'plex', label: 'Plex (Coming Soon)' }
];

interface MediaServerWidgetConfigProps {
    formContext: UseFormReturn<FormValues>;
}

export const MediaServerWidgetConfig = ({ formContext }: MediaServerWidgetConfigProps) => {
    const isMobile = useIsMobile();

    // Watch the media server type directly from the form
    const watchedMediaServerType = formContext.watch('mediaServerType');
    const [mediaServerType, setMediaServerType] = useState<string>(
        watchedMediaServerType || formContext.getValues('mediaServerType') || 'jellyfin'
    );

    const textFieldStyling = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'text.primary',
            },
            '&:hover fieldset': { borderColor: 'primary.main' },
            '&.Mui-focused fieldset': { borderColor: 'primary.main' },
        },
        width: '100%',
        minWidth: isMobile ? '50vw' : '20vw'
    };

    useEffect(() => {
        if (watchedMediaServerType) {
            setMediaServerType(watchedMediaServerType);

            // Set default port if there's no existing port value (for new widgets)
            const currentPort = formContext.getValues('msPort');
            if (!currentPort || currentPort === '') {
                const defaultPort = watchedMediaServerType === 'plex' ? '32400' : '8096';
                formContext.setValue('msPort', defaultPort);
            }

            // Set default display name if there's no existing name value (for new widgets)
            const current名称 = formContext.getValues('mediaServer名称');
            if (!current名称 || current名称 === '') {
                const default名称 = watchedMediaServerType === 'plex' ? 'Plex' :
                    watchedMediaServerType === 'emby' ? 'Emby' : 'Jellyfin';
                formContext.setValue('mediaServer名称', default名称);
            }
        }
    }, [watchedMediaServerType, formContext]);

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
                        Select Media Server:
                    </Typography>
                    <RadioGroup
                        name='mediaServerType'
                        value={mediaServerType}
                        onChange={(e) => {
                            const newType = e.target.value;
                            setMediaServerType(newType);
                            formContext.setValue('mediaServerType', newType);

                            // Update display name based on selected type
                            const display名称 = newType === 'plex' ? 'Plex' :
                                newType === 'emby' ? 'Emby' : 'Jellyfin';
                            formContext.setValue('mediaServer名称', display名称);
                        }}
                        sx={{
                            flexDirection: 'row',
                            ml: 1,
                            '& .MuiFormControlLabel-label': {
                                color: 'white'
                            }
                        }}
                    >
                        {MEDIA_SERVER_OPTIONS.map((option) => (
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
                <TextFieldElement
                    label='Display 名称'
                    name='mediaServer名称'
                    fullWidth
                    sx={textFieldStyling}
                    slotProps={{
                        inputLabel: { style: { color: theme.palette.text.primary } }
                    }}
                    placeholder='Jellyfin'
                />
            </Grid>

            <Grid>
                <TextFieldElement
                    name='msHost'
                    label='Host'
                    variant='outlined'
                    fullWidth
                    autoComplete='off'
                    required
                    sx={textFieldStyling}
                    slotProps={{
                        inputLabel: { style: { color: theme.palette.text.primary } }
                    }}
                    placeholder='192.168.1.100 or jellyfin.example.com'
                />
            </Grid>

            <Grid>
                <TextFieldElement
                    name='msPort'
                    label='Port'
                    variant='outlined'
                    fullWidth
                    autoComplete='off'
                    required
                    sx={textFieldStyling}
                    slotProps={{
                        inputLabel: { style: { color: theme.palette.text.primary } }
                    }}
                />
            </Grid>

            <Grid>
                <TextFieldElement
                    name='msApiKey'
                    label='API Key'
                    type='password'
                    variant='outlined'
                    fullWidth
                    autoComplete='off'
                    required
                    sx={textFieldStyling}
                    slotProps={{
                        inputLabel: { style: { color: theme.palette.text.primary } }
                    }}
                    helperText='Generate in Jellyfin: 仪表盘 > API Keys'
                    rules={{
                        required: 'API Key is required',
                        validate: (value: string) => {
                            // Allow masked value for existing widgets
                            if (value === '**********') return true;
                            // Require actual value for new widgets or when changed
                            if (!value || value.trim() === '') {
                                return 'API Key is required';
                            }
                            return true;
                        }
                    }}
                />
            </Grid>

            <Grid>
                <CheckboxElement
                    label='Use SSL'
                    name='msSsl'
                    checked={formContext.watch('msSsl')}
                    sx={{
                        ml: 1,
                        color: 'white',
                        '& .MuiSvgIcon-root': { fontSize: 30 }
                    }}
                />
            </Grid>

            <Grid>
                <CheckboxElement
                    label='Show Label'
                    name='showLabel'
                    checked={formContext.watch('showLabel') !== false}
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
