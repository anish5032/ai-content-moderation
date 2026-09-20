import { ArrowUpRight, Clock3, Flag, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DemoNotice, PageHeader } from '../components/platform/PageHeader';
import { MetricCard, Panel } from '../components/platform/MetricCard';
import { RiskPill } from '../components/platform/StatusPill';
import { demoDashboardActivity, demoDashboardMetrics, demoProcessingStatus } from '../data/demo/dashboard';
import { demoReviews } from '../data/demo/reviews';

const activityTone = {
  safe: 'bg-low', moderate: 'bg-moderate', high: 'bg-high', critical: 'bg-critical', accent: 'bg-accent'
};

export function Dashboard() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Operations overview"
        title="Moderation at a glance"
        description="A demo workspace for monitoring content safety operations across video, review, and model surfaces."
        actions={<Link to="/moderation" className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-card hover:bg-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">Open moderation <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>} />
      <DemoNotice />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {demoDashboardMetrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <Panel title="Recent moderation activity" eyebrow="Live surface">
          <div className="divide-y divide-line-soft">
            {demoDashboardActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${activityTone[item.tone]}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{item.label}</p>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">{item.detail}</p>
                </div>
                <span className="shrink-0 text-[11px] text-ink-faint">{item.time}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Processing status" eyebrow="Demo volume">
          <div className="space-y-3">
            {demoProcessingStatus.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-ink-muted">{item.label}</span>
                  <span className="font-mono font-semibold text-ink">{item.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-raised"><div className={`h-full rounded-full ${item.tone}`} style={{ width: `${item.value}%` }} /></div>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-[11px] text-ink-faint"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> No processing jobs are connected.</p>
        </Panel>
      </div>

      <Panel title="Recent flagged events" eyebrow="Review workload" action={<Link to="/reviews" className="text-xs font-semibold text-accent hover:text-accent/80">View queue</Link>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead><tr className="border-b border-line text-[10px] uppercase tracking-wider text-ink-faint"><th className="pb-2 font-semibold">Event</th><th className="pb-2 font-semibold">Severity</th><th className="pb-2 font-semibold">Action</th><th className="pb-2 text-right font-semibold">Status</th></tr></thead>
            <tbody>{demoReviews.slice(0, 3).map((review) => <tr key={review.id} className="border-b border-line-soft last:border-0"><td className="py-3"><p className="text-sm font-medium text-ink">{review.threat}</p><p className="mt-0.5 text-[11px] text-ink-faint">{review.modality} · {review.timestamp}</p></td><td className="py-3"><RiskPill level={review.severity} /></td><td className="py-3 text-xs text-ink-muted"><span className="inline-flex items-center gap-1.5"><Flag className="h-3.5 w-3.5" aria-hidden="true" />{review.action}</span></td><td className="py-3 text-right"><span className="text-xs text-ink-muted">{review.status}</span></td></tr>)}</tbody>
          </table>
        </div>
      </Panel>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/videos" className="group rounded-xl border border-line bg-surface p-4 shadow-card transition-colors hover:border-accent/30 hover:bg-accent/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent"><PlayCircle className="h-4 w-4" aria-hidden="true" /></span><div><p className="text-sm font-semibold text-ink">Browse demo video library</p><p className="mt-0.5 text-xs text-ink-muted">Inspect processing and moderation status.</p></div><ArrowUpRight className="ml-auto h-4 w-4 text-ink-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></div></Link>
        <Link to="/mlops" className="group rounded-xl border border-line bg-surface p-4 shadow-card transition-colors hover:border-accent/30 hover:bg-accent/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-moderate/10 text-moderate"><Clock3 className="h-4 w-4" aria-hidden="true" /></span><div><p className="text-sm font-semibold text-ink">Inspect model monitoring</p><p className="mt-0.5 text-xs text-ink-muted">Placeholder health and evaluation surfaces.</p></div><ArrowUpRight className="ml-auto h-4 w-4 text-ink-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></div></Link>
      </div>
    </div>
  );
}
