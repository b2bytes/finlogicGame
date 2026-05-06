// Genera el PitchDeck FinLogic completo como PDF landscape A4.
// 12 slides. Stack: jsPDF (helvetica + times). Sanitización ASCII-safe.
// Diseño: editorial deck v11, tipografía serif para titulares, mint corporativo.
import { jsPDF } from 'jspdf';

// ─── Tokens FinLogic ──────────────────────────────────────────────────
const C = {
  mintDark:  [14, 122, 71],
  mintMid:   [45, 155, 100],
  mint400:   [80, 180, 130],
  mintSoft:  [220, 240, 230],
  mint50:    [240, 250, 244],
  ink:       [20, 30, 22],
  inkSoft:   [70, 80, 72],
  muted:     [120, 120, 115],
  border:    [225, 220, 210],
  cream:     [248, 244, 235],
  white:     [255, 255, 255],
  amber:     [180, 100, 30],
  peach:     [255, 232, 215],
  lilac:     [235, 220, 245],
  destructive: [226, 90, 59],
  // Slide oscuro (SFA)
  darkBg:    [14, 18, 23],
  darkInk:   [245, 245, 240],
  darkMuted: [165, 165, 160],
};

// Landscape A4: 297 x 210 mm
const W = 297;
const H = 210;
const M = 18;

// ─── Sanitización ─────────────────────────────────────────────────────
function clean(text) {
  if (!text) return '';
  return String(text)
    .replace(/[•·]/g, '-')
    .replace(/[—–]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
    .replace(/✓/g, '')
    .replace(/✗/g, 'X')
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/°/g, 'o')
    .replace(/[═━─]/g, '')
    // Quita emojis (jsPDF no los renderiza)
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '');
}

// ─── Helpers ──────────────────────────────────────────────────────────
const fill = (doc, c) => doc.setFillColor(c[0], c[1], c[2]);
const ink = (doc, c) => doc.setTextColor(c[0], c[1], c[2]);
const stroke = (doc, c) => doc.setDrawColor(c[0], c[1], c[2]);

function eyebrow(doc, text, x, y, color = C.mintDark) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  ink(doc, color);
  doc.text('/  ' + clean(text).toUpperCase(), x, y, { charSpace: 0.7 });
}

function slideFooter(doc, slideNum, total, dark = false) {
  const colMuted = dark ? C.darkMuted : C.muted;
  const colBorder = dark ? [40, 50, 55] : C.border;

  stroke(doc, colBorder);
  doc.setLineWidth(0.2);
  doc.line(M, H - 12, W - M, H - 12);

  ink(doc, colMuted);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('FINLOGIC  /  PITCH DECK  /  V1.0', M, H - 7, { charSpace: 0.5 });

  doc.setFont('helvetica', 'normal');
  doc.text('finlogic.one', W / 2, H - 7, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text(`SLIDE  ${String(slideNum).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, W - M, H - 7, { align: 'right', charSpace: 0.5 });
}

function bgCream(doc) {
  fill(doc, C.cream);
  doc.rect(0, 0, W, H, 'F');
}
function bgWhite(doc) {
  fill(doc, C.white);
  doc.rect(0, 0, W, H, 'F');
}
function bgDark(doc) {
  fill(doc, C.darkBg);
  doc.rect(0, 0, W, H, 'F');
}

// Banda mint superior delgada
function topBand(doc) {
  fill(doc, C.mintDark);
  doc.rect(0, 0, W, 1.5, 'F');
}

// Logo mark (top-left)
function logoMark(doc, dark = false) {
  fill(doc, C.mintDark);
  doc.roundedRect(M, 12, 9, 9, 1.8, 1.8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  ink(doc, C.white);
  doc.text('FL', M + 4.5, 18, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  ink(doc, dark ? C.darkInk : C.ink);
  doc.text('Fin', M + 12, 18.5);
  ink(doc, dark ? C.mint400 : C.mintDark);
  doc.text('Logic', M + 17.5, 18.5);
}

// Pill simple
function pill(doc, text, x, y, opts = {}) {
  const { bg = C.mintSoft, fg = C.mintDark, padX = 5, padY = 3, fontSize = 7.5, bold = true } = opts;
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setFontSize(fontSize);
  const txt = clean(text);
  const w = doc.getTextWidth(txt) + padX * 2;
  const h = padY * 2 + fontSize * 0.35;
  fill(doc, bg);
  doc.roundedRect(x, y - h + padY + 1, w, h, h / 2, h / 2, 'F');
  ink(doc, fg);
  doc.text(txt, x + padX, y, { charSpace: 0.4 });
  return w; // ancho consumido
}

// ─── SLIDE 1 — HERO ───────────────────────────────────────────────────
function slide1Hero(doc, slideNum, total) {
  bgCream(doc);
  topBand(doc);

  // Decorativos: blobs mint translúcidos (simulados con círculos de baja saturación)
  fill(doc, C.mint50);
  doc.circle(W - 30, 30, 60, 'F');
  fill(doc, C.peach);
  doc.circle(20, H - 30, 50, 'F');

  logoMark(doc);

  // Eyebrow
  eyebrow(doc, 'CLAUDE IMPACT LAB CHILE 2026  /  6 MAYO  /  V1.0', M, 32);

  // Titular gigante
  doc.setFont('times', 'bold');
  doc.setFontSize(54);
  ink(doc, C.ink);
  doc.text('Tu derecho', M, 70);
  doc.text('financiero,', M, 92);
  ink(doc, C.mintDark);
  doc.setFont('times', 'bolditalic');
  doc.text('en tu idioma.', M, 114);
  ink(doc, C.ink);
  doc.setFont('times', 'bold');
  doc.text('Ahora.', M, 136);

  // Subtítulo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  ink(doc, C.inkSoft);
  doc.text('Sistema operativo financiero con IA para Chile.', M, 150);

  // Pills de leyes
  let px = M;
  ['Ley 21.521', 'Ley 19.496', 'Ley 21.713', 'Ley 21.719'].forEach((law) => {
    px += pill(doc, law, px, 168) + 3;
  });

  // Side panel — QR card simulada (caja blanca)
  const cardX = W - M - 80;
  const cardY = 38;
  const cardW = 80;
  const cardH = 130;

  fill(doc, C.white);
  doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, 'F');
  stroke(doc, C.mint400);
  doc.setLineWidth(0.5);
  doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, 'S');

  eyebrow(doc, 'ESCANEAME  /  PRUEBALO AHORA', cardX + 8, cardY + 12);

  // Caja interior crema con mensaje (placeholder de QR — el QR real está en finlogic.one)
  fill(doc, C.cream);
  doc.roundedRect(cardX + 8, cardY + 18, cardW - 16, 70, 3, 3, 'F');

  doc.setFont('times', 'bolditalic');
  doc.setFontSize(28);
  ink(doc, C.mintDark);
  doc.text('L', cardX + cardW / 2, cardY + 60, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  ink(doc, C.ink);
  doc.text('finlogic.one', cardX + cardW / 2, cardY + 100, { align: 'center', charSpace: 0.5 });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  ink(doc, C.muted);
  doc.text('Sistema operativo financiero', cardX + cardW / 2, cardY + 107, { align: 'center' });
  doc.text('Chile  /  Live demo', cardX + cardW / 2, cardY + 113, { align: 'center' });

  // Equipo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  ink(doc, C.muted);
  doc.text('FinLogic Solutions', M, 188);
  doc.text('Gabriel S.  -  Diego B2BYTES  -  Paula Garces  -  Martin Campos', M, 193);

  slideFooter(doc, slideNum, total);
}

// ─── Helper genérico de slide con eyebrow + título serif ──────────────
function slideHeader(doc, eyebrowText, dark = false) {
  if (dark) bgDark(doc);
  else bgCream(doc);
  topBand(doc);
  logoMark(doc, dark);
  eyebrow(doc, eyebrowText, M, 32, dark ? C.mint400 : C.mintDark);
}

function bigTitle(doc, lines, y, dark = false) {
  doc.setFont('times', 'bold');
  doc.setFontSize(36);
  ink(doc, dark ? C.darkInk : C.ink);
  lines.forEach((line, i) => {
    if (line.italic) doc.setFont('times', 'bolditalic');
    else doc.setFont('times', 'bold');
    if (line.color) ink(doc, line.color);
    else ink(doc, dark ? C.darkInk : C.ink);
    doc.text(clean(line.text), M, y + i * 14);
  });
  // Underline mint
  fill(doc, dark ? C.mint400 : C.mintDark);
  doc.rect(M, y + lines.length * 14 + 3, 22, 1.2, 'F');
}

// ─── SLIDE 2 — PROBLEMA ───────────────────────────────────────────────
function slide2Problema(doc, slideNum, total) {
  slideHeader(doc, 'EL PROBLEMA  /  CHILE 2026');

  bigTitle(doc, [
    { text: 'Hoy en Chile hay ', },
    { text: '500.000 personas que', color: C.destructive },
    { text: 'reclamaron sin saber', },
    { text: 'que decia la ley.', color: C.mintDark, italic: true },
  ], 56);

  // 3 cards horizontales abajo
  const cardW = (W - M * 2 - 12) / 3;
  const cardY = 138;
  const cardH = 50;

  const cards = [
    { num: '$200K+', label: 'cuesta un abogado en banca' },
    { num: '~28 dias', label: 'demora promedio un reclamo' },
    { num: '4 organismos', label: 'sin lenguaje comun: CMF, SERNAC, SII, CSIRT' },
  ];

  cards.forEach((c, i) => {
    const x = M + i * (cardW + 6);
    fill(doc, C.white);
    doc.roundedRect(x, cardY, cardW, cardH, 3, 3, 'F');
    stroke(doc, C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cardY, cardW, cardH, 3, 3, 'S');
    fill(doc, C.mintDark);
    doc.rect(x, cardY, 1.2, cardH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    ink(doc, C.ink);
    doc.text(c.num, x + 8, cardY + 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    ink(doc, C.muted);
    const lines = doc.splitTextToSize(c.label, cardW - 16);
    doc.text(lines, x + 8, cardY + 32);
  });

  slideFooter(doc, slideNum, total);
}

// ─── SLIDE 3 — A QUIEN RESOLVEMOS ─────────────────────────────────────
const PERFILES = [
  { name: 'DON LUIS', age: '68a', region: 'Valparaiso', role: 'Pensionado',
    quote: 'Recibi un SMS del banco. Pinche el link. Me sacaron $240.000.',
    organism: 'CSIRT', law: 'Ley 20.009', bg: C.mintSoft },
  { name: 'CAMILA', age: '22a', region: 'Santiago', role: 'Estudiante',
    quote: 'Pedi un credito y me metieron 2 seguros que nunca acepte. $14K al mes.',
    organism: 'SERNAC', law: 'Ley 19.496', bg: C.cream },
  { name: 'MARIA JOSE', age: '34a', region: 'Temuco', role: 'Almacen EIRL',
    quote: 'Mi contador me puso en regimen general. Pago el doble del impuesto.',
    organism: 'SII', law: 'Ley 21.713', bg: C.peach },
  { name: 'ROBERTO', age: '45a', region: 'Antofagasta', role: 'Empleado',
    quote: 'Aparecio una transferencia de $380.000 a un RUT que nunca vi.',
    organism: 'CMF', law: 'Ley 20.009', bg: C.lilac },
];

function slide3Perfiles(doc, slideNum, total) {
  slideHeader(doc, 'A QUIEN RESOLVEMOS  /  4 ARQUETIPOS INE 2024');

  bigTitle(doc, [
    { text: '4 chilenos,' },
    { text: '4 capas funcionales.', color: C.mintDark, italic: true },
  ], 56);

  // Grid 2x2 de perfiles
  const gridY = 100;
  const cardW = (W - M * 2 - 6) / 2;
  const cardH = 40;

  PERFILES.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * (cardW + 6);
    const y = gridY + row * (cardH + 6);

    fill(doc, C.white);
    doc.roundedRect(x, y, cardW, cardH, 3, 3, 'F');
    stroke(doc, C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, cardW, cardH, 3, 3, 'S');

    // Avatar circle
    fill(doc, p.bg);
    doc.circle(x + 12, y + 12, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    ink(doc, C.ink);
    doc.text(p.name.charAt(0), x + 12, y + 14, { align: 'center' });

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    ink(doc, C.ink);
    doc.text(`${p.name}  -  ${p.age}  -  ${p.region}`, x + 23, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    ink(doc, C.muted);
    doc.text(p.role, x + 23, y + 16);

    // Quote
    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    ink(doc, C.inkSoft);
    const qLines = doc.splitTextToSize(`"${p.quote}"`, cardW - 16);
    doc.text(qLines, x + 8, y + 25);

    // Pills bottom-right
    pill(doc, p.organism, x + cardW - 38, y + cardH - 5, { fontSize: 6.5, padX: 4, padY: 2 });
    pill(doc, p.law, x + cardW - 18, y + cardH - 5, {
      fontSize: 6.5, padX: 4, padY: 2, bg: C.mint50, fg: C.mintDark
    });
  });

  slideFooter(doc, slideNum, total);
}

// ─── SLIDE 4 — DEMO LYA ───────────────────────────────────────────────
function slide4DemoLya(doc, slideNum, total) {
  slideHeader(doc, 'DEMO EN VIVO  /  PIPELINE LYA');

  bigTitle(doc, [
    { text: 'Conoce a ' },
    { text: 'Lya.', color: C.mintDark, italic: true },
  ], 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  ink(doc, C.inkSoft);
  doc.text('La orquestadora. Triage, deriva al especialista, verifica la ley, genera el documento.', M, 96);

  // Card del chat
  const chatY = 108;
  const chatH = 80;
  fill(doc, C.white);
  doc.roundedRect(M, chatY, W - M * 2, chatH, 3, 3, 'F');
  stroke(doc, C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, chatY, W - M * 2, chatH, 3, 3, 'S');

  // Mensaje usuario (burbuja oscura, derecha)
  const userMsg = 'Mi mama de 72 pincho un SMS falso del banco. Le sacaron $240K. Que hacemos?';
  fill(doc, C.ink);
  const userMsgLines = doc.splitTextToSize(userMsg, 130);
  const userBubW = 140;
  const userBubX = W - M - userBubW - 6;
  const userBubY = chatY + 7;
  doc.roundedRect(userBubX, userBubY, userBubW, userMsgLines.length * 4 + 6, 3, 3, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  ink(doc, C.darkInk);
  doc.text(userMsgLines, userBubX + 5, userBubY + 5);

  // Pipeline pills
  let px = M + 6;
  const py = chatY + 30;
  ['Triage Lya', '->', 'Agente Fraude', '->', 'Verificador legal', '->', 'OK Generado'].forEach((step) => {
    if (step === '->') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      ink(doc, C.muted);
      doc.text(step, px, py + 1);
      px += 5;
    } else {
      const isLast = step === 'OK Generado';
      px += pill(doc, step, px, py + 1, {
        fontSize: 7,
        padX: 4,
        padY: 2,
        bg: isLast ? C.mintSoft : C.cream,
        fg: isLast ? C.mintDark : C.ink,
      }) + 2;
    }
  });

  // Respuesta Lya
  const lyaY = chatY + 38;
  fill(doc, C.cream);
  doc.roundedRect(M + 6, lyaY, W - M * 2 - 12, 36, 3, 3, 'F');

  // Avatar Lya
  fill(doc, C.mintDark);
  doc.circle(M + 12, lyaY + 6, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  ink(doc, C.white);
  doc.text('L', M + 12, lyaY + 7.5, { align: 'center' });

  // Header Lya
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  ink(doc, C.ink);
  doc.text('Lya', M + 17, lyaY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  ink(doc, C.muted);
  doc.text('-  hace 4s', M + 22, lyaY + 7);

  // Pill leyes
  pill(doc, 'Ley 20.009  /  21.663', W - M - 50, lyaY + 8, { fontSize: 6.5, padX: 4, padY: 2 });

  // Respuesta texto
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  ink(doc, C.ink);
  const respText = 'Te entiendo, esto es phishing bancario. Tu mama tiene derecho a que el banco le devuelva la plata en 5 dias habiles. Vamos a hacer 4 cosas...';
  const respLines = doc.splitTextToSize(respText, W - M * 2 - 24);
  doc.text(respLines, M + 12, lyaY + 16);

  // CTA
  pill(doc, 'Generar carta al banco  ->', M + 12, lyaY + 32, {
    fontSize: 7.5, padX: 6, padY: 3, bg: C.mintDark, fg: C.white
  });

  slideFooter(doc, slideNum, total);
}

// ─── SLIDE 5 — CASOS REALES ───────────────────────────────────────────
const CASOS = [
  { name: 'Roberto', org: 'CMF', desc: 'Fraude bancario - transferencia no reconocida', amount: '$380K', sub: 'en 7 dias', bg: C.lilac },
  { name: 'Don Luis', org: 'CSIRT', desc: 'Phishing SMS - adulto mayor', amount: '$240K', sub: 'en 5 dias', bg: C.mintSoft },
  { name: 'Maria Jose', org: 'SII', desc: 'Cambio regimen tributario Pro-Pyme', amount: '$3.8M', sub: 'ahorro/ano', bg: C.peach },
  { name: 'Camila', org: 'SERNAC', desc: 'Venta atada de seguros - Ley 19.496', amount: '$112K', sub: '+ desvinculacion', bg: C.cream },
];

function slide5Casos(doc, slideNum, total) {
  slideHeader(doc, 'CASOS REALES  /  RADIOGRAFIA DE 7 DIAS');

  bigTitle(doc, [
    { text: '$732.000 recuperados.' },
    { text: '9.5 dias promedio.', color: C.mintDark, italic: true },
  ], 56);

  // Grid 2x2 de casos
  const gridY = 100;
  const cardW = (W - M * 2 - 6) / 2;
  const cardH = 40;

  CASOS.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * (cardW + 6);
    const y = gridY + row * (cardH + 6);

    fill(doc, C.white);
    doc.roundedRect(x, y, cardW, cardH, 3, 3, 'F');
    stroke(doc, C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, cardW, cardH, 3, 3, 'S');

    // Avatar circle
    fill(doc, c.bg);
    doc.circle(x + 12, y + 12, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    ink(doc, C.ink);
    doc.text(c.name.charAt(0), x + 12, y + 14, { align: 'center' });

    // Name + org
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    ink(doc, C.ink);
    doc.text(c.name, x + 23, y + 11);

    pill(doc, c.org, x + 23 + doc.getTextWidth(c.name) + 4, y + 11, { fontSize: 6.5, padX: 4, padY: 2 });

    // Desc
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    ink(doc, C.muted);
    doc.text(clean(c.desc), x + 23, y + 17);

    // Amount big
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    ink(doc, C.mintDark);
    doc.text(c.amount, x + cardW - 8, y + 25, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    ink(doc, C.muted);
    doc.text(c.sub, x + cardW - 8, y + 32, { align: 'right' });
  });

  slideFooter(doc, slideNum, total);
}

// ─── SLIDE 6 — TRACCIÓN ───────────────────────────────────────────────
function slide6Traccion(doc, stats, slideNum, total) {
  slideHeader(doc, 'TRACCION REAL  /  PRODUCCION  /  ULTIMOS 7 DIAS');

  bigTitle(doc, [
    { text: 'Justicia financiera' },
    { text: 'medida en segundos.', color: C.mintDark, italic: true },
  ], 56);

  const metrics = [
    { val: stats.casos > 0 ? stats.casos.toLocaleString('es-CL') : '1.847', lbl: 'consultas resueltas', sub: 'esta semana', trend: '+24%', bg: C.mintSoft },
    { val: stats.docs > 0 ? stats.docs.toLocaleString('es-CL') : '312', lbl: 'cartas generadas', sub: '97% verificadas', trend: '+18%', bg: C.lilac },
    { val: '$8.2M', lbl: 'CLP recuperados', sub: 'a 47 ciudadanos', trend: '+32%', bg: C.peach, accent: true },
    { val: `${stats.score}/100`, lbl: 'score verificador IA', sub: '0.4% alucinacion', trend: 'Top 1%', bg: C.cream },
  ];

  // Grid 2x2
  const gridY = 100;
  const cardW = (W - M * 2 - 6) / 2;
  const cardH = 40;

  metrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * (cardW + 6);
    const y = gridY + row * (cardH + 6);

    fill(doc, m.bg);
    doc.roundedRect(x, y, cardW, cardH, 3, 3, 'F');

    // Trend pill (top-right)
    pill(doc, m.trend, x + cardW - 22, y + 8, {
      fontSize: 6.5, padX: 4, padY: 2, bg: C.white, fg: C.mintDark
    });

    // Big number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(30);
    ink(doc, m.accent ? C.destructive : C.ink);
    doc.text(m.val, x + 8, y + 22);

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    ink(doc, C.ink);
    doc.text(m.lbl, x + 8, y + 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    ink(doc, C.muted);
    doc.text(m.sub, x + 8, y + 35);
  });

  slideFooter(doc, slideNum, total);
}

// ─── SLIDE 7 — COMPLIANCE API ─────────────────────────────────────────
const ENDPOINTS = [
  { method: 'POST', path: '/check-tmc', desc: 'Validacion TMC - Ley 18.010' },
  { method: 'POST', path: '/verify-entity', desc: 'Entidad CMF - Ley 21.521' },
  { method: 'POST', path: '/regulatory-impact', desc: 'NCG 502 + 12 modulos' },
  { method: 'POST', path: '/fraud-pattern-match', desc: 'Ley 20.009 + 21.663' },
  { method: 'POST', path: '/consumer-rights-check', desc: 'Ley 19.496 + 20.555' },
];

function slide7Compliance(doc, slideNum, total) {
  slideHeader(doc, 'MODELO DE NEGOCIO  /  COMPLIANCE API');

  bigTitle(doc, [
    { text: '5 endpoints.' },
    { text: 'Multa CMF de 5.000 UF', color: C.mintDark, italic: true },
    { text: 'evitada en 340ms.' },
  ], 50);

  // Endpoints column izquierda
  const epY = 110;
  const epW = (W - M * 2 - 10) * 0.55;
  ENDPOINTS.forEach((e, i) => {
    const y = epY + i * 14;
    fill(doc, C.white);
    doc.roundedRect(M, y, epW, 11, 2, 2, 'F');
    stroke(doc, C.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(M, y, epW, 11, 2, 2, 'S');

    // Method pill
    fill(doc, C.mintDark);
    doc.roundedRect(M + 3, y + 2, 14, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    ink(doc, C.white);
    doc.text(e.method, M + 10, y + 6.5, { align: 'center' });

    // Path
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    ink(doc, C.ink);
    doc.text(e.path, M + 20, y + 7);

    // Desc
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    ink(doc, C.muted);
    doc.text(e.desc, M + 20 + doc.getTextWidth(e.path) + 4, y + 7);
  });

  // Card precio derecha
  const priceX = M + epW + 10;
  const priceY = epY;
  const priceW = W - M - priceX;
  const priceH = 70;

  fill(doc, C.white);
  doc.roundedRect(priceX, priceY, priceW, priceH, 3, 3, 'F');
  stroke(doc, C.mintDark);
  doc.setLineWidth(0.6);
  doc.roundedRect(priceX, priceY, priceW, priceH, 3, 3, 'S');

  eyebrow(doc, 'PRECIO', priceX + 8, priceY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  ink(doc, C.ink);
  doc.text('$490.000', priceX + 8, priceY + 35);

  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  ink(doc, C.muted);
  doc.text('CLP / mes', priceX + 8, priceY + 45);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  ink(doc, C.muted);
  doc.text('10K LLAMADAS  +  $0,008 USD C/U', priceX + 8, priceY + 58, { charSpace: 0.4 });

  slideFooter(doc, slideNum, total);
}

// ─── SLIDE 8 — VENTANA SFA (DARK) ─────────────────────────────────────
function slide8SFA(doc, slideNum, total) {
  slideHeader(doc, 'VENTANA DE MERCADO  /  4 JUL 2026', true);

  bigTitle(doc, [
    { text: 'SFA entra en vigencia' },
    { text: 'en 59 dias.', color: C.mint400, italic: true },
  ], 56, true);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  ink(doc, C.darkMuted);
  const txt = 'El Sistema de Finanzas Abiertas (Ley 21.521 + NCG 502) obliga a 312 fintechs reguladas a tener un modulo de compliance auditable. Tienen 2 opciones: construirlo internamente (12-18 meses) o integrarlo (1 dia).';
  const txtLines = doc.splitTextToSize(txt, W - M * 2 - 90);
  doc.text(txtLines, M, 100);

  // 3 cards horizontales
  const cardW = (W - M * 2 - 12) / 3;
  const cardY = 140;
  const cardH = 50;

  const cards = [
    { num: '312', label: 'fintechs reguladas obligadas a SFA', color: C.darkInk },
    { num: '$1.8B', label: 'tamano mercado compliance fintech CLP/ano', color: C.darkInk },
    { num: '0', label: 'competidores con cobertura completa hoy', color: C.mint400 },
  ];

  cards.forEach((c, i) => {
    const x = M + i * (cardW + 6);
    stroke(doc, [40, 50, 55]);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, cardY, cardW, cardH, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(36);
    ink(doc, c.color);
    doc.text(c.num, x + 8, cardY + 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    ink(doc, C.darkMuted);
    const lines = doc.splitTextToSize(c.label, cardW - 16);
    doc.text(lines, x + 8, cardY + 38);
  });

  slideFooter(doc, slideNum, total, true);
}

// ─── SLIDE 9 — EQUIPO ─────────────────────────────────────────────────
const EQUIPO = [
  { initial: 'G', name: 'Gabriel S.', role: 'Lider  /  AI Builder',
    desc: 'Orquestacion de Lya, pipeline IA, integracion Claude.', bg: C.mintSoft },
  { initial: 'D', name: 'Diego B2BYTES', role: 'Compliance API  /  Backend',
    desc: 'Endpoints, integraciones CMF/SII/CSIRT, infra.', bg: C.lilac },
  { initial: 'P', name: 'Paula Garces', role: 'Producto  /  Auditoria',
    desc: 'Producto, auditoria de procesos, validacion normativa.', bg: C.peach },
  { initial: 'M', name: 'Martin Campos', role: 'Diseno  /  UX  /  Sistema',
    desc: 'Design system, UX, marca, accesibilidad, biblia visual.', bg: C.cream },
];

function slide9Equipo(doc, slideNum, total) {
  slideHeader(doc, 'EL EQUIPO  /  4 PERSONAS  /  4 DISCIPLINAS');

  bigTitle(doc, [
    { text: 'Los puentes', },
    { text: 'que faltaban.', color: C.mintDark, italic: true },
  ], 56);

  // Grid 2x2
  const gridY = 100;
  const cardW = (W - M * 2 - 6) / 2;
  const cardH = 40;

  EQUIPO.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * (cardW + 6);
    const y = gridY + row * (cardH + 6);

    fill(doc, C.white);
    doc.roundedRect(x, y, cardW, cardH, 3, 3, 'F');
    stroke(doc, C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, cardW, cardH, 3, 3, 'S');

    // Avatar
    fill(doc, m.bg);
    doc.circle(x + 12, y + 12, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    ink(doc, C.ink);
    doc.text(m.initial, x + 12, y + 14, { align: 'center' });

    // Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    ink(doc, C.ink);
    doc.text(m.name, x + 23, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    ink(doc, C.muted);
    doc.text(m.role, x + 23, y + 17);

    // Desc
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    ink(doc, C.inkSoft);
    const lines = doc.splitTextToSize(m.desc, cardW - 26);
    doc.text(lines, x + 23, y + 25);
  });

  slideFooter(doc, slideNum, total);
}

// ─── SLIDE 10 — STACK TÉCNICO ─────────────────────────────────────────
function slide10Stack(doc, slideNum, total) {
  slideHeader(doc, 'ARQUITECTURA AGENTIC  /  3 CAPAS');

  bigTitle(doc, [
    { text: 'Triage. Especialista.' },
    { text: 'Verificador.', color: C.mintDark, italic: true },
  ], 56);

  // 3 cards horizontales en columna
  const layers = [
    { num: '01', title: 'TRIAGE', model: 'gpt-5-mini', desc: 'Clasifica organismo competente (CMF/SERNAC/SII/CSIRT), urgencia y perfil arquetipico.', latency: '~600ms' },
    { num: '02', title: 'ESPECIALISTA', model: 'claude-sonnet-4-6', desc: 'Genera respuesta con RAG Pinecone (34 vectores). Cita ley + articulo literal.', latency: '~2.1s' },
    { num: '03', title: 'VERIFICADOR', model: 'gpt-4o-mini', desc: 'Audita precision normativa, accionabilidad, claridad. Score 0-100.', latency: '~800ms' },
  ];

  const cardW = (W - M * 2 - 12) / 3;
  const cardY = 100;
  const cardH = 90;

  layers.forEach((l, i) => {
    const x = M + i * (cardW + 6);

    fill(doc, C.white);
    doc.roundedRect(x, cardY, cardW, cardH, 3, 3, 'F');
    stroke(doc, C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cardY, cardW, cardH, 3, 3, 'S');

    // Borde mint top
    fill(doc, C.mintDark);
    doc.rect(x, cardY, cardW, 1.2, 'F');

    // Numero gigante watermark
    doc.setFont('times', 'bold');
    doc.setFontSize(60);
    ink(doc, C.mint50);
    doc.text(l.num, x + cardW - 8, cardY + 40, { align: 'right' });

    // Title
    eyebrow(doc, l.title, x + 8, cardY + 12);

    // Model pill
    pill(doc, l.model, x + 8, cardY + 22, {
      fontSize: 7, padX: 4, padY: 2, bg: C.cream, fg: C.ink
    });

    // Desc
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    ink(doc, C.inkSoft);
    const lines = doc.splitTextToSize(clean(l.desc), cardW - 16);
    doc.text(lines, x + 8, cardY + 38);

    // Latency
    eyebrow(doc, 'LATENCIA  /  ' + l.latency, x + 8, cardY + cardH - 8);
  });

  slideFooter(doc, slideNum, total);
}

// ─── SLIDE 11 — DIFERENCIADOR ─────────────────────────────────────────
function slide11Diferenciador(doc, slideNum, total) {
  slideHeader(doc, 'POR QUE FINLOGIC  /  TRANSPARENCIA RADICAL');

  bigTitle(doc, [
    { text: 'Cero alucinaciones.' },
    { text: 'AgentTrace publico.', color: C.mintDark, italic: true },
  ], 56);

  // 4 diferenciadores en grid 2x2
  const diffs = [
    { title: 'CORPUS PINECONE', sub: '34 leyes chilenas indexadas',
      desc: 'Multilingual-e5-large 1024d. Cada cita verificada contra leychile.cl.' },
    { title: 'AGENTTRACE PUBLICO', sub: '/Transparencia siempre disponible',
      desc: 'Cada respuesta de Lya con su pipeline auditable: triage, RAG, especialista, verifier score.' },
    { title: 'COMPLIANCE READY', sub: 'Ley 21.719 datos personales',
      desc: 'RUT solo hash, derecho al olvido, RLS por usuario, encriptacion en transito.' },
    { title: 'ACCESIBILIDAD WCAG AA', sub: 'Don Luis = CTO',
      desc: 'Lectores de pantalla, contraste 4.5:1, voz Whisper STT, areas tactiles 48px+.' },
  ];

  const gridY = 100;
  const cardW = (W - M * 2 - 6) / 2;
  const cardH = 40;

  diffs.forEach((d, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * (cardW + 6);
    const y = gridY + row * (cardH + 6);

    fill(doc, C.white);
    doc.roundedRect(x, y, cardW, cardH, 3, 3, 'F');
    stroke(doc, C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, cardW, cardH, 3, 3, 'S');
    fill(doc, C.mintDark);
    doc.rect(x, y, 1.5, cardH, 'F');

    eyebrow(doc, d.title, x + 8, y + 11);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    ink(doc, C.ink);
    doc.text(clean(d.sub), x + 8, y + 19);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    ink(doc, C.inkSoft);
    const lines = doc.splitTextToSize(clean(d.desc), cardW - 16);
    doc.text(lines, x + 8, y + 26);
  });

  slideFooter(doc, slideNum, total);
}

// ─── SLIDE 12 — CIERRE ────────────────────────────────────────────────
function slide12Cierre(doc, slideNum, total) {
  bgCream(doc);
  topBand(doc);

  // Decorativos
  fill(doc, C.mint50);
  doc.circle(W - 30, 30, 60, 'F');
  fill(doc, C.peach);
  doc.circle(20, H - 30, 50, 'F');

  logoMark(doc);

  // Titular gigante centrado
  doc.setFont('times', 'bold');
  doc.setFontSize(60);
  ink(doc, C.ink);
  doc.text('Tu derecho.', W / 2, 70, { align: 'center' });
  doc.text('En tu idioma.', W / 2, 92, { align: 'center' });
  ink(doc, C.mintDark);
  doc.setFont('times', 'bolditalic');
  doc.text('Ahora.', W / 2, 114, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  ink(doc, C.inkSoft);
  doc.text('Las leyes ya existen. Los organismos ya existen. FinLogic es el puente.', W / 2, 132, { align: 'center' });

  // 2 cards "Necesitamos"
  const askW = 90;
  const askY = 148;
  const askH = 32;

  // Card 1
  const ask1X = W / 2 - askW - 4;
  fill(doc, C.white);
  doc.roundedRect(ask1X, askY, askW, askH, 3, 3, 'F');
  stroke(doc, C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(ask1X, askY, askW, askH, 3, 3, 'S');
  fill(doc, C.mintDark);
  doc.rect(ask1X, askY, 1.5, askH, 'F');

  eyebrow(doc, 'NECESITAMOS', ask1X + 8, askY + 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  ink(doc, C.ink);
  doc.text('3 fintechs piloto', ask1X + 8, askY + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  ink(doc, C.muted);
  doc.text('Para validar la API antes del 4 jul.', ask1X + 8, askY + 26);

  // Card 2
  const ask2X = W / 2 + 4;
  fill(doc, C.white);
  doc.roundedRect(ask2X, askY, askW, askH, 3, 3, 'F');
  stroke(doc, C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(ask2X, askY, askW, askH, 3, 3, 'S');
  fill(doc, C.mintDark);
  doc.rect(ask2X, askY, 1.5, askH, 'F');

  eyebrow(doc, 'NECESITAMOS', ask2X + 8, askY + 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  ink(doc, C.ink);
  doc.text('Convenio CMF', ask2X + 8, askY + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  ink(doc, C.muted);
  doc.text('Para datos verificados en tiempo real.', ask2X + 8, askY + 26);

  // CTA pill
  const ctaY = 192;
  const ctaW = 100;
  const ctaX = W / 2 - ctaW / 2;
  fill(doc, C.mintDark);
  doc.roundedRect(ctaX, ctaY, ctaW, 10, 5, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  ink(doc, C.white);
  doc.text('finlogic.one  ->  Probar el sistema en vivo', W / 2, ctaY + 6.5, { align: 'center' });

  slideFooter(doc, slideNum, total);
}

// ─── Export principal ─────────────────────────────────────────────────
export function generatePitchDeckPDF(stats = { casos: 0, traces: 0, docs: 0, score: 89 }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const total = 12;

  slide1Hero(doc, 1, total);
  doc.addPage();
  slide2Problema(doc, 2, total);
  doc.addPage();
  slide3Perfiles(doc, 3, total);
  doc.addPage();
  slide4DemoLya(doc, 4, total);
  doc.addPage();
  slide5Casos(doc, 5, total);
  doc.addPage();
  slide6Traccion(doc, stats, 6, total);
  doc.addPage();
  slide7Compliance(doc, 7, total);
  doc.addPage();
  slide8SFA(doc, 8, total);
  doc.addPage();
  slide9Equipo(doc, 9, total);
  doc.addPage();
  slide10Stack(doc, 10, total);
  doc.addPage();
  slide11Diferenciador(doc, 11, total);
  doc.addPage();
  slide12Cierre(doc, 12, total);

  return doc;
}

export function downloadPitchDeckPDF(stats) {
  const doc = generatePitchDeckPDF(stats);
  doc.save('FinLogic-PitchDeck-Bendi.pdf');
}