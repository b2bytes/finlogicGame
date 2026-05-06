// generateDocPDF — convierte un documento legal en markdown a un PDF descargable
// listo para firma. Diseño sobrio tipo carta formal: A4, márgenes amplios,
// header con título y destinatario, cuerpo con formato preservado, footer
// con marca FinLogic + Lya y línea de firma.
import jsPDF from 'jspdf';

const PAGE_W = 210; // mm A4
const PAGE_H = 297;
const MARGIN_X = 22;
const MARGIN_TOP = 24;
const MARGIN_BOTTOM = 22;
const LINE_HEIGHT = 5.6;

function stripMd(line) {
  return line
    .replace(/\*\*(.+?)\*\*/g, '$1') // bold inline
    .replace(/\*(.+?)\*/g, '$1') // italic
    .replace(/`(.+?)`/g, '$1') // inline code
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1 ($2)'); // links
}

export function generateDocPDF({ title, content, addressedTo, legalBasis }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFont('helvetica');

  // ─── Header ────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text('FinLogic · Documento generado por Lya (asistente IA legal)', MARGIN_X, 14);
  doc.setDrawColor(220);
  doc.line(MARGIN_X, 17, PAGE_W - MARGIN_X, 17);

  let y = MARGIN_TOP;

  // Fecha
  doc.setFontSize(10);
  doc.setTextColor(80);
  const fecha = new Date().toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  doc.text(`Santiago, ${fecha}`, PAGE_W - MARGIN_X, y, { align: 'right' });
  y += 10;

  // Destinatario
  if (addressedTo) {
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Sr(a).', MARGIN_X, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const addrLines = doc.splitTextToSize(addressedTo, PAGE_W - MARGIN_X * 2);
    addrLines.forEach((l) => { doc.text(l, MARGIN_X, y); y += 5; });
    y += 3;
  }

  // Título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15);
  const titleLines = doc.splitTextToSize(`Asunto: ${title || 'Documento'}`, PAGE_W - MARGIN_X * 2);
  titleLines.forEach((l) => { doc.text(l, MARGIN_X, y); y += 6; });
  y += 4;

  // ─── Cuerpo (markdown ligero) ──────────────────────────────
  doc.setTextColor(25);
  const lines = (content || '').split('\n');
  for (const raw of lines) {
    if (y > PAGE_H - MARGIN_BOTTOM - 30) {
      doc.addPage();
      y = MARGIN_TOP;
    }
    const trimmed = raw.trim();
    if (!trimmed) { y += LINE_HEIGHT * 0.5; continue; }

    // Headings
    if (trimmed.startsWith('### ')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      const t = stripMd(trimmed.replace(/^###\s+/, ''));
      const wrapped = doc.splitTextToSize(t, PAGE_W - MARGIN_X * 2);
      wrapped.forEach((l) => { doc.text(l, MARGIN_X, y); y += LINE_HEIGHT; });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      const t = stripMd(trimmed.replace(/^##\s+/, ''));
      const wrapped = doc.splitTextToSize(t, PAGE_W - MARGIN_X * 2);
      wrapped.forEach((l) => { doc.text(l, MARGIN_X, y); y += LINE_HEIGHT + 0.4; });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      const t = stripMd(trimmed.replace(/^#\s+/, ''));
      const wrapped = doc.splitTextToSize(t, PAGE_W - MARGIN_X * 2);
      wrapped.forEach((l) => { doc.text(l, MARGIN_X, y); y += LINE_HEIGHT + 0.6; });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      continue;
    }

    // Listas
    if (/^[-*]\s+/.test(trimmed)) {
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'normal');
      const t = stripMd(trimmed.replace(/^[-*]\s+/, ''));
      const wrapped = doc.splitTextToSize(t, PAGE_W - MARGIN_X * 2 - 6);
      wrapped.forEach((l, i) => {
        if (i === 0) doc.text('•', MARGIN_X + 1, y);
        doc.text(l, MARGIN_X + 6, y);
        y += LINE_HEIGHT;
      });
      continue;
    }

    // Párrafo normal
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    const t = stripMd(trimmed);
    const wrapped = doc.splitTextToSize(t, PAGE_W - MARGIN_X * 2);
    wrapped.forEach((l) => { doc.text(l, MARGIN_X, y); y += LINE_HEIGHT; });
    y += 1;
  }

  // ─── Línea de firma ────────────────────────────────────────
  if (y > PAGE_H - MARGIN_BOTTOM - 30) {
    doc.addPage();
    y = MARGIN_TOP;
  }
  y += 16;
  doc.setDrawColor(140);
  doc.line(MARGIN_X, y, MARGIN_X + 70, y);
  y += 5;
  doc.setFontSize(9.5);
  doc.setTextColor(70);
  doc.text('Firma del titular', MARGIN_X, y);

  // ─── Footer en cada página ────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(225);
    doc.line(MARGIN_X, PAGE_H - 14, PAGE_W - MARGIN_X, PAGE_H - 14);
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text(
      `Generado por Lya · FinLogic · ${legalBasis || 'Normativa chilena vigente'}`,
      MARGIN_X,
      PAGE_H - 9,
    );
    doc.text(`Página ${i} de ${total}`, PAGE_W - MARGIN_X, PAGE_H - 9, { align: 'right' });
    doc.setFontSize(7.5);
    doc.text(
      'Documento de borrador. Revísalo y completa los campos entre [ ] antes de firmar y presentar.',
      MARGIN_X,
      PAGE_H - 5,
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