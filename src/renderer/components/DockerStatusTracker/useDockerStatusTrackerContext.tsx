import { useContext, useMemo } from 'react';
import { ProjectStatus } from 'src/renderer/enums';
import { dockerGroupName } from 'src/shared/constants';
import { IProject } from 'src/shared/interfaces';
import { DockerStatusTrackerContext } from './DockerStatusTrackerContextProvider';

interface Props {
    project?: IProject;
}

export const useDockerStatusTrackerContext = (props?: Props) => {
    const context = useContext(DockerStatusTrackerContext);
    const project = useMemo(() => {
        return props.project ? `${dockerGroupName}-${props.project.domain}` : '';
    }, [props.project]);

    const containerStatus = useMemo(() => {
        return context.containerStatus[project]?.status ?? ProjectStatus.unknown;
    }, [context.containerStatus, project]);

    const containerStatusColor = useMemo<'success' | 'warning' | 'error' | 'disabled'>(() => {
        switch (containerStatus) {
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
    }, [containerStatus]);

    const containerId = useMemo(() => {
        return context.containerStatus[project]?.id;
    }, [context.containerStatus, project]);

    return {
        containerId,
        containerStatus,
        containerStatusColor,
        setContainerStatusByProject: context.setContainerStatusByProject,
    };
};
