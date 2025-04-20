import { FormControl, FormHelperText, TextField } from '@mui/material';

interface Props {
    value?: string;
    error?: string;
    onChange?: (newValue: string) => void;
}

export function MarketplaceItemInstallTextInput(props: Props) {
    return (
        <FormControl fullWidth>
            <TextField
                placeholder=''
                sx={{ minWidth: '8ch' }}
                value={props.value}
                onChange={(e) => {
                    props.onChange && props.onChange(e.currentTarget.value);
                }}
            />
            <FormHelperText error={props.error != null}>{props.error ?? ' '}</FormHelperText>
        </FormControl>
    );
}
