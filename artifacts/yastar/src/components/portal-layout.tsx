import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  LayoutDashboard,
  Calculator,
  BarChart2,
  TrendingUp,
  Tag,
  Receipt,
  Building2,
  CreditCard,
  Layers,
  LogOut,
  Menu,
  X,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Package,
  Award,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useOwnerAuth } from '@/lib/ownerAuth';
import { TIER_LABELS } from '@/lib/format';
import type { Account } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'beranda',
    label: 'Beranda',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  // --- Simulasi ---
  {
    id: 'target-mundur',
    label: 'Target Profit → Klien',
    icon: <Calculator className="h-4 w-4" />,
    section: 'Simulasi Bisnis',
  },
  {
    id: 'hpp',
    label: 'Hitung HPP',
    icon: <BarChart2 className="h-4 w-4" />,
  },
  {
    id: 'bep-usaha',
    label: 'Titik Impas Usaha',
    icon: <TrendingUp className="h-4 w-4" />,
    badge: 'Starter+',
  },
  {
    id: 'harga-jual',
    label: 'Uji Harga Jual',
    icon: <Tag className="h-4 w-4" />,
    badge: 'Starter+',
  },
  {
    id: 'bundling',
    label: 'Bundling & Promo',
    icon: <Package className="h-4 w-4" />,
    badge: 'Starter+',
  },
  {
    id: 'komisi',
    label: 'Komisi Staf Berjenjang',
    icon: <Users className="h-4 w-4" />,
    badge: 'Starter+',
  },
  {
    id: 'benchmark',
    label: 'Benchmark Industri',
    icon: <Award className="h-4 w-4" />,
    badge: 'Pro',
  },
  {
    id: 'ai-advisor',
    label: 'AI Business Advisor',
    icon: <Sparkles className="h-4 w-4 text-primary" />,
    badge: 'Pro',
  },
  {
    id: 'pajak',
    label: 'Estimasi Pajak UMKM',
    icon: <Receipt className="h-4 w-4" />,
    badge: 'Starter+',
  },
  {
    id: 'ekspansi',
    label: 'Kelayakan Cabang Baru',
    icon: <Building2 className="h-4 w-4" />,
    badge: 'Pro',
  },
  {
    id: 'pinjaman',
    label: 'Simulasi Pinjaman',
    icon: <CreditCard className="h-4 w-4" />,
    badge: 'Pro',
  },
  // --- Akun ---
  {
    id: 'skenario',
    label: 'Skenario Tersimpan',
    icon: <Layers className="h-4 w-4" />,
    section: 'Akun',
  },
];

interface PortalLayoutProps {
  activeModule: string;
  account?: Account;
  children: React.ReactNode;
}

export default function PortalLayout({ activeModule, account, children }: PortalLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('yastar_sidebar_collapsed');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // ignore
    }
    return true; // Default tertutup (collapsed) saat awal dibuka
  });

  const { session, logout } = useOwnerAuth();
  const [, navigate] = useLocation();

  function toggleCollapse() {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('yastar_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  function handleNav(id: string) {
    navigate(`/user-portal/${id}`);
    setMobileOpen(false);
  }

  const activeNav = NAV_ITEMS.find((item) => item.id === activeModule);

  const usageLabel = account
    ? account.scenarioLimit === null
      ? `${account.scenarioCount} skenario`
      : `${account.scenarioCount} / ${account.scenarioLimit} skenario`
    : null;

  const renderSidebarContent = (collapsed: boolean) => (
    <div className="flex flex-col h-full select-none">
      {/* Header / Logo */}
      <div className={cn(
        "flex items-center h-14 border-b border-border transition-all px-3.5",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <a href={basePath || '/'} className="flex items-center gap-2.5 overflow-hidden">
          <img src={`${basePath}/logo.svg`} alt="Yastar" className="h-7 w-7 rounded-lg shrink-0" />
          {!collapsed && (
            <span className="font-bold tracking-tight text-sm truncate">Yastar</span>
          )}
        </a>

        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
            onClick={toggleCollapse}
            title="Sembunyikan Sidebar"
            data-testid="button-collapse-sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-1">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = activeModule === item.id;
          const prevItem = NAV_ITEMS[idx - 1];
          const showSection = item.section && item.section !== prevItem?.section;

          const buttonContent = (
            <button
              onClick={() => handleNav(item.id)}
              className={cn(
                'w-full flex items-center rounded-md text-sm transition-colors text-left',
                collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2',
                isActive
                  ? 'bg-primary text-primary-foreground font-medium shadow-xs'
                  : 'text-foreground/75 hover:bg-accent hover:text-foreground',
              )}
              data-testid={`nav-${item.id}`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto shrink-0 opacity-70" />}
                </>
              )}
            </button>
          );

          return (
            <div key={item.id}>
              {showSection && (
                collapsed ? (
                  <div className="my-2 border-t border-border/60 mx-1" />
                ) : (
                  <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {item.section}
                  </p>
                )
              )}

              {collapsed ? (
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-primary-foreground/20 text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </TooltipContent>
                </Tooltip>
              ) : (
                buttonContent
              )}
            </div>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-border p-2.5">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {(session?.businessName ?? session?.email ?? 'Y')[0].toUpperCase()}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium text-xs">{session?.businessName ?? session?.email}</p>
                {account && <p className="text-[10px] opacity-80">{TIER_LABELS[account.tier]}</p>}
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => logout()}
                  data-testid="button-sign-out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Keluar</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{session?.businessName ?? session?.email}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {account && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                      {TIER_LABELS[account.tier]}
                    </Badge>
                  )}
                  {usageLabel && (
                    <span className="text-[10px] text-muted-foreground">{usageLabel}</span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground text-xs h-8"
              onClick={() => logout()}
              data-testid="button-sign-out"
            >
              <LogOut className="h-3.5 w-3.5 mr-2" /> Keluar
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden" data-testid="portal-layout">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col shrink-0 border-r border-border bg-card transition-all duration-200 ease-in-out',
          isCollapsed ? 'w-[68px]' : 'w-60',
        )}
      >
        {renderSidebarContent(isCollapsed)}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-50 flex flex-col w-64 bg-card border-r border-border h-full shadow-xl">
            <button
              className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-accent text-muted-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            {renderSidebarContent(false)}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header Topbar */}
        <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-card shrink-0 gap-3">
          <div className="flex items-center gap-3">
            {/* Desktop Expand Button when Collapsed */}
            {isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={toggleCollapse}
                title="Buka Sidebar"
                data-testid="button-expand-sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(true)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <span className="font-semibold text-sm tracking-tight text-foreground">
              {activeNav?.label ?? 'User Portal'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {account && (
              <Badge variant="secondary" className="text-xs font-normal">
                {TIER_LABELS[account.tier]}
              </Badge>
            )}
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

