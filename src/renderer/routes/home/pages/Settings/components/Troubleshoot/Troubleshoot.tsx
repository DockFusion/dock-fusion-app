import { Button, Container, Typography } from '@mui/material';
import { useEffect } from 'react';
import { usePageLoaderContext } from 'src/renderer/components/PageLoader/usePageLoaderContext';
import { Self } from 'src/renderer/helpers/self';

export function Troubleshoot() {
    const { setLoaderVisible } = usePageLoaderContext();

    useEffect(() => {
        setLoaderVisible(false);

        return () => {
            setLoaderVisible(true);
        };
    }, []);

    return (
        <Container>
            <Typography>Restart DockFusion</Typography>
            <Typography>Restarting should fix an exception which might have occurred in the app</Typography>
            <Button
                onClick={() => {
                    Self.restart();
                }}
            >
                Restart
            </Button>
        </Container>
    );
}
