import { app } from 'electron';
import { readFromFile, sleep, writeToFile } from 'src/electron/utils';
import { createFolder, deleteFolder, downloadFile, pathExist } from './utils';

let marketplaceDownloads: any = {};

export async function downloadMarketplaceFile(_: any, downloadUrl: string, github: string, filePath: string) {
    const githubSplited = github.split('/');
    const version = githubSplited[githubSplited.length - 1];
    const githubWithoutVersion = github.substring(0, github.length - version.length - 1);

    const githubProjectLocalPath = `${app.getPath('userData')}/githubDownloads/${githubWithoutVersion}`;
    const githubFileLocalPath = `${githubProjectLocalPath}/${filePath}`;

    if (marketplaceDownloads[githubFileLocalPath]) {
        while (marketplaceDownloads[githubFileLocalPath]) {
            await sleep(500);
        }
    }
    marketplaceDownloads[githubFileLocalPath] = true;
    let needFullUpdate = false;
    if (await pathExist(`${githubProjectLocalPath}/version`)) {
        const localVersion = await readFromFile(`${githubProjectLocalPath}/version`);
        if (localVersion !== version) {
            needFullUpdate = true;
        }
    } else {
        needFullUpdate = true;
    }
    if (needFullUpdate) {
        await deleteFolder(githubProjectLocalPath);
        await createFolder(githubProjectLocalPath);
        await writeToFile(version, `${githubProjectLocalPath}/version`);
    }

    if (!(await pathExist(githubFileLocalPath))) {
        await downloadFile(downloadUrl, githubProjectLocalPath, filePath);
    }
    marketplaceDownloads[githubFileLocalPath] = false;

    return githubFileLocalPath.replaceAll('\\', '/');
}

export async function readMarketplaceFile(_: any, github: string, filePath: string) {
    const githubSplited = github.split('/');
    const version = githubSplited[githubSplited.length - 1];
    const githubWithoutVersion = github.substring(0, github.length - version.length - 1);

    const githubProjectLocalPath = `${app.getPath('userData')}/githubDownloads/${githubWithoutVersion}`;
    const githubFileLocalPath = `${githubProjectLocalPath}/${filePath}`;

    if (marketplaceDownloads[githubFileLocalPath]) {
        while (marketplaceDownloads[githubFileLocalPath]) {
            await sleep(500);
        }
    }

    return await readFromFile(githubFileLocalPath);
}
