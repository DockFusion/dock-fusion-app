import { Components, Zoom } from '@mui/material';
import createTheme, { Theme } from '@mui/material/styles/createTheme';

const components: Components<Omit<Theme, 'components'>> = {
    MuiSkeleton: {
        defaultProps: {
            animation: 'wave',
        },
    },
    MuiTextField: {
        defaultProps: {
            variant: 'standard',
        },
    },
    MuiGrid: {
        defaultProps: {
            spacing: 2,
        },
    },
    MuiTooltip: {
        defaultProps: {
            arrow: true,
            TransitionComponent: Zoom,
            disableInteractive: true,
            placement: 'right',
        },
    },
    MuiIconButton: {
        defaultProps: {},
    },
    MuiButton: {
        defaultProps: {
            variant: 'contained',
            style: {
                textTransform: 'none',
                textAlign: 'left',
            },
        },
    },
    MuiButtonGroup: {
        defaultProps: {
            variant: 'contained',
        },
    },
    MuiBackdrop: {
        defaultProps: {
            sx: {
                zIndex: 9999,
            },
        },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                overflow: 'unset !important',
            },
        },
    },
    MuiContainer: {
        defaultProps: {
            sx: {
                pt: '10px',
                pb: '10px',
            },
        },
    },
    MuiSlider: {
        defaultProps: {
            sx: {
                color: '#fff',
            },
        },
    },
    MuiSwitch: {
        defaultProps: {
            color: 'default',
        },
    },
    MuiListItemIcon: {
        defaultProps: {
            sx: {
                minWidth: 0,
            },
        },
    },
};

export const muiLightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#424a57',
        },
    },
    components: components,
});

export const muiDarkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#252f3f',
        },
    },
    components: components,
});
