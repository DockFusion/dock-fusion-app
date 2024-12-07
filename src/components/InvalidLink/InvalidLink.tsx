import { Button, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageLoaderContext } from '../PageLoader/usePageLoaderContext';

export function InvalidLink() {
    const { setLoaderVisible } = usePageLoaderContext();
    const navigate = useNavigate();

    useEffect(() => {
        setLoaderVisible(false);

        return () => {
            setLoaderVisible(true);
        };
    }, []);

    return (
        <>
            <Stack>
                <Typography>Até onde sabemos isto não deveria ter acontecido...</Typography>
                <Typography>
                    Reporta-nos o bug descrevendo como chegaste até aqui para que possamos melhorar o produto e evitar
                    este tipo de complicações no futuro. obrigado pela compreensão.
                </Typography>
                <Button
                    onClick={() => {
                        navigate('/home');
                    }}
                >
                    Restart DockFusion
                </Button>
            </Stack>
        </>
    );
}
