import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { AccessibilityProvider } from '@/lib/AccessibilityContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from '@/pages/Home';
import Consulta from '@/pages/Consulta';
import Transparencia from '@/pages/Transparencia';
import MisCasos from '@/pages/MisCasos';
import Soporte from '@/pages/Soporte';
import B2BAPIKeys from '@/pages/B2BAPIKeys';
import Casos from '@/pages/Casos';
import APICompliance from '@/pages/APICompliance';
import Pyme from '@/pages/Pyme';
import Pricing from '@/pages/Pricing';
import FinancialDashboard from '@/pages/FinancialDashboard';
import Marca from '@/pages/Marca';
import CasoDetalle from '@/pages/CasoDetalle';
import PitchDeck from '@/pages/PitchDeck';
import OperacionesDashboard from '@/pages/OperacionesDashboard';
import Embajadores from '@/pages/Embajadores';
import Insights from '@/pages/Insights';
import Pro from '@/pages/Pro';
import SystemMetrics from '@/pages/SystemMetrics';
import AsistenteLya from '@/pages/AsistenteLya';
import ContentStudio from '@/pages/ContentStudio';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Consulta" element={<Consulta />} />
      <Route path="/Transparencia" element={<Transparencia />} />
      <Route path="/MisCasos" element={<MisCasos />} />
      <Route path="/Soporte" element={<Soporte />} />
      <Route path="/B2B/APIKeys" element={<B2BAPIKeys />} />
      <Route path="/Casos" element={<Casos />} />
      <Route path="/api-compliance" element={<APICompliance />} />
      <Route path="/Pyme" element={<Pyme />} />
      <Route path="/Pricing" element={<Pricing />} />
      <Route path="/FinancialDashboard" element={<FinancialDashboard />} />
      <Route path="/Marca" element={<Marca />} />
      <Route path="/MisCasos/:id" element={<CasoDetalle />} />
      <Route path="/PitchDeck" element={<PitchDeck />} />
      <Route path="/OperacionesDashboard" element={<OperacionesDashboard />} />
      <Route path="/Embajadores" element={<Embajadores />} />
      <Route path="/Insights" element={<Insights />} />
      <Route path="/Pro" element={<Pro />} />
      <Route path="/Admin/SystemMetrics" element={<SystemMetrics />} />
      <Route path="/AsistenteLya" element={<AsistenteLya />} />
      <Route path="/Admin/ContentStudio" element={<ContentStudio />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <AccessibilityProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AccessibilityProvider>
    </AuthProvider>
  )
}

export default App