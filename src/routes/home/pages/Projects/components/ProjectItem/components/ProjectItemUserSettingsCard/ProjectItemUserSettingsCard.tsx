import { Card, ImageListItem, Stack, Tooltip, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Self } from 'src/helpers/self';

interface Props {
    project: IProjectWithMarketPlace;
}

function CardInfo(props: { title: string; children: JSX.Element }) {
    return (
        <Stack direction={'row'} justifyContent={'space-between'} gap={'20px'}>
            <Typography>{props.title}</Typography>
            {props.children}
        </Stack>
    );
}

export function ProjectItemUserSettingsCard(props: Props) {
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [formStructure, setFormStructure] = useState([]);
    const formStructureRef = useRef(formStructure);
    formStructureRef.current = formStructure;

    useEffect(() => {
        Self.getSettingsByProject(props.project)
            .then((settings) => {
                Self.getEnvironmentByProject(props.project)
                    .then((envVars) => {
                        let formStructure = [];

                        if (settings) {
                            if (settings.user) {
                                if (typeof settings.user === 'object' && !Array.isArray(settings.user)) {
                                    Object.values(settings.user).map((userSetting: any) => {
                                        if (userSetting.target) {
                                            formStructure.push({
                                                title: userSetting.label,
                                                description: userSetting.hint,
                                                type: userSetting.type,
                                                target: userSetting.target,
                                                values: userSetting.values ?? [],
                                                value: envVars[userSetting.target] ?? null,
                                            });
                                        } else {
                                            formStructure.push(
                                                <Typography color='red'>
                                                    {`user setting ${userSetting.label} with incorrect configuration! Please, report this issue if it keeps happening.`}
                                                </Typography>,
                                            );
                                        }
                                    });
                                } else {
                                    console.error(settings.user);
                                    formStructure.push(
                                        <Typography color='red'>
                                            {
                                                'user settings with incorrect format! Please, report this issue if it keeps happening.'
                                            }
                                        </Typography>,
                                    );
                                }
                            }

                            // if (settings.system?.show_localpath_selector) {
                            //     formStructure.push({
                            //         title: 'Project path',
                            //         description:
                            //             'The selected path is where your codes are, use an existing project path or a new one. You may open up this path in your code editor to do changes in real time',
                            //         type: 'path-select',
                            //         value: getDefaultValue('path-select'),
                            //     });
                            // }

                            // if (settings.system?.db_credentials) {
                            //     formStructure.push({
                            //         title: 'Database credentials',
                            //         description: 'Create database, user and password',
                            //         type: 'db-credentials',
                            //         value: getDefaultValue('db-credentials'),
                            //     });
                            // }
                        }
                        setFormStructure(formStructure);
                        setSettingsLoading(false);
                    })
                    .catch(() => {
                        setFormStructure([]);
                    });
            })
            .catch(() => {
                setFormStructure([]);
            });
    }, [props.project]);

    if (!formStructure.length) {
        return <></>;
    }

    return (
        <ImageListItem>
            <Card sx={{ backgroundColor: '#252525', p: '5px', overflow: 'hidden' }}>
                {formStructure.map((el, index) => {
                    return (
                        <CardInfo key={index} title={el.title}>
                            <div style={{ minWidth: '50px', display: 'flex', justifyContent: 'flex-end' }}>
                                <Tooltip placement='bottom' title={el.value}>
                                    <Typography noWrap minWidth={'50px'}>
                                        {el.value}
                                    </Typography>
                                </Tooltip>
                            </div>
                        </CardInfo>
                    );
                })}
            </Card>
        </ImageListItem>
    );
}
