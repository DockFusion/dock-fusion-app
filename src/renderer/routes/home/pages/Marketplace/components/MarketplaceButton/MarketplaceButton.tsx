import { Button } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import noImage from 'src/renderer/assets/img/no_image.jpg';
import { getLogoUrlByImage } from 'src/renderer/helpers/github';
import { IMarketplaceItem } from 'src/shared/interfaces';

interface Props {
    marketplaceItem: IMarketplaceItem;
}

export function MarketplaceButton(props: Props) {
    const [logoUrl, setLogoUrl] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = useMemo(() => {
        const route = `/home/marketplace/${props.marketplaceItem.id}`;
        return location.pathname === route || location.pathname.startsWith(`${route}/`);
    }, [location.pathname, props.marketplaceItem.id]);

    useEffect(() => {
        getLogoUrlByImage(props.marketplaceItem).then((res) => {
            setLogoUrl(res);
        });
    }, [props.marketplaceItem]);

    return (
        <Button
            startIcon={
                <object data={logoUrl} height={'20px'} width={'20px'} type='image/png' style={{ objectFit: 'contain' }}>
                    <img src={noImage} height={'20px'} width={'20px'} style={{ objectFit: 'contain' }} />
                </object>
            }
            sx={{ justifyContent: 'left' }}
            onClick={() => {
                navigate(`/home/marketplace/${props.marketplaceItem.id}`);
            }}
            color={isActive ? 'info' : undefined}
        >
            {props.marketplaceItem.name}
        </Button>
    );
}
