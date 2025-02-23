import { Circle, Close, Save } from '@mui/icons-material';
import { Button, Container, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import noImage from 'src/renderer/assets/img/no_image.jpg';
import { useDockerStatusTrackerContext } from 'src/renderer/components/DockerStatusTracker/useDockerStatusTrackerContext';
import { usePageLoaderContext } from 'src/renderer/components/PageLoader/usePageLoaderContext';
import { useProjectsContext } from 'src/renderer/components/ProjectsProvider/useProjectsContext';
import { getLogoUrlByProject } from 'src/renderer/helpers/github';
import { Self } from 'src/renderer/helpers/self';
import { getDefaultValue } from '../../../Marketplace/components/MarketplaceItem/components/MarketplaceItemInstall/MarketplaceItemInstall';
import { MarketplaceItemInstallSection } from '../../../Marketplace/components/MarketplaceItem/components/MarketplaceItemInstall/components/MarketplaceItemInstallSection/MarketplaceItemInstallSection';

interface Props {}

export function ProjectItemEditForm(props: Props) {
    const [logoUrl, setLogoUrl] = useState('');
    const [version, setVersion] = useState('');
    const navigate = useNavigate();
    const [settings, setSettings] = useState<any>({});
    const [envVars, setEnvVars] = useState<any>({});
    const [settingsLoading, setSettingsLoading] = useState(false);
    const { setLoaderVisible } = usePageLoaderContext();
    const { projectDomain } = useParams();
    const { refreshProjects, projects } = useProjectsContext();
    const project = useMemo(() => {
        return projects.find((el) => el.domain == projectDomain);
    }, [projectDomain, projects]);
    const { containerStatus, containerStatusColor } = useDockerStatusTrackerContext({
        project: project,
    });
    const containerStatusRef = useRef(containerStatus);
    containerStatusRef.current = containerStatus;
    const [formStructure, setFormStructure] = useState([]);
    const formStructureRef = useRef(formStructure);
    formStructureRef.current = formStructure;

    useEffect(() => {
        if (settingsLoading) {
            setFormStructure([]);
            return;
        }
        let formStructure = [];

        function getCurrentValue(target: string, type: string) {
            switch (type) {
                case 'checkbox':
                case 'switch':
                    if (envVars[target]) {
                        return Boolean(
                            typeof envVars[target] === 'string' ? JSON.parse(envVars[target]) : envVars[target],
                        );
                    }
                    return getDefaultValue(type);

                default:
                    return envVars[target] ?? getDefaultValue(type);
            }
        }

        // user settings first
        if (settings && envVars) {
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
                                value: getCurrentValue(userSetting.target, userSetting.type),
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
                            {'user settings with incorrect format! Please, report this issue if it keeps happening.'}
                        </Typography>,
                    );
                }
            }

            if (settings.system?.show_localpath_selector) {
                formStructure.push({
                    title: 'Project path',
                    description:
                        'The selected path is where your codes are, use an existing project path or a new one. You may open up this path in your code editor to do changes in real time',
                    type: 'path-select',
                    value: envVars['APP_CODE_PATH_HOST'] ?? getDefaultValue('path-select'),
                });
            }

            if (settings.system?.db_credentials) {
                formStructure.push({
                    title: 'Database credentials',
                    description: 'Create database, user and password',
                    type: 'db-credentials',
                    value: {
                        database: envVars['DB_NAME'] ?? '',
                        user: envVars['DB_USER'] ?? '',
                        password: envVars['DB_ROOT_PASSWORD'] ?? envVars['DB_PASSWORD'] ?? '',
                    },
                });
            }
        }

        setFormStructure(formStructure);

        return () => {
            setFormStructure([]);
        };
    }, [settings, envVars, settingsLoading]);

    useEffect(() => {
        if (project == null) {
            navigate('/home/projects');
            return;
        }

        setSettingsLoading(true);
        Self.getSettingsByProject(project).then((res) => {
            Self.getEnvironmentByProject(project).then((envVars) => {
                setSettings(res);
                setEnvVars(envVars);
                setSettingsLoading(false);
            });
        });
        getLogoUrlByProject(project).then((res) => {
            setLogoUrl(res);
        });
        Self.readProjectFile(project, 'version').then((localVersion) => {
            setVersion(localVersion);
        });

        setLoaderVisible(false);

        return () => {
            setLoaderVisible(true);
        };
    }, [project]);

    function installItem() {
        setLoaderVisible(true);
        let newformStructure = [...formStructure];

        let containsErrors = false;
        for (let i = 0; i < newformStructure.length; ++i) {
            const structure = newformStructure[i];

            switch (structure.type) {
                case 'checkbox':
                case 'switch':
                    break;

                case 'db-credentials':
                    {
                        const fields = ['database', 'user', 'password'];
                        for (const field of fields) {
                            if (!structure.value || !structure.value[field]) {
                                newformStructure[i].error = {
                                    ...(newformStructure[i].error ?? {}),
                                };
                                newformStructure[i].error[field] = 'This field can not be empty!';
                                containsErrors = true;
                            }
                        }
                    }
                    break;

                default: {
                    if (!structure.value) {
                        let error = '';
                        switch (structure.type) {
                            case 'select':
                            case 'radio':
                                error = 'You need to select at least one option!';
                                break;
                            default:
                                error = 'This field can not be empty!';
                                break;
                        }
                        newformStructure[i].error = error;
                        containsErrors = true;
                    }
                }
            }
        }

        if (containsErrors) {
            setFormStructure(newformStructure);
            setLoaderVisible(false);
            return;
        }

        Self.editApp(newformStructure, project)
            .then(() => {
                enqueueSnackbar(`${project.name} app edited with success.`, {
                    variant: 'success',
                });
                // Self.startProject(project, true);
                refreshProjects().then(() => {
                    navigate(`/home/projects/${project.domain}`);
                });
            })
            .catch(() => {
                enqueueSnackbar(`Couldn't edit the ${project.name} app with success!`, {
                    variant: 'error',
                    autoHideDuration: 8000,
                });
                setLoaderVisible(false);
            });
    }

    return (
        <Stack sx={{ overflow: 'hidden' }} direction={'column'} height={'100%'} width={'100%'}>
            {project && (
                <Toolbar sx={{ pt: '5px' }}>
                    {logoUrl && (
                        <object
                            data={logoUrl}
                            height={'40px'}
                            width={'40px'}
                            type='image/png'
                            style={{ objectFit: 'contain' }}
                        >
                            <img src={noImage} height={'40px'} width={'40px'} style={{ objectFit: 'contain' }} />
                        </object>
                    )}
                    <div style={{ width: '10px' }}></div>
                    <Stack height={'100%'} justifyContent={'center'} direction={'column'}>
                        <Stack direction={'row'} gap={'10px'} alignItems={'end'}>
                            <Stack justifyContent={'center'} sx={{ height: '100%' }}>
                                <Circle color={containerStatusColor} />
                            </Stack>
                            <Typography variant='h6'>{project.name}</Typography>
                            <Stack direction={'row'} gap={'5px'} alignItems={'end'}>
                                <Typography variant='body2' sx={{ textDecoration: 'underline' }}>
                                    {version}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                    <div style={{ flex: 1, minWidth: '10px' }}></div>
                    <Stack direction={'column'} alignItems={'flex-start'} height={'100%'}>
                        <IconButton
                            onClick={() => {
                                navigate(`/home/projects/${project.domain}`);
                            }}
                        >
                            <Close />
                        </IconButton>
                    </Stack>
                </Toolbar>
            )}
            <Container sx={{ height: '100%', flex: '1', overflowY: 'auto', p: 0, py: '10px' }}>
                <Stack direction={'column'} gap={'10px'} alignItems={'flex-end'}>
                    {formStructure.map((item, index) => {
                        if (!Object.isExtensible(item)) {
                            return <div key={index}>{item}</div>;
                        }

                        return (
                            <MarketplaceItemInstallSection
                                key={index}
                                title={item.title}
                                description={item.description}
                                type={item.type}
                                values={item.values}
                                value={item.value}
                                error={item.error}
                                onChange={(newValue) => {
                                    let newformStructure = [...formStructureRef.current];
                                    newformStructure[index].value = newValue;
                                    newformStructure[index].error = null;
                                    setFormStructure(newformStructure);
                                }}
                            />
                        );
                    })}

                    {!settings && (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Typography>{'No Information (settings.yml missing)'}</Typography>
                        </div>
                    )}

                    <Button startIcon={<Save />} onClick={installItem} sx={{ width: 'fit-content' }}>
                        Save
                    </Button>
                </Stack>
            </Container>
        </Stack>
    );
}
