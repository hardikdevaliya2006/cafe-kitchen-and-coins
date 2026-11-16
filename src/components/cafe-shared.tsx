import { Link, useRouterState } from '@tanstack/react-router';
import type { ComponentType, ReactNode } from 'react';
import { ChevronRight, ReceiptText, Search, ShoppingBag, X } from 'lucide-react';
import { KitchenIcon } from './cafe-icons';
import { money, type Food } from '@/lib/cafe-data';

export type IconType = ComponentType<{ size?: number; className?: string }>;
export type Tone = 'red' | 'amber' | 'green' | 'blue' | 'muted';

export function Brand() {
  return (
    <Link to="/kitchen" className="brand" aria-label="Cafe, go to the kitchen">
      <span className="brand-word">cafe</span>
      <span className="brand-sub">Good food. Good mood.</span>
    </Link>
  );
}

export function CafeHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <ScreenSwitcher />
        <div className="header-end">
          <span className="live-pill"><i className="live-dot" /><span className="live-text">Open now</span></span>
          <span className="avatar" title="Cafe manager" aria-label="Signed in as cafe manager">SC</span>
        </div>
      </div>
    </header>
  );
}

export function VegMark({ veg }: { veg: boolean }) {
  return <span className={veg ? 'veg-mark veg' : 'veg-mark nonveg'} role="img" aria-label={veg ? 'Vegetarian' : 'Non-vegetarian'}><i /></span>;
}

export function FoodThumb({ food }: { food: Food }) {
  return <img className="food-thumb" src={food.image} alt={food.name} width={64} height={64} loading="lazy" />;
}

export function EmptyState({ title, description, icon: Icon = ShoppingBag }: { title: string; description: string; icon?: IconType | undefined }) {
  return (
    <div className="empty-state">
      <span><Icon size={30} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function Totals({ subtotal }: { subtotal: number }) {
  return (
    <div className="totals">
      <div><span>Item total</span><span>{money(subtotal)}</span></div>
      <div><span>GST (5%)</span><span>{money(subtotal * 0.05)}</span></div>
      <div className="grand-total"><span>Total amount</span><strong>{money(subtotal * 1.05)}</strong></div>
    </div>
  );
}

export function SectionLabel({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="section-label">
      <h2>{title}</h2>
      {action ? <span className="section-action">{action}</span> : null}
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <label className="z-search">
      <Search className="z-search-icon" size={21} />
      <input type="search" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {value ? (
        <button type="button" aria-label="Clear search" onClick={() => onChange('')}><X size={18} /></button>
      ) : null}
    </label>
  );
}

export function Banner({ tone, tag, icon: Icon, children, action }: { tone: 'amber' | 'orange'; tag: string; icon: IconType; children: ReactNode; action?: { label: string; onClick: () => void } | undefined }) {
  return (
    <div className={`z-banner tone-${tone}`} role="status">
      <div className="z-banner-text">
        <span className="z-banner-tag">{tag}</span>
        <p>{children}</p>
        {action ? (
          <button type="button" className="z-banner-action" onClick={action.onClick}>{action.label}<ChevronRight size={16} /></button>
        ) : null}
      </div>
      <span className="z-banner-art" aria-hidden><Icon size={30} /></span>
    </div>
  );
}

export function StatCard({ icon: Icon, tone, label, value, unit }: { icon: IconType; tone: Tone; label: string; value: string; unit?: string | undefined }) {
  return (
    <div className="stat-card">
      <span className={`stat-icon tone-${tone}`}><Icon size={20} /></span>
      <div>
        <strong>{value}{unit ? <small>{unit}</small> : null}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

export type TabItem = { key: string; label: string; icon: IconType; tone: Tone; badge?: number | undefined };

// Zomato-style category row: tinted icon circles, label, green underline on the active one.
export function CategoryTabs({ items, active, onSelect, className }: { items: TabItem[]; active: string; onSelect: (k: string) => void; className?: string | undefined }) {
  return (
    <div className={className ? `cat-tabs ${className}` : 'cat-tabs'} role="tablist" aria-label="Sections">
      {items.map((it) => (
        <button key={it.key} type="button" role="tab" aria-selected={active === it.key} className={active === it.key ? 'cat-tab active' : 'cat-tab'} onClick={() => onSelect(it.key)}>
          <span className={`cat-icon tone-${it.tone}`}>
            <it.icon size={22} />
            {it.badge ? <span className="cat-badge">{it.badge}</span> : null}
          </span>
          <span className="cat-label">{it.label}</span>
        </button>
      ))}
    </div>
  );
}

// Workspace switch: centred in the header on desktop, floating dark-pill bar at the bottom on phones.
export function ScreenSwitcher() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const active = path.startsWith('/billing') ? 'billing' : path.startsWith('/kitchen') ? 'kitchen' : null;
  if (!active) return null;
  const tap = () => { try { navigator.vibrate?.(8); } catch { /* not supported */ } };
  return (
    <nav className={`screen-switch is-${active}`} aria-label="Workspace">
      <span className="switch-thumb" aria-hidden />
      {([['kitchen', '/kitchen', KitchenIcon, 'Kitchen'], ['billing', '/billing', ReceiptText, 'Billing']] as const).map(([k, to, I, l]) => (
        <Link key={k} to={to} onPointerDown={tap} aria-current={active === k ? 'page' : undefined}>
          <span className="switch-ico" key={active === k ? 'on' : 'off'}><I size={20} /></span>
          <span className="switch-label">{l}</span>
        </Link>
      ))}
    </nav>
  );
}

// iOS-style floating bottom navigation with a sliding active pill.
export function BottomNav({ items, active, onSelect, className }: { items: TabItem[]; active: string; onSelect: (k: string) => void; className?: string | undefined }) {
  const idx = Math.max(0, items.findIndex((i) => i.key === active));
  const tap = () => { try { navigator.vibrate?.(6); } catch { /* not supported */ } };
  return (
    <nav className={className ? `bottom-nav ${className}` : 'bottom-nav'} aria-label="Sections" style={{ ['--n' as string]: items.length, ['--i' as string]: idx }}>
      <span className="bottom-thumb" aria-hidden />
      {items.map((it) => (
        <button key={it.key} type="button" aria-current={active === it.key ? 'page' : undefined} className={active === it.key ? 'bottom-tab active' : 'bottom-tab'} onPointerDown={tap} onClick={() => onSelect(it.key)}>
          <span className="bottom-ico" key={active === it.key ? 'on' : 'off'}>
            <it.icon size={21} />
            {it.badge ? <span className="bottom-badge">{it.badge}</span> : null}
          </span>
          <span className="bottom-label">{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
