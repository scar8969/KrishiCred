import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import GovernmentDashboard from './pages/GovernmentDashboard';
import PlantDashboard from './pages/PlantDashboard';
import FireMonitorPage from './pages/FireMonitorPage';
import AccountPage from './pages/AccountPage';
import AboutPage from './pages/AboutPage';
import CarbonMarketplace from './pages/CarbonMarketplace';
import PremiumLandingPage from './pages/PremiumLandingPage';
import FarmerJourney from './pages/FarmerJourney';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/government" element={<GovernmentDashboard />} />
        <Route path="/plant" element={<PlantDashboard />} />
        <Route path="/fire" element={<FireMonitorPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/marketplace" element={<CarbonMarketplace />} />
        <Route path="/premium" element={<PremiumLandingPage />} />
        <Route path="/farmer-journey" element={<FarmerJourney />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
