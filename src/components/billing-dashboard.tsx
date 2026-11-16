import { useState } from 'react';
import { BadgePercent, Minus, Plus, ShoppingBag, Banknote, BarChart3, Check, ChevronLeft, ChevronRight, CircleHelp, Clock, CreditCard, Hash, IndianRupee, Printer, Receipt, Smartphone, Users, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { DiningIcon, TablesIcon } from './cafe-icons';
import { CafeHeader, BottomNav, EmptyState, SearchBar, SectionLabel, StatCard, Totals, VegMark, type IconType, type Tone } from './cafe-shared';
import { foods, money, pad2, type Food } from '@/lib/cafe-data';

type Line = { food: Food; qty: number };
type Table = { id: number; seats: number; status: string; time: string; lines: Line[] };
type View = 'Tables' | 'Invoices' | 'Overview';
const VIEWS: { key: View; icon: IconType; tone: Tone }[] = [
  { key: 'Tables', icon: TablesIcon, tone: 'red' },
  { key: 'Invoices', icon: Receipt, tone: 'green' },
  { key: 'Overview', icon: BarChart3, tone: 'blue' },
];
const FILTERS = ['All tables', 'Available', 'Occupied'] as const;
const FILTER_HEADING: Record<string, string> = { 'All tables': 'on the floor', Available: 'ready for guests', Occupied: 'dining right now' };
const METHODS: { key: string; icon: IconType; hint: string }[] = [
  { key: 'UPI', icon: Smartphone, hint: 'Scan & pay' },
  { key: 'Card', icon: CreditCard, hint: 'Tap or swipe' },
  { key: 'Cash', icon: Banknote, hint: 'At the counter' },
];
const INVOICES = [
  { table: 3, method: 'UPI', amount: 1047 },
  { table: 9, method: 'Cash', amount: 597 },
  { table: 4, method: 'UPI', amount: 249 },
  { table: 2, method: 'Cash', amount: 686 },
];
const FAVOURITE_COUNTS = [18, 15, 12, 9];

const toneOf = (s: string): Tone => (s === 'Available' ? 'green' : 'amber');
const labelOf = (s: string) => s;
const sumOf = (ls: Line[]) => ls.reduce((a, l) => a + l.food.price * l.qty, 0);
const SAMPLE: Line[][] = [[{ food: foods[0], qty: 2 }, { food: foods[1], qty: 1 }], [{ food: foods[2], qty: 1 }, { food: foods[4], qty: 2 }], [{ food: foods[3], qty: 1 }, { food: foods[5], qty: 2 }]];

const initialTables: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  seats: [2, 4, 4, 2, 6, 4, 4, 2, 6, 4, 2, 4][i] ?? 4,
  status: [1, 4, 5, 7, 10].includes(i) ? 'Available' : 'Occupied',
  lines: [1, 4, 5, 7, 10].includes(i) ? [] : (SAMPLE[i % 3] ?? []),
  time: ['24 min', '', '42 min', '12 min', '', '', '18 min', '', '35 min', '28 min', '', '16 min'][i] ?? '',
}));

export function BillingDashboard() {
  const [tables, setTables] = useState(initialTables);
  const [filter, setFilter] = useState<string>('All tables');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Table | null>(null);
  const [invoice, setInvoice] = useState(false);
  const [pay, setPay] = useState(false);
  const [method, setMethod] = useState('UPI');
  const [paid, setPaid] = useState(false);
  const [view, setView] = useState<View>('Tables');
  const [help, setHelp] = useState(false);

  const [ordering, setOrdering] = useState<null | 'seat' | 'more'>(null);
  const [cart, setCart] = useState<Record<number, number>>({});
  const lines: Line[] = selected?.lines ?? [];
  const subtotal = sumOf(lines);
  const total = subtotal * 1.05;
  const countOf = (s: string) => (s === 'All tables' ? tables.length : tables.filter((t) => t.status === s).length);
  const digits = search.replace(/\D/g, '');
  const visible = tables.filter((t) => (filter === 'All tables' || t.status === filter) && (!digits || String(t.id).includes(String(Number(digits)))));
  const goView = (v: View) => { setView(v); setSelected(null); };

  const openMenu = (mode: 'seat' | 'more') => { setCart({}); setOrdering(mode); };
  const cartLines: Line[] = foods.filter((f) => (cart[f.id] ?? 0) > 0).map((f) => ({ food: f, qty: cart[f.id] ?? 0 }));
  const bump = (id: number, d: number) => setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + d) }));
  const confirmOrder = () => {
    if (!selected || cartLines.length === 0) return;
    const merged = [...selected.lines];
    cartLines.forEach((cl) => {
      const i = merged.findIndex((l) => l.food.id === cl.food.id);
      if (i >= 0) merged[i] = { food: cl.food, qty: (merged[i]?.qty ?? 0) + cl.qty };
      else merged.push(cl);
    });
    const seating = ordering === 'seat';
    const next: Table = { ...selected, status: 'Occupied', time: seating ? 'Just seated' : selected.time, lines: merged };
    setTables((prev) => prev.map((x) => (x.id === next.id ? next : x)));
    setSelected(next);
    setOrdering(null);
    toast.success(seating ? `Table ${pad2(next.id)} seated` : `Items added · Table ${pad2(next.id)}`, { description: `${cartLines.reduce((a, l) => a + l.qty, 0)} items · ${money(sumOf(cartLines))}` });
  };
  const recordPayment = () => {
    setPaid(true);
    toast.success(`Payment received · Table ${selected ? pad2(selected.id) : ''}`, { description: `${method} · ${money(total)}` });
    setTables((prev) => prev.map((t) => (t.id === selected?.id ? { ...t, status: 'Available', lines: [], time: '' } : t)));
  };

  const heading = view === 'Tables'
    ? { title: 'Tables', sub: 'A smooth service starts with a clear view.' }
    : view === 'Invoices'
      ? { title: 'Invoices', sub: 'Every bill, neatly in one place.' }
      : { title: 'Today’s overview', sub: 'A good day, by the numbers.' };

  return (
    <>
      <CafeHeader />
      <div className="billing-layout">
        <aside className="billing-sidebar">
          <span className="sidebar-eyebrow">Menu</span>
          {VIEWS.map((v) => (
            <button type="button" key={v.key} className={view === v.key ? 'side-link active' : 'side-link'} aria-current={view === v.key ? 'page' : undefined} onClick={() => goView(v.key)}>
              <span className="side-ico"><v.icon size={19} /></span>{v.key}
              {v.key === 'Tables' ? <span className="side-count">{countOf('Occupied')}</span> : null}
            </button>
          ))}
          <div className="sidebar-bottom">
            <button type="button" className="help-card" onClick={() => setHelp(true)}>
              <CircleHelp size={20} />
              <span><strong>Need a hand?</strong><small>How this demo works</small></span>
            </button>
            <div className="staff-profile"><span className="avatar sm">SC</span><div><strong>Cafe manager</strong><small>Restaurant</small></div></div>
          </div>
        </aside>

        <main className="billing-main">
          {!selected ? (
            <BottomNav className="mobile-only" active={view} onSelect={(k) => goView(k as View)} items={VIEWS.map((v) => ({ key: v.key, label: v.key, icon: v.icon, tone: v.tone }))} />
          ) : null}

          {selected ? (
            <TableDetail table={selected} lines={lines} subtotal={subtotal} onBack={() => setSelected(null)} onSeat={() => openMenu('seat')} onMore={() => openMenu('more')} onInvoice={() => setInvoice(true)} onPay={() => { setPaid(false); setPay(true); }} />
          ) : (
            <>
              <div className="page-head">
                <div className="page-title">
                  <h1>{heading.title}</h1>
                  <p>{heading.sub}</p>
                </div>
                <div className="page-actions">
                  <span className="date-label">Saturday, 14 November 2026</span>
                  <button type="button" className="round-btn mobile-only" aria-label="How this demo works" onClick={() => setHelp(true)}><CircleHelp /></button>
                </div>
              </div>

              {view === 'Tables' ? (
                <>
                  <SectionLabel title="Floor at a glance" />
                  <div className="stat-row three">
                    <StatCard icon={TablesIcon} tone="blue" label="Total tables" value={pad2(tables.length)} />
                    <StatCard icon={Check} tone="green" label="Available" value={pad2(countOf('Available'))} />
                    <StatCard icon={Users} tone="amber" label="Occupied" value={pad2(countOf('Occupied'))} />
                  </div>
                  <div className="table-controls">
                    <div className="chip-row" role="group" aria-label="Filter tables">
                      {FILTERS.map((f) => (
                        <button type="button" key={f} aria-pressed={filter === f} className={filter === f ? 'chip active' : 'chip'} onClick={() => setFilter(f)}>
                          {f !== 'All tables' ? <i className={`chip-dot ${toneOf(f)}`} /> : null}
                          {labelOf(f)}
                          <span className="chip-count">{countOf(f)}</span>
                        </button>
                      ))}
                    </div>
                    <SearchBar value={search} onChange={setSearch} label="Search tables" placeholder="Search “table 7”" />
                  </div>
                  <SectionLabel title={`${visible.length} ${visible.length === 1 ? 'table' : 'tables'} ${FILTER_HEADING[filter] ?? ''}`} />
                  <div className="tables-grid">{visible.map((t) => <TableCard key={t.id} table={t} onOpen={() => setSelected(t)} />)}</div>
                  {visible.length === 0 ? <EmptyState icon={TablesIcon} title="No tables found" description="Try another table number or status." /> : null}
                </>
              ) : view === 'Invoices' ? (
                <>
                  <SectionLabel title="Recent invoices" action={<span className="status-tag green">{INVOICES.length} paid</span>} />
                  <div className="invoice-list">
                    {INVOICES.map((inv, i) => (
                      <button type="button" className="invoice-row" key={inv.table} onClick={() => { setSelected(tables[inv.table - 1] ?? null); setInvoice(true); }}>
                        <span className="invoice-icon"><Receipt size={22} /></span>
                        <span className="invoice-info"><strong>#SC-{1039 - i}</strong><small>Table {pad2(inv.table)} · Today · {inv.method}</small></span>
                        <span className="invoice-amount"><strong>{money(inv.amount)}</strong><span className="status-tag green">Paid</span></span>
                        <ChevronRight className="chev" size={20} />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="stat-row three">
                    <StatCard icon={IndianRupee} tone="green" label="Revenue today" value="₹12,480" />
                    <StatCard icon={Receipt} tone="blue" label="Paid bills" value="24" />
                    <StatCard icon={Users} tone="amber" label="Guests served" value="68" />
                  </div>
                  <SectionLabel title="Today’s favourites" action="By items ordered" />
                  <div className="fav-grid">
                    {foods.slice(0, 4).map((f, i) => (
                      <div className="fav-tile" key={f.id}>
                        <span className="fav-rank">#{i + 1}</span>
                        <img src={f.image} alt={f.name} width={112} height={112} loading="lazy" />
                        <strong><VegMark veg={f.veg} />{f.name}</strong>
                        <small>{FAVOURITE_COUNTS[i] ?? 0} ordered today</small>
                        <b>{money(f.price * (FAVOURITE_COUNTS[i] ?? 0))}</b>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
          <footer className="staff-footer">Billing workspace <span>·</span> Demo data</footer>
        </main>
      </div>

      <Dialog open={invoice} onOpenChange={setInvoice}>
        <DialogContent className="invoice-dialog">
          <DialogTitle>Invoice preview</DialogTitle>
          <DialogDescription>Table {selected ? pad2(selected.id) : ''} · Dine-in</DialogDescription>
          <div className="print-invoice">
            <div className="receipt-brand">cafe</div>
            <p className="receipt-tagline">Good food. Good mood.</p>
            <div className="invoice-meta"><span>Invoice #SC-1042</span><span>14 Nov 2026</span></div>
            <div className="invoice-meta"><span>Table {selected ? pad2(selected.id) : ''}</span><span>12:45 PM</span></div>
            <hr />
            {lines.map((l) => (
              <div className="invoice-line" key={l.food.id}><span>{l.qty} × {l.food.name}</span><span>{money(l.qty * l.food.price)}</span></div>
            ))}
            <Totals subtotal={subtotal} />
            <p className="invoice-thanks">Thank you for dining with us ♡</p>
          </div>
          <button type="button" className="z-cta ink" onClick={() => window.print()}><Printer />Print bill</button>
        </DialogContent>
      </Dialog>

      <Dialog open={pay} onOpenChange={setPay}>
        <DialogContent className="pay-dialog">
          {paid ? (
            <>
              <div className="success-icon"><Check size={32} /></div>
              <DialogTitle className="text-center">Payment recorded</DialogTitle>
              <DialogDescription className="text-center">Table {selected ? pad2(selected.id) : ''} is ready for its next guests. This was a demo payment.</DialogDescription>
              <button type="button" className="z-cta" onClick={() => { setPay(false); setSelected(null); }}>Back to tables<ChevronRight /></button>
            </>
          ) : (
            <>
              <DialogTitle>Collect payment</DialogTitle>
              <DialogDescription>Table {selected ? pad2(selected.id) : ''} · Invoice #SC-1042</DialogDescription>
              <div className="payment-amount"><small>Total payable</small><strong>{money(total)}</strong></div>
              <div className="saving-strip"><BadgePercent />GST 5% is included in this total</div>
              <h4 className="sheet-label">Payment method</h4>
              <div className="method-grid">
                {METHODS.map((m) => (
                  <button type="button" key={m.key} aria-pressed={method === m.key} className={method === m.key ? 'method active' : 'method'} onClick={() => setMethod(m.key)}>
                    <span><m.icon size={22} /></span>
                    <strong>{m.key}</strong>
                    <small>{m.hint}</small>
                  </button>
                ))}
              </div>
              <button type="button" className="z-cta" onClick={recordPayment}><Check />Record {method} payment · {money(total)}</button>
              <small className="mock-caption">No real payment will be processed.</small>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={ordering !== null} onOpenChange={(o) => { if (!o) setOrdering(null); }}>
        <DialogContent className="order-dialog">
          <DialogTitle>{ordering === 'seat' ? 'Seat guests · Take order' : 'Add more items'}</DialogTitle>
          <DialogDescription>Table {selected ? pad2(selected.id) : ''} · {ordering === 'seat' ? 'Pick dishes to start the order' : 'Added to the current order'}</DialogDescription>
          <div className="order-menu">
            {foods.map((f) => {
              const q = cart[f.id] ?? 0;
              return (
                <div className="order-row" key={f.id}>
                  <img src={f.image} alt={f.name} width={56} height={56} loading="lazy" />
                  <div className="order-info"><strong><VegMark veg={f.veg} />{f.name}</strong><small>{f.category} · {money(f.price)}</small></div>
                  {q === 0 ? (
                    <button type="button" className="order-add" onClick={() => bump(f.id, 1)}>Add<Plus size={15} /></button>
                  ) : (
                    <div className="order-stepper">
                      <button type="button" aria-label={`Remove one ${f.name}`} onClick={() => bump(f.id, -1)}><Minus size={15} /></button>
                      <span>{q}</span>
                      <button type="button" aria-label={`Add one ${f.name}`} onClick={() => bump(f.id, 1)}><Plus size={15} /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button type="button" className="z-cta" disabled={cartLines.length === 0} onClick={confirmOrder}>
            <Check />{cartLines.length === 0 ? 'Select items to continue' : `Confirm order · ${money(sumOf(cartLines))}`}
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent>
          <DialogTitle>Your cafe workspace</DialogTitle>
          <DialogDescription>This is a demo with sample tables, invoices and payments. No real orders or payments are processed.</DialogDescription>
          <button type="button" className="z-cta" onClick={() => setHelp(false)}>Got it</button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TableCard({ table: t, onOpen }: { table: Table; onOpen: () => void }) {
  const tone = toneOf(t.status);
  const total = sumOf(t.lines);
  return (
    <button type="button" className={`table-card tone-${tone}`} onClick={onOpen} aria-label={`Table ${pad2(t.id)}, ${labelOf(t.status)}, ${t.seats} seats`}>
      <div className="table-visual">
        {total > 0 ? <span className="visual-tag"><Receipt size={13} />{money(total)}</span> : null}
        <div className="table-diagram"><i /><i /><span><DiningIcon size={22} /></span><i /><i /></div>
        <span className="visual-strip"><i />{labelOf(t.status)}</span>
      </div>
      <div className="table-body">
        <div className="table-title"><h3>Table {pad2(t.id)}</h3><span className="seat-pill"><Users size={13} />{t.seats}</span></div>
        <p className="status-line">{t.status === 'Available' ? <><Check size={15} />Ready for guests</> : <><Zap size={15} />Seated {t.time}{t.time === 'Just seated' ? '' : ' ago'}</>}</p>
        <span className="card-link">{t.status === 'Available' ? 'Seat guests' : 'View bill'}<ChevronRight size={17} /></span>
      </div>
    </button>
  );
}

function TableDetail({ table: t, lines, subtotal, onBack, onSeat, onMore, onInvoice, onPay }: { table: Table; lines: Line[]; subtotal: number; onBack: () => void; onSeat: () => void; onMore: () => void; onInvoice: () => void; onPay: () => void }) {
  const tone = toneOf(t.status);
  const available = t.status === 'Available';
  return (
    <div className={`detail tone-${tone}`}>
      <div className="detail-top">
        <button type="button" className="round-btn" aria-label="Back to tables" onClick={onBack}><ChevronLeft /></button>
        <span className="detail-crumb">Tables <ChevronRight size={14} /> Table {pad2(t.id)}</span>
      </div>

      <section className="detail-hero">
        <span className="soft-chip"><DiningIcon size={15} />{labelOf(t.status)}</span>
        <div className="detail-hero-row">
          <h1>Table {pad2(t.id)}</h1>
          <div className="guest-pill"><strong><Users size={16} />{t.seats}</strong><small>{available ? 'seats' : 'guests'}</small></div>
        </div>
        {available ? (
          <p className="meta-line accent"><Zap />Ready for new guests</p>
        ) : (
          <>
            <p className="meta-line"><Hash />Order #1042 · Dine-in</p>
            <p className="meta-line accent"><Clock /><span><strong>Seated {t.time}{t.time === 'Just seated' ? '' : ' ago'}</strong> · All items served</span></p>
            <div className="check-row"><span className="check-chip"><Check />All items served</span><span className="check-chip"><Check />GST included</span></div>
          </>
        )}
      </section>

      {available ? (
        <div className="panel seat-panel">
          <EmptyState title="Ready for new guests" description={`Table ${t.id} is set for ${t.seats} guests.`} icon={DiningIcon} />
          <button type="button" className="z-cta" onClick={onSeat}><ShoppingBag />Seat guests & take order</button>
        </div>
      ) : (
        <>
          <div className="table-detail-grid">
            <section className="panel">
              <div className="panel-head"><h2>Ordered items</h2><button type="button" className="z-btn-soft add-more" onClick={onMore}><Plus size={16} />Add items</button></div>
              {lines.map((l) => (
                <div className="menu-item" key={l.food.id}>
                  <div className="menu-item-info">
                    <VegMark veg={l.food.veg} />
                    <h4>{l.food.name}</h4>
                    <p className="price">{money(l.food.price)} <span>× {l.qty} = {money(l.food.price * l.qty)}</span></p>
                    <small>{l.food.description}</small>
                  </div>
                  <div className="menu-item-media">
                    <img src={l.food.image} alt={l.food.name} width={118} height={118} loading="lazy" />
                    <span className="qty-pill">Qty {l.qty}</span>
                  </div>
                </div>
              ))}
              <div className="panel-head spaced"><h2>Table activity</h2></div>
              <div className="timeline">
                <div className="activity"><span><Check size={16} /></span><div><strong>Order #1042 served</strong><small>All items delivered to the table · 12:42 PM</small></div></div>
                <div className="activity"><span><DiningIcon size={16} /></span><div><strong>Guests seated</strong><small>{t.seats} guests · 12:15 PM</small></div></div>
              </div>
            </section>
            <aside className="panel bill-summary">
              <h2>Bill summary</h2>
              <p>Table {pad2(t.id)} · Order #1042</p>
              <Totals subtotal={subtotal} />
              <div className="saving-strip"><BadgePercent />GST 5% is included in this bill</div>
              <div className="bill-actions">
                <button type="button" className="z-btn-soft" onClick={onInvoice}><Receipt />Preview invoice</button>
                <button type="button" className="z-cta collect" onClick={onPay}><CreditCard />Collect payment</button>
              </div>
              <small className="mock-caption">Demo payment · No money is charged</small>
            </aside>
          </div>
          <div className="detail-cta-bar">
            <p className="cta-bar-note"><BadgePercent size={16} />GST included · Demo payment, no money is charged</p>
            <button type="button" className="cta-bar" onClick={onPay}>
              <span><strong>{money(subtotal * 1.05)}</strong><small>Total payable</small></span>
              <span>Collect payment<ChevronRight size={20} /></span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
