import React from 'react';
import { useLocation } from 'react-router-dom';
import HeroNav from '@/components/home/HeroNav';
import Footer from '@/components/home/Footer';
import ProHero from '@/components/pro/ProHero';
import PlanComparison from '@/components/pro/PlanComparison';
import ValueCalculator from '@/components/pro/ValueCalculator';

export default function Pro() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const trigger = params.get('trigger') || 'default';

  return (
    <div className="min-h-screen bg-background">
      <HeroNav />
      <main>
        <ProHero trigger={trigger} />
        <PlanComparison />
        <ValueCalculator />
      </main>
      <Footer />
    </div>
  );
}