import React from 'react';
import { Mic, Square, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Controles de voz para Lya — barra inferior con micrófono + toggle TTS.
 * Diseñada para ser táctil (≥48px), accesible y zero-friction.
 */
export default function LyaVoiceControls({
  sttSupported,
  ttsSupported,
  listening,
  speaking,
  autoSpeak,
  onToggleAutoSpeak,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  interim,
  voiceName,
  disabled,
}) {
  if (!sttSupported && !ttsSupported) return null;

  return (
    <div className="space-y-2">
      {(listening || interim) && (
        <div className="flex items-start gap-2 px-4 py-2.5 bg-mint-50 border border-mint-200 rounded-2xl text-sm text-mint-700 italic">
          <span className="w-1.5 h-1.5 rounded-full bg-mint-500 animate-pulse-soft mt-2 flex-shrink-0" />
          <span className="min-h-[1.25rem]">
            {interim || 'Escuchando…'}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {sttSupported && (
          <button
            type="button"
            onClick={listening ? onStopListening : onStartListening}
            disabled={disabled}
            aria-pressed={listening}
            aria-label={listening ? 'Detener grabación' : 'Hablar a Lya'}
            className={cn(
              'inline-flex items-center gap-2 h-12 px-4 rounded-full font-semibold text-sm border-2 transition-all',
              listening
                ? 'bg-destructive text-destructive-foreground border-destructive shadow-lg animate-pulse-soft'
                : 'bg-card text-foreground border-mint-200 hover:bg-mint-50 hover:border-mint-300 shadow-soft',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {listening ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                Detener
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-mint-600" />
                Hablar
              </>
            )}
          </button>
        )}

        {ttsSupported && (
          <button
            type="button"
            onClick={speaking ? onStopSpeaking : onToggleAutoSpeak}
            aria-pressed={autoSpeak}
            aria-label={
              speaking
                ? 'Silenciar a Lya'
                : autoSpeak
                  ? 'Desactivar respuesta hablada'
                  : 'Activar respuesta hablada'
            }
            className={cn(
              'inline-flex items-center gap-2 h-12 px-4 rounded-full font-medium text-sm border transition-all',
              speaking
                ? 'bg-mint-100 text-mint-700 border-mint-300'
                : autoSpeak
                  ? 'bg-mint-50 text-mint-700 border-mint-200 hover:bg-mint-100'
                  : 'bg-card text-muted-foreground border-border hover:bg-secondary'
            )}
          >
            {speaking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Lya hablando…
              </>
            ) : autoSpeak ? (
              <>
                <Volume2 className="w-4 h-4" />
                Voz: ON
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                Voz: OFF
              </>
            )}
          </button>
        )}

        {voiceName && autoSpeak && !speaking && (
          <span className="text-[10px] text-muted-foreground hidden sm:inline">
            {voiceName.length > 30 ? voiceName.slice(0, 30) + '…' : voiceName}
          </span>
        )}
      </div>
    </div>
  );
}