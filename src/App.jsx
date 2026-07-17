import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/admin/Dashboard';
import Courts from '@/pages/admin/Courts';
import TimeSlots from '@/pages/admin/TimeSlots';
import Bookings from '@/pages/admin/Bookings';
import Explore from '@/pages/client/Explore';
import CourtDetail from '@/pages/client/CourtDetail';
import MyBookings from '@/pages/client/MyBookings';
import Profile from '@/pages/client/Profile';
import MatchFeed from '@/pages/client/MatchFeed';
import Players from '@/pages/client/Players';
import PlayerDetail from '@/pages/client/PlayerDetail';
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const RoleRouter = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        const pendingType = localStorage.getItem("pending_account_type");
        if (pendingType && !me.account_type) {
          try {
            await base44.auth.updateMe({ account_type: pendingType });
            me.account_type = pendingType;
          } catch (e) { console.error(e); }
          localStorage.removeItem("pending_account_type");
        }
        setUser(me);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.account_type === "dono";

  if (isAdmin) {
    return (
      <Routes>
        <Route element={<AppLayout userRole="dono" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courts" element={<Courts />} />
          <Route path="/time-slots" element={<TimeSlots />} />
          <Route path="/bookings" element={<Bookings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppLayout userRole="cliente" />}>
        <Route path="/" element={<Navigate to="/explore" replace />} />
        <Route path="/matches" element={<MatchFeed />} />
        <Route path="/players" element={<Players />} />
        <Route path="/players/:id" element={<PlayerDetail />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/court/:id" element={<CourtDetail />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/explore" replace />} />
    </Routes>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return <RoleRouter />;
};


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
              <Route path="/*" element={<AuthenticatedApp />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App