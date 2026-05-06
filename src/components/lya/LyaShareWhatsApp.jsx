import React, { useState } from 'react';
import { MessageCircle, Check } from 'lucide-react';

export default function LyaShareWhatsApp({ query, response, sources = [] }) {
  const [shared, setShared] = useState(false);

  const handleShare = () => {
    const cleanResp = (response || '').replace(/\*\*/g, '').replace(/[#`]/g, '').slice(0, 380);
    const sourcesText = sources.length ? `\n\n📚 Fuente: ${sources[0]}` : '';
    const message = `🤖 FinLogic responde:\n\n*${query}*\n\n${cleanResp}${sourcesText}\n\n👉 Resuelve tu duda gratis en https://finlogic.one/AsistenteLya?utm_source=whatsapp_share`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  };

  return (
    <button
      onClick={handleShare}
      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-mint-50 hover:bg-mint-100 text-mint-700 text-xs font-semibold border border-mint-200 transition-colors"
    >
      {shared ? <Check className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
      {shared ? 'Listo · gracias por difundir' : 'Compartir en WhatsApp'}
    </button>
  );
}