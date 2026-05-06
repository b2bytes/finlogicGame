import React, { useEffect, useState } from 'react';
import HeroNav from '@/components/home/HeroNav';
import Footer from '@/components/home/Footer';
import EmbajadoresHero from '@/components/embajadores/EmbajadoresHero';
import ReferralCard from '@/components/embajadores/ReferralCard';
import ImpactList from '@/components/embajadores/ImpactList';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

function generateCode(email) {
  const seed = email || 'guest';
  const hash = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0) * 31, 0);
  const base = Math.abs(hash).toString(36).toUpperCase().padStart(6, 'X').slice(0, 6);
  return `FL-${base}`;
}

export default function Embajadores() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroNav />
      <main>
        <EmbajadoresHero />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
          {loading ? (
            <div className="bg-card rounded-3xl p-8 border border-border animate-pulse h-48" />
          ) : user ? (
            <ReferralCard referralCode={generateCode(user.email)} userEmail={user.email} />
          ) : (
            <div className="bg-card rounded-3xl border border-border shadow-soft p-8 text-center">
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                Inicia sesión para obtener tu link
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                Tu código personal te permite ver cuántos vecinos resuelven con tu ayuda.
              </p>
              <Button
                asChild
                size="lg"
                className="rounded-full bg-mint-500 hover:bg-mint-600 text-white h-12 px-6 font-semibold shadow-mint"
              >
                <Link to="/Consulta">Empezar gratis</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ImpactList />
        </div>
      </main>
      <Footer />
    </div>
  );
}