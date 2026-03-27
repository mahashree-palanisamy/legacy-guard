import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import PrivateRoute from "@/components/PrivateRoute";
import DashboardLayout from "@/components/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DeathVerificationPage from "@/pages/DeathVerificationPage";
import DashboardPage from "@/pages/DashboardPage";
import AssetsPage from "@/pages/AssetsPage";
import HeirsPage from "@/pages/HeirsPage";
import VideosPage from "@/pages/VideosPage";
import WillPage from "@/pages/WillPage";
import HeirDashboardPage from "@/pages/HeirDashboardPage";
import ActivityPage from "@/pages/ActivityPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import HelpPage from "@/pages/HelpPage";
import NotificationsPage from "@/pages/NotificationsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AppDataProvider>
          <TooltipProvider>
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/death-verification" element={<DeathVerificationPage />} />

                {/* Owner-only routes */}
                <Route element={<PrivateRoute allowedRoles={['OWNER']}><DashboardLayout /></PrivateRoute>}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/heirs" element={<HeirsPage />} />
                  <Route path="/activity" element={<ActivityPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                </Route>

                {/* Heir-only routes */}
                <Route element={<PrivateRoute allowedRoles={['HEIR']}><DashboardLayout /></PrivateRoute>}>
                  <Route path="/heir-dashboard" element={<HeirDashboardPage />} />
                </Route>

                {/* Shared routes (both roles) */}
                <Route element={<PrivateRoute allowedRoles={['OWNER', 'HEIR']}><DashboardLayout /></PrivateRoute>}>
                  <Route path="/assets" element={<AssetsPage />} />
                  <Route path="/videos" element={<VideosPage />} />
                  <Route path="/will" element={<WillPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/help" element={<HelpPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AppDataProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;