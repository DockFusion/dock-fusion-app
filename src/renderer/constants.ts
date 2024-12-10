import { ProjectStatus } from './enums';

export const ProjectStatusOrder = [
    ProjectStatus.stopping,
    ProjectStatus.starting,
    ProjectStatus.error,
    ProjectStatus.stopped,
    ProjectStatus.paused,
    ProjectStatus.running,
    ProjectStatus.unknown,
];
