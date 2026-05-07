import React from 'react';
import LyaVoiceCard from '@/components/lya/LyaVoiceCard';

/**
 * LyaConversationalLive — Wrapper compacto del card de voz Lya para PitchDeck.
 * Activa pitchMode (tools de navegación de slides) y se posiciona top-right
 * para coexistir con la presentación.
 */
export default function LyaConversationalLive() {
  return <LyaVoiceCard pitchMode position="top-right" />;
}