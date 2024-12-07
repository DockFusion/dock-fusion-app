import { CircularProgress, Container, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { usePageLoaderContext } from 'src/components/PageLoader/usePageLoaderContext';
import { DetectEditors } from 'src/helpers/detectEditors';
import { DetectShells } from 'src/helpers/detectShells';
import { IEditor, IShell } from 'src/shared/interfaces';

export function Integrations() {
    const { setLoaderVisible } = usePageLoaderContext();
    const [availableEditors, setAvailableEditors] = useState<IEditor[]>([]);
    const [availableShells, setAvalableShells] = useState<IShell[]>([]);
    const [availableEditorsLoaded, setAvailableEditorsLoaded] = useState(false);
    const [availableShellsLoaded, setAvalableShellsLoaded] = useState(false);

    useEffect(() => {
        setLoaderVisible(false);

        DetectEditors.getAvailableEditors().then((result) => {
            setAvailableEditors(result);
            setAvailableEditorsLoaded(true);
        });
        DetectShells.getAvailableShells().then((result) => {
            setAvalableShells(result);
            setAvalableShellsLoaded(true);
        });

        return () => {
            setLoaderVisible(true);
        };
    }, []);

    return (
        <Stack gap='10px' sx={{ height: '100%', width: '100%', overflowY: 'auto' }}>
            {availableEditorsLoaded ? (
                <Container>
                    <Typography>External Editors</Typography>
                    <Typography>Select a default code editor for opening projects</Typography>
                    {availableEditors.map((availableEditor, index) => {
                        return <Typography key={index}>{availableEditor.name}</Typography>;
                    })}
                </Container>
            ) : (
                <CircularProgress />
            )}

            {availableShellsLoaded ? (
                <Container>
                    <Typography>Shells</Typography>
                    <Typography>Select a default shell for opening project path</Typography>
                    {availableShells.map((availableShell, index) => {
                        return <Typography key={index}>{availableShell.name}</Typography>;
                    })}
                </Container>
            ) : (
                <CircularProgress />
            )}
        </Stack>
    );
}
