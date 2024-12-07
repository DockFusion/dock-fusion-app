import { Clear, Search } from '@mui/icons-material';
import { Container, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { usePageLoaderContext } from 'src/components/PageLoader/usePageLoaderContext';
import { getMarketplaceItems } from 'src/helpers/helpers';
import { Self } from 'src/helpers/self';
import { ProjectItem } from './components/ProjectItem/ProjectItem';
import { ProjectsButton } from './components/ProjectsButton/ProjectsButton';

export function Projects() {
    const { setLoaderVisible } = usePageLoaderContext();
    const [projectsList, setProjectsList] = useState<IProjectWithMarketPlace[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const marketplaceItems = getMarketplaceItems();

        const mappedMarketplaceItems = {};
        for (const marketplaceItem of marketplaceItems) {
            mappedMarketplaceItems[marketplaceItem.id] = marketplaceItem;
        }

        Self.getProjectsList()
            .then((projects) => {
                setProjectsList(
                    projects.map((project) => {
                        const cleanName = project.domain.replaceAll('-', ' ');
                        return {
                            ...project,
                            name: `${cleanName.charAt(0).toUpperCase()}${cleanName.slice(1)}`,
                            marketplaceItem: mappedMarketplaceItems[project.appId],
                        };
                    }),
                );
            })
            .finally(() => {
                setLoaderVisible(false);
            });

        return () => {
            setLoaderVisible(true);
        };
    }, []);

    return (
        <Stack direction={'row'} sx={{ height: '100%', width: '100%', maxWidth: 'calc(100vw - min(8vw, 70px))' }}>
            <Container sx={{ width: '22vw', maxWidth: '200px', height: '100%' }} style={{ padding: 0 }}>
                <Stack gap='6px' sx={{ px: '10px', height: '100%' }}>
                    <TextField
                        placeholder='Search'
                        value={search}
                        onChange={(e) => {
                            setSearch(e.currentTarget.value);
                        }}
                        slotProps={{
                            input: {
                                endAdornment: search !== '' && (
                                    <InputAdornment position='end'>
                                        <IconButton
                                            size='small'
                                            onClick={() => {
                                                setSearch('');
                                            }}
                                        >
                                            <Clear />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <Search />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <Stack gap='6px' sx={{ px: '10px', overflowY: 'auto', flex: 1 }}>
                        {projectsList.map((project) => {
                            if (project.name.toLowerCase().includes(search.toLowerCase())) {
                                return <ProjectsButton key={project.domain} project={project} />;
                            }
                            return <Fragment key={project.domain} />;
                        })}
                    </Stack>
                </Stack>
            </Container>
            <Container
                sx={{
                    height: '100%',
                    flex: '1',
                    width: '100%',
                    maxWidth: 'calc(100vw - min(8vw, 70px) - min(22vw, 200px))',
                }}
                style={{ padding: 0 }}
            >
                <Routes>
                    <Route path='/' element={<Typography>Select an project from the left</Typography>} />
                    <Route path='/:projectDomain/*' element={<ProjectItem projects={projectsList} />} />
                    <Route path='/*' element={<Navigate to='/home/marketplace' replace />} />
                </Routes>
            </Container>
        </Stack>
    );
}
