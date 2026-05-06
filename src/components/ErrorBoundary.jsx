import React from 'react';

/**
 * ErrorBoundary global de FinLogic.
 *
 * Garantiza que la app NUNCA quede en blanco si un componente lanza
 * un error de render. Captura el error, lo loggea (consola + sessionStorage
 * para debugging), y muestra una pantalla de recuperación accionable
 * con la marca y opciones de reintento.
 *
 * Acepta un `scope` opcional para identificar dónde se montó (root, route, widget).
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const scope = this.props.scope || 'root';
    // Log estructurado para que aparezca en runtime logs
    // eslint-disable-next-line no-console
    console.error(`[ErrorBoundary:${scope}]`, error, errorInfo?.componentStack);

    // Persistencia ligera para debugging post-mortem
    try {
      const log = {
        scope,
        message: error?.message || String(error),
        stack: error?.stack?.split('\n').slice(0, 8).join('\n'),
        componentStack: errorInfo?.componentStack?.split('\n').slice(0, 6).join('\n'),
        url: window.location.href,
        ts: new Date().toISOString(),
      };
      const prev = JSON.parse(sessionStorage.getItem('finlogic_errors') || '[]');
      sessionStorage.setItem('finlogic_errors', JSON.stringify([log, ...prev].slice(0, 5)));
    } catch (_) {
      /* sessionStorage puede fallar en privado */
    }

    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    // Variante compacta para widgets / secciones (no toma full screen)
    if (this.props.variant === 'inline') {
      return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900">
          <p className="font-semibold mb-1">Esta sección no se pudo cargar</p>
          <p className="text-amber-800/80 text-xs mb-3">
            Lya sigue funcionando en el resto de la página.
          </p>
          <button
            onClick={this.handleReset}
            className="text-xs px-3 py-1.5 rounded-full bg-amber-900 text-amber-50 hover:bg-amber-950 transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    // Variante full-screen (root)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center animate-fade-up">
          {/* Marca L */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-mint-100 mb-6">
            <span className="font-editorial text-mint-700 text-3xl font-bold leading-none">L</span>
          </div>

          <p className="text-xs font-mono uppercase tracking-wider text-mint-600 mb-3">
            Algo se interrumpió
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
            Lya tuvo un problema técnico.
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            No te preocupes — tus datos y consultas están seguros. Esto fue un
            error visual que no afecta tu información.
          </p>

          {/* Detalles para debugging — solo en preview/dev */}
          {this.state.error?.message && (
            <details className="text-left mb-6 bg-card border border-border rounded-2xl p-4 text-xs">
              <summary className="cursor-pointer font-semibold text-muted-foreground hover:text-foreground">
                Detalles técnicos
              </summary>
              <pre className="mt-3 text-[11px] text-muted-foreground whitespace-pre-wrap break-words font-mono leading-relaxed max-h-40 overflow-auto">
                {this.state.error.message}
                {this.state.errorInfo?.componentStack
                  ? `\n${this.state.errorInfo.componentStack.split('\n').slice(0, 5).join('\n')}`
                  : ''}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-mint-600 hover:bg-mint-700 text-white text-sm font-semibold transition-colors shadow-soft"
            >
              Recargar la página
            </button>
            <button
              onClick={this.handleGoHome}
              className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-card border border-border hover:border-mint-300 text-foreground text-sm font-semibold transition-colors"
            >
              Volver al inicio
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            Si el problema persiste, escríbenos en{' '}
            <a href="/Soporte" className="text-mint-700 underline hover:text-mint-800">
              soporte
            </a>
            .
          </p>
        </div>
      </div>
    );
  }
}