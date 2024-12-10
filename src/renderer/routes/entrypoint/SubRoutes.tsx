import { Route, Routes } from 'react-router-dom';
import { InvalidLink } from 'src/renderer/components/InvalidLink/InvalidLink';
import { Entrypoint } from './Entrypoint';

export function SubRoutes() {
    return (
        <Routes>
            <Route path='' element={<Entrypoint />} />
            <Route path='/*' element={<InvalidLink />} />
        </Routes>
    );
}
