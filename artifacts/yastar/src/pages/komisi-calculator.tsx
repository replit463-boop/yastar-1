import { useState } from 'react';
import { Users, Plus, Save, Trash2, Award, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CurrencyInput } from '@/components/currency-input';
import { InsightList } from '@/components/insight-list';
import { useToast } from '@/hooks/use-toast';
import { formatIDR } from '@/lib/format';
import { useCreateModuleScenario } from '@workspace/api-client-react';

interface Props {
  canSave: boolean;
  onScenarioSaved: () => void;
}

interface Tier {
  id: string;
  minClients: number;
  commissionPercent: number;
}

export default function KomisiCalculatorPage({ canSave, onScenarioSaved }: Props) {
  const [employeeName, setEmployeeName] = useState('Staf Senior');
  const [baseSalary, setBaseSalary] = useState(2000000);
  const [avgServicePrice, setAvgServicePrice] = useState(80000);
  const [monthlyClientsCount, setMonthlyClientsCount] = useState(85);

  const [tiers, setTiers] = useState<Tier[]>([
    { id: '1', minClients: 0, commissionPercent: 15 },
    { id: '2', minClients: 50, commissionPercent: 25 },
    { id: '3', minClients: 80, commissionPercent: 35 },
  ]);

  const [saveOpen, setSaveOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const { toast } = useToast();

  const createScenario = useCreateModuleScenario({
    mutation: {
      onSuccess: () => {
        setSaveOpen(false);
        setScenarioName('');
        toast({ title: 'Skenario skema komisi berhasil disimpan' });
        onScenarioSaved();
      },
      onError: () => toast({ title: 'Gagal menyimpan skenario', variant: 'destructive' }),
    },
  });

  // Calculation
  const grossRevenue = monthlyClientsCount * avgServicePrice;

  // Determine active tier based on clients count
  const sortedTiers = [...tiers].sort((a, b) => b.minClients - a.minClients);
  const activeTier = sortedTiers.find((t) => monthlyClientsCount >= t.minClients) || sortedTiers[sortedTiers.length - 1];

  const effectiveCommissionPercent = activeTier ? activeTier.commissionPercent : 0;
  const commissionNominal = (grossRevenue * effectiveCommissionPercent) / 100;
  const totalTakeHomePay = baseSalary + commissionNominal;

  const payrollRatio = grossRevenue > 0 ? (totalTakeHomePay / grossRevenue) * 100 : 0;
  const netContribution = grossRevenue - totalTakeHomePay;

  // Insights
  const insights: Array<{ severity: 'success' | 'warning' | 'danger' | 'info'; code: string; message: string }> = [];

  if (payrollRatio > 50) {
    insights.push({
      severity: 'danger',
      code: 'payroll_too_high',
      message: `PERINGATAN: Beban gaji & komisi menyerap ${payrollRatio.toFixed(1)}% dari total omset staf. Ini berisiko merugikan pemilik usaha.`,
    });
  } else if (payrollRatio > 40) {
    insights.push({
      severity: 'warning',
      code: 'payroll_moderate',
      message: `Beban gaji & komisi (${payrollRatio.toFixed(1)}%) cukup tinggi. Pastikan biaya tempat/sewa terkontrol dengan baik.`,
    });
  } else {
    insights.push({
      severity: 'success',
      code: 'payroll_healthy',
      message: `Skema komisi berjenjang aman dengan rasio beban gaji ${payrollRatio.toFixed(1)}% dari omset.`,
    });
  }

  insights.push({
    severity: 'info',
    code: 'tier_incentive',
    message: `Saat staf mencapai ${activeTier?.minClients ?? 0}+ klien/bulan, komisi otomatis naik ke ${effectiveCommissionPercent}%. Ini mendorong motivasi kerja.`,
  });

  function addTier() {
    setTiers((prev) => [
      ...prev,
      { id: Date.now().toString(), minClients: (prev[prev.length - 1]?.minClients || 0) + 30, commissionPercent: 40 },
    ]);
  }

  function removeTier(id: string) {
    if (tiers.length <= 1) {
      toast({ title: 'Minimal harus ada 1 tingkatan komisi', variant: 'destructive' });
      return;
    }
    setTiers((prev) => prev.filter((t) => t.id !== id));
  }

  function updateTier(id: string, field: keyof Tier, val: number) {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: val } : t)));
  }

  function handleSave() {
    if (!canSave) {
      toast({ title: 'Batas skenario tercapai. Upgrade ke Starter/Pro.', variant: 'destructive' });
      return;
    }
    createScenario.mutate({
      body: {
        name: scenarioName || 'Simulasi Skema Komisi Staf',
        moduleType: 'komisi' as any,
        businessType: 'salon',
        resultSnapshot: {
          employeeName,
          baseSalary,
          avgServicePrice,
          monthlyClientsCount,
          grossRevenue,
          effectiveCommissionPercent,
          commissionNominal,
          totalTakeHomePay,
          payrollRatio,
          netContribution,
          insights,
        },
      },
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6" data-testid="page-komisi">
      <Card className="border-border shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Simulasi Komisi Staf Berjenjang (Tiered Commission)
          </CardTitle>
          <CardDescription>
            Rancang skema insentif bertingkat untuk memotivasi staf melayani lebih banyak klien tanpa mengorbankan margin usaha.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Jabatan / Kategori Staf</Label>
              <Input
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Cth: Terapis Senior"
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Gaji Pokok Bulanan (Rp)</Label>
              <CurrencyInput
                value={baseSalary}
                onValueChange={setBaseSalary}
                className="mt-1 h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Rata-rata Tarif Layanan (Rp)</Label>
              <CurrencyInput
                value={avgServicePrice}
                onValueChange={setAvgServicePrice}
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Estimasi Klien Dilayani / Bulan</Label>
              <Input
                type="number"
                min={1}
                value={monthlyClientsCount}
                onChange={(e) => setMonthlyClientsCount(Number(e.target.value))}
                className="mt-1 h-9 text-xs"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tingkatan Komisi Berdasarkan Target Klien
              </Label>
              <Button size="xs" variant="outline" onClick={addTier} className="h-7 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Tier
              </Button>
            </div>

            <div className="space-y-2">
              {tiers.map((t, idx) => (
                <div
                  key={t.id}
                  className="grid grid-cols-[1fr_1fr_32px] gap-2 items-center bg-muted/40 p-2.5 rounded-lg border border-border/50 text-xs"
                >
                  <div>
                    <Label className="text-[10px] text-muted-foreground">
                      Minimal Klien (Tier {idx + 1})
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={t.minClients}
                      onChange={(e) => updateTier(t.id, 'minClients', Number(e.target.value))}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Komisi (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={t.commissionPercent}
                      onChange={(e) => updateTier(t.id, 'commissionPercent', Number(e.target.value))}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeTier(t.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive self-end"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Output Card */}
      <div className="space-y-4">
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Hasil Analisis Komisi</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setScenarioName(`Skema Komisi ${employeeName}`);
                  setSaveOpen(true);
                }}
                disabled={!canSave}
                className="h-8 gap-1.5 text-xs"
              >
                <Save className="h-3.5 w-3.5" /> Simpan
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3 bg-muted/30 rounded-lg border border-border/50 grid grid-cols-2 gap-2">
              <div>
                <p className="text-[11px] text-muted-foreground">Total Omset Staf</p>
                <p className="text-base font-bold text-foreground mt-0.5">{formatIDR(grossRevenue)}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Tier Komisi Aktif</p>
                <p className="text-base font-bold text-primary mt-0.5">{effectiveCommissionPercent}%</p>
              </div>
            </div>

            <div className="p-3 bg-card rounded-lg border border-border space-y-2">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Gaji Pokok</span>
                <span className="font-medium text-foreground">{formatIDR(baseSalary)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Nominal Komisi ({effectiveCommissionPercent}%)</span>
                <span className="font-medium text-primary">{formatIDR(commissionNominal)}</span>
              </div>
              <div className="flex justify-between py-1 font-semibold text-sm">
                <span>Total Gaji Diterima Staf (THP)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatIDR(totalTakeHomePay)}</span>
              </div>
            </div>

            <div className="p-3 bg-accent/40 rounded-lg border border-border flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Sisa Kontribusi Bersih untuk Usaha</p>
                <p className="text-[11px] text-muted-foreground">
                  (Omset dikurangi Total Gaji Staf)
                </p>
              </div>
              <span className="text-base font-bold text-primary">{formatIDR(netContribution)}</span>
            </div>

            <InsightList insights={insights} />
          </CardContent>
        </Card>
      </div>

      {/* Save Modal */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simpan Skenario Komisi</DialogTitle>
            <DialogDescription>Simpan parameter komisi berjenjang ini ke dalam daftar skenario Anda.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-xs font-medium">Nama Skenario</Label>
            <Input
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Cth: Skema Komisi Barbershop 2026"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={createScenario.isPending}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
