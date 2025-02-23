import {
    Circle,
    Edit,
    FolderOpen,
    KeyboardDoubleArrowLeft,
    KeyboardDoubleArrowRight,
    PlayArrow,
    Stop,
    Warning,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Box, Container, Drawer, IconButton, ImageList, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import noImage from 'src/renderer/assets/img/no_image.jpg';
import { useDockerStatusTrackerContext } from 'src/renderer/components/DockerStatusTracker/useDockerStatusTrackerContext';
import { usePageLoaderContext } from 'src/renderer/components/PageLoader/usePageLoaderContext';
import { useProjectsContext } from 'src/renderer/components/ProjectsProvider/useProjectsContext';
import { ProjectStatus } from 'src/renderer/enums';
import { getGithubLastVersion, getLogoUrlByProject } from 'src/renderer/helpers/github';
import { Self } from 'src/renderer/helpers/self';
import { ProjectItemMainInfoCard } from './components/ProjectItemMainInfoCard/ProjectItemMainInfoCard';
import { ProjectItemPowerToolsCard } from './components/ProjectItemPowerToolsCard/ProjectItemPowerToolsCard';
import { ProjectItemSettings } from './components/ProjectItemSettings';
import { ProjectItemUserSettingsCard } from './components/ProjectItemUserSettingsCard/ProjectItemUserSettingsCard';

interface Props {}

export function ProjectItem(props: Props) {
    const [logoUrl, setLogoUrl] = useState('');
    const [version, setVersion] = useState('');
    const [lastVersion, setLastVersion] = useState('');
    const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
    const [needRebuild, setNeedRebuild] = useState(false);
    const navigate = useNavigate();
    const { setLoaderVisible } = usePageLoaderContext();
    const { projectDomain } = useParams();
    const { projects } = useProjectsContext();
    const project = useMemo(() => {
        return projects.find((el) => el.domain == projectDomain);
    }, [projectDomain, projects]);
    const projectRef = useRef(project);
    projectRef.current = project;
    const { containerStatus, containerStatusColor, setContainerStatusByProject } = useDockerStatusTrackerContext({
        project: project,
    });
    const containerStatusRef = useRef(containerStatus);
    containerStatusRef.current = containerStatus;

    useEffect(() => {
        Self.doesExistAtProject(project, 'needRebuild').then((res) => {
            if (projectRef.current?.domain !== project.domain) {
                return;
            }
            setNeedRebuild(res);
        });
        Self.readProjectFile(project, 'version').then((localVersion) => {
            if (projectRef.current?.domain !== project.domain) {
                return;
            }
            setVersion(localVersion);
        });
    }, [project, containerStatusColor]);

    useEffect(() => {
        if (project == null) {
            navigate('/home/projects');
            return;
        }

        getLogoUrlByProject(project).then((res) => {
            if (projectRef.current?.domain !== project.domain) {
                return;
            }
            setLogoUrl(res);
        });
        getGithubLastVersion(project.marketplaceItem).then((githubVersion) => {
            if (projectRef.current?.domain !== project.domain) {
                return;
            }
            setLastVersion(githubVersion);
        });
        setLoaderVisible(false);

        return () => {
            setLoaderVisible(true);
        };
    }, [project]);

    const versionsMismatch = useMemo(() => {
        if (project == null || version === '' || lastVersion === '') {
            return false;
        }

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
                            {needRebuild && (
                                <Stack justifyContent={'center'} sx={{ height: '100%' }}>
                                    <Tooltip title={`Needs to be rebuilt to apply changes`}>
                                        <Warning fontSize='small' color='warning' />
                                    </Tooltip>
                                </Stack>
                            )}
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
                                    <Tooltip title='Edit configuration'>
                                        <IconButton
                                            onClick={() => {
                                                navigate(`/home/projects/${project.domain}/edit`);
                                            }}
                                            sx={{ width: 'fit-content' }}
                                        >
                                            <Edit />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title='Open configuration folder'>
                                        <IconButton
                                            onClick={() => {
                                                Self.openProjectAppDataFolder(project);
                                            }}
                                            sx={{ width: 'fit-content' }}
                                        >
                                            <FolderOpen />
                                        </IconButton>
                                    </Tooltip>
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
                                <ProjectItemSettings projectDomain={projectDomain} />
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
