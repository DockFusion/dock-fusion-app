import { AccessTimeFilled, Done, QuestionMark } from '@mui/icons-material';
import { CircularProgress, Typography } from '@mui/material';

export enum StepStatus {
    notRunning,
    waiting,
    running,
    done,
}

interface Props {
    title: string;
    status?: StepStatus;
}

function getIcon(status: StepStatus) {
    switch (status) {
        case StepStatus.notRunning:
        case StepStatus.waiting:
            return <AccessTimeFilled sx={{ width: '20px' }} />;

        case StepStatus.running:
            return <CircularProgress style={{ color: 'white', width: '20px', height: '20px' }} />;

        case StepStatus.done:
            return <Done sx={{ width: '20px' }} />;

        default:
            return <QuestionMark sx={{ width: '20px' }} />;
    }
}

export function Step(props: Props) {
    return (
        <div style={{ display: 'flex', gap: '5px' }}>
            {getIcon(props.status ?? StepStatus.notRunning)}
            <Typography>{props.title}</Typography>
        </div>
    );
}
