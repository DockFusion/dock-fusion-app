import { LockOutlined, PersonOutline, StorageOutlined } from '@mui/icons-material';
import { FormControl, FormHelperText, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';

interface Props {
    value?: any;
    error?: any;
    onChange?: (newValue: any) => void;
}

export function MarketplaceItemInstallDbCredentials(props: Props) {
    const [database, setDatabase] = useState(props.value?.database ?? '');
    const [user, setUser] = useState(props.value?.user ?? '');
    const [password, setPassword] = useState(props.value?.password ?? '');

    useEffect(() => {
        setDatabase(props.value?.database ?? '');
        setUser(props.value?.user ?? '');
        setPassword(props.value?.password ?? '');
    }, [props.value]);

    useEffect(() => {
        props.onChange &&
            props.onChange({
                database: database,
                user: user,
                password: password,
            });
    }, [database, user, password]);

    return (
        <Stack direction={'column'}>
            <FormControl fullWidth>
                <TextField
                    placeholder='Database'
                    value={database}
                    onChange={(e) => {
                        setDatabase(e.currentTarget.value);
                    }}
                    slotProps={{
                        input: {
                            startAdornment: <StorageOutlined />,
                        },
                    }}
                />
                <FormHelperText error={props.error?.database != null}>{props.error?.database ?? ' '}</FormHelperText>
            </FormControl>
            <FormControl fullWidth>
                <TextField
                    placeholder='User'
                    value={user}
                    onChange={(e) => {
                        setUser(e.currentTarget.value);
                    }}
                    slotProps={{
                        input: {
                            startAdornment: <PersonOutline />,
                        },
                    }}
                />
                <FormHelperText error={props.error?.user != null}>{props.error?.user ?? ' '}</FormHelperText>
            </FormControl>
            <FormControl fullWidth>
                <TextField
                    placeholder='Password'
                    value={password}
                    onChange={(e) => {
                        setPassword(e.currentTarget.value);
                    }}
                    slotProps={{
                        input: {
                            startAdornment: <LockOutlined />,
                        },
                    }}
                />
                <FormHelperText error={props.error?.password != null}>{props.error?.password ?? ' '}</FormHelperText>
            </FormControl>
        </Stack>
    );
}
