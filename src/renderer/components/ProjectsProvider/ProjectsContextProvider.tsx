import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { getMarketplaceItems, sleep } from 'src/renderer/helpers/helpers';
import { Self } from 'src/renderer/helpers/self';
import { IMarketplaceItem } from 'src/shared/interfaces';

export const ProjectsContext = createContext<{
    projects: IProjectWithMarketPlace[];
    marketplaceItems: IMarketplaceItem[];
    refreshMarketplaceItems: () => Promise<void>;
    refreshProjects: () => Promise<void>;
}>({
    projects: [],
    marketplaceItems: [],
    refreshMarketplaceItems: async () => {},
    refreshProjects: async () => {},
});

export const ProjectsContextProvider = (props: any) => {
    const [projects, setProjects] = useState<IProjectWithMarketPlace[]>([]);
    const [marketplaceItems, setMarketplaceItems] = useState<IMarketplaceItem[]>([]);
    const [projectsUpdateCounter, setProjectsUpdateCounter] = useState(0);
    const projectsUpdateCounterConfirmRef = useRef(0);
    const [marketplaceItemsUpdateCounter, setMarketplaceItemsUpdateCounter] = useState(0);
    const marketplaceItemsUpdateConfirmRef = useRef(0);
    const mappedMarketplaceItems = useMemo(() => {
        let items = {};
        for (const marketplaceItem of marketplaceItems) {
            items[marketplaceItem.id] = marketplaceItem;
        }
        return items;
    }, [marketplaceItems]);

    useEffect(() => {
        projectsUpdateCounterConfirmRef.current++;
    }, [projects]);

    useEffect(() => {
        marketplaceItemsUpdateConfirmRef.current++;
    }, [marketplaceItems]);

    useEffect(() => {
        const marketplaceItems = getMarketplaceItems();
        setMarketplaceItems(marketplaceItems);
    }, [marketplaceItemsUpdateCounter]);

    useEffect(() => {
        Self.getProjectsList().then((projects) => {
            setProjects(
                projects.map((project) => {
                    const cleanName = project.domain.replaceAll('-', ' ');
                    return {
                        ...project,
                        name: project.label ?? `${cleanName.charAt(0).toUpperCase()}${cleanName.slice(1)}`,
                        marketplaceItem: mappedMarketplaceItems[project.appId],
                    };
                }),
            );
        });
    }, [projectsUpdateCounter, marketplaceItems]);

    async function refreshMarketplaceItems() {
        const currentCount = marketplaceItemsUpdateConfirmRef.current;
        setMarketplaceItemsUpdateCounter(marketplaceItemsUpdateCounter + 1);
        while (marketplaceItemsUpdateConfirmRef.current <= currentCount) {
            await sleep(500);
        }
    }

    async function refreshProjects() {
        const currentCount = projectsUpdateCounterConfirmRef.current;
        setProjectsUpdateCounter(projectsUpdateCounter + 1);
        while (projectsUpdateCounterConfirmRef.current <= currentCount) {
            await sleep(500);
        }
    }

    return (
        <ProjectsContext.Provider
            value={{
                projects,
                marketplaceItems,
                refreshMarketplaceItems,
                refreshProjects,
            }}
        >
            {props.children}
        </ProjectsContext.Provider>
    );
};
