import { Download } from '@mui/icons-material';
import { Button, CircularProgress, Stack, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageLoaderContext } from 'src/renderer/components/PageLoader/usePageLoaderContext';
import { useProjectsContext } from 'src/renderer/components/ProjectsProvider/useProjectsContext';
import { downloadSourceFileFromGithubByImage } from 'src/renderer/helpers/github';
import { Self } from 'src/renderer/helpers/self';
import { IMarketplaceItem } from 'src/shared/interfaces';
import { MarketplaceItemInstallSection } from './components/MarketplaceItemInstallSection/MarketplaceItemInstallSection';

interface Props {
    settingsLoading: boolean;
    settings?: any;
    marketplaceItem: IMarketplaceItem;
}

function getDefaultValue(type: string) {
    switch (type) {
        case 'switch':
        case 'checkbox':
            return false;

        case 'path-select':
        case 'domain':
            return '';

        case 'db-credentials':
            return {
                database: '',
                user: '',
                password: '',
            };

        default:
            return null;
    }
}

export function MarketplaceItemInstall(props: Props) {
    const [formStructure, setFormStructure] = useState([]);
    const formStructureRef = useRef(formStructure);
    formStructureRef.current = formStructure;
    const { setLoaderVisible } = usePageLoaderContext();
    const navigate = useNavigate();
    const { refreshProjects } = useProjectsContext();

    useEffect(() => {
        let formStructure = [];

        // user settings first
        if (props.settings) {
            formStructure.push({
                title: 'Your stack URL',
                description:
                    "Enter a name for this stack, lowercase with dashes prefered. Make sure it's unique to your stacks!",
                type: 'domain',
                value: getDefaultValue('domain'),
            });

            if (props.settings.user) {
                if (typeof props.settings.user === 'object' && !Array.isArray(props.settings.user)) {
                    Object.values(props.settings.user).map((userSetting: any) => {
                        if (userSetting.target) {
                            formStructure.push({
                                title: userSetting.label,
                                description: userSetting.hint,
                                type: userSetting.type,
                                target: userSetting.target,
                                values: userSetting.values ?? [],
                                value: getDefaultValue(userSetting.type),
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
                    console.error(props.settings.user);
                    formStructure.push(
                        <Typography color='red'>
                            {'user settings with incorrect format! Please, report this issue if it keeps happening.'}
                        </Typography>,
                    );
                }
            }

            if (props.settings.system?.show_localpath_selector) {
                formStructure.push({
                    title: 'Project path',
                    description:
                        'The selected path is where your codes are, use an existing project path or a new one. You may open up this path in your code editor to do changes in real time',
                    type: 'path-select',
                    value: getDefaultValue('path-select'),
                });
            }

            if (props.settings.system?.db_credentials) {
                formStructure.push({
                    title: 'Database credentials',
                    description: 'Create database, user and password',
                    type: 'db-credentials',
                    value: getDefaultValue('db-credentials'),
                });
            }
        }

        setFormStructure(formStructure);

        return () => {
            setFormStructure([]);
        };
    }, [props.settings]);

    function installItem() {
        setLoaderVisible(true);
        let newformStructure = [...formStructure];

        let containsErrors = false;
        let domain = null;
        for (let i = 0; i < newformStructure.length; ++i) {
            const structure = newformStructure[i];

            switch (structure.type) {
                case 'domain':
                    domain = structure.value;
                    break;

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

        downloadSourceFileFromGithubByImage(props.marketplaceItem)
            .then(async (file) => {
                enqueueSnackbar(`Installing new ${props.marketplaceItem.name} app...`, {
                    variant: 'info',
                });
                Self.installApp(newformStructure, props.marketplaceItem)
                    .then(() => {
                        enqueueSnackbar(`New ${props.marketplaceItem.name} app installed with success.`, {
                            variant: 'success',
                        });
                        refreshProjects().then(() => {
                            navigate(`/home/projects/${domain}`);
                        });
                    })
                    .catch(() => {
                        enqueueSnackbar(`Couldn't install the new ${props.marketplaceItem.name} app with success!`, {
                            variant: 'error',
                            autoHideDuration: 8000,
                        });
                        setLoaderVisible(false);
                    });
            })
            .catch(() => {
                setLoaderVisible(false);
            });
    }

    return (
        <>
            {props.settingsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </div>
            ) : (
                <>
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

                        {!props.settings && (
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Typography>{'No Information (settings.yml missing)'}</Typography>
                            </div>
                        )}

                        <Button startIcon={<Download />} onClick={installItem} sx={{ width: 'fit-content' }}>
                            Install
                        </Button>
                    </Stack>
                </>
            )}
        </>
    );
}
