import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './i18n';

//master base
import { SubRoutes } from './routes/SubRoutes';

import { StyledEngineProvider } from '@mui/material';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { muiDarkTheme } from './assets/muiTheme';
import { DockerStatusTrackerContextProvider } from './components/DockerStatusTracker/DockerStatusTrackerContextProvider';
import { DynamicStrictMode } from './components/DynamicStrictMode/DynamicStrictMode';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { PageLoaderContextProvider } from './components/PageLoader/PageLoaderContextProvider';
import { ProjectsContextProvider } from './components/ProjectsProvider/ProjectsContextProvider';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
    <DynamicStrictMode strictMode={false}>
        <ThemeProvider theme={muiDarkTheme}>
            <StyledEngineProvider>
                <ErrorBoundary>
                    <DockerStatusTrackerContextProvider>
                        <ProjectsContextProvider>
                            <BrowserRouter>
                                <PageLoaderContextProvider>
                                    <Routes>
                                        <Route path='/*' element={<SubRoutes />} />
                                    </Routes>
                                </PageLoaderContextProvider>
                            </BrowserRouter>
                        </ProjectsContextProvider>
                    </DockerStatusTrackerContextProvider>
                </ErrorBoundary>
            </StyledEngineProvider>
        </ThemeProvider>
    </DynamicStrictMode>,
);
