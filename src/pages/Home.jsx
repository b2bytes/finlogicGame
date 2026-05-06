import React from 'react';
import HeroNav from '@/components/home/HeroNav';
import HeroSection from '@/components/home/HeroSection';
import MediaLogos from '@/components/home/MediaLogos';
import StatsBar from '@/components/home/StatsBar';
import RecentCasos from '@/components/home/RecentCasos';
import HowItWorks from '@/components/home/HowItWorks';
import PerfilesSection from '@/components/home/PerfilesSection';
import TestimoniosSection from '@/components/home/TestimoniosSection';
import TrustSection from '@/components/home/TrustSection';
import B2BSection from '@/components/home/B2BSection';
import CTASection from '@/components/home/CTASection';
import AntesDespues from '@/components/home/AntesDespues';
import Footer from '@/components/home/Footer';
import ImpactPullQuote from '@/components/home/ImpactPullQuote';
import CapasFinLogic from '@/components/home/CapasFinLogic';
import SFAUrgencyBanner from '@/components/home/SFAUrgencyBanner';
import ImpactLabBanner from '@/components/home/ImpactLabBanner';
import OrganismosCobertura from '@/components/home/OrganismosCobertura';
import DiferencialFinLogic from '@/components/home/DiferencialFinLogic';
import IndicadoresLive from '@/components/home/IndicadoresLive';
import { useReferralCapture } from '@/lib/useReferralCapture.jsx';

export default function Home() {
  useReferralCapture();
  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <HeroNav />
      <main className="overflow-x-clip">
        <ImpactLabBanner />
        <SFAUrgencyBanner />
        <HeroSection />
        <IndicadoresLive />
        <MediaLogos />
        <OrganismosCobertura />
        <StatsBar />
        <ImpactPullQuote />
        <AntesDespues />
        <CapasFinLogic />
        <HowItWorks />
        <RecentCasos />
        <PerfilesSection />
        <TestimoniosSection />
        <TrustSection />
        <DiferencialFinLogic />
        <B2BSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}