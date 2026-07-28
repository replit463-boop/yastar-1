import { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb, Copy, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Props {
  moduleName?: string;
  businessType?: string;
  scenarioData?: any;
}

export function AiAdvisorPanel({ moduleName = 'Simulasi Bisnis', businessType = 'Salon/Barbershop', scenarioData }: Props) {
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [analysis, setAnalysis] = useState<{
    summary?: string;
    strengths?: string[];
    risks?: string[];
    recommendations?: string[];
  } | null>(null);

  // Announcement state
  const [promoTitle, setPromoTitle] = useState('Paket Diskon Hari Raya');
  const [promoDetails, setPromoDetails] = useState('Diskon 20% untuk kombinasi Creambath + Potong Rambut.');
  const [loadingAnnouncement, setLoadingAnnouncement] = useState(false);
  const [announcement, setAnnouncement] = useState<{
    whatsappTemplate?: string;
    instagramCaption?: string;
    posterHeadline?: string;
  } | null>(null);

  const { toast } = useToast();

  async function handleRunAnalyze() {
    setLoadingAnalyze(true);
    try {
      const res = await fetch('/api/ai-advisor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName, businessType, scenarioData }),
      });
      const data = await res.json();
      setAnalysis(data);
      toast({ title: 'Analisis AI Advisor berhasil diperbarui' });
    } catch (err) {
      toast({ title: 'Gagal menghubungi AI Advisor', variant: 'destructive' });
    } finally {
      setLoadingAnalyze(false);
    }
  }

  async function handleGenerateAnnouncement() {
    setLoadingAnnouncement(true);
    try {
      const res = await fetch('/api/ai-advisor/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: promoTitle,
          details: promoDetails,
          targetAudience: 'Pelanggan Setia',
          tone: 'Ramah dan Menarik',
        }),
      });
      const data = await res.json();
      setAnnouncement(data);
      toast({ title: 'Draf pengumuman berhasil dibuat' });
    } catch (err) {
      toast({ title: 'Gagal membuat pengumuman AI', variant: 'destructive' });
    } finally {
      setLoadingAnnouncement(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} berhasil disalin ke clipboard!` });
  }

  return (
    <Card className="border-primary/20 shadow-xs bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gemini AI Business Advisor
          </CardTitle>
          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary font-medium">
            Powered by Gemini
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Dapatkan saran strategis instan dan buat draf materi promosi berbasis data simulasi bisnis Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid grid-cols-2 h-9 text-xs">
            <TabsTrigger value="analysis" className="text-xs">
              Saran Strategis
            </TabsTrigger>
            <TabsTrigger value="marketing" className="text-xs">
              Generator Promo AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-3 pt-3">
            {!analysis && !loadingAnalyze ? (
              <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-border/70 text-center space-y-2">
                <Sparkles className="h-7 w-7 text-primary/70 mx-auto" />
                <p className="text-xs font-medium text-foreground">
                  Minta rekomendasi finansial khusus untuk angka simulasi saat ini.
                </p>
                <Button size="sm" onClick={handleRunAnalyze} className="h-8 text-xs gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Analisis Sekarang
                </Button>
              </div>
            ) : loadingAnalyze ? (
              <div className="p-6 text-center text-muted-foreground space-y-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                <p className="text-xs">Sedang Menganalisis Skenario Finansial...</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {analysis?.summary && (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="font-semibold text-primary mb-1">Ringkasan Eksekutif AI:</p>
                    <p className="text-foreground/90 leading-relaxed">{analysis.summary}</p>
                  </div>
                )}

                {analysis?.strengths && analysis.strengths.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Poin Kekuatan:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {analysis.strengths.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis?.risks && analysis.risks.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" /> Potensi Risiko:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {analysis.risks.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis?.recommendations && analysis.recommendations.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="font-semibold text-primary flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5" /> Rekomendasi Langkah Aksi:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-foreground/90">
                      {analysis.recommendations.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleRunAnalyze}
                  className="h-7 text-[11px] gap-1 mt-2"
                >
                  <Sparkles className="h-3 w-3" /> Analisis Ulang
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="marketing" className="space-y-3 pt-3">
            <div className="space-y-2">
              <div>
                <Label className="text-xs font-medium">Judul Promo / Perubahan Harga</Label>
                <Input
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="Cth: Promo Lebaran Potong + Creambath"
                  className="h-8 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Detail Keunggulan & Diskon</Label>
                <Textarea
                  value={promoDetails}
                  onChange={(e) => setPromoDetails(e.target.value)}
                  placeholder="Cth: Cuma Rp99rb sudah dapat paket komplit."
                  className="text-xs mt-1 min-h-[60px]"
                />
              </div>

              <Button
                size="sm"
                onClick={handleGenerateAnnouncement}
                disabled={loadingAnnouncement}
                className="h-8 text-xs gap-1.5 w-full"
              >
                {loadingAnnouncement ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Buat Draf WhatsApp & Instagram
              </Button>
            </div>

            {announcement && (
              <div className="space-y-3 pt-2 border-t border-border text-xs">
                {announcement.posterHeadline && (
                  <div className="p-2.5 bg-muted/40 rounded border border-border/60">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Headline Poster Promo:</p>
                    <p className="font-bold text-foreground mt-0.5">{announcement.posterHeadline}</p>
                  </div>
                )}

                {announcement.whatsappTemplate && (
                  <div className="p-2.5 bg-muted/40 rounded border border-border/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                        <MessageSquare className="h-3 w-3 text-emerald-500" /> WhatsApp Blast Template:
                      </p>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => copyToClipboard(announcement.whatsappTemplate!, 'Teks WhatsApp')}
                        className="h-6 px-2 text-[10px] gap-1"
                      >
                        <Copy className="h-3 w-3" /> Salin
                      </Button>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-muted-foreground bg-background p-2 rounded border border-border/50 text-[11px]">
                      {announcement.whatsappTemplate}
                    </pre>
                  </div>
                )}

                {announcement.instagramCaption && (
                  <div className="p-2.5 bg-muted/40 rounded border border-border/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Instagram Caption:</p>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => copyToClipboard(announcement.instagramCaption!, 'Caption Instagram')}
                        className="h-6 px-2 text-[10px] gap-1"
                      >
                        <Copy className="h-3 w-3" /> Salin
                      </Button>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-muted-foreground bg-background p-2 rounded border border-border/50 text-[11px]">
                      {announcement.instagramCaption}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
