import { Backdrop, Box, CircularProgress } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { createContext, Dispatch, SetStateAction, useState } from 'react';
import { AlertDialog } from '../AlertDialog/AlertDialog';

export const PageLoaderContext = createContext<{
    loaderVisible: boolean;
    setLoaderVisible: Dispatch<SetStateAction<boolean>>;
}>({
    loaderVisible: false,
    setLoaderVisible: () => {},
});

export const PageLoaderContextProvider = (props: any) => {
    const [loaderVisible, setLoaderVisible] = useState(true);

    return (
        <PageLoaderContext.Provider
            value={{
                loaderVisible,
                setLoaderVisible,
            }}
        >
            <SnackbarProvider autoHideDuration={5000} maxSnack={3}>
                <Backdrop open={loaderVisible} mountOnEnter unmountOnExit>
                    <Box sx={{ display: 'flex' }}>
                        <CircularProgress sx={{ color: 'white' }} />
                    </Box>
                </Backdrop>
                {props.children}
                <AlertDialog />
            </SnackbarProvider>
        </PageLoaderContext.Provider>
    );
};
