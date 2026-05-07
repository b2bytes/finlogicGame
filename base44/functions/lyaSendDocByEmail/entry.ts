// lyaSendDocByEmail — envía un documento (carta, cotización, correo formal,
// reclamo) al email del destinatario o al propio usuario.
// Usa la integración Core.SendEmail con formato HTML brandeado FinLogic.
//
// Body: { to: string (email), subject?: string, title: string, content: string (markdown),
//         addressedTo?: string, legalBasis?: string, documentType?: string }
//
// El backend NO firma el PDF — el frontend ya genera el PDF para descarga.
// Este endpoint envía una versión HTML brandeada del documento al correo.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Conversión markdown → HTML simple (encabezados, listas, énfasis).
function mdToHtml(md) {
  if (!md) return '';
  let html = String(md);
  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 style="color:#0E7A47;font-size:15px;margin:18px 0 8px;font-family:Helvetica,Arial,sans-serif;">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="color:#0E7A47;font-size:17px;margin:22px 0 10px;font-family:Helvetica,Arial,sans-serif;">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="color:#0F1724;font-size:20px;margin:24px 0 12px;font-family:Helvetica,Arial,sans-serif;">$1</h1>');
  // Bold + italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Listas
  html = html.replace(/^[-*] (.+)$/gm, '<li style="margin:4px 0;">$1</li>');
  html = html.replace(/(<li[\s\S]*?<\/li>\s*)+/g, (m) =>
    `<ul style="padding-left:22px;margin:10px 0;color:#0F1724;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;">${m}</ul>`);
  // Párrafos (líneas con texto que no sean bloques)
  html = html
    .split(/\n\n+/)
    .map((block) => {
      const t = block.trim();
      if (!t) return '';
      if (t.startsWith('<h') || t.startsWith('<ul') || t.startsWith('<li')) return t;
      return `<p style="color:#0F1724;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;margin:10px 0;">${t.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');
  return html;
}

function buildBrandedHtml({ title, content, addressedTo, legalBasis }) {
  const fecha = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
  const bodyHtml = mdToHtml(content);
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"/><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f6f3ec;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f3ec;padding:30px 0;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="640" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 18px rgba(15,23,36,0.08);">
        <!-- Banda mint -->
        <tr><td style="background:#0E7A47;padding:18px 28px;color:#ffffff;">
          <table width="100%"><tr>
            <td style="vertical-align:middle;">
              <span style="display:inline-block;width:30px;height:30px;background:#ffffff;border-radius:8px;text-align:center;line-height:30px;color:#0E7A47;font-weight:700;font-size:13px;margin-right:10px;vertical-align:middle;">FL</span>
              <span style="font-size:18px;font-weight:700;letter-spacing:-0.01em;vertical-align:middle;">FinLogic</span>
              <span style="font-size:12px;opacity:0.85;margin-left:8px;vertical-align:middle;">· Tu derecho, en tu idioma</span>
            </td>
            <td align="right" style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.9;">Documento generado por Lya</td>
          </tr></table>
        </td></tr>
        <!-- Cabecera -->
        <tr><td style="padding:30px 36px 8px;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#0E7A47;font-weight:700;">DE LA DUDA A LA ACCIÓN</p>
          <h1 style="margin:0 0 18px;font-size:24px;line-height:1.2;color:#0F1724;font-weight:800;letter-spacing:-0.02em;">${title}</h1>
          <table cellpadding="0" cellspacing="0" width="100%" style="background:#e8f4ee;border-radius:10px;padding:14px 18px;">
            <tr>
              <td style="font-size:11px;color:#0E7A47;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Destinatario</td>
              <td style="font-size:11px;color:#0E7A47;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Fundamento</td>
              <td style="font-size:11px;color:#0E7A47;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Emitido</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#0F1724;padding-top:4px;">${addressedTo || 'A quien corresponda'}</td>
              <td style="font-size:13px;color:#0F1724;padding-top:4px;">${legalBasis || 'Normativa vigente'}</td>
              <td style="font-size:13px;color:#0F1724;padding-top:4px;">${fecha}</td>
            </tr>
          </table>
        </td></tr>
        <!-- Cuerpo -->
        <tr><td style="padding:18px 36px 8px;">
          ${bodyHtml}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:18px 36px 28px;border-top:1px solid #dee2e6;">
          <p style="margin:0 0 4px;font-size:11px;color:#0E7A47;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Respaldo institucional</p>
          <p style="margin:0;font-size:12px;color:#0F1724;line-height:1.5;">Anthropic Claude Impact Lab CL 2026 · RAG verificado sobre normativa chilena vigente</p>
          <p style="margin:6px 0 0;font-size:11px;color:#6e7680;">finlogic.one · Lya, asistente IA legal</p>
        </td></tr>
      </table>
      <p style="font-size:11px;color:#6e7680;margin:14px 0 0;font-family:Helvetica,Arial,sans-serif;">Este es un borrador generado por IA. Revisa los campos entre [ ] antes de firmar o presentar.</p>
    </td></tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { to, subject, title, content, addressedTo, legalBasis, documentType } = body;

    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return Response.json({ error: 'Email destino inválido' }, { status: 400 });
    }
    if (!title || !content) {
      return Response.json({ error: 'title y content son requeridos' }, { status: 400 });
    }

    // Si está logueado, registramos quién envió (auditoría)
    let senderEmail = 'anonimo';
    try {
      const me = await base44.auth.me();
      if (me?.email) senderEmail = me.email;
    } catch (_) {}

    const html = buildBrandedHtml({ title, content, addressedTo, legalBasis });
    const finalSubject = subject || `${title} · vía FinLogic`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'Lya · FinLogic',
      to,
      subject: finalSubject,
      body: html,
    });

    console.log(`[lyaSendDocByEmail] type=${documentType || 'n/a'} to=${to} from_user=${senderEmail}`);

    return Response.json({
      success: true,
      to,
      subject: finalSubject,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('lyaSendDocByEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});