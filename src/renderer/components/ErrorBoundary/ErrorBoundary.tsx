import { Error } from '@mui/icons-material';
import { Box, Button, Container, CssBaseline, Grid2 as Grid, Paper, Typography } from '@mui/material';
import { Component } from 'react';
import { i18n } from 'src/renderer/i18n';

interface ErrorBoundaryProps {
    children: JSX.Element;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, any> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            clearCache: true,
        };
    }

    static getDerivedStateFromError(error: any) {
        // Update state so the next render will show the fallback UI.
        console.error(error);
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error(error, errorInfo);

        // Helpers.notifyToSlackChannel(
        //     Servers.mainApi,
        //     `Problem <${window.location.href}|here>
        //     *${error.name}: ${error.message}*
        //     ${'```'}${error.stack}${'```'}`,
        // );
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <>
                    <CssBaseline />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                        <Paper sx={{ width: '400px', maxWidth: '100%', overflow: 'hidden' }}>
                            <Container>
                                <Box sx={{ paddingBottom: '10px', paddingTop: '10px' }}>
                                    <Grid container>
                                        <Grid size={12}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '100%',
                                                }}
                                            >
                                                <Error color='error' fontSize='large' />
                                            </Box>
                                        </Grid>
                                        <Grid size={12}>
                                            <Typography variant='h5'>{i18n.t('info.error')}</Typography>
                                        </Grid>
                                        <Grid size={12}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '100%',
                                                }}
                                            >
                                                <Button
                                                    onClick={() => {
                                                        window.location.reload();
                                                    }}
                                                >
                                                    {i18n.t('label.refresh_window')}
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Container>
                        </Paper>
                    </Box>
                </>
            );
        }

        return this.props.children;
    }
}
