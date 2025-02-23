import { Circle } from '@mui/icons-material';
import { Button, Tooltip, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import noImage from 'src/renderer/assets/img/no_image.jpg';
import { useDockerStatusTrackerContext } from 'src/renderer/components/DockerStatusTracker/useDockerStatusTrackerContext';
import { getLogoUrlByProject } from 'src/renderer/helpers/github';

interface Props {
    project: IProjectWithMarketPlace;
}

export function ProjectsButton(props: Props) {
    const [logoUrl, setLogoUrl] = useState('');
    const navigate = useNavigate();
    const { containerStatusColor } = useDockerStatusTrackerContext({ project: props.project });
    const location = useLocation();

    const isActive = useMemo(() => {
        const route = `/home/projects/${props.project.domain}`;
        return location.pathname === route || location.pathname.startsWith(`${route}/`);
    }, [location.pathname, props.project.domain]);

    useEffect(() => {
        getLogoUrlByProject(props.project).then((res) => {
            setLogoUrl(res);
        });
    }, [props.project.marketplaceItem]);

    return (
        <Tooltip title={props.project.name} placement='bottom'>
            <Button
                startIcon={
                    <object
                        data={logoUrl}
                        height={'20px'}
                        width={'20px'}
                        type='image/png'
                        style={{ objectFit: 'contain' }}
                    >
                        <img src={noImage} height={'20px'} width={'20px'} style={{ objectFit: 'contain' }} />
                    </object>
                }
                endIcon={<Circle color={containerStatusColor} />}
                sx={{ justifyContent: 'left' }}
                onClick={() => {
                    navigate(`/home/projects/${props.project.domain}`);
                }}
                color={isActive ? 'info' : undefined}
            >
                <Typography noWrap>{props.project.name}</Typography>
            </Button>
        </Tooltip>
    );
}
