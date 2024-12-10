import { Card, ImageListItem, Stack, Tooltip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
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

    useEffect(() => {
        Self.getEnvironmentByProject(props.project).then((envVars) => {
            setAppPath(envVars.APP_CODE_PATH_HOST ?? '');
            setAppDataPath(envVars.DATA_PATH_HOST ?? '');
        });
    }, [props.project]);

    return (
        <ImageListItem>
            <Card sx={{ backgroundColor: '#252525', p: '5px', overflow: 'hidden' }}>
                <CardInfo title={'Stack'}>
                    <Tooltip placement='bottom' title={props.project.marketplaceItem.name}>
                        <Typography noWrap>{props.project.marketplaceItem.name}</Typography>
                    </Tooltip>
                </CardInfo>
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
                        <Tooltip placement='bottom' title={appPath}>
                            <Typography noWrap height='fit-content'>
                                {appPath}
                            </Typography>
                        </Tooltip>
                    </CardInfo>
                )}
                {appDataPath && (
                    <CardInfo title={'Data location'}>
                        <Tooltip placement='bottom' title={appDataPath}>
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
