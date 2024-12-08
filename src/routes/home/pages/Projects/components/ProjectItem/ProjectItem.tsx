import { Circle, PlayArrow, Square, Warning } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Container, ImageList, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import jsyaml from 'js-yaml';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import noImage from 'src/assets/img/no_image.jpg';
import { useDockerStatusTrackerContext } from 'src/components/DockerStatusTracker/useDockerStatusTrackerContext';
import { usePageLoaderContext } from 'src/components/PageLoader/usePageLoaderContext';
import { ProjectStatus } from 'src/enums';
import { getGithubLastVersion, getLogoUrlByProject, getSettingsByProject } from 'src/helpers/github';
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
    const navigate = useNavigate();
    const { setLoaderVisible } = usePageLoaderContext();
    const { projectDomain } = useParams();
    const project = useMemo(() => {
        return props.projects.find((el) => el.domain == projectDomain);
    }, [projectDomain]);
    const { containerStatus, containerStatusColor } = useDockerStatusTrackerContext({ project: project });

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
    }, [project]);

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
