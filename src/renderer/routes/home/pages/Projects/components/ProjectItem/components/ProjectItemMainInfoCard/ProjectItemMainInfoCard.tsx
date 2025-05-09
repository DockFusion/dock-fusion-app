import { Card, ImageListItem, Stack, Tooltip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { openExternal } from 'src/renderer/helpers/helpers';
import { Self } from 'src/renderer/helpers/self';

interface Props {
    project: IProjectWithMarketPlace;
}

function CardInfo(props: { title: string; children: JSX.Element }) {
    return (
        <Stack direction={'row'} justifyContent={'space-between'} gap={'20px'} alignItems={'center'}>
            <Typography>{props.title}</Typography>
            {props.children}
        </Stack>
    );
}

export function ProjectItemMainInfoCard(props: Props) {
    const [appPath, setAppPath] = useState('');
    const [appDataPath, setAppDataPath] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!props.project) {
            return;
        }
        Self.getEnvironmentByProject(props.project).then((envVars) => {
            setAppPath(envVars.APP_CODE_PATH_HOST ?? '');
            setAppDataPath('');

            const newAppDataPath = envVars.DATA_PATH_HOST ?? '';
            Self.doesExist(newAppDataPath).then((exists) => {
                if (exists) {
                    setAppDataPath(newAppDataPath);
                }
            });
        });
    }, [props.project]);

    return (
        <ImageListItem>
            <Card sx={{ backgroundColor: '#252525', p: '5px', overflow: 'hidden' }}>
                {props.project.marketplaceItem ? (
                    <CardInfo title={'Stack'}>
                        <Tooltip
                            placement='bottom'
                            title={props.project.marketplaceItem.name}
                            onClick={() => {
                                navigate(`/home/marketplace/${props.project.marketplaceItem.id}`);
                            }}
                            style={{
                                cursor: 'pointer',
                            }}
                        >
                            <Typography noWrap>{props.project.marketplaceItem.name}</Typography>
                        </Tooltip>
                    </CardInfo>
                ) : (
                    <></>
                )}
                <CardInfo title={'Host'}>
                    <Tooltip
                        placement='bottom'
                        title={`https://${props.project.domain}.dock-fusion.run`}
                        onClick={() => {
                            openExternal(`https://${props.project.domain}.dock-fusion.run`);
                        }}
                        style={{
                            cursor: 'pointer',
                        }}
                    >
                        <Typography noWrap>{`https://${props.project.domain}.dock-fusion.run`}</Typography>
                    </Tooltip>
                </CardInfo>
                {appPath && (
                    <CardInfo title={'Project location'}>
                        <Tooltip
                            placement='bottom'
                            title={appPath}
                            onClick={() => {
                                Self.openFolder(appPath);
                            }}
                            style={{
                                cursor: 'pointer',
                            }}
                        >
                            <Typography noWrap height='fit-content'>
                                {appPath}
                            </Typography>
                        </Tooltip>
                    </CardInfo>
                )}
                {appDataPath && (
                    <CardInfo title={'Data location'}>
                        <Tooltip
                            placement='bottom'
                            title={appDataPath}
                            onClick={() => {
                                Self.openFolder(appDataPath);
                            }}
                            style={{
                                cursor: 'pointer',
                            }}
                        >
                            <Typography noWrap height='fit-content'>
                                {appDataPath}
                            </Typography>
                        </Tooltip>
                    </CardInfo>
                )}
            </Card>
        </ImageListItem>
    );
}
