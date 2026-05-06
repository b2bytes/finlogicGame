import React from 'react';
import HeroNav from '@/components/home/HeroNav';
import HeroSection from '@/components/home/HeroSection';
import StatsBar from '@/components/home/StatsBar';
import RecentCasos from '@/components/home/RecentCasos';
import HowItWorks from '@/components/home/HowItWorks';
import PerfilesSection from '@/components/home/PerfilesSection';
import TrustSection from '@/components/home/TrustSection';
import CTASection from '@/components/home/CTASection';
import Footer from '@/components/home/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroNav />
      <main>
        <HeroSection />
        <StatsBar />
        <RecentCasos />
        <HowItWorks />
        <PerfilesSection />
        <TrustSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}