import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Edit3, Save, ShieldCheck, AlertCircle, FileText, Sparkles, Eye } from 'lucide-react';

/**
 * DocumentEditor — editor del documento que Lya rellenó.
 * Toggle entre vista markdown editable (textarea) y preview formal.
 * Detecta placeholders [como_este] y los resalta para que el usuario complete.
 */
export default function DocumentEditor({
  draft,
  onContentChange,
  onMarkSection,
}) {
  const [editMode, setEditMode] = useState(false);
  const [localContent, setLocalContent] = useState(draft?.content || '');

  useEffect(() => {
    setLocalContent(draft?.content || '');
  }, [draft?.content]);

  // Detecta placeholders [xxx_xxx] que el usuario debe completar
  const placeholders = (localContent.match(/\[[a-zA-Z_ÁÉÍÓÚÑáéíóúñ\s]+\]/g) || []);
  const hasPlaceholders = placeholders.length > 0;

  const handleSaveEdit = () => {
    onContentChange(localContent);
    setEditMode(false);
  };

  // Resalta placeholders en el preview
  const highlightedContent = localContent.replace(
    /\[([a-zA-Z_ÁÉÍÓÚÑáéíóúñ\s]+)\]/g,
    '<mark class="bg-amber-100 text-amber-900 px-1 rounded font-semibold not-italic">[$1]</mark>'
  );

  if (!draft) return null;

  return (
    <div className="bg-card rounded-3xl border border-border shadow-soft overflow-hidden">
      {/* Header del documento */}
      <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-mint-50/50 to-transparent flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-mint-700" />
            <span className="text-[10px] font-mono-editorial uppercase tracking-wider text-mint-700">
              Documento generado por Lya
            </span>
          </div>
          <h3 className="font-display text-lg font-bold text-foreground tracking-tight truncate">
            {draft.title}
          </h3>
          {draft.addressedTo && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Destinatario: <span className="font-semibold text-foreground">{draft.addressedTo}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {typeof draft.verifierScore === 'number' && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
              draft.verifierScore >= 80 ? 'bg-mint-100 text-mint-700' :
              draft.verifierScore >= 60 ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              <ShieldCheck className="w-2.5 h-2.5" />
              Verificador {draft.verifierScore}/100
            </span>
          )}
          <button
            onClick={() => setEditMode(!editMode)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-foreground/5 hover:bg-foreground/10 text-xs font-semibold text-foreground transition-colors"
          >
            {editMode ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            {editMode ? 'Vista previa' : 'Editar'}
          </button>
        </div>
      </div>

      {/* Banner placeholders */}
      {hasPlaceholders && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-900">
              Faltan {placeholders.length} datos por completar
            </p>
            <p className="text-[11px] text-amber-800/80 leading-snug mt-0.5">
              Revisa los campos marcados en amarillo: {placeholders.slice(0, 3).join(', ')}
              {placeholders.length > 3 ? `… (+${placeholders.length - 3})` : ''}
            </p>
          </div>
        </motion.div>
      )}

      {/* Cuerpo */}
      <div className="p-5 sm:p-7 max-h-[60vh] overflow-y-auto">
        {editMode ? (
          <div className="space-y-3">
            <textarea
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              rows={20}
              className="w-full p-4 rounded-xl border-2 border-mint-200 focus:border-mint-400 outline-none text-sm font-mono leading-relaxed resize-none bg-mint-50/30"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setLocalContent(draft.content);
                  setEditMode(false);
                }}
                className="h-9 px-4 rounded-full text-sm text-muted-foreground hover:text-foreground"
              >
                Descartar
              </button>
              <button
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-mint-600 hover:bg-mint-700 text-white text-sm font-bold shadow-soft"
              >
                <Save className="w-3.5 h-3.5" />
                Guardar cambios
              </button>
            </div>
          </div>
        ) : (
          <div
            className="prose prose-sm max-w-none prose-headings:font-display prose-headings:tracking-tight prose-p:text-foreground/85 prose-strong:text-foreground prose-a:text-mint-700"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(highlightedContent) }}
          />
        )}
      </div>

      {/* Leyes citadas */}
      {draft.lawsCited && draft.lawsCited.length > 0 && (
        <div className="px-5 py-3 border-t border-border bg-mint-50/30">
          <p className="text-[10px] font-mono-editorial uppercase tracking-wider text-mint-700 mb-1.5">
            Leyes citadas · verificadas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {draft.lawsCited.map((law, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-full bg-mint-100 text-mint-800 border border-mint-200 font-mono-editorial"
              >
                {law}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Markdown → HTML simple sin react-markdown porque necesitamos inyectar <mark>
function markdownToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gim, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
}