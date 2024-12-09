import { useContext } from 'react';
import { ProjectsContext } from './ProjectsContextProvider';

interface Props {}

export const useProjectsContext = (props?: Props) => {
    const context = useContext(ProjectsContext);

    return context;
};
