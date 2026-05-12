import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UserLogin from './pages/UserLogin';
import UserSignup from './pages/UserSignup';
import DriverLogin from './pages/DriverLogin';
import DriverSignup from './pages/DriverSignup';
import Home from './pages/Home';
import DriverDashboard from './pages/DriverDashboard';
import Wallet from './pages/Wallet';
import Rewards from './pages/Rewards';
import { UserContext } from './context/UserContext';
import { DriverContext } from './context/DriverContext';
import { Toaster } from 'sonner';

// Protected Route Component
const ProtectedRoute = ({ children, role = 'user' }: { children: React.ReactNode, role?: 'user' | 'driver' }) => {
    const userToken = localStorage.getItem('token');
    const driverToken = localStorage.getItem('driver-token');
    
    if (role === 'user' && !userToken) {
        return <Navigate to="/login" />;
    }
    if (role === 'driver' && !driverToken) {
        return <Navigate to="/driver-login" />;
    }
    return <>{children}</>;
};

function App() {
  return (
    <UserContext>
        <DriverContext>
            <Router>
                <div className="font-sans antialiased bg-slate-950 text-slate-50 min-h-screen">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<UserLogin />} />
                        <Route path="/signup" element={<UserSignup />} />
                        <Route path="/driver-login" element={<DriverLogin />} />
                        <Route path="/driver-signup" element={<DriverSignup />} />
                        <Route path="/home" element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        } />
                        <Route path="/driver-dashboard" element={
                            <ProtectedRoute role="driver">
                                <DriverDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/wallet" element={
                            <ProtectedRoute>
                                <Wallet />
                            </ProtectedRoute>
                        } />
                        <Route path="/rewards" element={
                            <ProtectedRoute>
                                <Rewards />
                            </ProtectedRoute>
                        } />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                    <Toaster position="top-center" richColors theme="dark" />
                </div>
            </Router>
        </DriverContext>
    </UserContext>
  );
}

export default App;
