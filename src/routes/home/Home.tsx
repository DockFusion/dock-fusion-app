import { Paper, Stack } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Marketplace } from './pages/Marketplace/Marketplace';
import { Projects } from './pages/Projects/Projects';
import { Settings } from './pages/Settings/Settings';

export function Home() {
    return (
        <>
            <Stack direction={'row'} sx={{ display: 'inline-flex', width: '100%' }}>
                <Paper sx={{ width: '8vw', maxWidth: '70px', height: '100vh' }}>
                    <Sidebar />
                </Paper>
                <Paper sx={{ height: '100vh', flex: '1', overflow: 'hidden', maxWidth: 'calc(100% - min(8vw, 70px))' }}>
                    <Routes>
                        <Route path='/projects/*' element={<Projects />} />
                        <Route path='/marketplace/*' element={<Marketplace />} />
                        <Route path='/settings/*' element={<Settings />} />
                        <Route path='/*' element={<Navigate to='/home/projects' replace />} />
                    </Routes>
                </Paper>
            </Stack>
        </>
    );
}
