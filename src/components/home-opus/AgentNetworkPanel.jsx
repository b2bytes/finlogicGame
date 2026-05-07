import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

/**
 * AgentNetworkPanel — visualización de la red de 4 agentes IA orquestados
 * (Liquidator → SII → Mediator → CMF Validator). Conexiones con etiquetas
 * mint, halos suaves, badges verificables. Basado en imagen referencia Opus.
 */

const agents = [
  {
    id: 'liquidator',
    name: 'Liquidator',
    role: 'Agent',
    img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&q=85&auto=format&fit=crop&crop=faces',
    pos: 'top-[8%] left-[8%]',
    verified: true,
  },
  {
    id: 'sii',
    name: 'SII',
    role: 'Agent',
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=85&auto=format&fit=crop&crop=faces',
    pos: 'top-[8%] right-[10%]',
  },
  {
    id: 'mediator',
    name: 'Mediator',
    role: 'Agent',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=85&auto=format&fit=crop&crop=faces',
    pos: 'top-[42%] right-[18%]',
  },
  {
    id: 'cmf',
    name: 'CMF',
    role: 'Validator',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=85&auto=format&fit=crop&crop=faces',
    pos: 'bottom-[18%] left-[16%]',
  },
];

const connections = [
  // (x1,y1) → (x2,y2) en %, label, label position
  { from: { x: 22, y: 20 }, to: { x: 78, y: 20 }, label: 'Auditoría Bancaria', labelX: 50, labelY: 12 },
  { from: { x: 78, y: 30 }, to: { x: 78, y: 50 }, label: 'Auditoría Legal', labelX: 92, labelY: 40 },
  { from: { x: 30, y: 30 }, to: { x: 30, y: 70 }, label: 'Verificación Fiscal', labelX: 8, labelY: 50 },
  { from: { x: 40, y: 78 }, to: { x: 70, y: 60 }, label: 'Redacción Legal', labelX: 56, labelY: 76 },
];

function AgentNode({ agent }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
      className={`absolute ${agent.pos} flex flex-col items-center gap-1.5 z-10`}
    >
      <div className="relative">
        {/* Halo mint */}
        <div className="absolute inset-0 rounded-full bg-mint-400/30 blur-md scale-110" />
        <div className="relative w-[58px] h-[58px] rounded-full overflow-hidden ring-2 ring-mint-400/60 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
          <img src={agent.img} alt={agent.name} className="w-full h-full object-cover" />
        </div>
        {agent.verified && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-mint-500 ring-2 ring-[#0a1410] flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-[11px] font-geist font-bold text-white leading-tight">{agent.name}</p>
        <p className="text-[10px] font-geist text-white/50 leading-tight">{agent.role}</p>
      </div>
    </motion.div>
  );
}

function ConnectionLine({ from, to, label, labelX, labelY }) {
  return (
    <>
      <line
        x1={`${from.x}%`}
        y1={`${from.y}%`}
        x2={`${to.x}%`}
        y2={`${to.y}%`}
        stroke="url(#mintGradient)"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.5"
      />
      <foreignObject x={`${labelX - 12}%`} y={`${labelY - 2}%`} width="120" height="20">
        <div className="text-[9px] font-grotesk uppercase tracking-[0.15em] text-mint-300/80 bg-[#0a1410]/90 px-1.5 py-0.5 rounded inline-block whitespace-nowrap font-medium">
          {label}
        </div>
      </foreignObject>
    </>
  );
}

export default function AgentNetworkPanel() {
  return (
    <div className="relative h-full min-h-[480px] rounded-[28px] bg-gradient-to-br from-[#0d1f17]/90 via-[#0a1410]/80 to-[#081210]/90 border border-mint-500/10 overflow-hidden p-5">
      {/* Glow corner */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-mint-500/10 rounded-full blur-3xl" />

      {/* Header pill */}
      <div className="relative z-20 flex items-center justify-between mb-4">
        <div className="inline-flex items-center gap-2 text-[10px] font-grotesk uppercase tracking-[0.18em] text-mint-300 bg-mint-500/10 border border-mint-400/20 px-2.5 py-1 rounded-full font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse" />
          IMPACT LAB
        </div>
        <div className="text-[10px] font-geist-mono text-white/50 tabular-nums">
          9 consultas · <span className="text-mint-300">90/100</span>
        </div>
      </div>

      {/* Network — SVG connections + agents */}
      <div className="relative h-[340px]">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mintGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(152 70% 55%)" stopOpacity="0.2" />
              <stop offset="50%" stopColor="hsl(152 70% 55%)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(152 70% 55%)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {connections.map((c, i) => (
            <ConnectionLine key={i} {...c} />
          ))}
        </svg>

        {agents.map((a) => (
          <AgentNode key={a.id} agent={a} />
        ))}
      </div>

      {/* Footer — verifiable metatags */}
      <div className="relative z-10 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-1.5 mb-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-mint-400" />
          <span className="text-[12px] font-geist font-semibold text-white">Verifiable metatags</span>
        </div>
        <p className="text-[10px] font-geist text-white/40 mb-2.5">Click to verify.</p>
        <div className="flex flex-wrap gap-1.5">
          {['Ley 19.496', 'Ley 21.713', 'Ley 21.719'].map((l) => (
            <span
              key={l}
              className="text-[10px] font-geist-mono text-mint-200 bg-mint-500/10 border border-mint-400/20 px-2 py-0.5 rounded-full"
            >
              <CheckCircle2 className="w-2.5 h-2.5 inline mr-1 text-mint-400" />
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom-left corner pill — equipo */}
      <div className="absolute bottom-3 left-3 z-20">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-grotesk text-white/60 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3 h-3" />
          Equipo · <span className="text-mint-300">+K</span>
        </div>
      </div>
    </div>
  );
}