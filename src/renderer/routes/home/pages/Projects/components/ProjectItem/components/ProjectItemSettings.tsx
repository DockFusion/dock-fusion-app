import { Delete, DriveFileRenameOutline, PlayArrow, RestartAlt, Stop, Terminal, Update } from '@mui/icons-material';
import {
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Modal,
    useTheme,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlertDialog } from 'src/renderer/components/AlertDialog/useAlertDialog';
import { useDockerStatusTrackerContext } from 'src/renderer/components/DockerStatusTracker/useDockerStatusTrackerContext';
import { usePageLoaderContext } from 'src/renderer/components/PageLoader/usePageLoaderContext';
import { useProjectsContext } from 'src/renderer/components/ProjectsProvider/useProjectsContext';
import { ProjectStatus } from 'src/renderer/enums';
import { downloadSourceFileFromGithubByImage, getGithubLastVersion } from 'src/renderer/helpers/github';
import { sleep } from 'src/renderer/helpers/helpers';
import { Self } from 'src/renderer/helpers/self';
import { RenameAppForm } from './RenameAppForm';

interface Props {
    projectDomain: string;
    dense?: boolean;
    onClick?: () => void;
}

export function ProjectItemSettings(props: Props) {
    const { projects, refreshProjects } = useProjectsContext();
    const [version, setVersion] = useState('');
    const [lastVersion, setLastVersion] = useState('');
    const { alertDialogFire } = useAlertDialog();
    const muiTheme = useTheme();
    const [renameAppFormOpen, setRenameAppFormOpen] = useState(false);
    const project = useMemo(() => {
        return projects.find((el) => el.domain == props.projectDomain);
    }, [props.projectDomain, projects]);
    const projectRef = useRef(project);
    projectRef.current = project;
    const { containerStatus, containerStatusColor, setContainerStatusByProject } = useDockerStatusTrackerContext({
        project: project,
    });
    const containerStatusRef = useRef(containerStatus);
    containerStatusRef.current = containerStatus;
    const navigate = useNavigate();
    const { setLoaderVisible } = usePageLoaderContext();
    const [needRebuild, setNeedRebuild] = useState(false);
    const versionsMismatch = useMemo(() => {
        if (project == null || version === '' || lastVersion === '') {
            return false;
        }

        if (version !== lastVersion) {
            console.warn(`Versions mismatch: [${version}] != [${lastVersion}]`);
        }
        return version !== lastVersion;
    }, [project, version, lastVersion]);

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
        project.marketplaceItem &&
            getGithubLastVersion(project.marketplaceItem).then((githubVersion) => {
                if (projectRef.current?.domain !== project.domain) {
                    return;
                }
                setLastVersion(githubVersion);
            });
    }, [project]);

    return (
        <List dense={props.dense}>
            {versionsMismatch && (
                <>
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => {
                                props.onClick && props.onClick();
                                alertDialogFire({
                                    title: `Update ${project.name}`,
                                    text: `Do you wish to update app version from ${version} to ${lastVersion} ? The app will be stopped during the update!`,
                                    icon: 'question',
                                    confirmButtonCb: () => {
                                        const key = `${project.domain}|update app version`;
                                        if (!sessionStorage.getItem(key)) {
                                            sessionStorage.setItem(key, 'true');

                                            downloadSourceFileFromGithubByImage(project.marketplaceItem)
                                                .then(async (file) => {
                                                    enqueueSnackbar(`[${project.name}] updating...`, {
                                                        variant: 'info',
                                                    });
                                                    try {
                                                        if (containerStatusRef.current !== ProjectStatus.unknown) {
                                                            setContainerStatusByProject(
                                                                project.domain,
                                                                ProjectStatus.stopping,
                                                            );
                                                            await Self.stopProject(project);
                                                            while (
                                                                containerStatusRef.current !== ProjectStatus.unknown
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
                                                                refreshProjects();
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
                    <Divider sx={{ my: 1 }} />
                </>
            )}
            <ListItem disablePadding>
                <ListItemButton
                    onClick={() => {
                        props.onClick && props.onClick();
                        Self.spawnTerminalAtProject(project, 'bash');
                    }}
                >
                    <ListItemIcon style={{ width: '1em', height: '1em', fontSize: '1.5rem' }}>
                        <Terminal />
                    </ListItemIcon>
                    <ListItemText primary={'Open shell'} />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton
                    onClick={() => {
                        props.onClick && props.onClick();
                        Self.spawnLogsAtProject(project);
                    }}
                >
                    <ListItemIcon style={{ width: '1em', height: '1em', fontSize: '1.5rem' }}>
                        <Terminal />
                    </ListItemIcon>
                    <ListItemText primary={'Open logs'} />
                </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
                <ListItemButton
                    onClick={() => {
                        props.onClick && props.onClick();
                        setRenameAppFormOpen(true);
                    }}
                >
                    <ListItemIcon style={{ width: '1em', height: '1em', fontSize: '1.5rem' }}>
                        <DriveFileRenameOutline />
                    </ListItemIcon>
                    <ListItemText primary={'Rename app'} />
                </ListItemButton>
                <Modal
                    open={renameAppFormOpen}
                    onClose={() => setRenameAppFormOpen(false)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div>
                        <RenameAppForm project={project} onClose={() => setRenameAppFormOpen(false)} />
                    </div>
                </Modal>
            </ListItem>
            {[ProjectStatus.stopped, ProjectStatus.unknown, ProjectStatus.error, ProjectStatus.starting].includes(
                containerStatus,
            ) && (
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => {
                            props.onClick && props.onClick();
                            enqueueSnackbar(`[${project.name}] starting...`, {
                                variant: 'info',
                            });
                            setContainerStatusByProject(project.domain, ProjectStatus.starting);
                            Self.startProject(project);
                        }}
                        disabled={containerStatus === ProjectStatus.starting}
                    >
                        <ListItemIcon style={{ width: '1em', height: '1em', fontSize: '1.5rem' }}>
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
                            props.onClick && props.onClick();
                            enqueueSnackbar(`[${project.name}] stopping...`, {
                                variant: 'info',
                            });
                            setContainerStatusByProject(project.domain, ProjectStatus.stopping);
                            Self.stopProject(project);
                        }}
                        disabled={containerStatus === ProjectStatus.stopping}
                    >
                        <ListItemIcon style={{ width: '1em', height: '1em', fontSize: '1.5rem' }}>
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
                    sx={{ backgroundColor: needRebuild ? muiTheme.palette.warning.main : undefined }}
                    onClick={() => {
                        props.onClick && props.onClick();
                        enqueueSnackbar(`[${project.name}] rebuilding...`, {
                            variant: 'info',
                        });
                        setContainerStatusByProject(project.domain, ProjectStatus.stopping);
                        Self.startProject(project, true);
                    }}
                    disabled={
                        ![ProjectStatus.running, ProjectStatus.unknown, ProjectStatus.paused].includes(containerStatus)
                    }
                >
                    <ListItemIcon style={{ width: '1em', height: '1em', fontSize: '1.5rem' }}>
                        {![ProjectStatus.running, ProjectStatus.unknown, ProjectStatus.paused].includes(
                            containerStatus,
                        ) ? (
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
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
                <ListItemButton
                    sx={{ backgroundColor: muiTheme.palette.error.main }}
                    onClick={() => {
                        props.onClick && props.onClick();
                        alertDialogFire({
                            title: `Remove ${project.name}`,
                            text: `Are you sure you want to remove this app?`,
                            icon: 'question',
                            confirmButtonCb: async () => {
                                setLoaderVisible(true);
                                const key = `${project.domain}|remove app`;
                                if (!sessionStorage.getItem(key)) {
                                    sessionStorage.setItem(key, 'true');

                                    enqueueSnackbar(`[${project.name}] removing...`, {
                                        variant: 'info',
                                    });
                                    try {
                                        if (containerStatusRef.current !== ProjectStatus.unknown) {
                                            setContainerStatusByProject(project.domain, ProjectStatus.stopping);
                                            await Self.stopProject(project);
                                            while (containerStatusRef.current !== ProjectStatus.unknown) {
                                                await sleep(500);
                                            }
                                        }
                                        Self.removeApp(project)
                                            .then(() => {
                                                enqueueSnackbar(`The app [${project.name}] was removed with success.`, {
                                                    variant: 'success',
                                                });
                                                refreshProjects();
                                                navigate('/home/projects');
                                            })
                                            .catch(() => {
                                                enqueueSnackbar(
                                                    `Couldn't complete the removal of the app [${project.name}] with success!`,
                                                    {
                                                        variant: 'error',
                                                        autoHideDuration: 8000,
                                                    },
                                                );
                                            })
                                            .finally(() => {
                                                sessionStorage.removeItem(key);
                                                setLoaderVisible(false);
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
                                } else {
                                    enqueueSnackbar(
                                        `The app [${project.name}] is already being removed. please wait!`,
                                        {
                                            variant: 'warning',
                                        },
                                    );
                                    setLoaderVisible(false);
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
                        <Delete />
                    </ListItemIcon>
                    <ListItemText primary={'Remove app'} />
                </ListItemButton>
            </ListItem>
        </List>
    );
}
