import { Layers, LocalGroceryStore, SentimentVeryDissatisfied, Settings } from '@mui/icons-material';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from 'src/assets/img/logo.png';
import { openExternal } from 'src/helpers/helpers';
import { Self } from 'src/helpers/self';
import { projectRepositoryNewIssueUrl } from 'src/shared/constants';
import Styles from './index.module.scss';

export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [version, setVersion] = useState('');

    useEffect(() => {
        Self.getVersion().then((res) => {
            setVersion(res);
        });
    }, []);

    function isActive(route: string) {
        return location.pathname.startsWith(route);
    }

    return (
        <Stack direction={'column'} gap='6px' sx={{ height: '100%' }}>
            <div style={{ padding: 0, paddingLeft: '5px', paddingRight: '5px', width: '100%' }}>
                <img src={logo} style={{ width: '100%' }} />
            </div>
            <Stack direction={'column'} gap='6px' sx={{ px: '5px', overflowY: 'auto' }}>
                <Tooltip title='Projects'>
                    <IconButton
                        className={Styles.iconButton}
                        onClick={() => {
                            navigate('/home/projects');
                        }}
                        color={isActive('/home/projects') ? 'info' : undefined}
                    >
                        <Layers />
                    </IconButton>
                </Tooltip>
                <Tooltip title='Marketplace'>
                    <IconButton
                        className={Styles.iconButton}
                        onClick={() => {
                            navigate('/home/marketplace');
                        }}
                        color={isActive('/home/marketplace') ? 'info' : undefined}
                    >
                        <LocalGroceryStore />
                    </IconButton>
                </Tooltip>
                <Tooltip title='Settings'>
                    <IconButton
                        className={Styles.iconButton}
                        onClick={() => {
                            navigate('/home/settings');
                        }}
                        color={isActive('/home/settings') ? 'info' : undefined}
                    >
                        <Settings />
                    </IconButton>
                </Tooltip>
                <Tooltip title='Report'>
                    <IconButton
                        className={Styles.iconButton}
                        onClick={() => {
                            openExternal(projectRepositoryNewIssueUrl);
                        }}
                    >
                        <SentimentVeryDissatisfied />
                    </IconButton>
                </Tooltip>
            </Stack>
            <div style={{ flex: 1 }}></div>
            <div style={{ background: '#ffffff22' }}>
                <Tooltip title={version}>
                    <Typography
                        sx={{
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textWrap: 'nowrap',
                            px: '2px',
                        }}
                    >
                        {version}
                    </Typography>
                </Tooltip>
            </div>
        </Stack>
    );
}
