import { Route, Routes, useNavigate } from 'react-router-dom';

import { InvalidLink } from 'src/components/InvalidLink/InvalidLink';

import { CssBaseline, useTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { useEffect, useState } from 'react';
import { i18n } from 'src/i18n';
import { SubRoutes as EntrypointSubRoutes } from './entrypoint/SubRoutes';
import { SubRoutes as HomeSubRoutes } from './home/SubRoutes';

export function SubRoutes() {
    const [inited, setInited] = useState(false);
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const userLanguage = null;
        const curLanguage = i18n.language;
        i18n.changeLanguage(userLanguage ?? curLanguage);
        setInited(true);
    }, []);

    useEffect(() => {
        if (inited) {
            navigate('/entrypoint');
        }
    }, [inited]);

    if (!inited) {
        return <></>;
    }

    return (
        <>
            <div id='back-to-top-anchor' />
            <CssBaseline />

            <SnackbarProvider autoHideDuration={3000} maxSnack={3}>
                <Routes>
                    <Route path='/entrypoint/*' element={<EntrypointSubRoutes />} />
                    <Route path='/home/*' element={<HomeSubRoutes />} />

                    <Route path='/*' element={<InvalidLink />} />
                </Routes>
            </SnackbarProvider>
        </>
    );
}
