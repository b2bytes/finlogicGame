import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Mail, Phone } from 'lucide-react';
import Logo from '@/components/home/Logo';
import FAQAccordion from '@/components/soporte/FAQAccordion';
import SupportForm from '@/components/soporte/SupportForm';

const PROFILE_TABS = [
  { key: 'todos', label: 'Todos' },
  { key: 'camila', label: 'Joven / Pro' },
  { key: 'don_luis', label: 'Adulto mayor' },
  { key: 'roberto', label: 'Fraude / Urgente' },
  { key: 'b2b_fintech', label: 'B2B Fintech' },
];

export default function Soporte() {
  const [profile, setProfile] = useState('todos');

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <Logo size="sm" />
          <span className="text-xs text-muted-foreground hidden sm:block">Soporte</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 md:py-14">
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            ¿En qué te ayudamos?
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
            Respuestas rápidas a las dudas más comunes. Si no encuentras lo que buscas, pregúntanos directo abajo.
          </p>
        </div>

        {/* Canales de contacto */}
        <div className="grid sm:grid-cols-3 gap-3 mb-10">
          <a
            href="https://wa.me/56900000000"
            target="_blank"
            rel="noreferrer"
            className="bg-card rounded-2xl border border-border p-4 hover:shadow-soft transition-shadow flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-mint-50 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-mint-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">WhatsApp</p>
              <p className="text-xs text-muted-foreground">Respuesta &lt;5 min</p>
            </div>
          </a>
          <a
            href="mailto:soporte@finlogic.one"
            className="bg-card rounded-2xl border border-border p-4 hover:shadow-soft transition-shadow flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Mail className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Email</p>
              <p className="text-xs text-muted-foreground">soporte@finlogic.one</p>
            </div>
          </a>
          <a
            href="tel:+56900000000"
            className="bg-card rounded-2xl border border-border p-4 hover:shadow-soft transition-shadow flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Phone className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Llamada</p>
              <p className="text-xs text-muted-foreground">Solo Pro y B2B</p>
            </div>
          </a>
        </div>

        {/* Tabs por perfil */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {PROFILE_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setProfile(t.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  profile === t.key
                    ? 'bg-foreground text-background'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-10">
          <FAQAccordion filter={profile} />
        </div>

        {/* Form triage */}
        <SupportForm />
      </main>
    </div>
  );
}