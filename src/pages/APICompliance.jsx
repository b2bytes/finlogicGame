import React from 'react';
import HeroNav from '@/components/home/HeroNav';
import Footer from '@/components/home/Footer';
import ComplianceHero from '@/components/api-compliance/ComplianceHero';
import EndpointsGrid from '@/components/api-compliance/EndpointsGrid';
import ROICalculator from '@/components/api-compliance/ROICalculator';
import DemoCheckTMC from '@/components/api-compliance/DemoCheckTMC';
import ComplianceCTA from '@/components/api-compliance/ComplianceCTA';

export default function APICompliance() {
  return (
    <div className="min-h-screen bg-background">
      <HeroNav />
      <main>
        <ComplianceHero />
        <EndpointsGrid />
        <DemoCheckTMC />
        <ROICalculator />
        <ComplianceCTA />
      </main>
      <Footer />
    </div>
  );
}