import { Autocomplete, FormControl, FormHelperText, TextField } from '@mui/material';
import { useMemo } from 'react';

interface Props {
    values?: any[];
    value?: any[];
    error?: string;
    onChange?: (newValue: any[]) => void;
}

export function MarketplaceItemInstallMultipleSelect(props: Props) {
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
        return options.filter((el) => props.value.includes(el.id));
    }, [props.value]);

    return (
        <FormControl fullWidth>
            <Autocomplete
                sx={{ maxWidth: '300px' }}
                fullWidth
                disableCloseOnSelect
                multiple
                value={value}
                onChange={(e, values) => {
                    props.onChange && props.onChange(values.map((value) => value.id));
                }}
                options={options}
                renderInput={(params) => <TextField {...params} />}
            />
            <FormHelperText error={props.error != null}>{props.error ?? ' '}</FormHelperText>
        </FormControl>
    );
}
