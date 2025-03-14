import { Drawer, Fade, List, ListItem, Paper } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import Lottie from 'react-lottie-player';
import { usePageLoaderContext } from 'src/renderer/components/PageLoader/usePageLoaderContext';
import { Step, StepStatus } from './components/Step/Step';

import { useNavigate } from 'react-router-dom';
import logo from 'src/renderer/assets/img/logo.png';
import wave from 'src/renderer/assets/img/wave.svg';
import loader from 'src/renderer/assets/lottiefiles/lf20_rj4titti.json';
import { AllSetAndDone } from './components/AllSetAndDone/AllSetAndDone';
import { DependenciesInstall } from './components/DependenciesInstall/DependenciesInstall';
import { DockerInstall } from './components/DockerInstall/DockerInstall';
import { FinalAdjustments } from './components/FinalAdjustments/FinalAdjustments';
import { WSLInstall } from './components/WSLInstall/WSLInstall';

const drawerWidth = 290;
const drawerPadding = 20;

export function Entrypoint() {
    const { setLoaderVisible } = usePageLoaderContext();
    const [currentStep, setCurrentStep] = useState(0);
    const currentStepRef = useRef(currentStep);
    const navigate = useNavigate();
    currentStepRef.current = currentStep;
    const steps = [
        {
            label: 'WSL Installation',
            step: <WSLInstall nextStep={nextStep} />,
        },
        {
            label: 'Docker Installation',
            step: <DockerInstall nextStep={nextStep} />,
        },
        {
            label: 'Dependencies Installation',
            step: <DependenciesInstall nextStep={nextStep} />,
        },
        {
            label: 'Final Adjustments',
            step: <FinalAdjustments nextStep={nextStep} />,
        },
        {
            label: 'All set & done',
            step: (
                <AllSetAndDone
                    startDeck={() => {
                        navigate('/home');
                    }}
                />
            ),
        },
    ];

    function nextStep() {
        setCurrentStep(currentStepRef.current + 1);
    }

    useEffect(() => {
        setLoaderVisible(false);

        return () => {
            setLoaderVisible(true);
        };
    }, []);

    return (
        <>
            <Drawer
                variant='permanent'
                sx={{
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: `${drawerWidth}px`,
                        paddingX: `${drawerPadding}px`,
                    },
                }}
            >
                <List>
                    <ListItem>
                        <img src={logo} width={40} />
                    </ListItem>
                    {steps.map((step, index) => {
                        return (
                            <ListItem key={index}>
                                <Step
                                    title={step.label}
                                    status={
                                        currentStep === index
                                            ? StepStatus.running
                                            : currentStep > index
                                              ? StepStatus.done
                                              : StepStatus.waiting
                                    }
                                />
                            </ListItem>
                        );
                    })}
                </List>
            </Drawer>
            <Paper
                sx={{
                    marginLeft: `${drawerWidth}px`,
                    height: '100vh',
                    background: `url(${wave})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <Lottie animationData={loader} loop play style={{ height: '35vh' }} />
                </div>
                <div
                    style={{
                        height: '50%',
                        position: 'relative',
                    }}
                >
                    {steps.map((step, index) => {
                        return (
                            <Fade key={index} in={currentStep === index} unmountOnExit>
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        width: '100%',
                                        height: '100%',
                                        paddingTop: '5vh',
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        textAlign: 'center',
                                    }}
                                >
                                    {step.step}
                                </div>
                            </Fade>
                        );
                    })}
                </div>
            </Paper>
        </>
    );
}
