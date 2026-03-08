
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import OverviewTab from './components/OverviewTab';
import {
  dailyVisitors,
  trafficSources,
  topPages,
  topCities,
  engagementData,
  pageEngagement,
  topSearchTerms,
  conversionFunnel,
  goalCompletions,
  browserData,
  deviceData,
  pageLoadTimes,
  coreWebVitals,
  errorData,
  behaviorFlow,
} from '../../mocks/adminAnalytics';
import MiniLineChart from './components/MiniLineChart';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);
type Tab =
  | 'overview'
  | 'traffic'
  | 'engagement'
  | 'conversions'
  | 'behavior'
  | 'technical'
  | 'moderation';
type DateRange = '7d' | '30d' | '90d';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'ri-dashboard-3-line' },
  { id: 'traffic', label: 'Traffic', icon: 'ri-bar-chart-2-line' },
  { id: 'engagement', label: 'Engagement', icon: 'ri-heart-pulse-line' },
  { id: 'conversions', label: 'Conversions', icon: 'ri-exchange-funds-line' },
  { id: 'behavior', label: 'Behavior', icon: 'ri-route-line' },
  { id: 'technical', label: 'Technical', icon: 'ri-cpu-line' },
  { id: 'moderation', label: 'Moderation', icon: 'ri-store-2-line' },
];

function DonutChart({
  data,
  size = 120,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const innerR = size * 0.24;
  let cumulative = 0;

  const slices = data.map((d) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
    return { path, color: d.color };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} />
      ))}
    </svg>
  );
}

function TrafficTab() {
  const [metric, setMetric] = useState<'visitors' | 'pageViews'>('visitors');
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-lg">Traffic Volume</h3>
            <p className="text-gray-400 text-sm">Daily trend over selected period</p>
          </div>
          <div className="flex gap-1 bg-gray-700 rounded-lg p-1">
            {(['visitors', 'pageViews'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  metric === m ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'visitors' ? 'Visitors' : 'Page Views'}
              </button>
            ))}
          </div>
        </div>
        <div className="h-36">
          <MiniLineChart
            data={dailyVisitors}
            metric={metric}
            color={metric === 'visitors' ? '#F97316' : '#14B8A6'}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold text-lg mb-5">Traffic Sources</h3>
          <div className="flex items-center gap-6">
            <DonutChart
              size={130}
              data={trafficSources.map((s) => ({
                label: s.source,
                value: s.percentage,
                color: s.color,
              }))}
            />
            <div className="flex-1 space-y-3">
              {trafficSources.map((s) => (
                <div key={s.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-gray-300 text-sm">{s.source}</span>
                  </div>
                  <span className="text-white text-sm font-semibold">{s.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold text-lg mb-5">Top Cities</h3>
          <div className="space-y-4">
            {topCities.map((c, i) => (
              <div key={c.city}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-4">{i + 1}</span>
                    <span className="text-gray-300 text-sm">{c.city}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs">{c.visitors.toLocaleString()}</span>
                    <span className="text-white text-sm font-semibold w-10 text-right">
                      {c.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${c.percentage * 4}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-white font-semibold text-lg mb-5">Top Referring Pages</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-gray-400 text-xs font-medium pb-3 uppercase tracking-wider">
                Page
              </th>
              <th className="text-left text-gray-400 text-xs font-medium pb-3 uppercase tracking-wider">
                URL
              </th>
              <th className="text-right text-gray-400 text-xs font-medium pb-3 uppercase tracking-wider">
                Views
              </th>
              <th className="text-right text-gray-400 text-xs font-medium pb-3 uppercase tracking-wider">
                % of Total
              </th>
              <th className="text-right text-gray-400 text-xs font-medium pb-3 uppercase tracking-wider">
                Trend
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {topPages.map((pg) => (
              <tr key={pg.page} className="hover:bg-gray-700/30 transition-colors">
                <td className="py-3 text-white text-sm font-medium">{pg.title}</td>
                <td className="py-3 text-gray-400 text-sm font-mono">{pg.page}</td>
                <td className="py-3 text-right text-gray-300 text-sm">
                  {pg.views.toLocaleString()}
                </td>
                <td className="py-3 text-right text-gray-300 text-sm">{pg.percentage}%</td>
                <td className="py-3 text-right">
                  <i
                    className={`text-sm ${
                      pg.trend === 'up' ? 'ri-arrow-up-line text-emerald-400' : 'ri-arrow-down-line text-red-400'
                    }`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EngagementTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Pages / Session',
            value: engagementData.pagesPerSession,
            icon: 'ri-pages-line',
            color: 'text-orange-400',
            bg: 'bg-orange-500/20',
          },
          {
            label: 'Avg. Time on Page',
            value: engagementData.avgTimeOnPage,
            icon: 'ri-time-line',
            color: 'text-teal-400',
            bg: 'bg-teal-500/20',
          },
          {
            label: 'Avg. Scroll Depth',
            value: `${engagementData.scrollDepth}%`,
            icon: 'ri-arrow-down-double-line',
            color: 'text-amber-400',
            bg: 'bg-amber-500/20',
          },
          {
            label: 'Return Visitor Rate',
            value: `${engagementData.returnVisitorRate}%`,
            icon: 'ri-user-follow-line',
            color: 'text-violet-400',
            bg: 'bg-violet-500/20',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
              <i className={`${stat.icon} text-xl ${stat.color}`}></i>
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-white text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-white font-semibold text-lg mb-5">Page Engagement Breakdown</h3>
        <div className="space-y-4">
          {pageEngagement.map((pg) => (
            <div
              key={pg.page}
              className="grid grid-cols-4 gap-4 items-center py-3 border-b border-gray-700/50 last:border-0"
            >
              <span className="text-gray-300 text-sm font-medium">{pg.page}</span>
              <div>
                <p className="text-gray-400 text-xs mb-1">Avg. Time</p>
                <p className="text-white text-sm font-semibold">{pg.avgTime}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Scroll Depth</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${pg.scrollDepth}%` }}
                    />
                  </div>
                  <span className="text-white text-xs font-semibold w-8">{pg.scrollDepth}%</span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Sessions</p>
                <p className="text-white text-sm font-semibold">{pg.sessions.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-white font-semibold text-lg mb-5">Top Search Terms</h3>
        <div className="grid grid-cols-2 gap-3">
          {topSearchTerms.map((t, i) => (
            <div key={t.term} className="flex items-center justify-between bg-gray-700/40 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-xs w-4">{i + 1}</span>
                <span className="text-gray-300 text-sm">{t.term}</span>
              </div>
              <span className="text-orange-400 text-sm font-semibold">{t.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConversionsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-white font-semibold text-lg mb-6">Conversion Funnel</h3>
        <div className="space-y-3">
          {conversionFunnel.map((step, i) => (
            <div key={step.step}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-gray-300 text-sm font-medium">{step.step}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm">{step.count.toLocaleString()} users</span>
                  <span className="text-white text-sm font-bold w-14 text-right">{step.rate}%</span>
                </div>
              </div>
              <div className="h-8 bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                  style={{ width: `${step.rate}%`, backgroundColor: step.color }}
                >
                  {step.rate > 15 && <span className="text-white text-xs font-semibold">{step.rate}%</span>}
                </div>
              </div>
              {i < conversionFunnel.length - 1 && (
                <div className="flex justify-end mt-1">
                  <span className="text-red-400 text-xs">
                    -{(conversionFunnel[i].rate - conversionFunnel[i + 1].rate).toFixed(1)}% drop-off
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold text-lg mb-5">Goal Completions</h3>
          <div className="space-y-5">
            {goalCompletions.map((g) => {
              const pct = Math.round((g.count / g.target) * 100);
              return (
                <div key={g.goal}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">{g.goal}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">
                        {g.count.toLocaleString()} / {g.target.toLocaleString()}
                      </span>
                      <span className="text-white text-sm font-bold">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: g.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold text-lg mb-5">Conversion Rates by Step</h3>
          <div className="space-y-3">
            {conversionFunnel.map((step) => (
              <div key={step.step} className="flex items-center justify-between bg-gray-700/40 rounded-xl px-4 py-3">
                <span className="text-gray-300 text-sm">{step.step}</span>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1.5 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${step.rate}%`, backgroundColor: step.color }}
                    />
                  </div>
                  <span className="text-white text-sm font-bold w-12 text-right">{step.rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BehaviorTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-white font-semibold text-lg mb-2">User Behavior Flow</h3>
        <p className="text-gray-400 text-sm mb-6">How users navigate through the site</p>
        <div className="flex items-stretch gap-0">
          {behaviorFlow.map((step, i) => (
            <div key={step.step} className="flex items-center flex-1">
              <div className="flex-1">
                <div
                  className="rounded-xl p-4 text-center border border-gray-600"
                  style={{ backgroundColor: `rgba(249,115,22,${0.08 + (step.users / 48320) * 0.25})` }}
                >
                  <p className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
                    Step {step.step}
                  </p>
                  <p className="text-white text-sm font-semibold mb-2">{step.name}</p>
                  <p className="text-white text-xl font-bold">{step.users.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs mt-1">users</p>
                  {step.dropOff > 0 && (
                    <div className="mt-2 px-2 py-1 bg-red-500/20 rounded-lg">
                      <p className="text-red-400 text-xs font-medium">-{step.dropOff}% drop-off</p>
                    </div>
                  )}
                </div>
              </div>
              {i < behaviorFlow.length - 1 && (
                <div className="flex items-center justify-center w-8 flex-shrink-0">
                  <i className="ri-arrow-right-line text-gray-500 text-lg"></i>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold text-lg mb-5">Most Visited Pages</h3>
          <div className="space-y-3">
            {topPages.map((pg, i) => (
              <div key={pg.page} className="flex items-center gap-3">
                <span className="text-gray-500 text-xs w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-sm">{pg.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">{pg.views.toLocaleString()}</span>
                      <i
                        className={`text-xs ${
                          pg.trend === 'up' ? 'ri-arrow-up-line text-emerald-400' : 'ri-arrow-down-line text-red-400'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pg.percentage}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold text-lg mb-5">Heatmap Overview</h3>
          <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-gray-700" style={{ height: 220 }}>
            <img
              src="https://readdy.ai/api/search-image?query=website%20heatmap%20visualization%20showing%20user%20click%20patterns%20and%20interaction%20zones%20on%20a%20dark%20background%20with%20warm%20orange%20red%20gradient%20overlays%20representing%20high%20traffic%20areas%20analytics%20dashboard%20data%20visualization&width=600&height=400&seq=heatmap-admin-001&orientation=landscape"
              alt="Heatmap"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 flex items-end p-4">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-white text-xs font-medium">Click Density Map — Homepage</p>
                <p className="text-gray-400 text-xs mt-0.5">Warmer = higher interaction</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div
                className="w-16 h-2 rounded-full"
                style={{ background: 'linear-gradient(to right, #1e3a5f, #f97316, #ef4444)' }}
              />
              <span className="text-gray-400 text-xs">Low → High</span>
            </div>
            <span className="text-gray-500 text-xs">Last 30 days</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TechnicalTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {coreWebVitals.map((v) => (
          <div key={v.metric} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{v.metric}</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  v.status === 'good' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {v.status === 'good' ? 'Good' : 'Needs Work'}
              </span>
            </div>
            <p className="text-white text-2xl font-bold mb-1">{v.value}</p>
            <p className="text-gray-500 text-xs">{v.description}</p>
            <p className="text-gray-600 text-xs mt-1">Target: {v.threshold}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold text-lg mb-5">Browser Breakdown</h3>
          <div className="space-y-4">
            {browserData.map((b) => (
              <div key={b.browser}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                    <span className="text-gray-300 text-sm">{b.browser}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs">{b.users.toLocaleString()}</span>
                    <span className="text-white text-sm font-semibold w-10 text-right">{b.percentage}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${b.percentage}%`, backgroundColor: b.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold text-lg mb-5">Device Types</h3>
          <div className="flex items-center gap-6">
            <DonutChart
              size={130}
              data={deviceData.map((d) => ({
                label: d.device,
                value: d.percentage,
                color: d.color,
              }))}
            />
            <div className="flex-1 space-y-4">
              {deviceData.map((d) => (
                <div key={d.device}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-gray-300 text-sm">{d.device}</span>
                    </div>
                    <span className="text-white text-sm font-bold">{d.percentage}%</span>
                  </div>
                  <p className="text-gray-500 text-xs pl-4">{d.users.toLocaleString()} users</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold text-lg mb-5">Page Load Times</h3>
          <div className="space-y-3">
            {pageLoadTimes.map((p) => (
              <div key={p.page} className="flex items-center justify-between bg-gray-700/40 rounded-xl px-4 py-3">
                <span className="text-gray-300 text-sm">{p.page}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(p.loadTime / 3) * 100}%`,
                        backgroundColor: p.status === 'good' ? '#10B981' : '#F59E0B',
                      }}
                    />
                  </div>
                  <span
                    className={`text-sm font-bold w-14 text-right ${
                      p.status === 'good' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {p.loadTime}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold text-lg mb-5">Error Tracker</h3>
          <div className="space-y-3">
            {errorData.map((e) => (
              <div key={e.type} className="flex items-center justify-between bg-gray-700/40 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      e.trend === 'up' ? 'bg-red-500/20' : 'bg-emerald-500/20'
                    }`}
                  >
                    <i
                      className={`text-sm ${
                        e.trend === 'up' ? 'ri-error-warning-line text-red-400' : 'ri-checkbox-circle-line text-emerald-400'
                      }`}
                    />
                  </div>
                  <span className="text-gray-300 text-sm">{e.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-bold">{e.count}</span>
                  <i
                    className={`text-xs ${
                      e.trend === 'up' ? 'ri-arrow-up-line text-red-400' : 'ri-arrow-down-line text-emerald-400'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type SubmittedRestaurant = {
  id: string;
  restaurant_name: string;
  cuisine: string | null;
  address: string | null;
  submitter_name: string | null;
  submitter_email: string | null;
  reason: string | null;
  description: string | null;
  lat: number | null;
  lng: number | null;
  status: string | null;
  created_at: string;
  image_url: string | null;
};

function ModerationTab() {
  const [items, setItems] = useState<SubmittedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'declined' | 'all'>('all');
  const [error, setError] = useState('');

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError('');

    let query = supabase
      .from('restaurant_submissions')
      .select(
        'id, restaurant_name, cuisine, address, submitter_name, submitter_email, reason, description, lat, lng, status, created_at, image_url'
      )
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setItems((data || []) as SubmittedRestaurant[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleDecline = async (item: SubmittedRestaurant) => {
    setActionLoadingId(item.id);
    setError('');

    const { error } = await supabase
      .from('restaurant_submissions')
      .update({ status: 'declined' })
      .eq('id', item.id);

    if (error) {
      setError(error.message);
      setActionLoadingId(null);
      return;
    }

    setItems((prev) =>
      prev.map((row) =>
        row.id === item.id ? { ...row, status: 'declined' } : row
      )
    );
    setActionLoadingId(null);
  };

const handleApprove = async (item: SubmittedRestaurant) => {
  setActionLoadingId(item.id);
  setError('');

  console.log('APPROVING ITEM:', item);

  const restaurantPayload = {
    name: item.restaurant_name,
    cuisine: item.cuisine || null,
    address: item.address || '',
    description: item.description || item.reason || null,
    lat: item.lat,
    lng: item.lng,
    image: item.image_url || null,
    is_chain: false,
    approved: true
  };

  console.log('RESTAURANT PAYLOAD:', restaurantPayload);

  const { data: insertedRestaurant, error: insertError } = await supabase
    .from('restaurants')
    .insert([restaurantPayload])
    .select('*')
    .single();

  console.log('INSERTED RESTAURANT RESULT:', insertedRestaurant);
  console.log('INSERT ERROR:', insertError);

  if (insertError) {
    setError(insertError.message);
    setActionLoadingId(null);
    return;
  }

  const { data: updatedSubmission, error: updateError } = await supabase
    .from('restaurant_submissions')
    .update({ status: 'approved' })
    .eq('id', item.id)
    .select('*')
    .single();

  console.log('UPDATED SUBMISSION RESULT:', updatedSubmission);
  console.log('UPDATE ERROR:', updateError);

  if (updateError) {
    setError(updateError.message);
    setActionLoadingId(null);
    return;
  }

  setItems((prev) => prev.filter((row) => row.id !== item.id));
  setActionLoadingId(null);
};

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold text-lg">Restaurant Moderation</h3>
            <p className="text-gray-400 text-sm">
              Approve or decline submitted restaurant listings
            </p>
          </div>

          <div className="flex gap-2 bg-gray-700 rounded-xl p-1">
            {(['pending', 'approved', 'declined', 'all'] as const).map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  filter === value
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-400">
            <i className="ri-loader-4-line animate-spin text-2xl mb-3 block"></i>
            Loading submissions...
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No submissions found.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const isPending = item.status === 'pending';
              const isApproved = item.status === 'approved';
              const isDeclined = item.status === 'declined';
              const isBusy = actionLoadingId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-gray-900 border border-gray-700 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h4 className="text-white text-lg font-semibold">
                          {item.restaurant_name}
                        </h4>

                        {item.cuisine && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300">
                            {item.cuisine}
                          </span>
                        )}

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isPending
                              ? 'bg-amber-500/20 text-amber-300'
                              : isApproved
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {item.status || 'pending'}
                        </span>
                      </div>

                      <p className="text-gray-400 text-sm">
                        {item.address || 'No address provided'}
                      </p>
                    </div>

                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.restaurant_name}
                        className="w-24 h-24 rounded-xl object-cover border border-gray-700"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                        Submitter
                      </p>
                      <p className="text-white text-sm font-medium">
                        {item.submitter_name || 'N/A'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {item.submitter_email || 'No email'}
                      </p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                        Submitted
                      </p>
                      <p className="text-white text-sm font-medium">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(item.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {(item.reason || item.description) && (
                    <div className="space-y-3 mb-4">
                      {item.reason && (
                        <div className="bg-gray-800 rounded-xl p-4">
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
                            Reason
                          </p>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {item.reason}
                          </p>
                        </div>
                      )}

                      {item.description && (
                        <div className="bg-gray-800 rounded-xl p-4">
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
                            Description
                          </p>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="text-xs text-gray-500">
                      {item.lat != null && item.lng != null
                        ? `Coordinates: ${item.lat}, ${item.lng}`
                        : 'No coordinates provided'}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecline(item)}
                        disabled={isBusy || isDeclined}
                        className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                      >
                        {isBusy ? 'Working...' : 'Decline'}
                      </button>

                      <button
                        onClick={() => handleApprove(item)}
                        disabled={isBusy || isApproved}
                        className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                      >
                        {isBusy ? 'Working...' : 'Approve'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const dateRangeLabels: Record<DateRange, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-950 border-r border-gray-800 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2 mb-1">
            <img
              src="https://public.readdy.ai/ai/img_res/80f85077-31ae-49dd-a4fb-c8507f5e3844.png"
              alt="Logo"
              className="h-8 w-auto brightness-0 invert"
            />
          </Link>
          <p className="text-gray-500 text-xs mt-2">Analytics Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <i className={`${tab.icon} text-base`}></i>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-arrow-left-line text-base"></i>
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-gray-950 border-b border-gray-800 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-white text-xl font-bold">{tabs.find((t) => t.id === activeTab)?.label}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{dateRangeLabels[dateRange]} · Updated just now</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-800 rounded-xl p-1 border border-gray-700">
              {(['7d', '30d', '90d'] as DateRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    dateRange === r ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
            <button
              onClick={handleRefresh}
              className="w-9 h-9 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all cursor-pointer"
            >
              <i className={`ri-refresh-line text-base ${refreshing ? 'animate-spin' : ''}`}></i>
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'traffic' && <TrafficTab />}
          {activeTab === 'engagement' && <EngagementTab />}
          {activeTab === 'conversions' && <ConversionsTab />}
          {activeTab === 'behavior' && <BehaviorTab />}
          {activeTab === 'technical' && <TechnicalTab />}
          {activeTab === 'moderation' && <ModerationTab />}
        </main>
      </div>
    </div>
  );
}
