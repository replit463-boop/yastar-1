import { useState } from 'react';
import { Package, Plus, Save, Sparkles, Trash2, Percent, TrendingDown, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CurrencyInput } from '@/components/currency-input';
import { InsightList } from '@/components/insight-list';
import { useToast } from '@/hooks/use-toast';
import { formatIDR, formatNumber } from '@/lib/format';
import { useCreateModuleScenario } from '@workspace/api-client-react';

interface Props {
  canSave: boolean;
  onScenarioSaved: () => void;
}

interface BundleItem {
  id: string;
  name: string;
  regularPrice: number;
  cogs: number;
}

export default function BundlingCalculatorPage({ canSave, onScenarioSaved }: Props) {
  const [bundleName, setBundleName] = useState('Paket Hemat Combo');
  const [items, setItems] = useState<BundleItem[]>([
    { id: '1', name: 'Potong & Styling', regularPrice: 60000, cogs: 12000 },
    { id: '2', name: 'Creambath Relaksasi', regularPrice: 80000, cogs: 25000 },
  ]);
  const [discountType, setDiscountType] = useState<'percent' | 'nominal' | 'fixed_price'>('percent');
  const [discountValue, setDiscountValue] = useState(20); // 20% default
  const [commissionPerBundle, setCommissionPerBundle] = useState(10000);
  
  const [saveOpen, setSaveOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const { toast } = useToast();

  const createScenario = useCreateModuleScenario({
    mutation: {
      onSuccess: () => {
        setSaveOpen(false);
        setScenarioName('');
        toast({ title: 'Skenario bundling berhasil disimpan' });
        onScenarioSaved();
      },
      onError: () => toast({ title: 'Gagal menyimpan skenario', variant: 'destructive' }),
    },
  });

  // Calculate stats
  const totalRegularPrice = items.reduce((sum, item) => sum + item.regularPrice, 0);
  const totalCogs = items.reduce((sum, item) => sum + item.cogs, 0);

  let promoPrice = totalRegularPrice;
  if (discountType === 'percent') {
    promoPrice = Math.max(0, totalRegularPrice * (1 - discountValue / 100));
  } else if (discountType === 'nominal') {
    promoPrice = Math.max(0, totalRegularPrice - discountValue);
  } else if (discountType === 'fixed_price') {
    promoPrice = discountValue;
  }

  const discountAmount = Math.max(0, totalRegularPrice - promoPrice);
  const effectiveDiscountPercent = totalRegularPrice > 0 ? (discountAmount / totalRegularPrice) * 100 : 0;

  // Regular Profit (without promo)
  const regularNetProfit = totalRegularPrice - totalCogs - commissionPerBundle;
  const regularMargin = totalRegularPrice > 0 ? (regularNetProfit / totalRegularPrice) * 100 : 0;

  // Promo Profit
  const promoNetProfit = promoPrice - totalCogs - commissionPerBundle;
  const promoMargin = promoPrice > 0 ? (promoNetProfit / promoPrice) * 100 : 0;

  // Break Even Volume (How many promo bundles needed to achieve same profit as N regular sales, e.g. 10 regular sales)
  const bundleProfitRatio = promoNetProfit > 0 && regularNetProfit > 0 ? regularNetProfit / promoNetProfit : null;

  // Insights
  const insights: Array<{ severity: 'success' | 'warning' | 'danger' | 'info'; code: string; message: string }> = [];

  if (promoNetProfit <= 0) {
    insights.push({
      severity: 'danger',
      code: 'negative_profit',
      message: 'PERINGATAN: Promo ini MERUGI! Harga promo tidak cukup untuk menutup HPP dan komisi.',
    });
  } else if (promoMargin < 15) {
    insights.push({
      severity: 'warning',
      code: 'thin_margin',
      message: `Margin promo sangat tipis (${promoMargin.toFixed(1)}%). Risiko tidak menutup biaya operasional lain.`,
    });
  } else {
    insights.push({
      severity: 'success',
      code: 'healthy_bundle',
      message: `Paket promo sehat dengan margin laba ${promoMargin.toFixed(1)}% per transaksi.`,
    });
  }

  if (bundleProfitRatio && bundleProfitRatio > 1.5) {
    insights.push({
      severity: 'info',
      code: 'volume_needed',
      message: `Anda perlu menjual ${bundleProfitRatio.toFixed(1)}x lipat jumlah paket promo untuk mendapatkan total laba yang sama dengan penjualan normal.`,
    });
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), name: 'Layanan Tambahan', regularPrice: 50000, cogs: 10000 },
    ]);
  }

  function removeItem(id: string) {
    if (items.length <= 1) {
      toast({ title: 'Minimal harus ada 1 item dalam paket', variant: 'destructive' });
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function updateItem(id: string, field: keyof BundleItem, val: any) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: val } : it))
    );
  }

  function handleSave() {
    if (!canSave) {
      toast({ title: 'Batas skenario tercapai. Upgrade ke Starter/Pro.', variant: 'destructive' });
      return;
    }
    createScenario.mutate({
      body: {
        name: scenarioName || bundleName || 'Simulasi Bundling',
        moduleType: 'bundling' as any,
        businessType: 'salon',
        resultSnapshot: {
          totalRegularPrice,
          promoPrice,
          discountAmount,
          effectiveDiscountPercent,
          totalCogs,
          regularNetProfit,
          promoNetProfit,
          promoMargin,
          insights,
        },
      },
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6" data-testid="page-bundling">
      <Card className="border-border shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Simulasi Bundling & Diskon Promo
          </CardTitle>
          <CardDescription>
            Uji kelayakan diskon paket gabungan layanan untuk melihat sisa margin dan jumlah unit yang wajib terjual.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label className="text-xs font-medium">Nama Paket Promo</Label>
            <Input
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="Cth: Paket Glowing Lebaran"
              className="mt-1"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Daftar Item / Layanan Paket
              </Label>
              <Button size="xs" variant="outline" onClick={addItem} className="h-7 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Item
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_110px_110px_32px] gap-2 items-center bg-muted/40 p-2.5 rounded-lg border border-border/50 text-xs"
                >
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Nama Layanan</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className="h-8 text-xs bg-background"
                      placeholder="Nama"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Harga Normal</Label>
                    <CurrencyInput
                      value={item.regularPrice}
                      onValueChange={(v) => updateItem(item.id, 'regularPrice', v)}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">HPP / Bahan</Label>
                    <CurrencyInput
                      value={item.cogs}
                      onValueChange={(v) => updateItem(item.id, 'cogs', v)}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeItem(item.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive self-end"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <div>
              <Label className="text-xs font-medium">Tipe Skema Diskon</Label>
              <Select
                value={discountType}
                onValueChange={(v) => setDiscountType(v as typeof discountType)}
              >
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Persentase Diskon (%)</SelectItem>
                  <SelectItem value="nominal">Potongan Harga (Rp)</SelectItem>
                  <SelectItem value="fixed_price">Harga Paket Nett (Rp)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium">
                {discountType === 'percent'
                  ? 'Persentase Diskon (%)'
                  : discountType === 'nominal'
                  ? 'Nominal Diskon (Rp)'
                  : 'Harga Paket Spesial (Rp)'}
              </Label>
              {discountType === 'percent' ? (
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="mt-1 h-9 text-xs"
                />
              ) : (
                <CurrencyInput
                  value={discountValue}
                  onValueChange={setDiscountValue}
                  className="mt-1 h-9 text-xs"
                />
              )}
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">Komisi Karyawan / Biaya Operasional per Paket (Rp)</Label>
            <CurrencyInput
              value={commissionPerBundle}
              onValueChange={setCommissionPerBundle}
              className="mt-1 h-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Result Panel */}
      <div className="space-y-4">
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Hasil Analisis Promo</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setScenarioName(bundleName);
                  setSaveOpen(true);
                }}
                disabled={!canSave}
                className="h-8 gap-1.5 text-xs"
              >
                <Save className="h-3.5 w-3.5" /> Simpan
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-[11px] text-muted-foreground font-medium">Total Harga Normal</p>
                <p className="text-base font-bold text-foreground mt-0.5">{formatIDR(totalRegularPrice)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Margin Normal: <span className="font-semibold text-foreground">{regularMargin.toFixed(1)}%</span>
                </p>
              </div>

              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-[11px] text-primary font-medium flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Harga Paket Promo
                </p>
                <p className="text-base font-bold text-primary mt-0.5">{formatIDR(promoPrice)}</p>
                <p className="text-[10px] text-primary/80 mt-1">
                  Diskon: <span className="font-semibold">{effectiveDiscountPercent.toFixed(1)}%</span> ({formatIDR(discountAmount)})
                </p>
              </div>
            </div>

            <div className="p-3 bg-card rounded-lg border border-border space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Total HPP Bahan / Modal</span>
                <span className="font-medium text-foreground">{formatIDR(totalCogs)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Komisi & Operasional</span>
                <span className="font-medium text-foreground">{formatIDR(commissionPerBundle)}</span>
              </div>
              <div className="flex justify-between py-1 font-semibold text-sm">
                <span>Laba Bersih per Paket Promo</span>
                <span className={promoNetProfit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}>
                  {formatIDR(promoNetProfit)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-accent/40 rounded-lg border border-border flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-foreground">Sisa Margin Promo</p>
                <p className="text-[11px] text-muted-foreground">Target margin minimal industri adalah 20%</p>
              </div>
              <span
                className={`text-lg font-bold ${
                  promoMargin >= 20
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : promoMargin > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-destructive'
                }`}
              >
                {promoMargin.toFixed(1)}%
              </span>
            </div>

            <InsightList insights={insights} />
          </CardContent>
        </Card>
      </div>

      {/* Save Modal */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simpan Skenario Bundling Promo</DialogTitle>
            <DialogDescription>Simpan hasil simulasi ini ke akun Anda untuk diakses kembali nanti.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-xs font-medium">Nama Skenario</Label>
            <Input
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Cth: Promo Lebaran 2026"
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
