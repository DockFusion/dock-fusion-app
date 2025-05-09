import { Typography } from '@mui/material';
import { MarketplaceItemInstallCheckbox } from '../MarketplaceItemInstallCheckbox/MarketplaceItemInstallCheckbox';
import { MarketplaceItemInstallDbCredentials } from '../MarketplaceItemInstallDbCredentials/MarketplaceItemInstallDbCredentials';
import { MarketplaceItemInstallDomain } from '../MarketplaceItemInstallDomain/MarketplaceItemInstallDomain';
import { MarketplaceItemInstallHorizontalRadio } from '../MarketplaceItemInstallHorizontalRadio/MarketplaceItemInstallHorizontalRadio';
import { MarketplaceItemInstallMultipleSelect } from '../MarketplaceItemInstallMultipleSelect/MarketplaceItemInstallMultipleSelect';
import { MarketplaceItemInstallPathSelect } from '../MarketplaceItemInstallPathSelect/MarketplaceItemInstallPathSelect';
import { MarketplaceItemInstallProjectLabel } from '../MarketplaceItemInstallProjectLabel/MarketplaceItemInstallProjectLabel';
import { MarketplaceItemInstallSelect } from '../MarketplaceItemInstallSelect/MarketplaceItemInstallSelect';
import { MarketplaceItemInstallSwitch } from '../MarketplaceItemInstallSwitch/MarketplaceItemInstallSwitch';
import { MarketplaceItemInstallTextInput } from '../MarketplaceItemInstallTextInput/MarketplaceItemInstallProjectLabel';

interface Props {
    type: string;
    values?: any[];
    value?: any;
    error?: any;
    onChange?: (newValue: any) => void;
}

export function MarketplaceItemInstallInput(props: Props) {
    switch (props.type) {
        case 'project-label':
            return (
                <MarketplaceItemInstallProjectLabel value={props.value} error={props.error} onChange={props.onChange} />
            );

        case 'domain':
            return <MarketplaceItemInstallDomain value={props.value} error={props.error} onChange={props.onChange} />;

        case 'db-credentials':
            return (
                <MarketplaceItemInstallDbCredentials
                    value={props.value}
                    error={props.error}
                    onChange={props.onChange}
                />
            );

        case 'path-select':
            return (
                <MarketplaceItemInstallPathSelect value={props.value} error={props.error} onChange={props.onChange} />
            );

        case 'select':
            return (
                <MarketplaceItemInstallSelect
                    values={props.values}
                    value={props.value}
                    error={props.error}
                    onChange={props.onChange}
                />
            );

        case 'multiple-select':
            return (
                <MarketplaceItemInstallMultipleSelect
                    values={props.values}
                    value={props.value}
                    error={props.error}
                    onChange={props.onChange}
                />
            );

        case 'horizontal-radio':
            return (
                <MarketplaceItemInstallHorizontalRadio
                    row
                    values={props.values}
                    value={props.value}
                    error={props.error}
                    onChange={props.onChange}
                />
            );

        case 'radio':
            return (
                <MarketplaceItemInstallHorizontalRadio
                    values={props.values}
                    value={props.value}
                    error={props.error}
                    onChange={props.onChange}
                />
            );

        case 'checkbox':
            return <MarketplaceItemInstallCheckbox value={props.value} error={props.error} onChange={props.onChange} />;

        case 'switch':
            return <MarketplaceItemInstallSwitch value={props.value} error={props.error} onChange={props.onChange} />;

        case 'text-input':
            return (
                <MarketplaceItemInstallTextInput value={props.value} error={props.error} onChange={props.onChange} />
            );

        default:
            return (
                <Typography color='red'>{`Unknown input type: [${props.type}]. Please report the issue if it persists!`}</Typography>
            );
    }
}
