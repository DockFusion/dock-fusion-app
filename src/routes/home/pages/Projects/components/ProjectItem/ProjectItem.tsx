import { Circle, PlayArrow, Square, Warning } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Container, ImageList, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import jsyaml from 'js-yaml';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import noImage from 'src/assets/img/no_image.jpg';
import { usePageLoaderContext } from 'src/components/PageLoader/usePageLoaderContext';
import { Api } from 'src/helpers/api';
import { Docker } from 'src/helpers/docker';
import { getGithubLastVersion, getLogoUrlByProject, getSettingsByProject } from 'src/helpers/github';
import { Self } from 'src/helpers/self';
import { dockerGroupName } from 'src/shared/constants';
import { ProjectItemMainInfoCard } from './components/ProjectItemMainInfoCard/ProjectItemMainInfoCard';
import { ProjectItemPowerToolsCard } from './components/ProjectItemPowerToolsCard/ProjectItemPowerToolsCard';
import { ProjectItemUserSettingsCard } from './components/ProjectItemUserSettingsCard/ProjectItemUserSettingsCard';

interface Props {
    projects: IProjectWithMarketPlace[];
}

enum ProjectStatus {
    stopped,
    starting,
    running,
    paused,
    stopping,
    unknown,
    error,
}

export function ProjectItem(props: Props) {
    const [logoUrl, setLogoUrl] = useState('');
    const [version, setVersion] = useState('');
    const [lastVersion, setLastVersion] = useState('');
    const [settings, setSettings] = useState<any>('');
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [project, setProject] = useState<IProjectWithMarketPlace | null>(null);
    const [containerStatus, setContainerStatus] = useState<ProjectStatus>(ProjectStatus.unknown);
    const { projectDomain } = useParams();
    const navigate = useNavigate();
    const { setLoaderVisible } = usePageLoaderContext();
    const containerStatusWaiterRef = useRef<NodeJS.Timeout | null>(null);
    const containerIdRef = useRef<string | null>(null);
    const containerStatusWaiterProcessingRef = useRef<boolean>(false);

    useEffect(() => {
        const projectKey = 'com.docker.compose.project';
        const project = `${dockerGroupName}-${projectDomain}`;

        function getNewContainerStatus(status?: string) {
            switch (status) {
                case 'created':
                    return ProjectStatus.starting;

                case 'running':
                    return ProjectStatus.running;

                case 'restarting':
                    return ProjectStatus.stopping;

                case 'paused':
                    return ProjectStatus.paused;

                case 'exited':
                    return ProjectStatus.error;

                case 'destroy':
                    return ProjectStatus.stopped;

                default:
                    return ProjectStatus.unknown;
            }
        }

        function setupContainerStatus(status?: string) {
            setContainerStatus(getNewContainerStatus(status));
        }

        Docker.listContainers().then((containers) => {
            const container = containers.find((container) => container.Labels[projectKey] === project);
            if (!container) {
                setContainerStatus(ProjectStatus.unknown);
                return;
            }
            containerIdRef.current = container.Id;
            setupContainerStatus(container.State);
        });

        function containerStatusWaiter() {
            if (!containerIdRef.current || containerStatusWaiterProcessingRef.current) {
                return;
            }
            containerStatusWaiterProcessingRef.current = true;

            Docker.inpectContainer(containerIdRef.current).then(async (info) => {
                if (info) {
                    const newStatus = getNewContainerStatus(info.State.Status);
                    if (newStatus !== containerStatus) {
                        setupContainerStatus(info.State.Status);
                    }

                    clearInterval(containerStatusWaiterRef.current);
                    containerStatusWaiterRef.current = null;
                    containerStatusWaiterProcessingRef.current = false;
                } else {
                    clearInterval(containerStatusWaiterRef.current);
                    containerStatusWaiterRef.current = null;
                    containerStatusWaiterProcessingRef.current = false;
                }
            });
        }

        function setupContainerStatusWaiter() {
            if (containerStatusWaiterRef.current) {
                return;
            }
            containerStatusWaiterRef.current = setInterval(containerStatusWaiter, 50);
        }

        let becauseYes = true;
        const containerEventCB = (_: any, event: any) => {
            if (!becauseYes) {
                return;
            }
            const isOwned = event.attributes[projectKey] === project;
            if (!isOwned) {
                return;
            }
            containerIdRef.current = event.id;
            if (event.action === 'kill') {
                setContainerStatus(ProjectStatus.stopping);

                clearInterval(containerStatusWaiterRef.current);
                containerStatusWaiterRef.current = null;
                containerStatusWaiterProcessingRef.current = false;
            } else if (event.action === 'create') {
                setContainerStatus(ProjectStatus.starting);

                clearInterval(containerStatusWaiterRef.current);
                containerStatusWaiterRef.current = null;
                containerStatusWaiterProcessingRef.current = false;
            } else if (event.action === 'destroy') {
                setContainerStatus(ProjectStatus.unknown);

                clearInterval(containerStatusWaiterRef.current);
                containerStatusWaiterRef.current = null;
                containerStatusWaiterProcessingRef.current = false;
            } else {
                setupContainerStatusWaiter();
            }
        };
        Api.on('docker-container-event', containerEventCB);

        return () => {
            becauseYes = false;
            clearInterval(containerStatusWaiterRef.current);
            containerStatusWaiterRef.current = null;
            //TODO: check later. this does not work
            Api.off('docker-container-event', containerEventCB);
        };
    }, [projectDomain]);

    useEffect(() => {
        const project = props.projects.find((el) => el.domain == projectDomain);

        if (project == null) {
            navigate('/home/projects');
            return;
        }
        setProject(project);

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
    }, [projectDomain]);

    const versionsMismatch = useMemo(() => {
        if (version !== lastVersion) {
            console.warn(`Versions mismatch: [${version}] != [${lastVersion}]`);
        }
        return version !== lastVersion;
    }, [version, lastVersion]);

    function getStatusColor(status: ProjectStatus) {
        switch (status) {
            case ProjectStatus.running:
                return 'success';

            case ProjectStatus.paused:
            case ProjectStatus.starting:
            case ProjectStatus.stopping:
                return 'warning';

            case ProjectStatus.error:
                return 'error';

            case ProjectStatus.stopped:
            case ProjectStatus.unknown:
            default:
                return 'disabled';
        }
    }

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
                                <Circle color={getStatusColor(containerStatus)} />
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
                                    startIcon={<Square />}
                                    loadingPosition='start'
                                    loading={containerStatus === ProjectStatus.stopping}
                                    onClick={() => {
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
