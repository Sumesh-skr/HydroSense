/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DashboardAccess from './pages/DashboardAccess';
import DashboardDetail from './pages/DashboardDetail';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FDFCFB] font-sans text-[#1A1A1A]">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/access" element={<DashboardAccess />} />
            <Route path="/dashboard/:deviceId" element={<DashboardDetail />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

