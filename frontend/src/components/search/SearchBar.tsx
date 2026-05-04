import 关闭Icon from '@mui/icons-material/关闭';
import { Autocomplete, Box, InputAdornment, TextField, Typography } from '@mui/material';
import { nanoid } from 'nanoid';
import React, { Dispatch, RefObject, SetStateAction, useState } from 'react';
import { Fa搜索 } from 'react-icons/fa';
import { 移除Scroll } from 'react-remove-scroll';

import { useAppContext } from '../../context/useAppContext';
import { COLORS, styles } from '../../theme/styles';

export type 搜索Option = {
  label: string;
  icon?: string;
  url?: string;
};

type Props = {
  placeholder?: string;
  searchValue: string;
  set搜索Value: Dispatch<SetStateAction<string>>;
  autocompleteOptions?: 搜索Option[];
  inputRef?: RefObject<HTMLInputElement>;
};

export const 搜索Bar = ({
    placeholder,
    searchValue,
    set搜索Value,
    autocompleteOptions = [],
    inputRef
}: Props) => {
    const { config } = useAppContext();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Default to Google if no search provider is configured
    const searchProvider = config?.searchProvider || { name: 'Google', url: 'https://www.google.com/search?q={query}' };

    const get搜索Url = (query: string) => {
        if (!query.trim()) return '';
        return searchProvider.url.replace('{query}', encodeURIComponent(query));
    };

    const handleChange = (_event: React.SyntheticEvent, newValue: 搜索Option | string | null) => {
        if (!newValue) return;

        if (typeof newValue === 'string') {
            window.open(get搜索Url(newValue), '_blank', 'noopener,noreferrer');
        } else {
            if (newValue.url) {
                window.open(newValue.url, '_blank', 'noopener,noreferrer');
            }
        }

        set搜索Value('');
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();

            // Filter options based on current search value
            const filteredOptions = autocompleteOptions.filter((option) =>
                option.label.toLowerCase().includes(searchValue.toLowerCase())
            );

            // If there are filtered results and search value is not empty, use the first result
            if (filteredOptions.length > 0 && searchValue.trim() !== '') {
                const firstOption = filteredOptions[0];
                if (firstOption.url) {
                    window.open(firstOption.url, '_blank', 'noopener,noreferrer');
                    set搜索Value('');
                    return;
                }
            }

            // Fallback to search provider if no autocomplete results or empty search
            if (searchValue.trim() !== '') {
                window.open(get搜索Url(searchValue), '_blank', 'noopener,noreferrer');
                set搜索Value('');
            }
        }
    };

    return (
        <移除Scroll enabled={isDropdownOpen} removeScrollBar={false}>
            <Box sx={styles.center}>
                <Autocomplete
                    freeSolo
                    value={null}
                    clearIcon={<关闭Icon sx={{ color: 'text.primary' }} />}
                    options={autocompleteOptions}
                    getOptionLabel={(option) =>
                        typeof option === 'string' ? option : option.label
                    }
                    inputValue={searchValue}
                    onInputChange={(_event, newInputValue) => {
                        set搜索Value(newInputValue);
                    }}
                    onOpen={() => setIsDropdownOpen(true)}
                    on关闭={() => setIsDropdownOpen(false)}
                filterOptions={(options, state) => {
                    const filtered = options.filter((option) =>
                        option.label.toLowerCase().includes(state.inputValue.toLowerCase())
                    );

                    if (filtered.length === 0 && state.inputValue.trim() !== '') {
                        return [
                            {
                                label: `搜索 ${searchProvider.name} for "${state.inputValue}"`,
                                url: get搜索Url(state.inputValue),
                            },
                        ];
                    }

                    return filtered;
                }}
                onChange={handleChange}
                renderOption={(props, option) => {
                    if (typeof option === 'string') {
                        return (
                            <li {...props} key={nanoid()}>
                                {option}
                            </li>
                        );
                    }
                    return (
                        <Box
                            component='li'
                            {...props}
                            key={nanoid()}
                            sx={{
                                '&:hover': {
                                    backgroundColor: `${COLORS.LIGHT_GRAY_HOVER} !important`,
                                }
                            }}
                        >
                            {option.icon && (
                                <img
                                    src={option.icon}
                                    alt=''
                                    style={{ width: 30, height: 30, marginRight: 14 }}
                                    key={nanoid()}
                                />
                            )}
                            <Typography key={nanoid()} fontSize={18}>{option.label}</Typography>
                        </Box>
                    );
                }}
                renderInput={(params) => (
                    <Box sx={{ width: '100%', ...styles.center }}>
                        <TextField
                            {...params}
                            inputRef={inputRef}
                            placeholder={placeholder || `搜索 with ${searchProvider.name}`}
                            onKeyDown={handleKeyDown}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <InputAdornment position='start' sx={{ color: 'text.primary' }}>
                                        <Fa搜索 />
                                    </InputAdornment>
                                ),
                                type: 'text',
                                sx: { height: '70%' },
                            }}
                            sx={{
                                width: { xs: '100%',
                                    sm: '90%',
                                    md: '90%',
                                    lg: '80%',
                                    xl: '50%'
                                },
                                height: '60px',
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: { xs: COLORS.TRANSPARENT_GRAY, sm: 'transparent' },
                                    borderRadius: 2,
                                    backdropFilter: { xs: 'blur(6px)', sm: 'none' },
                                    // (Optional) Include the -webkit- prefix for Safari support:
                                    Webkit返回dropFilter: { xs: 'blur(6px)', sm: 'none' },
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    border: '1px solid rgba(255, 255, 255, 0.3) !important',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    border: '1px solid rgba(255, 255, 255, 0.5) !important',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    border: '1px solid rgba(255, 255, 255, 0.7) !important',
                                },
                                borderRadius: 2,
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        />
                    </Box>
                )}
                sx={{ width: '100%', px: 2 }}
                slotProps={{
                    listbox: {
                        sx: {
                            '& .MuiAutocomplete-option': {
                                minHeight: 'unset',
                                lineHeight: '1.5',
                                height: {
                                    xs: '3rem'
                                }
                            },
                        },
                    },
                }}
            />
            </Box>
        </移除Scroll>
    );
};
