import { Clear, Search } from '@mui/icons-material';
import { Container, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { usePageLoaderContext } from 'src/renderer/components/PageLoader/usePageLoaderContext';
import { useProjectsContext } from 'src/renderer/components/ProjectsProvider/useProjectsContext';
import { ProjectItem } from './components/ProjectItem/ProjectItem';
import { ProjectItemEditForm } from './components/ProjectItemEditForm/ProjectItemEditForm';
import { ProjectsButton } from './components/ProjectsButton/ProjectsButton';

export function Projects() {
    const { setLoaderVisible } = usePageLoaderContext();
    const [search, setSearch] = useState('');
    const [inited, setInited] = useState(false);
    const location = useLocation();
    const { projects } = useProjectsContext();

    useEffect(() => {
        setLoaderVisible(false);
        setInited(true);
        return () => {
            setLoaderVisible(true);
        };
    }, []);

    useEffect(() => {
        if (inited && location.pathname === '/home/projects') {
            setLoaderVisible(false);
        }
    }, [location]);

    return (
        <Stack direction={'row'} sx={{ height: '100%', width: '100%', maxWidth: 'calc(100vw - min(8vw, 70px))' }}>
            <Container sx={{ width: '22vw', maxWidth: '200px', height: '100%' }} style={{ padding: 0, margin: 0 }}>
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
                        {projects.map((project) => {
                            if (
                                project.name.toLowerCase().includes(search.toLowerCase()) ||
                                project.domain.toLowerCase().includes(search.toLowerCase())
                            ) {
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
                    <Route path='/:projectDomain/edit/*' element={<ProjectItemEditForm projects={projects} />} />
                    <Route path='/:projectDomain/*' element={<ProjectItem projects={projects} />} />
                    <Route path='/*' element={<Navigate to='/home/marketplace' replace />} />
                </Routes>
            </Container>
        </Stack>
    );
}
