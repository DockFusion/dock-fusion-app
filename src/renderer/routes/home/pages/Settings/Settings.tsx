import { Button, Container, Stack } from '@mui/material';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { usePageLoaderContext } from 'src/renderer/components/PageLoader/usePageLoaderContext';
import { Integrations } from './components/Integrations/Integrations';
import { Troubleshoot } from './components/Troubleshoot/Troubleshoot';

export function Settings() {
    const { setLoaderVisible } = usePageLoaderContext();
    const navigate = useNavigate();
    const location = useLocation();

    function isActive(route: string) {
        return location.pathname.startsWith(route);
    }

    return (
        <Stack direction={'row'} sx={{ height: '100%' }}>
            <Container sx={{ width: '22vw', maxWidth: '200px', height: '100%' }} style={{ padding: 0 }}>
                <Stack gap='6px' sx={{ px: '10px' }}>
                    <Button
                        onClick={() => {
                            navigate('integrations');
                        }}
                        fullWidth
                        color={isActive('/home/settings/integrations') ? 'info' : undefined}
                    >
                        Integrations
                    </Button>
                    <Button
                        onClick={() => {
                            navigate('troubleshoot');
                        }}
                        fullWidth
                        color={isActive('/home/settings/troubleshoot') ? 'info' : undefined}
                    >
                        Troubleshoot
                    </Button>
                </Stack>
            </Container>
            <Container sx={{ height: '100%', flex: '1' }} style={{ padding: 0 }}>
                <Routes>
                    <Route path='/integrations' element={<Integrations />} />
                    <Route path='/troubleshoot' element={<Troubleshoot />} />
                    <Route path='/*' element={<Navigate to='/home/settings/integrations' replace />} />
                </Routes>
            </Container>
        </Stack>
    );
}
