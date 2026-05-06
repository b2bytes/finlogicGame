import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Eye, Download, Share2, Sparkles } from 'lucide-react';
import Logo from '@/components/home/Logo';
import CasoTimeline from '@/components/casos/CasoTimeline';
import CasoDeadlineCard from '@/components/casos/CasoDeadlineCard';
import CasoOutcomeStats from '@/components/casos/CasoOutcomeStats';
import GenerateDocDialog from '@/components/casos/GenerateDocDialog';
import ProTriggerBanner from '@/components/pro/ProTriggerBanner';

const moduleLabels = {
  ley_fintech_21521: 'Ley Fintech 21.521',
  ncg_502_cmf: 'NCG 502 CMF',
  ley_19496_sernac: 'Ley 19.496 SERNAC',
  ley_20555: 'Ley 20.555',
  ley_21719_datos: 'Ley 21.719 Datos personales',
  ley_20009_fraude: 'Ley 20.009 Fraude tarjetas',
  ley_21663_ciberseguridad: 'Ley 21.663 Ciberseguridad',
  lir_propyme: 'LIR Pro-Pyme',
  ley_21713_tributaria: 'Ley 21.713',
  tributacion_cripto: 'Tributación Cripto',
  open_finance: 'Open Finance',
  csirt: 'CSIRT',
};

export default function CasoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caso, setCaso] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docOpen, setDocOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const c = await base44.entities.MisCasos.get(id);
      setCaso(c);
      if (c?.legalDeadlineRef) {
        const d = await base44.entities.LegalDeadline.get(c.legalDeadlineRef).catch(() => null);
        setDeadline(d);
      }
      if (c?.generatedDocRef) {
        const g = await base44.entities.GeneratedDocument.get(c.generatedDocRef).catch(() => null);
        setDoc(g);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleShare = () => {
    const text = `Resolví mi caso en FinLogic: ${caso.title}\n\nFundamento: ${moduleLabels[caso.normativeModule] || caso.normativeModule}\n\nResuelve el tuyo gratis: https://finlogic.one/Consulta`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-mint-200 border-t-mint-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!caso) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="font-display text-xl font-bold text-foreground">Caso no encontrado</p>
        <Button onClick={() => navigate('/MisCasos')} className="mt-4 rounded-full">Volver a Mis Casos</Button>
      </div>
    );
  }

  const days = caso.daysRemaining;
  const isOverdue = typeof days === 'number' && days < 0;

  // Detección Momento Pro: doc generado > deadline crítico
  let proTrigger = null;
  if (doc) proTrigger = 'document_generated';
  else if (typeof days === 'number' && days >= 0 && days < 5) proTrigger = 'deadline_critical';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/MisCasos" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Mis casos
          </Link>
          <Logo size="sm" />
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-14">
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-mint-50 border border-mint-200 text-mint-700">
              {caso.regulatoryBody}
            </span>
            <span className="text-xs text-muted-foreground">{moduleLabels[caso.normativeModule]}</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
            {caso.title}
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed max-w-3xl">
            {caso.description}
          </p>
        </div>

        <ProTriggerBanner trigger={proTrigger} />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Columna izq: timeline */}
          <div className="lg:col-span-2 space-y-6">
            <CasoOutcomeStats caso={caso} />
            <CasoDeadlineCard days={days} deadline={deadline} />

            {/* Documento generado */}
            {doc ? (
              <div className="bg-card rounded-3xl border border-border p-6 shadow-soft">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-mint-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-mint-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-mint-600 uppercase tracking-wide">Documento legal</p>
                    <h3 className="font-display text-lg font-bold text-foreground mt-0.5">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Listo para enviar a {doc.addressedTo || caso.regulatoryBody}</p>
                    {doc.fileUrl && (
                      <Button asChild className="mt-4 rounded-full bg-mint-600 hover:bg-mint-700 text-white h-10">
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Descargar PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : caso.status !== 'resuelto' && (
              <div className="bg-card rounded-3xl border-2 border-dashed border-mint-200 p-8 text-center">
                <Sparkles className="w-8 h-8 mx-auto text-mint-600 mb-3" />
                <p className="font-display text-lg font-bold text-foreground">Genera tu documento legal</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Carta lista para presentar al organismo competente, con normativa citada.
                </p>
                <Button onClick={() => setDocOpen(true)} className="mt-5 rounded-full bg-mint-600 hover:bg-mint-700 text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generar documento
                </Button>
              </div>
            )}

            {/* Acciones */}
            <div className="flex flex-wrap gap-3">
              {caso.agentTraceRef && (
                <Button asChild variant="outline" className="rounded-full">
                  <Link to={`/Transparencia?trace=${caso.agentTraceRef}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver razonamiento
                  </Link>
                </Button>
              )}
              {caso.status === 'resuelto' && (
                <Button onClick={handleShare} variant="outline" className="rounded-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir caso
                </Button>
              )}
            </div>
          </div>

          {/* Columna der: timeline */}
          <div>
            <CasoTimeline status={caso.status} vencido={isOverdue} />
          </div>
        </div>
      </main>

      <GenerateDocDialog
        caso={caso}
        open={docOpen}
        onOpenChange={setDocOpen}
        onGenerated={load}
      />
    </div>
  );
}