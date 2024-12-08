import { createContext, useEffect, useRef, useState } from 'react';
import { ProjectStatusOrder } from 'src/constants';
import { ProjectStatus } from 'src/enums';
import { Api } from 'src/helpers/api';
import { Docker } from 'src/helpers/docker';
import { getNewContainerStatus } from 'src/helpers/helpers';

export const DockerStatusTrackerContext = createContext<{
    containerStatus: any;
}>({
    containerStatus: {},
});
const projectKey = 'com.docker.compose.project';

export const DockerStatusTrackerContextProvider = (props: any) => {
    const [containerStatus, setContainerStatus] = useState<any>({});
    const containerStatusRef = useRef(containerStatus);
    containerStatusRef.current = containerStatus;
    const containerStatusWaiterRef = useRef<any>({});
    const containerStatusWaiterProcessingRef = useRef<any>({});
    const containersTracked = useRef<any>({});

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        function refreshContainerStatus() {
            for (const project of Object.keys(containersTracked.current)) {
                const containers = containersTracked.current[project];

                const containersTrackedArray: ProjectStatus[] = Object.values(containers);
                if (!containersTrackedArray.length) {
                    continue;
                }

                let currentStatus = containersTrackedArray[0];
                let currentStatusIndex = ProjectStatusOrder.indexOf(containersTrackedArray[0]);
                for (const projectContainerStatus of containersTrackedArray) {
                    if (ProjectStatusOrder.indexOf(projectContainerStatus) < currentStatusIndex) {
                        currentStatus = projectContainerStatus;
                    }
                }
                containerStatusRef.current[project] = currentStatus;
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
                const project = container.Labels[projectKey];
                const name = container.Names[0].slice(1);

                if (containersTrackedStatus[project] == null) {
                    containersTrackedStatus[project] = {};
                }
                containersTrackedStatus[project][name] = getNewContainerStatus(container.State);
            }
            containersTracked.current = containersTrackedStatus;

            refreshContainerStatus();
        });

        function containerStatusWaiter(id: string, project: string, name: string, originalStatus: ProjectStatus) {
            if (containerStatusWaiterRef.current[project] == null) {
                containerStatusWaiterRef.current[project] = {};
            }
            if (containerStatusWaiterProcessingRef.current[project] == null) {
                containerStatusWaiterProcessingRef.current[project] = {};
            }
            if (containersTracked.current[project] == null) {
                containersTracked.current[project] = {};
            }
            if (containerStatusWaiterProcessingRef.current[project][name]) {
                return;
            }
            containerStatusWaiterProcessingRef.current[project][name] = true;

            Docker.inpectContainer(id).then(async (info) => {
                if (info) {
                    containersTracked.current[project][name] = getNewContainerStatus(info.State.Status);
                    refreshContainerStatus();

                    if (containersTracked.current[project][name] !== originalStatus) {
                        clearInterval(containerStatusWaiterRef.current[project][name]);
                        containerStatusWaiterRef.current[project][name] = null;
                    }
                } else {
                    clearInterval(containerStatusWaiterRef.current[project][name]);
                    containerStatusWaiterRef.current[project][name] = null;
                }
                containerStatusWaiterProcessingRef.current[project][name] = false;
            });
        }

        function setupContainerStatusWaiter(id: string, project: string, name: string, originalStatus: ProjectStatus) {
            if (containerStatusWaiterRef.current[project] == null) {
                containerStatusWaiterRef.current[project] = {};
            }
            if (containerStatusWaiterRef.current[project][name]) {
                return;
            }
            containerStatusWaiterRef.current[project][name] = setInterval(() => {
                containerStatusWaiter(id, project, name, originalStatus);
            }, 50);
        }

        const containerEventCB = (_: any, event: any) => {
            if (signal.aborted) {
                return;
            }
            const project = event.attributes[projectKey];
            const name = event.name;

            if (containerStatusWaiterRef.current[project] == null) {
                containerStatusWaiterRef.current[project] = {};
            }
            if (containerStatusWaiterProcessingRef.current[project] == null) {
                containerStatusWaiterProcessingRef.current[project] = {};
            }
            if (containersTracked.current[project] == null) {
                containersTracked.current[project] = {};
            }

            const originalStatus = containersTracked.current[project][name] ?? ProjectStatus.unknown;

            if (event.action === 'kill') {
                containersTracked.current[project][name] = ProjectStatus.stopping;
                refreshContainerStatus();

                clearInterval(containerStatusWaiterRef.current[project][name]);
                containerStatusWaiterRef.current[project][name] = null;
                containerStatusWaiterProcessingRef.current[project][name] = false;
            } else if (event.action === 'create') {
                containersTracked.current[project][name] = ProjectStatus.starting;
                refreshContainerStatus();

                clearInterval(containerStatusWaiterRef.current[project][name]);
                containerStatusWaiterRef.current[project][name] = null;
                containerStatusWaiterProcessingRef.current[project][name] = false;
            } else if (event.action === 'destroy') {
                containersTracked.current[project][name] = ProjectStatus.unknown;
                refreshContainerStatus();

                clearInterval(containerStatusWaiterRef.current[project][name]);
                containerStatusWaiterRef.current[project][name] = null;
                containerStatusWaiterProcessingRef.current[project][name] = false;
            } else {
                setupContainerStatusWaiter(event.id, project, name, originalStatus);
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

    return (
        <DockerStatusTrackerContext.Provider value={{ containerStatus: containerStatus }}>
            {props.children}
        </DockerStatusTrackerContext.Provider>
    );
};
