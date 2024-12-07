import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup } from '@mui/material';
import { useMemo } from 'react';

interface Props {
    values?: any[];
    row?: boolean;
    value?: string;
    error?: string;
    onChange?: (newValue: string) => void;
}

export function MarketplaceItemInstallHorizontalRadio(props: Props) {
    const values = useMemo(() => {
        return props.values ?? [];
    }, [props.values]);

    return (
        <FormControl fullWidth>
            <RadioGroup
                row={props.row}
                sx={{ justifyContent: 'flex-end' }}
                value={props.value}
                onChange={(e, newValue) => {
                    props.onChange && props.onChange(newValue);
                }}
            >
                {values.map((value) => {
                    const valueString = value.toString();
                    return (
                        <FormControlLabel
                            key={valueString.toLowerCase()}
                            value={valueString.toLowerCase()}
                            control={<Radio size='small' />}
                            label={valueString}
                        />
                    );
                })}
            </RadioGroup>
            <FormHelperText error={props.error != null}>{props.error ?? ' '}</FormHelperText>
        </FormControl>
    );
}
