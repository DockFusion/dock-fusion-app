import { Autocomplete, FormControl, FormHelperText, TextField } from '@mui/material';
import { useMemo } from 'react';

interface Props {
    values?: any[];
    value?: any;
    error?: string;
    onChange?: (newValue: any) => void;
}

export function MarketplaceItemInstallSelect(props: Props) {
    const options = useMemo(() => {
        return (props.values ?? []).map((value: string | number) => {
            const valueString = value.toString();

            return {
                id: valueString.toLowerCase(),
                label: valueString,
            };
        });
    }, [props.values]);

    const value = useMemo(() => {
        return options.find((el) => el.id === props.value);
    }, [props.value]);

    return (
        <FormControl fullWidth>
            <Autocomplete
                sx={{ maxWidth: '300px' }}
                fullWidth
                value={value}
                onChange={(e, { id }) => {
                    props.onChange && props.onChange(id);
                }}
                options={options}
                renderInput={(params) => <TextField {...params} />}
            />
            <FormHelperText error={props.error != null}>{props.error ?? ' '}</FormHelperText>
        </FormControl>
    );
}
