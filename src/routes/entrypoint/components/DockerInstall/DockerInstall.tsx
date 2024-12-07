import { Button, Typography } from '@mui/material';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Docker } from 'src/helpers/docker';
import { sleep } from 'src/helpers/helpers';
import { dockerReadyTimeout } from 'src/shared/constants';

interface Props {
    nextStep: () => void;
}

export function DockerInstall(props: Props) {
    const [checking, setChecking] = useState(true);
    const [startingDocker, setStartingDocker] = useState(false);
    const [dockerDesktopInstalled, setDockerDesktopInstalled] = useState(false);
    const [dockerDesktopRunning, setDockerDesktopRunning] = useState(false);

    async function openDockerDesktop() {
        setStartingDocker(true);

        await Docker.open();
        const dockerRunning = new Promise<boolean>(async (resolve) => {
            const startedAt = moment.utc();
            let dockerRunning = await Docker.isRunning();
            while (!dockerRunning && moment.utc().diff(startedAt, 'seconds') < dockerReadyTimeout) {
                await sleep(500);
                dockerRunning = await Docker.isRunning();
            }
            resolve(dockerRunning);
        });

        setDockerDesktopRunning(await dockerRunning);
        checkDockerInstallation();
        setStartingDocker(false);
    }

    async function checkDockerInstallation() {
        setChecking(true);

        const isInstalled = await Docker.isInstalled();
        if (isInstalled) {
            setDockerDesktopInstalled(true);

            let dockerRunning = await Docker.isRunning();
            if (!dockerRunning) {
                openDockerDesktop();
            }
            setDockerDesktopRunning(dockerRunning);
        } else {
            setDockerDesktopInstalled(false);
        }

        setChecking(false);
    }

    useEffect(() => {
        checkDockerInstallation();
    }, []);

    useEffect(() => {
        if (dockerDesktopInstalled && dockerDesktopRunning) {
            props.nextStep();
        }
    }, [dockerDesktopInstalled, dockerDesktopRunning]);

    if (startingDocker) {
        return (
            <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                {'A executar Docker Desktop...'}
            </Typography>
        );
    } else if (checking) {
        return (
            <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                {'A verificar o Docker Desktop...'}
            </Typography>
        );
    } else if (!dockerDesktopInstalled) {
        return (
            <>
                <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                    {'Docker Desktop not installed'}
                </Typography>
                <Typography variant='subtitle2'>
                    {
                        'DECK requires Docker Desktop to be installed since it interacts with it. DECK is just a friendly GUI to manage your projects'
                    }
                </Typography>
                <div style={{ height: '5vh' }}></div>
                <Button
                    onClick={() => {
                        Docker.openInstallationDocs();
                    }}
                >
                    {'Open documentation'}
                </Button>
                <div style={{ height: '1rem' }}></div>
                <Button
                    onClick={() => {
                        checkDockerInstallation();
                    }}
                >
                    {'Retry'}
                </Button>
            </>
        );
    } else if (!dockerDesktopRunning) {
        return (
            <>
                <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                    {'Docker Desktop not running'}
                </Typography>
                <Typography variant='subtitle2'>
                    {"Couldn't detect Docker Desktop running! DECK requires it to be running so we can do calls to it."}
                </Typography>
                <div style={{ height: '5vh' }}></div>
                <Button
                    onClick={() => {
                        openDockerDesktop();
                    }}
                >
                    {'Open Docker Desktop'}
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
                        checkDockerInstallation();
                    }}
                >
                    {'Retry'}
                </Button>
            </>
        );
    }
}
