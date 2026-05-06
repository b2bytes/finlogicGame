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
import { useReferralCapture } from '@/lib/useReferralCapture';

export default function Home() {
  useReferralCapture();
  return (
    <div className="min-h-screen bg-background">
      <HeroNav />
      <main>
        <SFAUrgencyBanner />
        <HeroSection />
        <MediaLogos />
        <StatsBar />
        <ImpactPullQuote />
        <AntesDespues />
        <CapasFinLogic />
        <HowItWorks />
        <RecentCasos />
        <PerfilesSection />
        <TestimoniosSection />
        <TrustSection />
        <B2BSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}