import { Divider, Grid2, Stack, Typography } from '@mui/material';
import { MarketplaceItemInstallInput } from '../MarketplaceItemInstallInput/MarketplaceItemInstallInput';

interface Props {
    title: string;
    description: string;
    type: string;
    values?: any[];
    value?: any;
    error?: any;
    onChange?: (newValue: any) => void;
}

export function MarketplaceItemInstallSection(props: Props) {
    return (
        <Stack direction={'column'} gap={'5px'} width={'100%'}>
            <Typography variant='h6'>{props.title}</Typography>
            <Divider />
            <Grid2 container columns={2}>
                <Grid2 size={1}>
                    <Typography variant='body2'>{props.description}</Typography>
                </Grid2>
                <Grid2 size={1}>
                    <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'flex-end' }}>
                        <MarketplaceItemInstallInput
                            type={props.type}
                            values={props.values}
                            value={props.value}
                            error={props.error}
                            onChange={props.onChange}
                        />
                    </div>
                </Grid2>
            </Grid2>
        </Stack>
    );
}
