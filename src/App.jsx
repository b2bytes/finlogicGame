import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { AccessibilityProvider } from '@/lib/AccessibilityContext';
import { SkinProvider } from '@/lib/SkinContext.jsx';
import { LyaPersistentProvider } from '@/lib/LyaPersistentContext.jsx';
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
import LyaVoiceCard from '@/components/lya/LyaVoiceCard';
import LyaActionBus from '@/components/lya/LyaActionBus';
import SmartAlertsBridge from '@/components/notifications/SmartAlertsBridge';
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
import AdminCRM from '@/pages/AdminCRM';
import Lanzamiento from '@/pages/Lanzamiento';
import SafeRoute from '@/components/SafeRoute';

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
        <Route path="/" element={<SafeRoute name="Home"><Home /></SafeRoute>} />
        <Route path="/Consulta" element={<SafeRoute name="Consulta"><Consulta /></SafeRoute>} />
        <Route path="/Transparencia" element={<SafeRoute name="Transparencia"><Transparencia /></SafeRoute>} />
        <Route path="/MisCasos" element={<SafeRoute name="MisCasos"><MisCasos /></SafeRoute>} />
        <Route path="/Soporte" element={<SafeRoute name="Soporte"><Soporte /></SafeRoute>} />
        <Route path="/MisSoporte" element={<SafeRoute name="MisSoporte"><MisSoporte /></SafeRoute>} />
        <Route path="/B2B/APIKeys" element={<SafeRoute name="B2BAPIKeys"><B2BAPIKeys /></SafeRoute>} />
        <Route path="/Casos" element={<SafeRoute name="Casos"><Casos /></SafeRoute>} />
        <Route path="/CasosResueltos" element={<SafeRoute name="CasosResueltos"><Casos /></SafeRoute>} />
        <Route path="/api-compliance" element={<SafeRoute name="APICompliance"><APICompliance /></SafeRoute>} />
        <Route path="/Pyme" element={<SafeRoute name="Pyme"><Pyme /></SafeRoute>} />
        <Route path="/Pricing" element={<SafeRoute name="Pricing"><Pricing /></SafeRoute>} />
        <Route path="/FinancialDashboard" element={<SafeRoute name="FinancialDashboard"><FinancialDashboard /></SafeRoute>} />
        <Route path="/Marca" element={<SafeRoute name="Marca"><Marca /></SafeRoute>} />
        <Route path="/MisCasos/:id" element={<SafeRoute name="CasoDetalle"><CasoDetalle /></SafeRoute>} />
        <Route path="/PitchDeck" element={<SafeRoute name="PitchDeck"><PitchDeck /></SafeRoute>} />
        <Route path="/OperacionesDashboard" element={<SafeRoute name="OperacionesDashboard"><OperacionesDashboard /></SafeRoute>} />
        <Route path="/Embajadores" element={<SafeRoute name="Embajadores"><Embajadores /></SafeRoute>} />
        <Route path="/Insights" element={<SafeRoute name="Insights"><Insights /></SafeRoute>} />
        <Route path="/Pro" element={<SafeRoute name="Pro"><Pro /></SafeRoute>} />
        <Route path="/Admin/SystemMetrics" element={<SafeRoute name="SystemMetrics"><SystemMetrics /></SafeRoute>} />
        <Route path="/AsistenteLya" element={<SafeRoute name="AsistenteLya"><AsistenteLya /></SafeRoute>} />
        <Route path="/Admin/ContentStudio" element={<SafeRoute name="ContentStudio"><ContentStudio /></SafeRoute>} />
        <Route path="/Embed/Lya" element={<SafeRoute name="EmbedLya"><EmbedLya /></SafeRoute>} />
        <Route path="/Diseno" element={<SafeRoute name="Diseno"><Diseno /></SafeRoute>} />
        <Route path="/Diseño" element={<SafeRoute name="Diseno"><Diseno /></SafeRoute>} />
        <Route path="/Rubrica" element={<SafeRoute name="Rubrica"><Rubrica /></SafeRoute>} />
        <Route path="/Rúbrica" element={<SafeRoute name="Rubrica"><Rubrica /></SafeRoute>} />
        <Route path="/Demo" element={<SafeRoute name="Demo"><Demo /></SafeRoute>} />
        <Route path="/Entregables" element={<SafeRoute name="Entregables"><Entregables /></SafeRoute>} />
        <Route path="/Admin/CRM" element={<SafeRoute name="AdminCRM"><AdminCRM /></SafeRoute>} />
        <Route path="/Admin/Lanzamiento" element={<SafeRoute name="Lanzamiento"><Lanzamiento /></SafeRoute>} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </ErrorBoundary>
    <ErrorBoundary scope="lya-widget" variant="silent">
      <LyaChatWidget />
    </ErrorBoundary>
    {/* Lya voz global PERSISTENTE — montada UNA SOLA VEZ y sobrevive a
        navegaciones SPA gracias al LyaPersistentProvider. Solo se excluye
        en /Embed/Lya (iframe externo) para evitar doble instancia. */}
    {!location?.pathname?.startsWith('/Embed/Lya') && (
      <ErrorBoundary scope="lya-voice-card" variant="silent">
        <LyaVoiceCard
          position="bottom-right"
          stackOffset={92}
          pitchMode={location?.pathname?.startsWith('/PitchDeck')}
        />
      </ErrorBoundary>
    )}
    <ErrorBoundary scope="shell" variant="silent">
      <SkinAutoDetectToast />
      <PWAInstallBanner />
      <QuickAdminPanel />
      <LyaActionBus />
      <SmartAlertsBridge />
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
            <LyaPersistentProvider>
              <QueryClientProvider client={queryClientInstance}>
                <Router>
                  <AuthenticatedApp />
                </Router>
                <Toaster />
              </QueryClientProvider>
            </LyaPersistentProvider>
          </SkinProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App