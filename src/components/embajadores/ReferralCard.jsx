import React, { useState } from 'react';
import { Copy, Check, Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReferralCard({ referralCode, userEmail, stats }) {
  const [copied, setCopied] = useState(false);

  const referralUrl = `${window.location.origin}/?ref=${referralCode}`;
  const whatsappMsg = encodeURIComponent(
    `Hola 👋 Si alguna vez te cobraron algo raro o sentiste que no entendías tu deuda, FinLogic te ayuda gratis. Es chileno, registrado en CMF, y en 30 segundos te dice qué hacer. Pruébalo: ${referralUrl}`
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card rounded-3xl border border-border shadow-soft-lg p-6 md:p-8">
      <div className="flex items-center gap-2 mb-2">
        <Share2 className="w-4 h-4 text-mint-600" />
        <h2 className="font-display text-xl font-bold text-foreground">
          Tu link personal de embajador
        </h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Compártelo con tus papás, vecinos, compañeros de pega. Cada vez que alguien resuelve un caso con tu link, lo verás aquí.
      </p>

      <div className="bg-mint-50 rounded-2xl border border-mint-200 p-4 mb-4">
        <p className="text-xs font-semibold text-mint-700 uppercase tracking-wide mb-1.5">
          Tu código
        </p>
        <p className="font-mono text-2xl font-bold text-foreground tracking-wider">
          {referralCode}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleCopy}
          variant="outline"
          size="lg"
          className="rounded-full h-12 flex-1 gap-2 font-semibold"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-mint-600" />
              ¡Copiado!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar link
            </>
          )}
        </Button>
        <Button
          asChild
          size="lg"
          className="rounded-full h-12 flex-1 bg-mint-500 hover:bg-mint-600 text-white gap-2 font-semibold shadow-mint"
        >
          <a
            href={`https://wa.me/?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="w-4 h-4" />
            Compartir por WhatsApp
          </a>
        </Button>
      </div>

      {stats && (
        <div className="mt-5 pt-5 border-t border-border grid grid-cols-3 gap-3">
          <ReferralStat value={stats.total} label="referidos" />
          <ReferralStat value={stats.activated} label="activados" />
          <ReferralStat value={stats.converted} label="conversiones Pro" />
          <div className="col-span-3 mt-2 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-50 border border-mint-200 text-xs font-semibold text-mint-700">
              Tu nivel: {stats.tier}
            </span>
          </div>
        </div>
      )}

      {userEmail && (
        <p className="mt-4 text-xs text-muted-foreground">
          Vinculado a {userEmail}
        </p>
      )}
    </div>
  );
}

function ReferralStat({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl font-bold text-foreground tabular-nums">{value}</div>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}