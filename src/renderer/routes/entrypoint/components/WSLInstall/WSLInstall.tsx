import { Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Self } from 'src/renderer/helpers/self';
import { Windows } from 'src/renderer/helpers/windows';
import { WSL } from 'src/renderer/helpers/wsl';
import { i18n } from 'src/renderer/i18n';
import { wslDistributionName, wslDistributionUrl } from 'src/shared/constants';

interface Props {
    nextStep: () => void;
}

export function WSLInstall(props: Props) {
    const [checking, setChecking] = useState(true);
    const [installing, setInstalling] = useState(false);
    const [wslInstalled, setWslInstalled] = useState(false);
    const [customUbuntuInstalled, setCustomUbuntuInstalled] = useState(false);

    async function checkWSLInstallation() {
        setChecking(true);
        try {
            const status = await WSL.getStatus();
            setWslInstalled(true);
            if (status.defaultDistribution === wslDistributionName) {
                setCustomUbuntuInstalled(true);
            } else {
                const distributions = await WSL.getDistributions();
                const customDistribution = distributions.find(
                    (distribution) => distribution.name === wslDistributionName,
                );

                if (customDistribution) {
                    // WSL.setDefault(wslDistributionName);
                    setCustomUbuntuInstalled(true);
                } else {
                    setCustomUbuntuInstalled(false);
                }
            }
        } catch (e) {
            setWslInstalled(false);
        }
        setChecking(false);
    }

    async function installCustomUbuntu() {
        setInstalling(true);
        const downloadDirectory = await Self.getPath('temp');
        await Windows.downloadFile(wslDistributionUrl, downloadDirectory, `${wslDistributionName}.tar.xz`);
        await WSL.import(
            wslDistributionName,
            `c:\\${wslDistributionName}`,

            `${downloadDirectory}\\${wslDistributionName}.tar.xz`,
        );
        await Windows.delete(`${downloadDirectory}\\${wslDistributionName}.tar.xz`);
        checkWSLInstallation();

        setInstalling(false);
    }

    useEffect(() => {
        checkWSLInstallation();
    }, []);

    useEffect(() => {
        if (wslInstalled && customUbuntuInstalled) {
            props.nextStep();
        }
    }, [wslInstalled, customUbuntuInstalled]);

    if (installing) {
        return (
            <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                {'A instalar o Ubuntu customizado...'}
            </Typography>
        );
    } else if (checking) {
        return (
            <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                {'A verificar o WSL...'}
            </Typography>
        );
    } else if (!wslInstalled) {
        return (
            <>
                <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                    {i18n.t('entrypoint.wslNotInstalled')}
                </Typography>
                <Typography variant='subtitle2'>{i18n.t('entrypoint.wsl2RequiredDescription')}</Typography>
                <div style={{ height: '5vh' }}></div>
                <Button
                    onClick={() => {
                        WSL.openInstallationDocs();
                    }}
                >
                    {'Open documentation'}
                </Button>
                <div style={{ height: '1rem' }}></div>
                <Button
                    onClick={() => {
                        checkWSLInstallation();
                    }}
                >
                    {'Retry'}
                </Button>
            </>
        );
    } else if (!customUbuntuInstalled) {
        return (
            <>
                <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                    {'Custom Ubuntu distribution not installed'}
                </Typography>
                <Typography variant='subtitle2'>{i18n.t('entrypoint.customUbuntuRequiredDescription')}</Typography>
                <div style={{ height: '5vh' }}></div>
                <Button
                    onClick={() => {
                        installCustomUbuntu();
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
                        checkWSLInstallation();
                    }}
                >
                    {'Retry'}
                </Button>
            </>
        );
    }
}
