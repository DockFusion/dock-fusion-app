import { ArrowBack, Download, Refresh } from '@mui/icons-material';
import { Button, Chip, CircularProgress, Container, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import jsyaml from 'js-yaml';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import noImage from 'src/renderer/assets/img/no_image.jpg';
import { usePageLoaderContext } from 'src/renderer/components/PageLoader/usePageLoaderContext';
import { useProjectsContext } from 'src/renderer/components/ProjectsProvider/useProjectsContext';
import {
    getGithubLastVersion,
    getGithubTags,
    getLogoUrlByImage,
    getReadMeByImage,
    getSettingsByImage,
    resetGithubTags,
} from 'src/renderer/helpers/github';
import { IMarketplaceItem } from 'src/shared/interfaces';
import { MarketplaceItemInfo } from './components/MarketplaceItemInfo/MarketplaceItemInfo';
import { MarketplaceItemInstall } from './components/MarketplaceItemInstall/MarketplaceItemInstall';

interface Props {}

export function MarketplaceItem(props: Props) {
    const [logoUrl, setLogoUrl] = useState('');
    const [markdown, setMarkdown] = useState('');
    const [markdownLoading, setMarkdownLoading] = useState(false);
    const [settings, setSettings] = useState<any>('');
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [version, setVersion] = useState('');
    const [marketplaceItem, setMarketplaceItem] = useState<IMarketplaceItem | null>(null);
    const { marketplaceItemId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { setLoaderVisible } = usePageLoaderContext();
    const { marketplaceItems } = useProjectsContext();
    const [refreshGithubVersionButtonVisible, setRefreshGithubVersionButtonVisible] = useState(false);
    const [refreshGithubVersionLoading, setRefreshGithubVersionLoading] = useState(false);
    const [refreshGithubVersionCounter, setRefreshGithubVersionCounter] = useState(0);
    const refreshGithubVersionCounterRef = useRef(refreshGithubVersionCounter);
    refreshGithubVersionCounterRef.current = refreshGithubVersionCounter;

    const inInstallForm = useMemo(() => {
        return location.pathname.startsWith(`/home/marketplace/${marketplaceItemId}/install`);
    }, [location]);

    useEffect(() => {
        setMarkdownLoading(true);
        setSettingsLoading(true);
        const marketplaceItem = marketplaceItems.find((el) => el.id == marketplaceItemId);

        if (marketplaceItem == null) {
            navigate('/home/marketplace');
            return;
        }
        setMarketplaceItem(marketplaceItem);

        getGithubLastVersion(marketplaceItem).then((res) => setVersion(res));
        getReadMeByImage(marketplaceItem).then((res) => {
            setMarkdown(res);
            setMarkdownLoading(false);
        });
        getSettingsByImage(marketplaceItem).then((res) => {
            setSettings(jsyaml.load(res) ?? '');
            setSettingsLoading(false);
        });
        getLogoUrlByImage(marketplaceItem).then((res) => {
            setLogoUrl(res);
        });

        setLoaderVisible(false);

        return () => {
            setLoaderVisible(true);
        };
    }, [marketplaceItems, marketplaceItemId, refreshGithubVersionCounter]);

    return (
        <Stack sx={{ overflow: 'hidden' }} direction={'column'} height={'100%'} width={'100%'}>
            {marketplaceItem && (
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
                    <Stack height={'100%'} justifyContent={'start'} direction={'column'}>
                        <Stack direction={'row'} gap={'10px'} alignItems={'end'}>
                            <Typography variant='h6'>{marketplaceItem.name}</Typography>
                            <Typography
                                variant='body2'
                                sx={{ textDecoration: 'underline' }}
                                onMouseEnter={() => setRefreshGithubVersionButtonVisible(true)}
                                onMouseLeave={() => setRefreshGithubVersionButtonVisible(false)}
                            >
                                {version}
                                {refreshGithubVersionButtonVisible && (
                                    <IconButton
                                        loading={refreshGithubVersionLoading}
                                        size='small'
                                        sx={{ p: 0, ml: '3px' }}
                                        onClick={async () => {
                                            setRefreshGithubVersionLoading(true);
                                            resetGithubTags(marketplaceItem.github);
                                            await getGithubTags(marketplaceItem.github);
                                            setRefreshGithubVersionCounter(refreshGithubVersionCounterRef.current + 1);
                                            setRefreshGithubVersionLoading(false);
                                            enqueueSnackbar(`[${marketplaceItem.name}] Version updated`, {
                                                variant: 'success',
                                            });
                                        }}
                                    >
                                        <Refresh fontSize='small' />
                                    </IconButton>
                                )}
                            </Typography>
                        </Stack>
                        <Typography variant='body2'>{marketplaceItem.description}</Typography>
                        <Stack direction={'row'} gap={'5px'}>
                            {marketplaceItem.tags.map((tag) => {
                                return <Chip key={tag} label={tag} size='small' />;
                            })}
                        </Stack>
                    </Stack>
                    <div style={{ flex: 1, minWidth: '10px' }}></div>
                    <Stack
                        height={'100%'}
                        justifyContent={'start'}
                        alignItems={'end'}
                        direction={'column'}
                        minWidth={'fit-content'}
                    >
                        {settingsLoading ? (
                            <CircularProgress />
                        ) : (
                            <>
                                {settings != '' ? (
                                    <Button
                                        startIcon={inInstallForm ? <ArrowBack /> : <Download />}
                                        sx={{ width: 'fit-content' }}
                                        onClick={() => {
                                            navigate(
                                                `/home/marketplace/${marketplaceItemId}/${inInstallForm ? '' : 'install'}`,
                                            );
                                        }}
                                    >
                                        {inInstallForm ? 'Back' : 'Install'}
                                    </Button>
                                ) : (
                                    <Button startIcon={<Download />} disabled>
                                        Missing settings
                                    </Button>
                                )}
                            </>
                        )}
                        <Stack direction={'row'} gap={'10px'}>
                            <a href={`https://github.com/${marketplaceItem.github}/issues/new`} target='_blank'>
                                Report an issue
                            </a>
                            <a href={`https://github.com/${marketplaceItem.github}`} target='_blank'>
                                Github
                            </a>
                        </Stack>
                    </Stack>
                </Toolbar>
            )}
            <Container sx={{ height: '100%', flex: '1', overflowY: 'auto', p: 0, py: '10px' }}>
                <Routes>
                    <Route
                        path='/'
                        element={<MarketplaceItemInfo markdownLoading={markdownLoading} markdown={markdown} />}
                    />
                    <Route
                        path='/install'
                        element={
                            <MarketplaceItemInstall
                                settingsLoading={settingsLoading}
                                settings={settings}
                                marketplaceItem={marketplaceItem}
                            />
                        }
                    />
                    <Route path='/*' element={<Navigate to={`/home/marketplace/${marketplaceItemId}`} replace />} />
                </Routes>
            </Container>
        </Stack>
    );
}
