import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * AdminGuard — Bloquea acceso a páginas administrativas.
 * Solo permite el render del children si el usuario está autenticado
 * Y tiene rol "admin". En caso contrario muestra un panel de login.
 */
export default function AdminGuard({ children }) {
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-mint-200 border-t-mint-600 rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = isAuthenticated && user?.role === 'admin';
  if (isAdmin) return children;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-soft text-center">
        <div className="w-14 h-14 rounded-2xl bg-mint-50 border border-mint-200 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-6 h-6 text-mint-700" />
        </div>
        <h1 className="font-display text-xl font-bold text-foreground mb-2">
          Acceso restringido
        </h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Esta sección es solo para el equipo FinLogic. Inicia sesión con una
          cuenta de administrador para continuar.
        </p>
        <div className="space-y-2">
          {!isAuthenticated ? (
            <button
              onClick={navigateToLogin}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Iniciar sesión
            </button>
          ) : (
            <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-2xl px-3 py-2">
              Tu cuenta no tiene permisos de administrador.
            </p>
          )}
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-secondary text-foreground font-semibold text-sm hover:bg-secondary/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}