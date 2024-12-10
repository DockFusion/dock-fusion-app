import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './renderer/i18n';

//master base
import { SubRoutes } from './renderer/routes/SubRoutes';

import { StyledEngineProvider } from '@mui/material';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { muiDarkTheme } from './renderer/assets/muiTheme';
import { DockerStatusTrackerContextProvider } from './renderer/components/DockerStatusTracker/DockerStatusTrackerContextProvider';
import { DynamicStrictMode } from './renderer/components/DynamicStrictMode/DynamicStrictMode';
import { ErrorBoundary } from './renderer/components/ErrorBoundary/ErrorBoundary';
import { PageLoaderContextProvider } from './renderer/components/PageLoader/PageLoaderContextProvider';
import { ProjectsContextProvider } from './renderer/components/ProjectsProvider/ProjectsContextProvider';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
    <DynamicStrictMode strictMode={false}>
        <ThemeProvider theme={muiDarkTheme}>
            <StyledEngineProvider>
                <ErrorBoundary>
                    <DockerStatusTrackerContextProvider>
                        <ProjectsContextProvider>
                            <HashRouter>
                                <PageLoaderContextProvider>
                                    <Routes>
                                        <Route path='/*' element={<SubRoutes />} />
                                    </Routes>
                                </PageLoaderContextProvider>
                            </HashRouter>
                        </ProjectsContextProvider>
                    </DockerStatusTrackerContextProvider>
                </ErrorBoundary>
            </StyledEngineProvider>
        </ThemeProvider>
    </DynamicStrictMode>,
);
