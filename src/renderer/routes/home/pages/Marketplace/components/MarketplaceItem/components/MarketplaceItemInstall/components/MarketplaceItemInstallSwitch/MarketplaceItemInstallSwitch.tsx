import { FormControl, FormHelperText, Switch } from '@mui/material';

interface Props {
    value?: boolean;
    error?: string;
    onChange?: (newValue: boolean) => void;
}

export function MarketplaceItemInstallSwitch(props: Props) {
    return (
        <FormControl fullWidth sx={{ alignItems: 'flex-end' }}>
            <Switch
                size='small'
                checked={props.value}
                onChange={(e, newValue) => {
                    props.onChange && props.onChange(newValue);
                }}
            />
            <FormHelperText error={props.error != null} sx={{ marginRight: 'auto' }}>
                {props.error ?? ' '}
            </FormHelperText>
        </FormControl>
    );
}
