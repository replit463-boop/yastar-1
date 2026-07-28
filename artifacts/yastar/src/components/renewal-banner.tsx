import { MessageCircle, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Account } from '@workspace/api-client-react';

interface Props {
  account: Account;
}

export function RenewalBanner({ account }: Props) {
  if (!account) return null;

  const adminPhone = '6281234567890'; // Admin WhatsApp default
  const businessName = account.businessName || 'Pemilik Usaha';
  const email = account.email || '';
  const currentTier = account.tier?.toUpperCase() || 'FREE';

  let daysRemaining: number | null = null;
  let expiresFormatted = '';

  if (account.packageExpiresAt) {
    const expiresDate = new Date(account.packageExpiresAt);
    const now = new Date();
    const diffTime = expiresDate.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    expiresFormatted = expiresDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // Wa message template
  const waText = encodeURIComponent(
    `Halo Admin Yastar,\nSaya ingin perpanjang / upgrade paket Yastar SaaS.\n- Nama Usaha: ${businessName}\n- Email: ${email}\n- Paket Saat Ini: ${currentTier}\nMohon rincian rekening pembayaran manual. Terima kasih!`
  );

  const waUrl = `https://wa.me/${adminPhone}?text=${waText}`;

  // If user is Free, show upgrade banner
  if (account.tier === 'free') {
    return (
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground text-[10px]">Paket Gratis</Badge>
            <p className="font-semibold text-xs text-foreground">
              Nikmati Simulasi Tanpa Batas dengan Paket Starter / Pro
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Buka akses ekspor PDF/Excel, simulasi bundling promo, komisi staf berjenjang, dan AI Advisor.
          </p>
        </div>
        <Button size="sm" className="h-8 text-xs gap-1.5 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-3.5 w-3.5" /> Upgrade via WhatsApp 1-Klik
          </a>
        </Button>
      </div>
    );
  }

  // If user is Premium and nearing expiration (<= 7 days or expired)
  if (daysRemaining !== null && daysRemaining <= 7) {
    const isExpired = daysRemaining <= 0;

    return (
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isExpired
            ? 'border-destructive/30 bg-destructive/10'
            : 'border-amber-500/30 bg-amber-500/10'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${isExpired ? 'text-destructive' : 'text-amber-600'}`} />
            <p className="font-semibold text-xs text-foreground">
              {isExpired
                ? `Masa aktif paket ${currentTier} Anda telah berakhir (${expiresFormatted}).`
                : `Masa aktif paket ${currentTier} tinggal ${daysRemaining} hari lagi (s/d ${expiresFormatted}).`}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Perpanjang sekarang agar akses penyimpanan skenario dan fitur ekspor laporan tetap aktif.
          </p>
        </div>
        <Button size="sm" className="h-8 text-xs gap-1.5 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-3.5 w-3.5" /> Perpanjang via WhatsApp
          </a>
        </Button>
      </div>
    );
  }

  return null;
}
