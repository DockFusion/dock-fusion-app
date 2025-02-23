import { Circle, Warning } from '@mui/icons-material';
import { Button, ClickAwayListener, Popover, PopoverPosition, Stack, Tooltip, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import noImage from 'src/renderer/assets/img/no_image.jpg';
import { useDockerStatusTrackerContext } from 'src/renderer/components/DockerStatusTracker/useDockerStatusTrackerContext';
import { getLogoUrlByProject } from 'src/renderer/helpers/github';
import { Self } from 'src/renderer/helpers/self';
import { ProjectItemSettings } from '../ProjectItem/components/ProjectItemSettings';

interface Props {
    project: IProjectWithMarketPlace;
}

export function ProjectsButton(props: Props) {
    const [logoUrl, setLogoUrl] = useState('');
    const navigate = useNavigate();
    const { containerStatusColor } = useDockerStatusTrackerContext({ project: props.project });
    const location = useLocation();
    const [needRebuild, setNeedRebuild] = useState(false);
    const projectRef = useRef(props.project);
    projectRef.current = props.project;
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorPosition, setAnchorPosition] = useState<PopoverPosition | undefined>(undefined);
    const [contextMenuOpen, setContextMenuOpen] = useState(false);

    const handleClick = (event) => {
        event.preventDefault();
        setAnchorPosition({
            top: event.clientY,
            left: event.clientX,
        });
        setContextMenuOpen(true);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const isActive = useMemo(() => {
        const route = `/home/projects/${props.project.domain}`;
        return location.pathname === route || location.pathname.startsWith(`${route}/`);
    }, [location.pathname, props.project.domain]);

    useEffect(() => {
        const project = props.project;
        Self.doesExistAtProject(project, 'needRebuild').then((res) => {
            if (projectRef.current?.domain !== project.domain) {
                return;
            }
            setNeedRebuild(res);
        });
    }, [containerStatusColor]);

    useEffect(() => {
        getLogoUrlByProject(props.project).then((res) => {
            setLogoUrl(res);
        });
    }, [props.project.marketplaceItem]);

    return (
        <>
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
                    onContextMenu={handleClick}
                    color={isActive ? 'info' : undefined}
                >
                    {needRebuild && (
                        <Stack justifyContent={'center'} sx={{ height: '100%' }}>
                            <Tooltip title={`Needs to be rebuilt to apply changes`}>
                                <Warning fontSize='small' color='warning' />
                            </Tooltip>
                        </Stack>
                    )}
                    <Typography noWrap>{props.project.name}</Typography>
                </Button>
            </Tooltip>
            <Popover
                anchorReference='anchorPosition'
                anchorPosition={anchorPosition}
                keepMounted
                open={contextMenuOpen}
                onClose={handleClose}
                slotProps={{
                    root: {
                        style: {
                            pointerEvents: 'none',
                        },
                    },
                    paper: {
                        style: {
                            pointerEvents: 'auto',
                        },
                    },
                }}
                hideBackdrop
            >
                <ClickAwayListener
                    mouseEvent='onMouseDown'
                    touchEvent='onTouchStart'
                    onClickAway={() => setContextMenuOpen(false)}
                >
                    <div>
                        <ProjectItemSettings
                            projectDomain={props.project.domain}
                            dense
                            onClick={() => setContextMenuOpen(false)}
                        />
                    </div>
                </ClickAwayListener>
            </Popover>
        </>
    );
}
