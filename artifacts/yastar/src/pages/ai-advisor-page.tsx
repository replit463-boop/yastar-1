import { useState } from 'react';
import { Sparkles, Bot, Building2, Calculator, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/currency-input';
import { AiAdvisorPanel } from '@/components/ai-advisor-panel';

export default function AiAdvisorPage() {
  const [businessType, setBusinessType] = useState('salon');
  const [targetProfit, setTargetProfit] = useState(15000000);
  const [staffCount, setStaffCount] = useState(3);
  const [fixedCost, setFixedCost] = useState(8000000);

  return (
    <div className="space-y-6" data-testid="page-ai-advisor">
      <Card className="border-border shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Business Advisor (Gemini AI)
          </CardTitle>
          <CardDescription>
            Konsultan bisnis virtual cerdas berbasis Gemini AI untuk menganalisis strategi target laba, optimasi harga, dan menyusun materi pemasaran WhatsApp & Instagram.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg border border-border/60">
            <div>
              <Label className="text-xs font-medium">Jenis Usaha</Label>
              <Select value={businessType} onValueChange={setBusinessType}>
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
              <Label className="text-xs font-medium">Target Laba Bersih / Bulan (Rp)</Label>
              <CurrencyInput
                value={targetProfit}
                onValueChange={setTargetProfit}
                className="mt-1 h-9 text-xs bg-background"
              />
            </div>

            <div>
              <Label className="text-xs font-medium">Jumlah Karyawan Operasional</Label>
              <Input
                type="number"
                min={1}
                value={staffCount}
                onChange={(e) => setStaffCount(Number(e.target.value))}
                className="mt-1 h-9 text-xs bg-background"
              />
            </div>

            <div>
              <Label className="text-xs font-medium">Biaya Tetap Bulanan (Rp)</Label>
              <CurrencyInput
                value={fixedCost}
                onValueChange={setFixedCost}
                className="mt-1 h-9 text-xs bg-background"
              />
            </div>
          </div>

          <AiAdvisorPanel
            moduleName="Target Laba & Operasional"
            businessType={
              businessType === 'barbershop'
                ? 'Barbershop'
                : businessType === 'salon'
                ? 'Salon Kecantikan'
                : businessType === 'spa'
                ? 'Spa & Wellness'
                : 'Klinik Estetika'
            }
            scenarioData={{
              targetProfit,
              staffCount,
              fixedCost,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
