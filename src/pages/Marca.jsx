import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Palette, Type, Volume2, Heart } from 'lucide-react';
import HeroNav from '@/components/home/HeroNav';
import Footer from '@/components/home/Footer';
import Logo from '@/components/home/Logo';

const PALETTE = [
  { name: 'Mint 600', hex: '#1A7A4A', use: 'Primary · CTA · Confirmaciones', class: 'bg-mint-600' },
  { name: 'Mint 500', hex: '#22A06B', use: 'Acción · Énfasis', class: 'bg-mint-500' },
  { name: 'Mint 100', hex: '#D4F2E0', use: 'Backgrounds suaves · Badges', class: 'bg-mint-100' },
  { name: 'Foreground', hex: '#1F2533', use: 'Texto principal · Headers', class: 'bg-foreground' },
  { name: 'Accent', hex: '#FBE3D0', use: 'Durazno cálido · Highlights', class: 'bg-accent' },
  { name: 'Background', hex: '#F8F3E9', use: 'Surface crema · Body', class: 'bg-background' },
];

const VALUES = [
  { icon: Heart, title: 'Justicia accesible', desc: 'No es empowerment genérico. Es la emoción específica de entender por primera vez.' },
  { icon: Eye, title: 'Transparencia radical', desc: 'Cada respuesta es auditable en /Transparencia. Ningún razonamiento oculto.' },
  { icon: Volume2, title: 'Voz cálida', desc: 'Cálido pero directo. Nunca condescendiente. Nunca burocrático.' },
];

export default function Marca() {
  return (
    <div className="min-h-screen bg-background">
      <HeroNav />

      <main className="max-w-5xl mx-auto px-6 lg:px-8 pt-12 pb-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Hero */}
        <div className="mb-16 max-w-3xl animate-fade-up">
          <p className="text-sm font-semibold text-mint-600 mb-3 tracking-wide uppercase">
            Manual de marca público
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
            Tu derecho.<br />En tu idioma.<br /><span className="text-mint-600">Ahora.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Coherente con nuestro principio de transparencia radical: cualquier ciudadano puede ver cómo se construyó la identidad de quien lo representa.
          </p>
        </div>

        {/* Logo */}
        <section className="mb-16 animate-fade-up" style={{ animationDelay: '80ms' }}>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Identidad</h2>
          <div className="bg-card rounded-3xl border border-border p-10 shadow-soft flex items-center justify-center">
            <Logo size="lg" />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            <strong className="text-foreground">FinLogic</strong> — combinación de "Fin" (finanzas) y "Logic" (lógica que ilumina).
            Dominio canónico: <code className="font-mono text-mint-700">finlogic.one</code> · Porque solo necesitas uno.
          </p>
        </section>

        {/* Valores */}
        <section className="mb-16 animate-fade-up" style={{ animationDelay: '160ms' }}>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Arquetipo · Héroe + Sabio</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-card rounded-3xl border border-border p-6 shadow-soft">
                <div className="w-10 h-10 rounded-2xl bg-mint-50 flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-mint-600" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Paleta */}
        <section className="mb-16 animate-fade-up" style={{ animationDelay: '240ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-mint-600" />
            <h2 className="font-display text-2xl font-bold text-foreground">Paleta cromática</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
            Mint cálido (no azul corporativo bancario). El verde aquí significa "acción completada", "derecho ejercido" — no "dinero".
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PALETTE.map((c) => (
              <div key={c.name} className="bg-card rounded-3xl border border-border overflow-hidden shadow-soft">
                <div className={`${c.class} h-24`} />
                <div className="p-4">
                  <p className="font-display font-bold text-foreground">{c.name}</p>
                  <p className="font-mono text-xs text-mint-700 mt-0.5">{c.hex}</p>
                  <p className="text-xs text-muted-foreground mt-2">{c.use}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tipografía */}
        <section className="mb-16 animate-fade-up" style={{ animationDelay: '320ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <Type className="w-5 h-5 text-mint-600" />
            <h2 className="font-display text-2xl font-bold text-foreground">Tipografía</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card rounded-3xl border border-border p-8 shadow-soft">
              <p className="text-xs font-semibold text-mint-600 uppercase tracking-wide mb-2">Display</p>
              <p className="font-display text-4xl font-bold text-foreground mb-2">Plus Jakarta</p>
              <p className="text-sm text-muted-foreground">Títulos · KPIs · Headlines · Hero</p>
            </div>
            <div className="bg-card rounded-3xl border border-border p-8 shadow-soft">
              <p className="text-xs font-semibold text-mint-600 uppercase tracking-wide mb-2">Body</p>
              <p className="font-sans text-4xl font-medium text-foreground mb-2">Inter</p>
              <p className="text-sm text-muted-foreground">Lectura · Cuerpo · Respuestas del agente</p>
            </div>
          </div>
        </section>

        {/* Tagline */}
        <section className="animate-fade-up" style={{ animationDelay: '400ms' }}>
          <div className="bg-foreground text-background rounded-3xl p-12 text-center shadow-soft-lg">
            <p className="text-xs font-semibold text-mint-300 uppercase tracking-wide mb-4">Tagline canónico</p>
            <p className="font-display text-2xl md:text-3xl font-bold leading-snug">
              Esto no es un chatbot.<br />
              Es el <span className="text-mint-300">sistema operativo financiero</span><br />
              del pueblo de Chile.
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Manual abierto · Cumple Ley 21.719 · Actualizado en tiempo real
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}