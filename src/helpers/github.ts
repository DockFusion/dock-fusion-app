import { SemVer } from 'semver';
import { IMarketplaceItem, IProject } from 'src/shared/interfaces';

export const Github = {
    downloadMarketplaceFile: async (downloadUrl: string, github: string, filePath: string) => {
        return await window.electron.github.downloadMarketplaceFile(downloadUrl, github, filePath);
    },
    readMarketplaceFile: async (github: string, filePath: string) => {
        return await window.electron.github.readMarketplaceFile(github, filePath);
    },
};

export async function getGithubTags(github: string) {
    if ((window as any).githubTags == null) {
        let githubTags = JSON.parse(localStorage.getItem('githubTags')) ?? {};
        if (typeof githubTags !== 'object' || Array.isArray(githubTags)) {
            githubTags = {};
        }
        (window as any).githubTags = githubTags;
    }
    if ((window as any).githubTags[github] != null) {
        return (window as any).githubTags[github];
    }
    let gitApiUrl = `https://api.github.com/repos/${github}/tags`;

    const response = await fetch(gitApiUrl);
    const data = await response.json();
    let versions: GithubVersion[] = [];
    let latestVersion: GithubVersion;
    if (response.status === 200 && data.length > 0) {
        versions = data.sort((v1, v2) => new SemVer(v2.name).compare(v1.name));
        latestVersion = versions[0];
    }
    (window as any).githubTags[github] = {
        versions: versions,
        latestVersion: latestVersion,
    };
    localStorage.setItem('githubTags', JSON.stringify((window as any).githubTags));

    return (window as any).githubTags[github];
}

export async function extractGithubPath(image: IMarketplaceItem) {
    const githubFolder = image.github;
    const githubTags = await getGithubTags(githubFolder);
    const githubVersion = githubTags.latestVersion?.name ?? image.version;

    return { githubFolder, githubVersion };
}

export async function getGithubLastVersion(image: IMarketplaceItem) {
    const githubTags = await getGithubTags(image.github);
    const githubVersion = githubTags.latestVersion?.name ?? image.version;
    return githubVersion;
}

async function getGithubBaseRawUrl(image: IMarketplaceItem) {
    const githubTags = await getGithubTags(image.github);
    return `https://raw.githubusercontent.com/${image.github}/${githubTags.latestVersion?.name ?? image.version}`;
}

async function getGithubBaseArchiveUrl(image: IMarketplaceItem) {
    return `https://github.com/${image.github}/archive`;
}

async function getFilePathFromGithubByImage(image: IMarketplaceItem, filePath: string) {
    const url = `${await getGithubBaseRawUrl(image)}/${filePath}`;

    const { githubFolder, githubVersion } = await extractGithubPath(image);

    return await Github.downloadMarketplaceFile(url, `${githubFolder}/${githubVersion}`, filePath);
}

async function getFileFromGithubByImage(image: IMarketplaceItem, filePath: string) {
    const url = `${await getGithubBaseRawUrl(image)}/${filePath}`;

    const { githubFolder, githubVersion } = await extractGithubPath(image);

    await Github.downloadMarketplaceFile(url, `${githubFolder}/${githubVersion}`, filePath);
    return await Github.readMarketplaceFile(`${githubFolder}/${githubVersion}`, filePath);
}

export async function getLogoUrlByProject(project: IProject) {
    return `appdownloads://${project.domain}/default.png`;
}

export async function getLogoUrlByImage(image: IMarketplaceItem) {
    let filePath = await getFilePathFromGithubByImage(image, 'default.png');
    let filePathSplited = filePath.split('githubDownloads/');
    return `githubdownloads://${filePathSplited[1]}`;
}

export async function getReadMeByProject(project: IProject) {
    return `appdownloads://${project.domain}/README.md`;
}

export async function getReadMeByImage(image: IMarketplaceItem) {
    return getFileFromGithubByImage(image, 'README.md');
}

export async function getSettingsByProject(project: IProject) {
    return `appdownloads://${project.domain}/settings.yml`;
}

export async function getSettingsByImage(image: IMarketplaceItem) {
    return getFileFromGithubByImage(image, 'settings.yml');
}

export async function getArchiveFileFromGithubByImage(image: IMarketplaceItem, filePath: string) {
    const url = `${await getGithubBaseRawUrl(image)}/${filePath}`;

    const { githubFolder, githubVersion } = await extractGithubPath(image);

    await Github.downloadMarketplaceFile(url, `${githubFolder}/${githubVersion}`, filePath);
    return await Github.readMarketplaceFile(`${githubFolder}/${githubVersion}`, filePath);
}

export async function getSourceFileFromGithubByImage(image: IMarketplaceItem) {
    const { githubFolder, githubVersion } = await extractGithubPath(image);

    const url = `${await getGithubBaseArchiveUrl(image)}/${githubVersion}.zip`;
    const fileName = 'source.zip';

    await Github.downloadMarketplaceFile(url, `${githubFolder}/${githubVersion}`, fileName);
    return await Github.readMarketplaceFile(`${githubFolder}/${githubVersion}`, fileName);
}

export async function downloadSourceFileFromGithubByImage(image: IMarketplaceItem) {
    const { githubFolder, githubVersion } = await extractGithubPath(image);

    const url = `${await getGithubBaseArchiveUrl(image)}/${githubVersion}.zip`;
    const fileName = 'source.zip';

    return await Github.downloadMarketplaceFile(url, `${githubFolder}/${githubVersion}`, fileName);
}
