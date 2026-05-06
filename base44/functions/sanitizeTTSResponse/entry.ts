// sanitizeTTSResponse
// Limpia respuestas para Text-to-Speech: strip markdown, truncar 900 chars,
// dividir en chunks por puntuación. Mandato ValidatorAgent §5.10 — gap crítico.

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const { text, maxChars = 900, chunkSize = 250 } = await req.json();
    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'text requerido' }, { status: 400 });
    }

    // 1. Strip markdown
    let clean = text
      .replace(/```[\s\S]*?```/g, '') // code blocks
      .replace(/`([^`]+)`/g, '$1') // inline code
      .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
      .replace(/\*([^*]+)\*/g, '$1') // italic
      .replace(/__([^_]+)__/g, '$1') // bold alt
      .replace(/_([^_]+)_/g, '$1') // italic alt
      .replace(/^#{1,6}\s+/gm, '') // headings
      .replace(/^\s*[-*+]\s+/gm, '') // bullets
      .replace(/^\s*\d+\.\s+/gm, '') // numbered lists
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
      .replace(/[⚖️📋⏰💚✅❌🔒📌🎯👤👴🏼👩🏽‍🎓👩🏽‍💼👨🏽‍🔧]/g, '') // emoji
      .replace(/\n{2,}/g, '. ') // párrafos → punto
      .replace(/\n/g, ' ')
      .replace(/\.{2,}/g, '.') // puntos múltiples
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+([.,;:!?])/g, '$1') // espacios antes de puntuación
      .trim();

    // 2. Truncar al límite
    if (clean.length > maxChars) {
      const truncated = clean.slice(0, maxChars);
      const lastPunct = Math.max(
        truncated.lastIndexOf('.'),
        truncated.lastIndexOf('!'),
        truncated.lastIndexOf('?'),
      );
      clean = lastPunct > maxChars * 0.7 ? truncated.slice(0, lastPunct + 1) : truncated + '...';
    }

    // 3. Dividir en chunks por puntuación (excluyendo punto entre dígitos: "21.521")
    const protectedText = clean.replace(/(\d)\.(\d)/g, '$1__DOT__$2');
    const sentences = (protectedText.match(/[^.!?]+[.!?]+/g) || [protectedText]).map((s) =>
      s.replace(/__DOT__/g, '.'),
    );
    const chunks = [];
    let current = '';

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if ((current + ' ' + trimmed).length > chunkSize && current) {
        chunks.push(current.trim());
        current = trimmed;
      } else {
        current = current ? `${current} ${trimmed}` : trimmed;
      }
    }
    if (current.trim()) chunks.push(current.trim());

    return Response.json({
      sanitized: clean,
      chunks,
      originalLength: text.length,
      sanitizedLength: clean.length,
      chunksCount: chunks.length,
      truncated: text.length > maxChars,
    });
  } catch (error) {
    console.error('sanitizeTTSResponse error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});