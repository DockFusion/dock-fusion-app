import { Circle } from '@mui/icons-material';
import { Button, Tooltip, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import noImage from 'src/assets/img/no_image.jpg';
import { Api } from 'src/helpers/api';
import { Docker } from 'src/helpers/docker';
import { getLogoUrlByProject } from 'src/helpers/github';
import { dockerGroupName } from 'src/shared/constants';

interface Props {
    project: IProjectWithMarketPlace;
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

export function ProjectsButton(props: Props) {
    const [logoUrl, setLogoUrl] = useState('');
    const navigate = useNavigate();
    const [containerStatus, setContainerStatus] = useState<ProjectStatus>(ProjectStatus.unknown);
    const containerStatusWaiterRef = useRef<NodeJS.Timeout | null>(null);
    const containerIdRef = useRef<string | null>(null);
    const containerStatusWaiterProcessingRef = useRef<boolean>(false);

    function isActive(route: string) {
        return location.pathname === route || location.pathname.startsWith(`${route}/`);
    }

    useEffect(() => {
        getLogoUrlByProject(props.project).then((res) => {
            setLogoUrl(res);
        });
    }, [props.project.marketplaceItem]);

    useEffect(() => {
        const projectKey = 'com.docker.compose.project';
        const project = `${dockerGroupName}-${props.project.domain}`;

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
    }, [props.project]);

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
        <Tooltip title={props.project.name} placement='bottom'>
            <Button
                startIcon={
                    <object
                        data={logoUrl}
                        height={'20px'}
                        width={'20px'}
                        type='image/png'
                        style={{ objectFit: 'contain' }}
                    >
                        <img src={noImage} height={'20px'} width={'20px'} style={{ objectFit: 'contain' }} />
                    </object>
                }
                endIcon={<Circle color={getStatusColor(containerStatus)} />}
                sx={{ justifyContent: 'left' }}
                onClick={() => {
                    navigate(`/home/projects/${props.project.domain}`);
                }}
                color={isActive(`/home/projects/${props.project.domain}`) ? 'info' : undefined}
            >
                <Typography noWrap>{props.project.name}</Typography>
            </Button>
        </Tooltip>
    );
}
