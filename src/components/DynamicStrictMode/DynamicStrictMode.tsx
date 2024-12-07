import { StrictMode } from 'react';

interface DynamicStrictModeProps {
    strictMode?: boolean;
    children: JSX.Element;
}

export function DynamicStrictMode(props: DynamicStrictModeProps) {
    const strictMode = props.strictMode ?? true;

    if (strictMode) {
        return <StrictMode>{props.children}</StrictMode>;
    } else {
        return props.children;
    }
}
