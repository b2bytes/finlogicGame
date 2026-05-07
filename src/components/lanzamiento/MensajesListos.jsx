import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Eyebrow from '@/components/editorial/Eyebrow';

const MENSAJES = [
  {
    canal: 'LinkedIn DM',
    para: 'Felipe Pizarro Astudillo',
    texto: `Hola Felipe, soy [nombre] de FinLogic. Sé que llevas 17 años en prevención de fraudes electrónicos en banca chilena.

Construimos un sistema que automatiza cartas Ley 20.009 en 5 minutos, con verificador anti-alucinación 89/100 score. Ya recuperamos $732K para 47 chilenos.

¿Tomamos un café mañana en CFF26 para mostrarte el endpoint /fraud-pattern-match en vivo? Nos vemos cerca de BancoEstado 09:30.

finlogic.one`,
  },
  {
    canal: 'LinkedIn DM',
    para: 'Hugo Guerra · AI Tinkerers',
    texto: `Hugo, te seguí la fundación de fintech.benditaia.cl 👏

Somos FinLogic — IA legal financiera con voz nativa (Lya). Pipeline RAG + Pinecone + verificador. Te invito a verla mañana en Espacio Riesco. 90 segundos te dejan helado.

¿Te tinca un episodio AI Tinkerers junio sobre nuestro caso? Yo llevo el café.`,
  },
  {
    canal: 'Tweet pre-evento',
    para: 'X / Twitter',
    texto: `Mañana entramos a @ChileFintechFor en Espacio Riesco con 1 sola misión:

Mostrar que la traducción de leyes financieras chilenas a lenguaje ciudadano YA existe.

$732K recuperados · 9.5 días · 0.4% alucinación.

→ finlogic.one

#CFF26 #Fintech #IA #Chile`,
  },
  {
    canal: 'Post LinkedIn',
    para: 'Cuenta personal del equipo',
    texto: `Mañana 7 de mayo, FinLogic se presenta oficialmente en Chile Fintech Forum 2026.

Construimos algo simple: que cualquier ciudadano pueda denunciar un fraude bancario en 5 minutos, en su idioma, con base legal verificada.

→ Ley 20.009. Ley 19.496. Ley 21.713. NCG 502.
→ 89/100 score verificador IA.
→ 12 módulos normativos vivos.

Si vas a estar en Espacio Riesco, búscanos. Tengo un demo de 90 segundos que cambia cómo piensas la justicia financiera.

📍 finlogic.one`,
  },
  {
    canal: 'Pitch oral 30s',
    para: 'Networking de pasillo',
    texto: `Hola, soy [nombre] de FinLogic.

Construimos el primer sistema operativo financiero con IA para Chile. Resolvemos consultas legales-financieras en segundos, en lenguaje ciudadano. Generamos documentos firmables. Cubrimos los 4 organismos: CMF, SERNAC, SII, CSIRT.

Tres datos: $732K recuperados, 9.5 días promedio, 0.4% alucinación. Estamos en producción en finlogic.one.

¿Te muestro Lya hablando 90 segundos?`,
  },
  {
    canal: 'Email follow-up post-evento',
    para: 'Lead capturado',
    texto: `[Nombre], gracias por la conversación de hoy en CFF26.

Como prometí, te dejo:
1. Demo en vivo: finlogic.one/Demo
2. ROI Compliance API: finlogic.one/api-compliance (calculadora interactiva)
3. Mi Calendly: [link] — slot 30 min cualquier día 8-15 mayo

Construimos esto para resolver lo que mencionaste. Si vemos sinergia en 30 minutos, podemos firmar piloto antes del 4 julio (ventana SFA).

Saludos,
[Equipo FinLogic]`,
  },
];

function MessageCard({ msg }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(msg.texto);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <article className="bg-card border border-border rounded-3xl p-6 shadow-soft">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-mono-editorial uppercase tracking-wider text-mint-700 font-bold">{msg.canal}</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">para {msg.para}</p>
        </div>
        <button
          onClick={copy}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-mint-50 hover:bg-mint-100 text-mint-700 flex items-center justify-center transition-colors"
          aria-label="Copiar mensaje"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/85 leading-relaxed">{msg.texto}</pre>
    </article>
  );
}

export default function MensajesListos() {
  return (
    <section className="px-6 lg:px-12 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto">
        <Eyebrow size="md" className="mb-4">📋 COPY-PASTE READY</Eyebrow>
        <h2 className="font-display tracking-tight font-bold text-foreground text-3xl sm:text-5xl mb-4 leading-tight">
          6 mensajes listos.<br />
          <span className="text-mint-600">Copia · pega · envía.</span>
        </h2>
        <p className="text-muted-foreground max-w-3xl">
          Cero fricción. Cada mensaje calibrado al canal, persona y momento. Personaliza el [nombre] y dispara.
        </p>

        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {MENSAJES.map((m, i) => <MessageCard key={i} msg={m} />)}
        </div>
      </div>
    </section>
  );
}