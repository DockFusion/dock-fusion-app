import { FormControl, FormHelperText, TextField } from '@mui/material';

interface Props {
    value?: string;
    error?: string;
    onChange?: (newValue: string) => void;
}

export function MarketplaceItemInstallDomain(props: Props) {
    return (
        <FormControl fullWidth>
            <TextField
                placeholder='my-awesome-app'
                sx={{ minWidth: '8ch' }}
                value={props.value}
                onChange={(e) => {
                    props.onChange && props.onChange(e.currentTarget.value);
                }}
                slotProps={{
                    input: {
                        startAdornment: (
                            <span
                                style={{
                                    minWidth: 'fit-content',
                                    padding: '0 5px',
                                    opacity: '0.5',
                                    pointerEvents: 'none',
                                }}
                            >
                                {'https://'}
                            </span>
                        ),
                        endAdornment: (
                            <span
                                style={{
                                    minWidth: 'fit-content',
                                    padding: '0 5px',
                                    opacity: '0.5',
                                    pointerEvents: 'none',
                                }}
                            >
                                {'.dock-fusion.run'}
                            </span>
                        ),
                    },
                }}
            />
            <FormHelperText error={props.error != null}>{props.error ?? ' '}</FormHelperText>
        </FormControl>
    );
}
