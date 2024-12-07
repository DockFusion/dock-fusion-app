import { Route, Routes } from 'react-router-dom';
import { Home } from './Home';

export function SubRoutes() {
    return (
        <Routes>
            <Route path='/*' element={<Home />} />
        </Routes>
    );
}
