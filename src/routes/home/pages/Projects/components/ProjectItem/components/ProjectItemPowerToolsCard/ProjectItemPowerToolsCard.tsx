import { Card, ImageListItem, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
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

    const availablePowerTools = useMemo(() => {
        let tools = {};

        if (projectFiles[ProjectFiles.PackageJson]) {
            // tools[ProjectFiles.PackageJson]
        }

        return tools;
    }, [projectFiles]);

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

    return (
        <ImageListItem>
            <Card sx={{ backgroundColor: '#252525', p: '5px', overflow: 'hidden' }}>
                <Stack>
                    <Typography>Power tools</Typography>
                    <Typography>Run commands in the prject by clicking on the buttons</Typography>
                    <Typography>TODO</Typography>
                </Stack>
            </Card>
        </ImageListItem>
    );
}
