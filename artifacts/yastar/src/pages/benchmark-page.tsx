import { useState } from 'react';
import { Award, Building, ChevronRight, CheckCircle2, AlertTriangle, HelpCircle, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CurrencyInput } from '@/components/currency-input';
import { formatIDR } from '@/lib/format';

interface BenchmarkData {
  businessType: string;
  avgMargin: number;
  laborCostRatio: number;
  avgCapacityUtilization: number;
  avgTicketPrice: number;
  tips: string[];
}

const BENCHMARKS: Record<string, BenchmarkData> = {
  barbershop: {
    businessType: 'Barbershop',
    avgMargin: 35,
    laborCostRatio: 40,
    avgCapacityUtilization: 65,
    avgTicketPrice: 35000,
    tips: [
      'Gunakan sistem komisi flat atau bagi hasil 40-50% untuk menahan pergantian staf (turnover).',
      'Optimalkan layanan tambahan (wash, pomade, shaving) untuk menaikkan nilai transaksi per klien hingga Rp50.000+.',
      'Sediakan jam operasional khusus weekend dengan staf penuh karena 60% omset mingguan terkonsentrasi di Sabtu-Minggu.',
    ],
  },
  salon: {
    businessType: 'Salon Kecantikan',
    avgMargin: 42,
    laborCostRatio: 35,
    avgCapacityUtilization: 60,
    avgTicketPrice: 120000,
    tips: [
      'Fokus pada layanan frekuensi tinggi seperti Creambath & Styling untuk menjaga arus kas harian.',
      'Layanan kimia (hair color, smoothing) memiliki margin tinggi (>60%), dorong staf melakukan upselling.',
      'Jaga biaya bahan baku/consumables di bawah 15% dari total omset.',
    ],
  },
  spa: {
    businessType: 'Spa & Wellness',
    avgMargin: 45,
    laborCostRatio: 30,
    avgCapacityUtilization: 55,
    avgTicketPrice: 250000,
    tips: [
      'Model reservasi/booking awal sangat vital untuk menjaga utilisasi terapis di atas 50%.',
      'Manfaatkan paket keanggotaan/membership bulanan untuk kepastian pemasukan tetap.',
      'Sediakan ruangan pasangan (couple room) untuk menaikkan rata-rata belanja per reservasi.',
    ],
  },
  klinik: {
    businessType: 'Klinik Estetika / Skincare',
    avgMargin: 48,
    laborCostRatio: 25,
    avgCapacityUtilization: 50,
    avgTicketPrice: 450000,
    tips: [
      'Retensi pasien lama jauh lebih murah dibanding akuisisi pasien baru (fokus pada loyalty program).',
      'Bundling treatment dokter dengan produk homecare untuk mengunci margin di atas 50%.',
      'Kelola persediaan krim & obat dengan sistem FIFO untuk menghindari bahan kadaluarsa.',
    ],
  },
};

export default function BenchmarkPage() {
  const [selectedType, setSelectedType] = useState<string>('barbershop');
  const [monthlyRevenue, setMonthlyRevenue] = useState(35000000);
  const [monthlyPayroll, setMonthlyPayroll] = useState(12000000);
  const [monthlyNetProfit, setMonthlyNetProfit] = useState(12500000);

  const benchmark = BENCHMARKS[selectedType] || BENCHMARKS.barbershop;

  // Calculated User Ratios
  const userMargin = monthlyRevenue > 0 ? (monthlyNetProfit / monthlyRevenue) * 100 : 0;
  const userLaborRatio = monthlyRevenue > 0 ? (monthlyPayroll / monthlyRevenue) * 100 : 0;

  return (
    <div className="space-y-6" data-testid="page-benchmark">
      <Card className="border-border shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-primary" />
              Benchmark Industri Jasa Lokal (Indonesia)
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-primary/5 text-primary">
              Data Standar Industri
            </Badge>
          </div>
          <CardDescription>
            Bandingkan rasio keuangan usaha Anda dengan rata-rata kinerja bisnis sejenis di Indonesia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg border border-border/60">
            <div>
              <Label className="text-xs font-medium">Kategori Bisnis</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="mt-1 h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="barbershop">Barbershop</SelectItem>
                  <SelectItem value="salon">Salon Kecantikan</SelectItem>
                  <SelectItem value="spa">Spa & Wellness</SelectItem>
                  <SelectItem value="klinik">Klinik Estetika</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium">Total Omset / Bulan (Rp)</Label>
              <CurrencyInput
                value={monthlyRevenue}
                onValueChange={setMonthlyRevenue}
                className="mt-1 h-9 text-xs bg-background"
              />
            </div>

            <div>
              <Label className="text-xs font-medium">Total Gaji + Komisi Staf (Rp)</Label>
              <CurrencyInput
                value={monthlyPayroll}
                onValueChange={setMonthlyPayroll}
                className="mt-1 h-9 text-xs bg-background"
              />
            </div>

            <div>
              <Label className="text-xs font-medium">Laba Bersih Bulanan (Rp)</Label>
              <CurrencyInput
                value={monthlyNetProfit}
                onValueChange={setMonthlyNetProfit}
                className="mt-1 h-9 text-xs bg-background"
              />
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Net Profit Margin Card */}
            <Card className="border-border/80 shadow-2xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Margin Laba Bersih (%)</span>
                  <Badge
                    variant={userMargin >= benchmark.avgMargin ? 'default' : 'secondary'}
                    className="text-[10px]"
                  >
                    {userMargin >= benchmark.avgMargin ? 'Di Atas Rata-rata' : 'Di Bawah Rata-rata'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between border-b border-border/50 pb-2">
                  <span className="text-xs text-muted-foreground">Usaha Anda</span>
                  <span className="text-xl font-bold text-foreground">{userMargin.toFixed(1)}%</span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Standar Industri ({benchmark.businessType})</span>
                  <span className="font-semibold text-primary">{benchmark.avgMargin}%</span>
                </div>

                <p className="text-[11px] text-muted-foreground pt-1">
                  {userMargin >= benchmark.avgMargin
                    ? 'Margin laba bersih Anda sehat dan unggul dibandingkan rata-rata pesaing.'
                    : 'Margin Anda berada di bawah rata-rata industri. Evaluasi efisiensi biaya operasional atau harga jual.'}
                </p>
              </CardContent>
            </Card>

            {/* Labor Cost Ratio Card */}
            <Card className="border-border/80 shadow-2xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Rasio Beban Gaji vs Omset (%)</span>
                  <Badge
                    variant={userLaborRatio <= benchmark.laborCostRatio ? 'default' : 'destructive'}
                    className="text-[10px]"
                  >
                    {userLaborRatio <= benchmark.laborCostRatio ? 'Efisien' : 'Perlu Diwaspadai'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between border-b border-border/50 pb-2">
                  <span className="text-xs text-muted-foreground">Usaha Anda</span>
                  <span className="text-xl font-bold text-foreground">{userLaborRatio.toFixed(1)}%</span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Batas Maksimal Ideal</span>
                  <span className="font-semibold text-primary">{benchmark.laborCostRatio}%</span>
                </div>

                <p className="text-[11px] text-muted-foreground pt-1">
                  {userLaborRatio <= benchmark.laborCostRatio
                    ? 'Pengeluaran gaji dan komisi berada dalam proporsi ideal terhadap omset.'
                    : 'Pengeluaran gaji & komisi menyerap porsi omset yang terlalu besar (> target ideal).'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Industry Insights & Recommendations */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> Strategi Penyehatan Bisnis ({benchmark.businessType})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {benchmark.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
