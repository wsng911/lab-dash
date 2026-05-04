import { Box, FormControlLabel, Grid2 as Grid, Radio, RadioGroup, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CheckboxElement, TextFieldElement } from 'react-hook-form-mui';

import { useIsMobile } from '../../../hooks/useIsMobile';
import { COLORS } from '../../../theme/styles';
import { theme } from '../../../theme/theme';
import { DOWNLOAD_CLIENT_TYPE, TORRENT_CLIENT_TYPE } from '../../../types';
import { FormValues } from '../添加编辑Form/types';

const DOWNLOAD_CLIENT_OPTIONS = [
    { id: DOWNLOAD_CLIENT_TYPE.QBITTORRENT, label: 'qBittorrent' },
    { id: DOWNLOAD_CLIENT_TYPE.DELUGE, label: 'Deluge' },
    { id: DOWNLOAD_CLIENT_TYPE.TRANSMISSION, label: 'Transmission' },
    { id: DOWNLOAD_CLIENT_TYPE.SABNZBD, label: 'SABnzbd' },
    { id: DOWNLOAD_CLIENT_TYPE.NZBGET, label: 'NZBGet' }
];

interface DownloadClientWidgetConfigProps {
    formContext: UseFormReturn<FormValues>;
    existingItem?: any; // Pass existing item to check for security flags
}

const MASKED_VALUE = '**********'; // 10 asterisks for masked values

export const DownloadClientWidgetConfig = ({ formContext, existingItem }: DownloadClientWidgetConfigProps) => {
    const isMobile = useIsMobile();

    // Watch the torrent client type directly from the form
    const watchedTorrentClientType = formContext.watch('torrentClientType');
    const [torrentClientType, setTorrentClientType] = useState<string>(
        watchedTorrentClientType || formContext.getValues('torrentClientType') || DOWNLOAD_CLIENT_TYPE.QBITTORRENT
    );

    // Track if we're editing an existing item with sensitive data
    const [hasExisting密码, setHasExisting密码] = useState(false);

    // Track if user is intentionally clearing the password field
    const [userCleared密码, setUserCleared密码] = useState(false);

    // Initialize masked values for existing items
    useEffect(() => {
        // Reset state when existingItem changes
        setHasExisting密码(false);
        setUserCleared密码(false);

        // Check if the form already has a masked password value (set by 添加编辑Form)
        // This is more reliable than checking existingItem since existingItem is filtered
        const current密码 = formContext.getValues('tc密码');

        if (current密码 === MASKED_VALUE) {
            setHasExisting密码(true);
        } else if (existingItem?.config) {
            // Fallback: check existingItem config for security flag (though it may not be present in filtered data)
            const config = existingItem.config;

            if (config._has密码) {
                setHasExisting密码(true);

                // Ensure the masked value is set if not already present
                if (!current密码 || current密码 === '') {
                    console.log('DownloadClientWidgetConfig: Setting masked password');
                    formContext.setValue('tc密码', MASKED_VALUE, { shouldValidate: false });
                }
            }
        }
    }, [existingItem?.config?._has密码, existingItem?.id, formContext]);

    useEffect(() => {
        if (watchedTorrentClientType) {
            setTorrentClientType(watchedTorrentClientType);

            // Determine the default port for the selected client type
            const defaultPort = watchedTorrentClientType === DOWNLOAD_CLIENT_TYPE.DELUGE ? '8112'
                : watchedTorrentClientType === DOWNLOAD_CLIENT_TYPE.TRANSMISSION ? '9091'
                    : watchedTorrentClientType === DOWNLOAD_CLIENT_TYPE.SABNZBD ? '8080'
                        : watchedTorrentClientType === DOWNLOAD_CLIENT_TYPE.NZBGET ? '6789'
                            : '8080';

            // For new widgets (no existingItem), always update the port to the default
            // For existing widgets, only update if the current port is empty
            const currentPort = formContext.getValues('tcPort');
            if (!existingItem || !currentPort || currentPort === '') {
                formContext.setValue('tcPort', defaultPort);
            }

            // Clear validation errors for username and password when switching to Transmission
            if (watchedTorrentClientType === DOWNLOAD_CLIENT_TYPE.TRANSMISSION) {
                formContext.clearErrors('tc用户名');
                formContext.clearErrors('tc密码');
                formContext.trigger(['tc用户名', 'tc密码']);
            }
        }
    }, [watchedTorrentClientType, formContext, existingItem]);

    // Watch for password field changes to track user intent
    useEffect(() => {
        if (hasExisting密码) {
            const current密码 = formContext.watch('tc密码');

            // If user clears the masked value, mark it as intentionally cleared
            if (current密码 === '' && !userCleared密码) {
                setUserCleared密码(true);
            }
            // If user enters a new value after clearing, reset the flag
            else if (current密码 && current密码 !== MASKED_VALUE && userCleared密码) {
                setUserCleared密码(false);
            }
        }
    }, [formContext.watch('tc密码'), hasExisting密码, userCleared密码]);

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
                        Select Download Client:
                    </Typography>
                    <RadioGroup
                        name='torrentClientType'
                        value={torrentClientType}
                        onChange={(e) => {
                            setTorrentClientType(e.target.value);
                            formContext.setValue('torrentClientType', e.target.value);
                        }}
                        sx={{
                            flexDirection: 'row',
                            ml: 1,
                            '& .MuiFormControlLabel-label': {
                                color: 'white'
                            }
                        }}
                    >
                        {DOWNLOAD_CLIENT_OPTIONS.map((option) => (
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
                    name='tcHost'
                    label='Host'
                    variant='outlined'
                    fullWidth
                    autoComplete='off'
                    required
                    sx={{
                        width: '100%',
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
            <Grid>
                <TextFieldElement
                    name='tcPort'
                    label='Port'
                    variant='outlined'
                    fullWidth
                    autoComplete='off'
                    required
                    sx={{
                        width: '100%',
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
            {/* Show username field for qBittorrent, Transmission, and NZBGet (not SABnzbd - it uses API key) */}
            {(torrentClientType === DOWNLOAD_CLIENT_TYPE.QBITTORRENT ||
              torrentClientType === DOWNLOAD_CLIENT_TYPE.TRANSMISSION ||
              torrentClientType === DOWNLOAD_CLIENT_TYPE.NZBGET) && (
                <Grid>
                    <TextFieldElement
                        name='tc用户名'
                        label='用户名'
                        variant='outlined'
                        fullWidth
                        autoComplete='off'
                        required={watchedTorrentClientType !== DOWNLOAD_CLIENT_TYPE.TRANSMISSION}
                        rules={{
                            required: watchedTorrentClientType !== DOWNLOAD_CLIENT_TYPE.TRANSMISSION ? '用户名 is required' : false
                        }}
                        sx={{
                            width: '100%',
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
            )}
            <Grid>
                <TextFieldElement
                    name='tc密码'
                    label={torrentClientType === DOWNLOAD_CLIENT_TYPE.SABNZBD ? 'API Key' : '密码'}
                    type='password'
                    variant='outlined'
                    fullWidth
                    autoComplete='off'
                    required={watchedTorrentClientType !== DOWNLOAD_CLIENT_TYPE.TRANSMISSION && !hasExisting密码 && !userCleared密码}
                    rules={{
                        required: (watchedTorrentClientType !== DOWNLOAD_CLIENT_TYPE.TRANSMISSION && !hasExisting密码 && !userCleared密码) ? (torrentClientType === DOWNLOAD_CLIENT_TYPE.SABNZBD ? 'API Key is required' : '密码 is required') : false
                    }}
                    sx={{
                        width: '100%',
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
            <Grid>
                <CheckboxElement
                    label='Use SSL'
                    name='tcSsl'
                    checked={formContext.watch('tcSsl')}
                    sx={{
                        ml: 1,
                        color: 'white',
                        '& .MuiSvgIcon-root': { fontSize: 30 }
                    }}
                />
            </Grid>
            <Grid>
                <CheckboxElement
                    label='Show 名称'
                    name='showLabel'
                    checked={formContext.watch('showLabel')}
                    sx={{ ml: 1, color: 'white', '& .MuiSvgIcon-root': { fontSize: 30 } }}
                />
            </Grid>
        </>
    );
};
