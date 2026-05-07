// generateDocPDF — convierte un documento legal en markdown a un PDF descargable
// listo para firma. Estilo editorial FinLogic: banda mint de marca, bloque
// resumen con iconos (destinatario · fundamento · fecha), frase de impacto
// "control preventivo", cuerpo formal y footer con respaldo institucional
// (Anthropic Claude Impact Lab CL 2026) + cita normativa verificada.
import jsPDF from 'jspdf';

const PAGE_W = 210; // mm A4
const PAGE_H = 297;
const MARGIN_X = 22;
const MARGIN_BOTTOM = 26;
const LINE_HEIGHT = 5.6;

// Mint editorial deck v11 (#0E7A47) en RGB
const MINT = [14, 122, 71];
const MINT_SOFT = [232, 244, 238];
const INK = [15, 23, 36];
const MUTED = [110, 118, 128];
const BORDER = [222, 226, 230];

function stripMd(line) {
  return line
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1 ($2)');
}

// ─── Iconos vectoriales minimalistas (mm) ─────────────────────────────
function iconUser(doc, x, y) {
  doc.setDrawColor(...MINT);
  doc.setLineWidth(0.4);
  doc.circle(x + 2.5, y + 1.8, 1.3, 'S');
  doc.line(x + 0.6, y + 5.4, x + 4.4, y + 5.4);
  doc.line(x + 0.6, y + 5.4, x + 1.3, y + 3.8);
  doc.line(x + 4.4, y + 5.4, x + 3.7, y + 3.8);
}
function iconScale(doc, x, y) {
  doc.setDrawColor(...MINT);
  doc.setLineWidth(0.4);
  doc.line(x + 2.5, y + 0.8, x + 2.5, y + 5.6);
  doc.line(x + 0.8, y + 2.2, x + 4.2, y + 2.2);
  doc.line(x + 1.6, y + 5.6, x + 3.4, y + 5.6);
  // platillos
  doc.line(x + 0.8, y + 2.2, x + 0.2, y + 3.6);
  doc.line(x + 0.8, y + 2.2, x + 1.4, y + 3.6);
  doc.line(x + 4.2, y + 2.2, x + 3.6, y + 3.6);
  doc.line(x + 4.2, y + 2.2, x + 4.8, y + 3.6);
}
function iconCalendar(doc, x, y) {
  doc.setDrawColor(...MINT);
  doc.setLineWidth(0.4);
  doc.roundedRect(x + 0.4, y + 1.4, 4.4, 4.2, 0.4, 0.4, 'S');
  doc.line(x + 0.4, y + 2.8, x + 4.8, y + 2.8);
  doc.line(x + 1.6, y + 0.6, x + 1.6, y + 1.8);
  doc.line(x + 3.6, y + 0.6, x + 3.6, y + 1.8);
}
function iconShield(doc, x, y) {
  doc.setDrawColor(...MINT);
  doc.setLineWidth(0.4);
  doc.lines(
    [[2, 0], [0, 3], [-2, 1.6], [-2, -1.6], [0, -3]],
    x + 0.6,
    y + 0.8,
    [1, 1],
    'S',
    true,
  );
  // check interior
  doc.line(x + 1.5, y + 2.6, x + 2.3, y + 3.4);
  doc.line(x + 2.3, y + 3.4, x + 3.6, y + 1.9);
}

// ─── Logo FinLogic compacto (mm) ──────────────────────────────────────
function drawLogo(doc, x, y) {
  doc.setFillColor(...MINT);
  doc.roundedRect(x, y, 7, 7, 1.6, 1.6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('FL', x + 3.5, y + 4.7, { align: 'center' });
}

export function generateDocPDF({ title, content, addressedTo, legalBasis }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFont('helvetica');

  // ─── Banda de marca superior (estilo editorial) ────────────────────
  doc.setFillColor(...MINT);
  doc.rect(0, 0, PAGE_W, 14, 'F');
  drawLogo(doc, MARGIN_X, 3.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('FinLogic', MARGIN_X + 9, 8.6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.text('Tu derecho, en tu idioma', MARGIN_X + 9, 11.6);
  // tagline derecha
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.text('CONTROL PREVENTIVO · NO REACTIVO', PAGE_W - MARGIN_X, 8.6, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Documento generado por Lya · Asistente IA legal', PAGE_W - MARGIN_X, 11.6, { align: 'right' });

  let y = 22;

  // ─── Frase de impacto editorial ────────────────────────────────────
  doc.setTextColor(...MINT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DE LA DUDA A LA ACCIÓN', MARGIN_X, y);
  y += 6;

  // Título grande
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...INK);
  const titleLines = doc.splitTextToSize(title || 'Documento legal', PAGE_W - MARGIN_X * 2);
  titleLines.forEach((l) => { doc.text(l, MARGIN_X, y); y += 7; });
  y += 3;

  // ─── Bloque resumen con iconos (estilo tríptico) ───────────────────
  const summaryY = y;
  const colW = (PAGE_W - MARGIN_X * 2) / 3;
  doc.setFillColor(...MINT_SOFT);
  doc.roundedRect(MARGIN_X, summaryY, PAGE_W - MARGIN_X * 2, 18, 2, 2, 'F');

  const fecha = new Date().toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const summaryItems = [
    { icon: iconUser, label: 'DESTINATARIO', value: addressedTo || 'A quien corresponda' },
    { icon: iconScale, label: 'FUNDAMENTO LEGAL', value: legalBasis || 'Normativa chilena vigente' },
    { icon: iconCalendar, label: 'EMITIDO', value: `Santiago · ${fecha}` },
  ];

  summaryItems.forEach((item, i) => {
    const cx = MARGIN_X + colW * i + 5;
    item.icon(doc, cx, summaryY + 4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...MINT);
    doc.text(item.label, cx + 8, summaryY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.4);
    doc.setTextColor(...INK);
    const wrapped = doc.splitTextToSize(item.value, colW - 14);
    wrapped.slice(0, 2).forEach((l, idx) => {
      doc.text(l, cx + 8, summaryY + 11 + idx * 3.6);
    });
  });
  y = summaryY + 24;

  // Línea de apertura formal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  if (addressedTo) {
    doc.setFont('helvetica', 'bold');
    doc.text('Sr(a).', MARGIN_X, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const addrLines = doc.splitTextToSize(addressedTo, PAGE_W - MARGIN_X * 2);
    addrLines.forEach((l) => { doc.text(l, MARGIN_X, y); y += 5; });
    y += 4;
  }

  // ─── Cuerpo (markdown ligero) ──────────────────────────────────────
  doc.setTextColor(...INK);
  const lines = (content || '').split('\n');
  for (const raw of lines) {
    if (y > PAGE_H - MARGIN_BOTTOM - 30) {
      doc.addPage();
      y = 22;
    }
    const trimmed = raw.trim();
    if (!trimmed) { y += LINE_HEIGHT * 0.5; continue; }

    if (trimmed.startsWith('### ')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...MINT);
      const t = stripMd(trimmed.replace(/^###\s+/, ''));
      const wrapped = doc.splitTextToSize(t, PAGE_W - MARGIN_X * 2);
      wrapped.forEach((l) => { doc.text(l, MARGIN_X, y); y += LINE_HEIGHT; });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...MINT);
      const t = stripMd(trimmed.replace(/^##\s+/, ''));
      const wrapped = doc.splitTextToSize(t, PAGE_W - MARGIN_X * 2);
      wrapped.forEach((l) => { doc.text(l, MARGIN_X, y); y += LINE_HEIGHT + 0.4; });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...INK);
      const t = stripMd(trimmed.replace(/^#\s+/, ''));
      const wrapped = doc.splitTextToSize(t, PAGE_W - MARGIN_X * 2);
      wrapped.forEach((l) => { doc.text(l, MARGIN_X, y); y += LINE_HEIGHT + 0.6; });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'normal');
      const t = stripMd(trimmed.replace(/^[-*]\s+/, ''));
      const wrapped = doc.splitTextToSize(t, PAGE_W - MARGIN_X * 2 - 6);
      wrapped.forEach((l, i) => {
        if (i === 0) {
          doc.setTextColor(...MINT);
          doc.text('•', MARGIN_X + 1, y);
          doc.setTextColor(...INK);
        }
        doc.text(l, MARGIN_X + 6, y);
        y += LINE_HEIGHT;
      });
      continue;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    const t = stripMd(trimmed);
    const wrapped = doc.splitTextToSize(t, PAGE_W - MARGIN_X * 2);
    wrapped.forEach((l) => { doc.text(l, MARGIN_X, y); y += LINE_HEIGHT; });
    y += 1;
  }

  // ─── Línea de firma ───────────────────────────────────────────────
  if (y > PAGE_H - MARGIN_BOTTOM - 36) {
    doc.addPage();
    y = 30;
  }
  y += 16;
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_X, y, MARGIN_X + 70, y);
  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Firma del titular', MARGIN_X, y);

  // ─── Footer institucional en cada página ─────────────────────────
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);

    // Banda inferior con respaldo institucional
    const footerY = PAGE_H - 20;
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_X, footerY, PAGE_W - MARGIN_X, footerY);

    // Bloque trust: shield + texto institucional
    iconShield(doc, MARGIN_X, footerY + 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.setTextColor(...MINT);
    doc.text('RESPALDO INSTITUCIONAL', MARGIN_X + 7, footerY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...INK);
    doc.text(
      'Anthropic Claude Impact Lab CL 2026 · RAG verificado sobre normativa chilena vigente',
      MARGIN_X + 7,
      footerY + 7.6,
    );
    doc.setFontSize(6.8);
    doc.setTextColor(...MUTED);
    doc.text(
      legalBasis ? `Fundamento citado: ${legalBasis}` : 'Normativa: leychile.cl · cmf.cl · sernac.cl',
      MARGIN_X + 7,
      footerY + 10.6,
    );

    // Paginación derecha
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.setTextColor(...INK);
    doc.text(`Página ${i} de ${total}`, PAGE_W - MARGIN_X, footerY + 4.5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...MUTED);
    doc.text('finlogic.one', PAGE_W - MARGIN_X, footerY + 7.6, { align: 'right' });
    doc.text('Lya · Asistente IA', PAGE_W - MARGIN_X, footerY + 10.6, { align: 'right' });

    // Aviso legal de borrador
    doc.setFontSize(6.6);
    doc.setTextColor(...MUTED);
    doc.text(
      'Borrador. Revisa y completa los campos entre [ ] antes de firmar y presentar. La cita normativa proviene del corpus oficial de FinLogic.',
      PAGE_W / 2,
      PAGE_H - 5,
      { align: 'center' },
    );
  }

  const slug = (title || 'documento')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
  doc.save(`finlogic-${slug}.pdf`);
}