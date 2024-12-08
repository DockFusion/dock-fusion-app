import { Clear, Search } from '@mui/icons-material';
import { Container, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { usePageLoaderContext } from 'src/components/PageLoader/usePageLoaderContext';
import { getMarketplaceItems } from 'src/helpers/helpers';
import { IMarketplaceItem } from 'src/shared/interfaces';
import { MarketplaceButton } from './components/MarketplaceButton/MarketplaceButton';
import { MarketplaceItem } from './components/MarketplaceItem/MarketplaceItem';

export function Marketplace() {
    const { setLoaderVisible } = usePageLoaderContext();
    const [marketplaceItems, setMarketplaceItems] = useState<IMarketplaceItem[]>([]);
    const [inited, setInited] = useState(false);
    const location = useLocation();
    const [search, setSearch] = useState('');

    useEffect(() => {
        setMarketplaceItems(getMarketplaceItems());

        setLoaderVisible(false);
        setInited(true);

        return () => {
            setLoaderVisible(true);
        };
    }, []);

    useEffect(() => {
        if (inited && location.pathname === '/home/marketplace') {
            setLoaderVisible(false);
        }
    }, [location]);

    return (
        <Stack direction={'row'} sx={{ height: '100%', width: '100%', maxWidth: 'calc(100vw - min(8vw, 70px))' }}>
            <Container sx={{ width: '22vw', maxWidth: '200px', height: '100%' }} style={{ padding: 0 }}>
                <Stack gap='6px' sx={{ px: '10px', height: '100%' }}>
                    <TextField
                        placeholder='Search'
                        value={search}
                        onChange={(e) => {
                            setSearch(e.currentTarget.value);
                        }}
                        slotProps={{
                            input: {
                                endAdornment: search !== '' && (
                                    <InputAdornment position='end'>
                                        <IconButton
                                            size='small'
                                            onClick={() => {
                                                setSearch('');
                                            }}
                                        >
                                            <Clear />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <Search />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <Stack gap='6px' sx={{ px: '10px', overflowY: 'auto', flex: 1 }}>
                        {marketplaceItems.map((marketplaceItem) => {
                            if (marketplaceItem.name.toLowerCase().includes(search.toLowerCase())) {
                                return <MarketplaceButton key={marketplaceItem.id} marketplaceItem={marketplaceItem} />;
                            }
                            return <></>;
                        })}
                    </Stack>
                </Stack>
            </Container>
            <Container
                sx={{
                    height: '100%',
                    flex: '1',
                    width: '100%',
                    maxWidth: 'calc(100vw - min(8vw, 70px) - min(22vw, 200px))',
                }}
                style={{ padding: 0 }}
            >
                <Routes>
                    <Route path='/' element={<Typography>Select an item from the left</Typography>} />
                    <Route
                        path='/:marketplaceItemId/*'
                        element={<MarketplaceItem marketplaceItems={marketplaceItems} />}
                    />
                    <Route path='/*' element={<Navigate to='/home/marketplace' replace />} />
                </Routes>
            </Container>
        </Stack>
    );
}
