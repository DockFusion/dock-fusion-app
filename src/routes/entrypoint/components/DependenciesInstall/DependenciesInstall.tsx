import { Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Windows } from 'src/helpers/windows';
import { i18n } from 'src/i18n';

interface Props {
    nextStep: () => void;
}

export function DependenciesInstall(props: Props) {
    const [checking, setChecking] = useState(true);
    const [installing, setInstalling] = useState(false);
    const [dependenciesInstalled, setDependenciesInstalled] = useState(false);

    async function checkDependenciesInstallation() {
        setChecking(true);
        const dependenciesReady = await Windows.checkDependencies();
        setDependenciesInstalled(dependenciesReady);
        setChecking(false);
    }

    async function installDependencies() {
        setInstalling(true);
        await Windows.installDependencies();
        checkDependenciesInstallation();
        setInstalling(false);
    }

    useEffect(() => {
        checkDependenciesInstallation();
    }, []);

    useEffect(() => {
        if (dependenciesInstalled) {
            props.nextStep();
        }
    }, [dependenciesInstalled]);

    if (installing) {
        return (
            <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                {'A instalar as dependencias...'}
            </Typography>
        );
    } else if (checking) {
        return (
            <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                {'A verificar as dependencias...'}
            </Typography>
        );
    } else if (!dependenciesInstalled) {
        return (
            <>
                <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                    {'Dependencies not installed'}
                </Typography>
                <Typography variant='subtitle2'>{i18n.t('entrypoint.dependenciesRequiredDescription')}</Typography>
                <div style={{ height: '5vh' }}></div>
                <Button
                    onClick={() => {
                        installDependencies();
                    }}
                >
                    {'Install'}
                </Button>
            </>
        );
    } else {
        return (
            <>
                <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                    {'Unkown error'}
                </Typography>
                <div style={{ height: '5vh' }}></div>
                <Button
                    onClick={() => {
                        checkDependenciesInstallation();
                    }}
                >
                    {'Retry'}
                </Button>
            </>
        );
    }
}
