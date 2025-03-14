import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { resetGithubTagsOnceByDay } from 'src/renderer/helpers/github';

interface Props {
    nextStep: () => void;
}

export function FinalAdjustments(props: Props) {
    useEffect(() => {
        resetGithubTagsOnceByDay();

        props.nextStep();
    }, []);

    return (
        <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
            {'A fazer os últimos ajustes...'}
        </Typography>
    );
}
