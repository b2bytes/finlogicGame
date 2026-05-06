// Genera la Ficha Cívica Bendi como PDF con diseño editorial FinLogic.
// Stack: jsPDF (built-in helvetica + times). Solo ASCII-safe — los glifos
// como • ° — ✓ ✗ se sustituyen por equivalentes que helvetica renderiza
// limpiamente, evitando el "Ø=Üe" típico de fuentes sin soporte Unicode.
import { jsPDF } from 'jspdf';

// ─── Tokens de diseño FinLogic (deck v11) ─────────────────────────────
const COLORS = {
  mintDark: [14, 122, 71],
  mintMid:  [45, 155, 100],
  mintSoft: [220, 240, 230],
  ink:      [20, 30, 22],
  inkSoft:  [70, 80, 72],
  muted:    [120, 120, 115],
  border:   [225, 220, 210],
  cream:    [248, 244, 235],
  white:    [255, 255, 255],
  amber:    [180, 100, 30],
  amberSoft:[255, 240, 220],
};

const PAGE_W = 210;
const PAGE_H = 297;
const M = 20;
const CONTENT_W = PAGE_W - M * 2;

// ─── Sanitización: quita glifos que helvetica no renderiza bien ───────
function clean(text) {
  if (!text) return '';
  return String(text)
    .replace(/[•·]/g, '-')
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
    .replace(/✓/g, '')
    .replace(/✗/g, 'X')
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/°/g, 'o')   // "Art. 5°" -> "Art. 5o"
    .replace(/[═━─]/g, '');
}

// ─── Helpers ──────────────────────────────────────────────────────────
function fill(doc, rgb)  { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }
function ink(doc, rgb)   { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }
function stroke(doc, rgb){ doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }

function eyebrow(doc, text, x, y, color = COLORS.mintDark) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  ink(doc, color);
  doc.text(clean(text).toUpperCase(), x, y, { charSpace: 0.7 });
}

function pageHeader(doc, pageNum, total) {
  // Banda superior delgada
  fill(doc, COLORS.mintDark);
  doc.rect(0, 0, PAGE_W, 1.5, 'F');

  // Texto header
  ink(doc, COLORS.muted);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('FINLOGIC  /  FICHA CIVICA  /  BENDI 2026', M, 9, { charSpace: 0.5 });
  doc.setFont('helvetica', 'normal');
  doc.text(`${String(pageNum).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, PAGE_W - M, 9, { align: 'right' });

  stroke(doc, COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(M, 13, PAGE_W - M, 13);
}

function pageFooter(doc) {
  stroke(doc, COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(M, PAGE_H - 14, PAGE_W - M, PAGE_H - 14);

  ink(doc, COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('finlogic.one  /  Claude Impact Lab Chile  /  6-7 mayo 2026', M, PAGE_H - 9);
  doc.setFont('helvetica', 'bold');
  doc.text('FinLogic Solutions', PAGE_W - M, PAGE_H - 9, { align: 'right' });
}

// ─── Portada ──────────────────────────────────────────────────────────
function renderCover(doc) {
  // Fondo crema
  fill(doc, COLORS.cream);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // Banda mint top
  fill(doc, COLORS.mintDark);
  doc.rect(0, 0, PAGE_W, 7, 'F');

  // Mark + wordmark (top-left)
  fill(doc, COLORS.mintDark);
  doc.roundedRect(M, 22, 13, 13, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  ink(doc, COLORS.white);
  doc.text('FL', M + 6.5, 30.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  ink(doc, COLORS.ink);
  doc.text('Fin', M + 17, 31.5);
  ink(doc, COLORS.mintDark);
  doc.text('Logic', M + 24.5, 31.5);

  // Pill de fecha (top-right)
  fill(doc, COLORS.white);
  doc.roundedRect(PAGE_W - M - 50, 24, 50, 9, 4.5, 4.5, 'F');
  stroke(doc, COLORS.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(PAGE_W - M - 50, 24, 50, 9, 4.5, 4.5, 'S');
  ink(doc, COLORS.muted);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  const today = new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: '2-digit' });
  doc.text(`v1.0  /  ${today.toUpperCase()}`, PAGE_W - M - 25, 30, { align: 'center', charSpace: 0.5 });

  // Eyebrow
  eyebrow(doc, '/  PRE-EVALUACION OFICIAL  /  ENTREGABLE 01 DE 03', M, 75);

  // Titular grande (Times = Fraunces fallback)
  doc.setFont('times', 'bold');
  doc.setFontSize(46);
  ink(doc, COLORS.ink);
  doc.text('Justicia', M, 100);
  doc.text('financiera', M, 117);
  ink(doc, COLORS.mintDark);
  doc.setFont('times', 'bolditalic');
  doc.text('en su idioma.', M, 134);

  // Subtítulo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  ink(doc, COLORS.inkSoft);
  const subtitle = clean(
    'Ficha civica oficial FinLogic. 6 campos validados con datos reales del sistema productivo, fuentes regulatorias chilenas (.gob.cl, .cl) y normativa literal del corpus Pinecone con 34 vectores indexados.'
  );
  const subLines = doc.splitTextToSize(subtitle, CONTENT_W - 30);
  doc.text(subLines, M, 152);

  // Linea separadora
  stroke(doc, COLORS.mintDark);
  doc.setLineWidth(0.6);
  doc.line(M, 178, M + 40, 178);

  // Card de meta-info — 3 columnas en grid
  const cardY = 192;
  const cardH = 48;
  fill(doc, COLORS.white);
  doc.roundedRect(M, cardY, CONTENT_W, cardH, 3, 3, 'F');
  stroke(doc, COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, cardY, CONTENT_W, cardH, 3, 3, 'S');

  // Borde mint izquierdo (acento)
  fill(doc, COLORS.mintDark);
  doc.rect(M, cardY, 1.2, cardH, 'F');

  const cards = [
    { label: 'PROYECTO',  value: 'Lya',         sub: 'Asistente IA financiero' },
    { label: 'ORGANISMOS', value: '4 + BCN',    sub: 'CMF · SERNAC · SII · CSIRT' },
    { label: 'CORPUS',    value: '34 leyes',    sub: 'Pinecone · multilingual-e5' },
  ];
  const colW = (CONTENT_W - 6) / 3;
  cards.forEach((c, i) => {
    const x = M + 8 + colW * i;
    eyebrow(doc, c.label, x, cardY + 10);

    ink(doc, COLORS.ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(c.value, x, cardY + 26);

    ink(doc, COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(clean(c.sub), x, cardY + 35);
  });

  // Tabla de contenidos — 6 campos
  const tocY = 254;
  eyebrow(doc, 'INDICE  /  6 CAMPOS', M, tocY);

  const items = [
    '01  Problema regulatorio',
    '02  Segmento ciudadano',
    '03  Canal de adopcion',
    '04  Impacto cuantificado',
    '05  Fuentes regulatorias',
    '06  Normativa base literal',
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  ink(doc, COLORS.inkSoft);
  items.forEach((it, i) => {
    const col = Math.floor(i / 3);
    const row = i % 3;
    const x = M + col * (CONTENT_W / 2);
    const y = tocY + 7 + row * 5.5;
    doc.text(it, x, y);
  });

  // Footer mint
  fill(doc, COLORS.mintDark);
  doc.rect(0, PAGE_H - 14, PAGE_W, 14, 'F');
  ink(doc, COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('finlogic.one', M, PAGE_H - 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Equipo: Gabriel S. · Diego B2BYTES · Paula Garces · Martin Campos', PAGE_W - M, PAGE_H - 5, { align: 'right' });
}

// ─── Página de campo ──────────────────────────────────────────────────
function renderFieldPage(doc, field, pageNum, totalPages) {
  pageHeader(doc, pageNum, totalPages);

  // Numero gigante en watermark suave
  doc.setFont('times', 'bold');
  doc.setFontSize(140);
  ink(doc, COLORS.mintSoft);
  doc.text(field.num, PAGE_W - M, 60, { align: 'right' });

  // Eyebrow
  eyebrow(doc, `CAMPO ${field.num}  /  ${field.eyebrow}`, M, 28);

  // Titulo serif
  doc.setFont('times', 'bold');
  doc.setFontSize(34);
  ink(doc, COLORS.ink);
  doc.text(clean(field.title), M, 50);

  // Underline mint corto
  fill(doc, COLORS.mintDark);
  doc.rect(M, 54, 22, 1.2, 'F');

  // Hint
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  ink(doc, COLORS.muted);
  const hintLines = doc.splitTextToSize(clean(field.hint), CONTENT_W);
  doc.text(hintLines, M, 66);

  let yStart = 66 + hintLines.length * 4 + 4;

  // Pill char counter (si aplica)
  if (field.max) {
    const len = (field.value || '').length;
    const ok = len <= field.max;
    fill(doc, ok ? COLORS.mintSoft : COLORS.amberSoft);
    doc.roundedRect(M, yStart, 56, 8, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    ink(doc, ok ? COLORS.mintDark : COLORS.amber);
    doc.text(`${ok ? 'OK' : '!!'}   ${len} / ${field.max} chars`, M + 4, yStart + 5.5);
    yStart += 13;
  }

  // Card del contenido
  const cardY = yStart;
  const cardPadX = 10;
  const cardPadY = 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  const cleanedValue = clean(field.value);
  const valueLines = doc.splitTextToSize(cleanedValue, CONTENT_W - cardPadX * 2);
  const lineH = 5.2;
  const cardH = valueLines.length * lineH + cardPadY * 2;

  // Sombra
  fill(doc, [240, 235, 225]);
  doc.roundedRect(M + 0.6, cardY + 0.8, CONTENT_W, cardH, 3, 3, 'F');
  // Card
  fill(doc, COLORS.white);
  doc.roundedRect(M, cardY, CONTENT_W, cardH, 3, 3, 'F');
  stroke(doc, COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, cardY, CONTENT_W, cardH, 3, 3, 'S');

  // Borde mint izquierdo
  fill(doc, COLORS.mintDark);
  doc.rect(M, cardY, 1.5, cardH, 'F');

  // Texto del contenido (line-by-line para controlar espaciado)
  ink(doc, COLORS.ink);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  valueLines.forEach((line, i) => {
    doc.text(line, M + cardPadX, cardY + cardPadY + 4 + i * lineH);
  });

  pageFooter(doc);
}

// ─── Página de cierre ─────────────────────────────────────────────────
function renderClosingPage(doc, pageNum, totalPages) {
  pageHeader(doc, pageNum, totalPages);

  eyebrow(doc, '/  CIERRE  /  COMPLIANCE BENDI', M, 28);

  doc.setFont('times', 'bold');
  doc.setFontSize(36);
  ink(doc, COLORS.ink);
  doc.text('Validacion', M, 52);
  doc.setFont('times', 'bolditalic');
  ink(doc, COLORS.mintDark);
  doc.text('oficial.', M + 64, 52);

  fill(doc, COLORS.mintDark);
  doc.rect(M, 56, 22, 1.2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  ink(doc, COLORS.inkSoft);
  doc.text('Cumple los 6 criterios oficiales de pre-evaluacion Bendi.', M, 68);

  // Lista de checks
  const checks = [
    { label: 'Problema en lenguaje ciudadano',  detail: 'Bajo 300 chars, cero jerga tecnica, sin siglas sin explicar.' },
    { label: 'Segmento ciudadano especifico',   detail: '4 arquetipos con edad, region y condicion socioeconomica.' },
    { label: 'Canal de adopcion concreto',      detail: '4 canales nombrados con justificacion por segmento.' },
    { label: 'Impacto cuantificado',            detail: '5 metricas con URL .gob.cl/.cl validables manualmente.' },
    { label: 'Fuentes regulatorias oficiales',  detail: '12 URLs en bcn.cl, cmf.cl, sernac.cl, sii.cl, csirt.gob.cl.' },
    { label: 'Normativa base literal',          detail: '13 leyes y articulos contra Wiki Legal Pinecone.' },
  ];

  let y = 84;
  checks.forEach((c) => {
    // Check circle
    fill(doc, COLORS.mintDark);
    doc.circle(M + 3, y - 1.5, 2.8, 'F');
    ink(doc, COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('OK', M + 3, y - 0.3, { align: 'center' });

    // Texto
    ink(doc, COLORS.ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(clean(c.label), M + 11, y);

    ink(doc, COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(clean(c.detail), M + 11, y + 5);

    y += 16;
  });

  // Quote editorial
  y += 4;
  fill(doc, COLORS.cream);
  doc.roundedRect(M, y, CONTENT_W, 44, 3, 3, 'F');
  fill(doc, COLORS.mintDark);
  doc.rect(M, y, 1.5, 44, 'F');

  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  ink(doc, COLORS.ink);
  const quote = clean('"Cero alucinaciones regulatorias. Cada ley citada existe en el corpus Pinecone, cada plazo esta verificado contra leychile.cl."');
  const qLines = doc.splitTextToSize(quote, CONTENT_W - 18);
  doc.text(qLines, M + 9, y + 13);

  ink(doc, COLORS.mintDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('FINLOGIC  /  COMPROMISO ANTI-ALUCINACION', M + 9, y + 38, { charSpace: 0.6 });

  // Verifica en vivo
  y += 54;
  eyebrow(doc, '/  VERIFICA EN VIVO', M, y);
  y += 6;

  const links = [
    { label: 'Validador agentic auto-ejecutable',     url: 'finlogic.one/Rubrica' },
    { label: 'AgentTrace publico de cada respuesta',  url: 'finlogic.one/Transparencia' },
    { label: 'Demo workflow + script broadcast 4K',   url: 'finlogic.one/Demo' },
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  links.forEach((l, i) => {
    ink(doc, COLORS.inkSoft);
    doc.text(`-  ${clean(l.label)}`, M, y + i * 6);
    ink(doc, COLORS.mintDark);
    doc.setFont('helvetica', 'bold');
    doc.text(l.url, PAGE_W - M, y + i * 6, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  });

  pageFooter(doc);
}

// ─── Export principal ─────────────────────────────────────────────────
export function generateFichaCivicaPDF(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const fields = [
    { num: '01', eyebrow: 'PROBLEMA REGULATORIO', title: 'Problema',  hint: 'Maximo 300 caracteres, sin jerga ni siglas sin explicar.', max: 300, value: data.problema },
    { num: '02', eyebrow: 'SEGMENTO CIUDADANO',    title: 'Segmento',  hint: '4 arquetipos con edad, region y condicion socioeconomica (INE 2024).', value: data.segmento },
    { num: '03', eyebrow: 'CANAL DE ADOPCION',     title: 'Canal',     hint: 'Canales nombrados (no genericos) y por que llegan al segmento.', value: data.canal },
    { num: '04', eyebrow: 'IMPACTO CUANTIFICADO',  title: 'Impacto',   hint: 'Numeros concretos con URL de fuente oficial .gob.cl o .cl.', value: data.impacto },
    { num: '05', eyebrow: 'FUENTES REGULATORIAS',  title: 'Fuentes',   hint: '12 URLs reales del corpus Pinecone FinLogic.', value: data.fuentes },
    { num: '06', eyebrow: 'NORMATIVA BASE',        title: 'Normativa', hint: 'Leyes y articulos citados literal contra la Wiki Legal Bendi.', value: data.normativa },
  ];

  const totalPages = 1 + fields.length + 1;

  renderCover(doc);
  fields.forEach((field, i) => {
    doc.addPage();
    renderFieldPage(doc, field, i + 2, totalPages);
  });
  doc.addPage();
  renderClosingPage(doc, totalPages, totalPages);

  return doc;
}

export function downloadFichaCivicaPDF(data) {
  const doc = generateFichaCivicaPDF(data);
  doc.save('FinLogic-Ficha-Civica-Bendi.pdf');
}