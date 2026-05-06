import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { AccessibilityProvider } from '@/lib/AccessibilityContext';
import { SkinProvider } from '@/lib/SkinContext.jsx';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from '@/pages/Home';
import Consulta from '@/pages/Consulta';
import Transparencia from '@/pages/Transparencia';
import MisCasos from '@/pages/MisCasos';
import Soporte from '@/pages/Soporte';
import MisSoporte from '@/pages/MisSoporte';
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
import LyaChatWidget from '@/components/lya/LyaChatWidget';
import ErrorBoundary from '@/components/ErrorBoundary';
import SkinAutoDetectToast from '@/components/skins/SkinAutoDetectToast.jsx';
import EmbedLya from '@/pages/EmbedLya';
import Diseno from '@/pages/Diseno';
import ScrollToTop from '@/components/ScrollToTop';
import PWAInstallBanner from '@/components/pwa/PWAInstallBanner';
import QuickAdminPanel from '@/components/admin/QuickAdminPanel';
import Rubrica from '@/pages/Rubrica';
import Demo from '@/pages/Demo';
import Entregables from '@/pages/Entregables';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // App 100% pública — Claude Impact Lab CL 2026.
  // NUNCA bloqueamos ninguna ruta. Cualquier persona (jurado, prensa, ciudadanos)
  // puede entrar a cualquier página. Solo mostramos UserNotRegisteredError si el
  // visitante llega con un token de otro app inválido.
  if (authError && authError.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Render the main app — cada zona aislada en su propio ErrorBoundary
  // para que un crash en una página NO tumbe el chat ni el resto del shell.
  return (
    <>
    <ScrollToTop />
    <ErrorBoundary scope="routes" key={location?.pathname || 'routes'}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Consulta" element={<Consulta />} />
        <Route path="/Transparencia" element={<Transparencia />} />
        <Route path="/MisCasos" element={<MisCasos />} />
        <Route path="/Soporte" element={<Soporte />} />
        <Route path="/MisSoporte" element={<MisSoporte />} />
        <Route path="/B2B/APIKeys" element={<B2BAPIKeys />} />
        <Route path="/Casos" element={<Casos />} />
        <Route path="/CasosResueltos" element={<Casos />} />
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
        <Route path="/Embed/Lya" element={<EmbedLya />} />
        <Route path="/Diseno" element={<Diseno />} />
        <Route path="/Diseño" element={<Diseno />} />
        <Route path="/Rubrica" element={<Rubrica />} />
        <Route path="/Rúbrica" element={<Rubrica />} />
        <Route path="/Demo" element={<Demo />} />
        <Route path="/Entregables" element={<Entregables />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </ErrorBoundary>
    <ErrorBoundary scope="lya-widget" variant="silent">
      <LyaChatWidget />
    </ErrorBoundary>
    <ErrorBoundary scope="shell" variant="silent">
      <SkinAutoDetectToast />
      <PWAInstallBanner />
      <QuickAdminPanel />
    </ErrorBoundary>
    </>
  );
};


function App() {

  return (
    <ErrorBoundary scope="root">
      <AuthProvider>
        <AccessibilityProvider>
          <SkinProvider>
            <QueryClientProvider client={queryClientInstance}>
              <Router>
                <AuthenticatedApp />
              </Router>
              <Toaster />
            </QueryClientProvider>
          </SkinProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App