import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ScanInPage from './pages/ScanInPage';
import ScanOutPage from './pages/ScanOutPage';
import NotFoundPage from './pages/NotFoundPage';

/** Route table; every page renders inside the shared Layout. */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/scan-in" element={<ScanInPage />} />
        <Route path="/scan-out" element={<ScanOutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
