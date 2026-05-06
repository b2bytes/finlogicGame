import React from 'react';
import { Share2 } from 'lucide-react';

export default function ShareWhatsApp({ response, query }) {
  if (!response) return null;

  const handleShare = () => {
    const fact = response.fact || query;
    const action = (response.action || '').replace(/[#*_`]/g, '').slice(0, 200);
    const laws = (response.lawsCited || []).slice(0, 2).join(', ');

    const text = `🛡️ FinLogic me resolvió esto:\n\n"${fact}"\n\n${
      laws ? `📜 Te protege: ${laws}\n\n` : ''
    }${action ? `✅ ${action}\n\n` : ''}Resuelve gratis tu caso: https://finlogic.one/Consulta`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleShare}
      className="w-full flex items-center justify-center gap-2 py-3 min-h-[48px] rounded-2xl bg-[#25D366] hover:bg-[#1FB855] text-white font-semibold transition-colors shadow-soft"
    >
      <Share2 className="w-4 h-4" strokeWidth={2.4} />
      Compartir en WhatsApp
    </button>
  );
}