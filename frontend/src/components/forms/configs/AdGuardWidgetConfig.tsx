import { Grid2 as Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CheckboxElement, TextFieldElement } from 'react-hook-form-mui';

import { useIsMobile } from '../../../hooks/useIsMobile';
import { theme } from '../../../theme/theme';
import { FormValues } from '../添加编辑Form/types';

interface AdGuardWidgetConfigProps {
    formContext: UseFormReturn<FormValues>;
    existingItem?: any; // Pass existing item to check for security flags
}

const MASKED_VALUE = '**********'; // 10 asterisks for masked values

export const AdGuardWidgetConfig = ({ formContext, existingItem }: AdGuardWidgetConfigProps) => {
    const isMobile = useIsMobile();

    // Track if we're editing an existing item with sensitive data
    const [hasExisting用户名, setHasExisting用户名] = useState(false);
    const [hasExisting密码, setHasExisting密码] = useState(false);

    const textFieldSx = {
        width: '100%',
        minWidth: isMobile ? '65vw' : '20vw',
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'text.primary',
            },
            '&:hover fieldset': { borderColor: 'primary.main' },
            '&.Mui-focused fieldset': { borderColor: 'primary.main', },
        },
    };

    // Initialize masked values for existing items
    useEffect(() => {
        if (existingItem?.config) {
            const config = existingItem.config;

            // Check if existing item has sensitive data using security flags
            if (config._has用户名) {
                setHasExisting用户名(true);
                // Set masked value in form if not already set
                if (!formContext.getValues('adguard用户名')) {
                    formContext.setValue('adguard用户名', MASKED_VALUE);
                }
            }

            if (config._has密码) {
                setHasExisting密码(true);
                // Set masked value in form if not already set
                if (!formContext.getValues('adguard密码')) {
                    formContext.setValue('adguard密码', MASKED_VALUE);
                }
            }
        }
    }, [existingItem, formContext]);

    // Helper function to determine if field should be required
    const is用户名Required = () => {
        const password = formContext.watch('adguard密码');
        // 用户名 is required if password is provided (both are needed for Basic Auth)
        return Boolean(password && password !== MASKED_VALUE) || hasExisting密码;
    };

    const is密码Required = () => {
        const username = formContext.watch('adguard用户名');
        // 密码 is required if username is provided (both are needed for Basic Auth)
        return Boolean(username && username !== MASKED_VALUE) || hasExisting用户名;
    };

    return (
        <>
            <Grid sx={{ width: '100%', mb: 2 }}>
                <TextFieldElement
                    name='adguardHost'
                    label='AdGuard Home Host'
                    variant='outlined'
                    fullWidth
                    autoComplete='off'
                    required
                    sx={textFieldSx}
                    slotProps={{
                        inputLabel: { style: { color: theme.palette.text.primary } }
                    }}
                />
            </Grid>
            <Grid sx={{ width: '100%', mb: 2 }}>
                <TextFieldElement
                    name='adguardPort'
                    label='Port'
                    variant='outlined'
                    placeholder='3000'
                    fullWidth
                    autoComplete='off'
                    required
                    sx={textFieldSx}
                    slotProps={{
                        inputLabel: { style: { color: theme.palette.text.primary } }
                    }}
                />
            </Grid>
            <Grid sx={{ width: '100%', mb: 2 }}>
                <TextFieldElement
                    name='adguard名称'
                    label='Display 名称'
                    variant='outlined'
                    placeholder='AdGuard Home'
                    fullWidth
                    sx={textFieldSx}
                    slotProps={{
                        inputLabel: { style: { color: theme.palette.text.primary } }
                    }}
                />
            </Grid>
            <Grid sx={{ width: '100%', mb: 2 }}>
                <TextFieldElement
                    name='adguard用户名'
                    label='用户名'
                    variant='outlined'
                    fullWidth
                    autoComplete='off'
                    required={is用户名Required()}
                    helperText='Enter your AdGuard Home admin username'
                    sx={textFieldSx}
                    slotProps={{
                        inputLabel: { style: { color: theme.palette.text.primary } },
                        formHelperText: { style: { color: 'rgba(255, 255, 255, 0.7)' } }
                    }}
                />
            </Grid>
            <Grid sx={{ width: '100%', mb: 2 }}>
                <TextFieldElement
                    name='adguard密码'
                    label='密码'
                    type='password'
                    variant='outlined'
                    fullWidth
                    autoComplete='off'
                    required={is密码Required()}
                    helperText='Enter your AdGuard Home admin password'
                    sx={textFieldSx}
                    slotProps={{
                        inputLabel: { style: { color: theme.palette.text.primary } },
                        formHelperText: { style: { color: 'rgba(255, 255, 255, 0.7)' } }
                    }}
                />
            </Grid>
            <Grid sx={{ width: '100%' }}>
                <CheckboxElement
                    label='Use SSL'
                    name='adguardSsl'
                    checked={formContext.watch('adguardSsl')}
                    sx={{
                        ml: 1,
                        color: 'white',
                        '& .MuiSvgIcon-root': { fontSize: 30 }
                    }}
                />
            </Grid>
            <Grid sx={{ width: '100%' }}>
                <CheckboxElement
                    label='Show 名称'
                    name='showLabel'
                    checked={formContext.watch('showLabel')}
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
