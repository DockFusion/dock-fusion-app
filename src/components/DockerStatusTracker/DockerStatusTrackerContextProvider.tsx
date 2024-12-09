import { createContext, useEffect, useRef, useState } from 'react';
import { ProjectStatusOrder } from 'src/constants';
import { ProjectStatus } from 'src/enums';
import { Api } from 'src/helpers/api';
import { Docker } from 'src/helpers/docker';
import { getNewContainerStatus } from 'src/helpers/helpers';
import { dockerGroupName } from 'src/shared/constants';

export const DockerStatusTrackerContext = createContext<{
    containerStatus: any;
    setContainerStatusByProject: (domain: string, status: ProjectStatus) => void;
}>({
    containerStatus: {},
    setContainerStatusByProject: () => {},
});
const projectKey = 'com.docker.compose.project';

export const DockerStatusTrackerContextProvider = (props: any) => {
    const [containerStatus, setContainerStatus] = useState<any>({});
    const containerStatusRef = useRef(containerStatus);
    containerStatusRef.current = containerStatus;
    const containerStatusWaiterRef = useRef<any>({});
    const containerStatusWaiterIdRef = useRef<any>({});
    const containerStatusWaiterAbortControllerRef = useRef<any>({});
    const containerLatestRequestRef = useRef<any>({});
    const containerStatusWaiterProcessingRef = useRef<any>({});
    const containersTracked = useRef<any>({});

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        function refreshContainerStatus() {
            for (const project of Object.keys(containersTracked.current)) {
                const containers = containersTracked.current[project];

                const containersTrackedArray: { id: string; status: ProjectStatus }[] = Object.values(containers);
                if (!containersTrackedArray.length) {
                    continue;
                }

                let currentContainerId = containersTrackedArray[0].id;
                let currentStatus = containersTrackedArray[0].status;
                let currentStatusIndex = ProjectStatusOrder.indexOf(containersTrackedArray[0].status);
                for (const projectContainerStatus of containersTrackedArray) {
                    if (ProjectStatusOrder.indexOf(projectContainerStatus.status) < currentStatusIndex) {
                        currentStatus = projectContainerStatus.status;
                    }
                }
                containerStatusRef.current[project] = {
                    id: currentContainerId,
                    status: currentStatus,
                };
            }
            setContainerStatus({ ...containerStatusRef.current });
        }

        Docker.listContainers().then((containers) => {
            if (!containers.length) {
                containerStatusRef.current = {};
                setContainerStatus(containerStatusRef.current);
                return;
            }

            let containersTrackedStatus = {};
            for (const container of containers) {
                const id = container.Id;
                const project = container.Labels[projectKey];
                const name = container.Names[0].slice(1);

                if (containersTrackedStatus[project] == null) {
                    containersTrackedStatus[project] = {};
                }
                containersTrackedStatus[project][name] = {
                    id: id,
                    status: getNewContainerStatus(container.State),
                };
            }
            containersTracked.current = containersTrackedStatus;

            refreshContainerStatus();
        });

        function setupContainerStatusWaiter(id: string, project: string, name: string) {
            if (containerStatusWaiterRef.current[project] == null) {
                containerStatusWaiterRef.current[project] = {};
            }
            if (containerStatusWaiterAbortControllerRef.current[project] == null) {
                containerStatusWaiterAbortControllerRef.current[project] = {};
            }
            if (containerStatusWaiterIdRef.current[project] == null) {
                containerStatusWaiterIdRef.current[project] = {};
            }
            if (
                containerStatusWaiterIdRef.current[project][name] === id &&
                containerStatusWaiterRef.current[project][name]
            ) {
                return;
            }
            if (containersTracked.current[project][name] == null) {
                containersTracked.current[project][name] = {
                    id: id,
                    status: ProjectStatus.unknown,
                };
            }
            containerStatusWaiterIdRef.current[project][name] = id;
            if (containerStatusWaiterAbortControllerRef.current[project][name]) {
                containerStatusWaiterAbortControllerRef.current[project][name].abort();
            }
            clearInterval(containerStatusWaiterRef.current[project][name]);

            const controller = new AbortController();
            containerStatusWaiterAbortControllerRef.current[project][name] = controller;
            function containerStatusWaiter(id: string, project: string, name: string) {
                if (containerStatusWaiterRef.current[project] == null) {
                    containerStatusWaiterRef.current[project] = {};
                }
                if (containerStatusWaiterIdRef.current[project] == null) {
                    containerStatusWaiterIdRef.current[project] = {};
                }
                if (containersTracked.current[project] == null) {
                    containersTracked.current[project] = {};
                }
                if (containerStatusWaiterProcessingRef.current[project][name]) {
                    return;
                }
                containerStatusWaiterProcessingRef.current[project][name] = true;

                Docker.inpectContainer(id)
                    .then(async (info) => {
                        if (!controller.signal.aborted) {
                            if (info) {
                                let statusToCompare = null;
                                switch (containerLatestRequestRef.current[project][name]) {
                                    case 'rename':
                                    case 'create':
                                    case 'start':
                                    case 'restart':
                                        statusToCompare = ProjectStatus.running;
                                        break;

                                    case 'kill':
                                    case 'stop':
                                        statusToCompare = ProjectStatus.stopped;
                                        break;
                                }
                                containersTracked.current[project][name].status = getNewContainerStatus(
                                    info.State.Status,
                                );
                                refreshContainerStatus();
                                if (containersTracked.current[project][name].status === statusToCompare) {
                                    controller.abort();
                                    clearInterval(containerStatusWaiterRef.current[project][name]);
                                    containerStatusWaiterRef.current[project][name] = null;
                                }
                            } else {
                                containersTracked.current[project][name].status = ProjectStatus.unknown;
                                refreshContainerStatus();
                                controller.abort();
                                clearInterval(containerStatusWaiterRef.current[project][name]);
                                containerStatusWaiterRef.current[project][name] = null;
                            }
                        }
                    })
                    .finally(() => {
                        containerStatusWaiterProcessingRef.current[project][name] = false;
                    });
            }

            containerStatusWaiterRef.current[project][name] = setInterval(() => {
                containerStatusWaiter(id, project, name);
            }, 50);
        }

        const containerEventCB = (_: any, event: any) => {
            if (signal.aborted) {
                return;
            }
            const id = event.id;
            const project = event.attributes[projectKey];
            const name = event.name;

            if (!(name as string).startsWith(dockerGroupName)) {
                return;
            }

            if (containerStatusWaiterRef.current[project] == null) {
                containerStatusWaiterRef.current[project] = {};
            }
            if (containerStatusWaiterIdRef.current[project] == null) {
                containerStatusWaiterIdRef.current[project] = {};
            }
            if (containerLatestRequestRef.current[project] == null) {
                containerLatestRequestRef.current[project] = {};
            }
            if (containerStatusWaiterProcessingRef.current[project] == null) {
                containerStatusWaiterProcessingRef.current[project] = {};
            }
            if (containersTracked.current[project] == null) {
                containersTracked.current[project] = {};
            }

            containerLatestRequestRef.current[project][name] = event.action;
            if (containersTracked.current[project][name] == null) {
                containersTracked.current[project][name] = {
                    id: id,
                    status: ProjectStatus.unknown,
                };
            }

            switch (event.action) {
                case 'die':
                case 'kill':
                    containersTracked.current[project][name].id = id;
                    containersTracked.current[project][name].status = ProjectStatus.stopping;
                    refreshContainerStatus();

                    clearInterval(containerStatusWaiterRef.current[project][name]);
                    containerStatusWaiterRef.current[project][name] = null;
                    containerStatusWaiterProcessingRef.current[project][name] = false;
                    break;

                case 'rename':
                case 'create':
                    containersTracked.current[project][name].id = id;
                    containersTracked.current[project][name].status = ProjectStatus.starting;
                    refreshContainerStatus();

                    clearInterval(containerStatusWaiterRef.current[project][name]);
                    containerStatusWaiterRef.current[project][name] = null;
                    containerStatusWaiterProcessingRef.current[project][name] = false;
                    break;

                default:
                    setupContainerStatusWaiter(id, project, name);
                    break;
            }
        };
        Api.on('docker-container-event', containerEventCB);

        return () => {
            controller.abort();
            for (const waiters of Object.values(containerStatusWaiterRef.current)) {
                for (const waiter of Object.values(waiters)) {
                    clearInterval(waiter as NodeJS.Timeout);
                }
            }
            containerStatusWaiterRef.current = {};
            containerStatusWaiterProcessingRef.current = {};
            //TODO: check later. this does not work
            Api.off('docker-container-event', containerEventCB);
        };
    }, []);

    function setContainerStatusByProject(domain: string, status: ProjectStatus) {
        const project = `${dockerGroupName}-${domain}`;
        if (containerStatusRef.current[project] == null) {
            containerStatusRef.current[project] = {
                id: null,
                status: status,
            };
        }
        for (const key of Object.keys(containersTracked.current[project] ?? {})) {
            containersTracked.current[project][key].status = status;
        }
        setContainerStatus({ ...containerStatusRef.current });
    }

    return (
        <DockerStatusTrackerContext.Provider value={{ containerStatus, setContainerStatusByProject }}>
            {props.children}
        </DockerStatusTrackerContext.Provider>
    );
};
