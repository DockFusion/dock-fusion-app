import { Save } from '@mui/icons-material';
import { Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useProjectsContext } from 'src/renderer/components/ProjectsProvider/useProjectsContext';
import { Self } from 'src/renderer/helpers/self';
import { IProject } from 'src/shared/interfaces';

interface Props {
    project: IProject;
    onClose: () => void;
}

export function RenameAppForm(props: Props) {
    const [appName, setAppName] = useState(props.project.label ?? '');
    const { refreshProjects } = useProjectsContext();

    function renameApp() {
        Self.renameApp(appName, props.project)
            .then(() => {
                props.onClose();
                enqueueSnackbar(`Project renamed to ${appName}.`, {
                    variant: 'success',
                });
                refreshProjects();
            })
            .catch(() => {
                enqueueSnackbar(`Couldn't set the project name to ${appName}.`, {
                    variant: 'error',
                });
            });
    }

    return (
        <Card sx={{ maxWidth: '250px' }}>
            <CardContent>
                <Stack direction={'column'} gap={'10px'}>
                    <Typography variant={'h6'}>Rename app</Typography>
                    <TextField
                        value={appName}
                        onChange={(e) => {
                            setAppName(e.currentTarget.value);
                        }}
                    />

                    <Stack direction={'column'} gap={'10px'} alignItems={'flex-end'}>
                        <Button startIcon={<Save />} onClick={renameApp} sx={{ width: 'fit-content' }}>
                            Save
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
