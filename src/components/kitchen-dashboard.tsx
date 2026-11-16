import { useState } from 'react';
import { ArrowRight, Bell, BellRing, Check, CheckCircle2, Clock, Flame, PackageCheck, RefreshCw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { DiningIcon, KitchenIcon } from './cafe-icons';
import { Banner, CafeHeader, BottomNav, EmptyState, FoodThumb, SearchBar, SectionLabel, StatCard, VegMark, type Tone } from './cafe-shared';
import { pad2, tickets, type Ticket } from '@/lib/cafe-data';

const STAGES = ['New Orders', 'Preparing', 'Ready', 'Completed'] as const;
type Stage = (typeof STAGES)[number];
const STAGE: Record<Stage, { tag: string; tone: Tone; heading: string; step: string }> = {
  'New Orders': { tag: 'New', tone: 'red', heading: 'fresh from the floor', step: 'Waiting to start' },
  Preparing: { tag: 'Preparing', tone: 'amber', heading: 'cooking right now', step: 'Cooking now' },
  Ready: { tag: 'Ready', tone: 'green', heading: 'ready for the table', step: 'At the pass' },
  Completed: { tag: 'Served', tone: 'muted', heading: 'served with love', step: 'Served' },
};
const stageOf = (s: string): Stage => ((STAGES as readonly string[]).includes(s) ? (s as Stage) : 'New Orders');

// Matches a table number ("7", "table 07"), an order number, or a dish name.
function matches(o: Ticket, q: string) {
  if (!q) return true;
  const digits = q.replace(/\D/g, '');
  if (digits && (String(o.table) === String(Number(digits)) || (digits.length >= 3 && String(o.id).includes(digits)))) return true;
  return o.items.some((l) => l.food.name.toLowerCase().includes(q));
}

export function KitchenDashboard() {
  const [orders, setOrders] = useState(tickets);
  const [tab, setTab] = useState<Stage>('New Orders');
  const [sound, setSound] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const count = (s: Stage) => orders.filter((o) => o.status === s).length;
  const q = query.trim().toLowerCase();
  const shown = orders.filter((o) => o.status === tab && matches(o, q));
  const waiting = count('New Orders');

  const advance = (o: Ticket) => {
    const next = STAGES[STAGES.indexOf(stageOf(o.status)) + 1];
    if (!next) return;
    setOrders((prev) => prev.map((t) => (t.id === o.id ? { ...t, status: next } : t)));
    toast.success(`Order #${o.id} · Table ${o.table}`, { description: next === 'Preparing' ? 'Accepted and moved to Preparing' : next === 'Ready' ? 'Marked ready for pickup' : 'Marked as served' });
  };
  const refresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 900); };

  return (
    <>
      <CafeHeader />
      <main className="staff-main">
        <div className="page-head">
          <div className="page-title">
            <h1>Kitchen</h1>
            <p>Saturday, 14 November · {count('New Orders') + count('Preparing')} orders on the go</p>
          </div>
          <div className="page-actions">
            <button type="button" className={sound ? 'round-btn' : 'round-btn is-off'} aria-label={sound ? 'Mute notifications' : 'Turn on notifications'} title={sound ? 'Mute notifications' : 'Turn on notifications'} onClick={() => setSound(!sound)}>{sound ? <Volume2 /> : <VolumeX />}</button>
            <button type="button" className="round-btn" aria-label="Refresh orders" title="Refresh orders" disabled={refreshing} onClick={refresh}><RefreshCw className={refreshing ? 'animate-spin' : ''} /></button>
          </div>
        </div>

        <SearchBar value={query} onChange={setQuery} label="Search orders" placeholder="Search “table 7” or “biryani”" />

        {waiting > 0 ? (
          <Banner tone="amber" tag="Needs you now" icon={BellRing} action={tab !== 'New Orders' ? { label: 'Show new orders', onClick: () => setTab('New Orders') } : undefined}>
            {waiting} new {waiting === 1 ? 'order is' : 'orders are'} waiting to be accepted.
          </Banner>
        ) : null}

        <div className="stat-row">
          <StatCard icon={DiningIcon} tone="blue" label="Orders today" value="32" />
          <StatCard icon={Bell} tone="red" label="Awaiting acceptance" value={pad2(waiting)} />
          <StatCard icon={KitchenIcon} tone="amber" label="In the kitchen" value={pad2(count('Preparing'))} />
          <StatCard icon={Clock} tone="green" label="Avg. preparation" value="18" unit="min" />
        </div>

        <BottomNav
          active={tab}
          onSelect={(k) => setTab(stageOf(k))}
          items={[
            { key: 'New Orders', label: 'New', icon: BellRing, tone: 'red', badge: count('New Orders') },
            { key: 'Preparing', label: 'Preparing', icon: Flame, tone: 'amber', badge: count('Preparing') },
            { key: 'Ready', label: 'Ready', icon: PackageCheck, tone: 'green', badge: count('Ready') },
            { key: 'Completed', label: 'Done', icon: CheckCircle2, tone: 'blue' },
          ]}
        />

        <SectionLabel title={`${shown.length} ${shown.length === 1 ? 'order' : 'orders'} ${STAGE[tab].heading}`} action={<><i className="live-dot" />Updated just now</>} />

        {refreshing ? (
          <>
            <p className="sparkle-note"><Sparkles size={18} />Fetching fresh orders…</p>
            <div className="ticket-grid">{[1, 2, 3].map((n) => <div className="ticket-skeleton" key={n}><span /><span /><span /></div>)}</div>
          </>
        ) : (
          <div className="ticket-grid">{shown.map((o) => <OrderTicket key={o.id} order={o} onAdvance={() => advance(o)} />)}</div>
        )}
        {!refreshing && shown.length === 0 ? (
          <EmptyState icon={KitchenIcon} title={q ? 'No matching orders' : 'All caught up!'} description={q ? `Nothing here matches “${query.trim()}”. Try a table number or dish.` : `No ${tab === 'Completed' ? 'served' : tab.toLowerCase()} orders right now.`} />
        ) : null}

        <footer className="staff-footer">Kitchen operations <span>·</span> Demo workspace</footer>
      </main>
    </>
  );
}

function OrderTicket({ order: o, onAdvance }: { order: Ticket; onAdvance: () => void }) {
  const stage = stageOf(o.status);
  const meta = STAGE[stage];
  const items = o.items.reduce((a, l) => a + l.qty, 0);
  return (
    <article className={`ticket tone-${meta.tone}`}>
      <header className="ticket-head">
        <div className="ticket-badge"><small>TABLE</small><strong>{pad2(o.table)}</strong></div>
        <div className="ticket-title">
          <h3>Table {pad2(o.table)}</h3>
          <p>Order #{o.id} · {items} {items === 1 ? 'item' : 'items'}</p>
          <span className="stage"><span className="stage-bar" data-step={STAGES.indexOf(stage) + 1} aria-hidden><i /></span>{meta.step}</span>
        </div>
        <span className={`status-tag ${meta.tone}`}>{meta.tag}</span>
      </header>
      <div className="ticket-time"><Clock size={14} />Placed {o.time}</div>
      <ul className="ticket-items">
        {o.items.map((l) => (
          <li key={l.food.id}>
            <FoodThumb food={l.food} />
            <div className="item-info">
              <span className="item-name"><VegMark veg={l.food.veg} /><span>{l.food.name}</span></span>
              <small>{l.food.category}</small>
            </div>
            <b className="item-qty">×{l.qty}</b>
          </li>
        ))}
      </ul>
      {o.note ? (
        <div className="cooking-note"><span><Flame size={13} />Cooking request</span><p>{o.note}</p></div>
      ) : (
        <p className="no-note">No cooking requests</p>
      )}
      <div className="ticket-foot">
        <button type="button" className={stage === 'Ready' ? 'z-cta ink' : 'z-cta'} disabled={stage === 'Completed'} onClick={onAdvance}>
          {stage === 'New Orders' ? <><Check />Accept &amp; start preparing</> : stage === 'Preparing' ? <><PackageCheck />Mark ready</> : stage === 'Ready' ? <>Mark served<ArrowRight /></> : <><CheckCircle2 />Served</>}
        </button>
      </div>
    </article>
  );
}
