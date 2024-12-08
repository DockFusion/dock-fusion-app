import { Button, Card, Divider, ImageListItem, Stack, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useAlertDialog } from 'src/components/AlertDialog/useAlertDialog';
import { useDockerStatusTrackerContext } from 'src/components/DockerStatusTracker/useDockerStatusTrackerContext';
import { ProjectStatus } from 'src/enums';
import { Self } from 'src/helpers/self';

interface Props {
    project: IProjectWithMarketPlace;
}

enum ProjectFiles {
    PackageJson = 'package.json',
    NodeModules = 'node_modules',
    ComposerJson = 'composer.json',
    Vendor = 'vendor',
    Artisan = 'artisan',
}

const ProjectFilesOrder = [
    ProjectFiles.PackageJson,
    ProjectFiles.NodeModules,
    ProjectFiles.ComposerJson,
    ProjectFiles.Vendor,
    ProjectFiles.Artisan,
];

const ToolsPerProjectFile = {
    [ProjectFiles.PackageJson]: ['npm install', 'npm ci'],
    [ProjectFiles.NodeModules]: ['npm run prod', 'npm run watch', 'npm update --save'],
    [ProjectFiles.ComposerJson]: ['composer install'],
    [ProjectFiles.Vendor]: ['composer update', 'composer dump-autoload', 'composer clear-cache'],
    [ProjectFiles.Artisan]: [
        'php artisan key:generate',
        'php artisan migrate',
        'php artisan db:seed',
        'php artisan cache:clear',
        'php artisan view:clear',
        'php artisan config:clear',
    ],
};

export function ProjectItemPowerToolsCard(props: Props) {
    const [projectFiles, setProjectFiles] = useState<any>({});
    const projectFilesRef = useRef(projectFiles);
    projectFilesRef.current = projectFiles;
    const showPowerTools = useMemo(() => {
        return Object.values(projectFiles).filter((el) => el).length > 0;
    }, [projectFiles]);
    const { containerId, containerStatus } = useDockerStatusTrackerContext({ project: props.project });
    const { alertDialogFire } = useAlertDialog();

    const availablePowerTools = useMemo(() => {
        let tools = {};

        for (const key of Object.keys(projectFiles)) {
            if (projectFiles[key]) {
                tools[key] = ToolsPerProjectFile[key];
            }
        }

        return tools;
    }, [projectFiles]);
    const sortedAvailablePowerTools = useMemo(() => {
        const powerTools = Object.keys(availablePowerTools).filter((key) =>
            ProjectFilesOrder.includes(key as ProjectFiles),
        );
        let finalPowerTools = [];

        for (const powerTool of ProjectFilesOrder) {
            if (availablePowerTools[powerTool]) {
                finalPowerTools.push({
                    source: powerTool,
                    tools: availablePowerTools[powerTool],
                });
            }
        }

        return finalPowerTools;
    }, [availablePowerTools]);
    const unsortedAvailablePowerTools = useMemo(() => {
        return Object.keys(availablePowerTools)
            .filter((key) => !ProjectFilesOrder.includes(key as ProjectFiles))
            .map((powerTool) => {
                return {
                    source: powerTool,
                    tools: availablePowerTools[powerTool],
                };
            });
    }, [availablePowerTools]);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const toCheck = [
            ProjectFiles.PackageJson,
            ProjectFiles.NodeModules,
            ProjectFiles.ComposerJson,
            ProjectFiles.Vendor,
        ];
        projectFilesRef.current = {};
        for (const fileOrDirectory of toCheck) {
            Self.doesExistAtProject(props.project, fileOrDirectory).then((res) => {
                if (signal.aborted) {
                    return;
                }
                projectFilesRef.current = {
                    ...projectFilesRef.current,
                    [fileOrDirectory]: res,
                };
                setProjectFiles(projectFilesRef.current);
            });
        }

        return () => {
            controller.abort();
        };
    }, [props.project]);

    if (!showPowerTools || !Object.values(availablePowerTools).length) {
        return <></>;
    }

    function powerToolButtons(buttons) {
        return buttons.map((powerTool, index) => {
            return (
                <Fragment key={powerTool.source}>
                    {index !== 0 && <Divider sx={{ my: 1 }} />}
                    <Typography>{powerTool.source}</Typography>
                    <Stack direction={'row'} gap={1} flexWrap={'wrap'}>
                        {powerTool.tools.map((command) => {
                            return (
                                <Button
                                    key={command}
                                    sx={{ width: 'fit-content' }}
                                    size='small'
                                    onClick={() => {
                                        const key = `${props.project.domain}|${command}`;
                                        if (!sessionStorage.getItem(key)) {
                                            sessionStorage.setItem(key, 'true');
                                            Self.execCommandInProject(containerId, command)
                                                .then(() => {
                                                    enqueueSnackbar(
                                                        `${command} completed with success at [${props.project.domain}]`,
                                                        {
                                                            variant: 'success',
                                                        },
                                                    );
                                                })
                                                .catch(() => {
                                                    enqueueSnackbar(
                                                        `${command} completed with errors at [${props.project.domain}]`,
                                                        {
                                                            variant: 'error',
                                                        },
                                                    );
                                                })
                                                .finally(() => {
                                                    sessionStorage.removeItem(key);
                                                });
                                        } else {
                                            //TODO: move this to another place in the code

                                            enqueueSnackbar('Command running! wait until it ends!', {
                                                variant: 'warning',
                                            });
                                        }
                                    }}
                                    disabled={containerStatus !== ProjectStatus.running}
                                >
                                    {command}
                                </Button>
                            );
                        })}
                    </Stack>
                </Fragment>
            );
        });
    }

    return (
        <ImageListItem>
            <Card sx={{ backgroundColor: '#252525', p: '5px', overflow: 'hidden' }}>
                <Stack>
                    <Typography>Power tools</Typography>
                    <Typography>Run commands in the prject by clicking on the buttons</Typography>
                    {powerToolButtons(sortedAvailablePowerTools)}
                    {powerToolButtons(unsortedAvailablePowerTools)}
                </Stack>
            </Card>
        </ImageListItem>
    );
}
