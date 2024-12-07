import { FolderOutlined } from '@mui/icons-material';
import { FormControl, FormHelperText, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { usePageLoaderContext } from 'src/components/PageLoader/usePageLoaderContext';
import { Self } from 'src/helpers/self';
import { wslDistributionName } from 'src/shared/constants';

interface Props {
    value?: string;
    error?: string;
    onChange?: (newValue: string) => void;
}

export function MarketplaceItemInstallPathSelect(props: Props) {
    const { setLoaderVisible } = usePageLoaderContext();
    const [value, setValue] = useState(props.value);

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    useEffect(() => {
        props.onChange && props.onChange(value);
    }, [value]);

    function chooseFolder() {
        setLoaderVisible(true);

        Self.showOpenDialog({
            defaultPath: value ?? `\\\\wsl$\\${wslDistributionName}\\root`,
            properties: ['openDirectory', 'promptToCreate'],
            title: 'DockFusion | Project location',
        }).then((paths) => {
            if (!paths.canceled) {
                setValue(paths.filePaths.length ? paths.filePaths[0] : '');
            }
            setLoaderVisible(false);
        });
    }

    return (
        <FormControl fullWidth>
            <TextField
                placeholder='Click to select project path'
                value={value}
                onClick={chooseFolder}
                slotProps={{
                    input: {
                        startAdornment: <FolderOutlined />,
                    },
                }}
            />
            <FormHelperText error={props.error != null}>{props.error ?? ' '}</FormHelperText>
        </FormControl>
    );
}
