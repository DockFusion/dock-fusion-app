import { Button, Typography } from '@mui/material';
import { useEffect } from 'react';

interface Props {
    startDeck: () => void;
}

export function AllSetAndDone(props: Props) {
    useEffect(() => {
        props.startDeck();
    }, []);

    return (
        <>
            <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                {'Everything ready'}
            </Typography>
            <Typography variant='subtitle2'>
                {'Everything ready to start managing your projects. Hope you enjoy our work ❤️'}
            </Typography>
            <div style={{ height: '5vh' }}></div>
            <Button
                onClick={() => {
                    props.startDeck();
                }}
            >
                {"Let' Go!"}
            </Button>
        </>
    );
}
