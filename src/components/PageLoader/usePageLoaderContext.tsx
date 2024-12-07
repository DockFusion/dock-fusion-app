import { useContext } from 'react';
import { PageLoaderContext } from './PageLoaderContextProvider';

interface Props {}

export const usePageLoaderContext = (props?: Props) => {
    const context = useContext(PageLoaderContext);

    return context;
};
