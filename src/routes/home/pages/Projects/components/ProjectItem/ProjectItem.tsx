import {
    Circle,
    KeyboardDoubleArrowLeft,
    KeyboardDoubleArrowRight,
    PlayArrow,
    RestartAlt,
    Stop,
    Update,
    Warning,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
    Box,
    CircularProgress,
    Container,
    Drawer,
    IconButton,
    ImageList,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar,
    Tooltip,
    Typography,
} from '@mui/material';
import jsyaml from 'js-yaml';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import noImage from 'src/assets/img/no_image.jpg';
import { useAlertDialog } from 'src/components/AlertDialog/useAlertDialog';
import { useDockerStatusTrackerContext } from 'src/components/DockerStatusTracker/useDockerStatusTrackerContext';
import { usePageLoaderContext } from 'src/components/PageLoader/usePageLoaderContext';
import { ProjectStatus } from 'src/enums';
import {
    downloadSourceFileFromGithubByImage,
    getGithubLastVersion,
    getLogoUrlByProject,
    getSettingsByProject,
} from 'src/helpers/github';
import { sleep } from 'src/helpers/helpers';
import { Self } from 'src/helpers/self';
import { ProjectItemMainInfoCard } from './components/ProjectItemMainInfoCard/ProjectItemMainInfoCard';
import { ProjectItemPowerToolsCard } from './components/ProjectItemPowerToolsCard/ProjectItemPowerToolsCard';
import { ProjectItemUserSettingsCard } from './components/ProjectItemUserSettingsCard/ProjectItemUserSettingsCard';

interface Props {
    projects: IProjectWithMarketPlace[];
}

export function ProjectItem(props: Props) {
    const [logoUrl, setLogoUrl] = useState('');
    const [version, setVersion] = useState('');
    const [lastVersion, setLastVersion] = useState('');
    const [settings, setSettings] = useState<any>('');
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
    const [versionUpdatedCounter, setVersionUpdatedCounter] = useState(0);
    const navigate = useNavigate();
    const { setLoaderVisible } = usePageLoaderContext();
    const { projectDomain } = useParams();
    const project = useMemo(() => {
        return props.projects.find((el) => el.domain == projectDomain);
    }, [projectDomain]);
    const { containerStatus, containerStatusColor, setContainerStatusByProject } = useDockerStatusTrackerContext({
        project: project,
    });
    const containerStatusRef = useRef(containerStatus);
    containerStatusRef.current = containerStatus;
    const { alertDialogFire } = useAlertDialog();

    useEffect(() => {
        if (project == null) {
            navigate('/home/projects');
            return;
        }

        getSettingsByProject(project).then((res) => {
            setSettings(jsyaml.load(res) ?? '');
            setSettingsLoading(false);
        });
        getLogoUrlByProject(project).then((res) => {
            setLogoUrl(res);
        });
        Self.readProjectFile(project, 'version').then((localVersion) => {
            setVersion(localVersion);
        });
        getGithubLastVersion(project.marketplaceItem).then((githubVersion) => {
            setLastVersion(githubVersion);
        });

        setLoaderVisible(false);

        return () => {
            setLoaderVisible(true);
        };
    }, [project, versionUpdatedCounter]);

    const versionsMismatch = useMemo(() => {
        if (version !== lastVersion) {
            console.warn(`Versions mismatch: [${version}] != [${lastVersion}]`);
        }
        return version !== lastVersion;
    }, [version, lastVersion]);

    return (
        <Stack sx={{ overflow: 'hidden' }} direction={'column'} height={'100%'} width={'100%'}>
            {project && (
                <Toolbar sx={{ pt: '5px' }}>
                    {logoUrl && (
                        <object
                            data={logoUrl}
                            height={'40px'}
                            width={'40px'}
                            type='image/png'
                            style={{ objectFit: 'contain' }}
                        >
                            <img src={noImage} height={'40px'} width={'40px'} style={{ objectFit: 'contain' }} />
                        </object>
                    )}
                    <div style={{ width: '10px' }}></div>
                    <Stack height={'100%'} justifyContent={'center'} direction={'column'}>
                        <Stack direction={'row'} gap={'10px'} alignItems={'end'}>
                            <Stack justifyContent={'center'} sx={{ height: '100%' }}>
                                <Circle color={containerStatusColor} />
                            </Stack>
                            <Typography variant='h6'>{project.name}</Typography>
                            <Stack direction={'row'} gap={'5px'} alignItems={'end'}>
                                <Typography variant='body2' sx={{ textDecoration: 'underline' }}>
                                    {version}
                                </Typography>
                                {versionsMismatch && (
                                    <Tooltip title={`New version available: ${lastVersion}`}>
                                        <Warning fontSize='small' color='warning' />
                                    </Tooltip>
                                )}
                            </Stack>
                        </Stack>
                    </Stack>
                    <div style={{ flex: 1, minWidth: '10px' }}></div>
                    <Stack
                        height={'100%'}
                        justifyContent={'start'}
                        alignItems={'end'}
                        direction={'column'}
                        minWidth={'fit-content'}
                    >
                        <Stack direction={'row'} gap={'10px'}>
                            {[
                                ProjectStatus.stopped,
                                ProjectStatus.unknown,
                                ProjectStatus.error,
                                ProjectStatus.starting,
                            ].includes(containerStatus) && (
                                <LoadingButton
                                    startIcon={<PlayArrow />}
                                    loadingPosition='start'
                                    loading={containerStatus === ProjectStatus.starting}
                                    onClick={() => {
                                        enqueueSnackbar(`[${project.name}] starting...`, {
                                            variant: 'info',
                                        });
                                        setContainerStatusByProject(project.domain, ProjectStatus.starting);
                                        Self.startProject(project);
                                    }}
                                    variant='contained'
                                    style={{
                                        textTransform: 'none',
                                        textAlign: 'left',
                                    }}
                                >
                                    {'Start'}
                                </LoadingButton>
                            )}
                            {[ProjectStatus.running, ProjectStatus.stopping].includes(containerStatus) && (
                                <LoadingButton
                                    startIcon={<Stop />}
                                    loadingPosition='start'
                                    loading={containerStatus === ProjectStatus.stopping}
                                    onClick={() => {
                                        enqueueSnackbar(`[${project.name}] stopping...`, {
                                            variant: 'info',
                                        });
                                        setContainerStatusByProject(project.domain, ProjectStatus.stopping);
                                        Self.stopProject(project);
                                    }}
                                    variant='contained'
                                    style={{
                                        textTransform: 'none',
                                        textAlign: 'left',
                                    }}
                                >
                                    {'Stop'}
                                </LoadingButton>
                            )}
                        </Stack>
                        <Stack direction={'row'} gap={'10px'}>
                            <a href={`https://github.com/${project.marketplaceItem.github}/issues/new`} target='_blank'>
                                Report an issue
                            </a>
                            <a href={`https://github.com/${project.marketplaceItem.github}`} target='_blank'>
                                Github
                            </a>
                        </Stack>
                    </Stack>
                    <div style={{ width: '10px' }}></div>
                    <Stack direction={'column'} alignItems={'flex-start'} height={'100%'}>
                        <IconButton
                            onClick={() => {
                                setSidebarMenuOpen(true);
                            }}
                        >
                            <KeyboardDoubleArrowLeft />
                        </IconButton>
                    </Stack>
                    <Drawer
                        open={sidebarMenuOpen}
                        onClose={() => {
                            setSidebarMenuOpen(false);
                        }}
                        anchor='right'
                    >
                        <Box
                            sx={{
                                width: 250,
                                height: '100vh',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                paddingRight: '24px',
                            }}
                        >
                            <Box sx={{ width: '100%' }}>
                                <Stack direction={'row'} justifyContent={'flex-end'} sx={{ my: '5px' }}>
                                    <IconButton
                                        onClick={() => {
                                            setSidebarMenuOpen(false);
                                        }}
                                        sx={{ width: 'fit-content' }}
                                    >
                                        <KeyboardDoubleArrowRight />
                                    </IconButton>
                                </Stack>
                            </Box>
                            <Box sx={{ width: '100%', overflowY: 'auto', flex: 1 }}>
                                <List>
                                    {versionsMismatch && (
                                        <ListItem disablePadding>
                                            <ListItemButton
                                                onClick={() => {
                                                    alertDialogFire({
                                                        title: `Update ${project.name}`,
                                                        text: `Do you wish to update app version from ${version} to ${lastVersion} ? The app will be stopped during the update!`,
                                                        icon: 'question',
                                                        confirmButtonCb: () => {
                                                            const key = `${project.domain}|update app version`;
                                                            if (!sessionStorage.getItem(key)) {
                                                                sessionStorage.setItem(key, 'true');

                                                                downloadSourceFileFromGithubByImage(
                                                                    project.marketplaceItem,
                                                                )
                                                                    .then(async (file) => {
                                                                        enqueueSnackbar(
                                                                            `[${project.name}] updating...`,
                                                                            {
                                                                                variant: 'info',
                                                                            },
                                                                        );
                                                                        try {
                                                                            if (
                                                                                containerStatusRef.current !==
                                                                                ProjectStatus.unknown
                                                                            ) {
                                                                                setContainerStatusByProject(
                                                                                    project.domain,
                                                                                    ProjectStatus.stopping,
                                                                                );
                                                                                await Self.stopProject(project);
                                                                                while (
                                                                                    containerStatusRef.current !==
                                                                                    ProjectStatus.unknown
                                                                                ) {
                                                                                    await sleep(500);
                                                                                }
                                                                            }

                                                                            Self.updateApp(project)
                                                                                .then(() => {
                                                                                    enqueueSnackbar(
                                                                                        `The update for app [${project.name}] completed with success. Enjoy our lastest changes!`,
                                                                                        {
                                                                                            variant: 'success',
                                                                                        },
                                                                                    );
                                                                                })
                                                                                .catch(() => {
                                                                                    enqueueSnackbar(
                                                                                        `The update for app [${project.name}] completed with errors! Changes reverted.`,
                                                                                        {
                                                                                            variant: 'error',
                                                                                            autoHideDuration: 8000,
                                                                                        },
                                                                                    );
                                                                                })
                                                                                .finally(() => {
                                                                                    setVersionUpdatedCounter(
                                                                                        versionUpdatedCounter + 1,
                                                                                    );
                                                                                    sessionStorage.removeItem(key);
                                                                                });
                                                                        } catch (e) {
                                                                            enqueueSnackbar(
                                                                                `Couldn't stop app [${project.name}] Please stop if manually before updating!`,
                                                                                {
                                                                                    variant: 'error',
                                                                                    autoHideDuration: 8000,
                                                                                },
                                                                            );
                                                                            sessionStorage.removeItem(key);
                                                                        }
                                                                    })
                                                                    .catch(() => {
                                                                        enqueueSnackbar(
                                                                            `Couldn't download the update. Please make sure you have proper internet connection before trying again`,
                                                                            {
                                                                                variant: 'error',
                                                                                autoHideDuration: 8000,
                                                                            },
                                                                        );
                                                                        sessionStorage.removeItem(key);
                                                                    });
                                                            } else {
                                                                enqueueSnackbar(
                                                                    `The app [${project.name}] is already being updated. please wait!`,
                                                                    {
                                                                        variant: 'warning',
                                                                    },
                                                                );
                                                            }
                                                        },
                                                        showCancelButton: true,
                                                        confirmButtonText: 'Yes',
                                                        cancelButtonText: 'No',
                                                        cancelButtonColor: 'error',
                                                    });
                                                }}
                                            >
                                                <ListItemIcon>
                                                    <Update />
                                                </ListItemIcon>
                                                <ListItemText primary={'Update app'} />
                                            </ListItemButton>
                                        </ListItem>
                                    )}
                                    {[
                                        ProjectStatus.stopped,
                                        ProjectStatus.unknown,
                                        ProjectStatus.error,
                                        ProjectStatus.starting,
                                    ].includes(containerStatus) && (
                                        <ListItem disablePadding>
                                            <ListItemButton
                                                onClick={() => {
                                                    enqueueSnackbar(`[${project.name}] starting...`, {
                                                        variant: 'info',
                                                    });
                                                    setContainerStatusByProject(project.domain, ProjectStatus.starting);
                                                    Self.startProject(project);
                                                }}
                                                disabled={containerStatus === ProjectStatus.starting}
                                            >
                                                <ListItemIcon
                                                    style={{ width: '1em', height: '1em', fontSize: '1.5rem' }}
                                                >
                                                    {containerStatus === ProjectStatus.starting ? (
                                                        <CircularProgress
                                                            sx={{ color: 'white' }}
                                                            style={{ width: '0.8em', height: '0.8em', margin: 'auto' }}
                                                        />
                                                    ) : (
                                                        <PlayArrow />
                                                    )}
                                                </ListItemIcon>
                                                <ListItemText primary={'Start app'} />
                                            </ListItemButton>
                                        </ListItem>
                                    )}
                                    {[ProjectStatus.running, ProjectStatus.stopping].includes(containerStatus) && (
                                        <ListItem disablePadding>
                                            <ListItemButton
                                                onClick={() => {
                                                    enqueueSnackbar(`[${project.name}] stopping...`, {
                                                        variant: 'info',
                                                    });
                                                    setContainerStatusByProject(project.domain, ProjectStatus.stopping);
                                                    Self.stopProject(project);
                                                }}
                                                disabled={containerStatus === ProjectStatus.stopping}
                                            >
                                                <ListItemIcon
                                                    style={{ width: '1em', height: '1em', fontSize: '1.5rem' }}
                                                >
                                                    {containerStatus === ProjectStatus.stopping ? (
                                                        <CircularProgress
                                                            sx={{ color: 'white' }}
                                                            style={{ width: '0.8em', height: '0.8em', margin: 'auto' }}
                                                        />
                                                    ) : (
                                                        <Stop />
                                                    )}
                                                </ListItemIcon>
                                                <ListItemText primary={'Stop app'} />
                                            </ListItemButton>
                                        </ListItem>
                                    )}
                                    <ListItem disablePadding>
                                        <ListItemButton
                                            onClick={() => {
                                                enqueueSnackbar(`[${project.name}] rebuilding...`, {
                                                    variant: 'info',
                                                });
                                                setContainerStatusByProject(project.domain, ProjectStatus.stopping);
                                                Self.startProject(project, true);
                                            }}
                                            disabled={
                                                ![
                                                    ProjectStatus.running,
                                                    ProjectStatus.unknown,
                                                    ProjectStatus.paused,
                                                ].includes(containerStatus)
                                            }
                                        >
                                            <ListItemIcon style={{ width: '1em', height: '1em', fontSize: '1.5rem' }}>
                                                {![
                                                    ProjectStatus.running,
                                                    ProjectStatus.unknown,
                                                    ProjectStatus.paused,
                                                ].includes(containerStatus) ? (
                                                    <CircularProgress
                                                        sx={{ color: 'white' }}
                                                        style={{ width: '0.8em', height: '0.8em', margin: 'auto' }}
                                                    />
                                                ) : (
                                                    <RestartAlt />
                                                )}
                                            </ListItemIcon>
                                            <ListItemText primary={'Rebuild app'} />
                                        </ListItemButton>
                                    </ListItem>
                                </List>
                            </Box>
                        </Box>
                    </Drawer>
                </Toolbar>
            )}
            <Container sx={{ height: '100%', flex: '1', overflowY: 'auto', p: 0, py: '10px' }}>
                {project && (
                    <ImageList variant='masonry' cols={2} gap={10}>
                        <ProjectItemMainInfoCard project={project} />
                        <ProjectItemUserSettingsCard project={project} />
                        <ProjectItemPowerToolsCard project={project} />
                    </ImageList>
                )}
            </Container>
        </Stack>
    );
}
