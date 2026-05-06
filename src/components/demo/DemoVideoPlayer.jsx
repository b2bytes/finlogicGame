import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, Film } from 'lucide-react';

/**
 * DemoVideoPlayer — slot profesional para el video de 3-5min del Impact Lab.
 * Lee la URL desde:
 *   1. Prop `url`
 *   2. localStorage (registrada vía DemoVideoUrlInput)
 *   3. Fallback: VIDEO_URL hardcoded abajo
 */

const VIDEO_URL = '';
const STORAGE_KEY = 'finlogic_demo_video_url';

function getEmbedUrl(url) {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([\w-]+)/);
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

export default function DemoVideoPlayer({ url: urlProp, title = 'Demo FinLogic · Claude Impact Lab 2026' }) {
  const [playing, setPlaying] = useState(false);
  const [storedUrl, setStoredUrl] = useState('');
  useEffect(() => {
    try { setStoredUrl(localStorage.getItem(STORAGE_KEY) || ''); } catch {}
  }, []);
  const url = urlProp || storedUrl || VIDEO_URL;
  const embedUrl = getEmbedUrl(url);
  const isMp4 = url && /\.mp4(\?|$)/i.test(url);

  // Sin URL → placeholder con guion
  if (!url) {
    return (
      <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-gradient-to-br from-mint-700 via-mint-600 to-mint-500 shadow-soft-lg border border-mint-200">
        <div aria-hidden className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.3) 0%, transparent 50%)'
        }} />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-8 py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-mint-50 text-[11px] font-mono-editorial uppercase tracking-widest mb-6">
            <Film className="w-3.5 h-3.5" />
            Pendiente de grabación
          </div>
          <h3 className="font-display tracking-tight font-bold text-3xl sm:text-4xl leading-tight max-w-2xl">
            Video demo 3 min<br />
            <span className="text-mint-200">listo para Bendi.</span>
          </h3>
          <p className="mt-4 text-sm text-mint-50/80 max-w-md">
            Guion canónico, shot list, prompts y especificaciones técnicas listos abajo. Cuando grabes, pega la URL en{' '}
            <code className="font-mono-editorial text-[11px] px-1.5 py-0.5 bg-white/10 rounded">components/demo/DemoVideoPlayer</code>.
          </p>
        </div>
      </div>
    );
  }

  // URL pegada → renderiza embed
  return (
    <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-foreground shadow-soft-lg border border-border">
      {!playing ? (
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 group flex items-center justify-center"
          aria-label={`Reproducir ${title}`}
        >
          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-mint-700/80 via-mint-600/70 to-foreground/90" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-soft-lg group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-mint-700 fill-mint-700 ml-1" />
            </div>
            <p className="text-white font-display font-bold text-lg">{title}</p>
            <p className="text-mint-100 text-xs font-mono-editorial">Pulsa para reproducir · 3 min</p>
          </div>
        </button>
      ) : isMp4 ? (
        <video src={url} controls autoPlay className="w-full h-full object-contain bg-black" />
      ) : embedUrl ? (
        <iframe
          src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white">
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 underline">
            Abrir video <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}