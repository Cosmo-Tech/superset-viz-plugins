import { CSSProperties, useMemo, useState } from 'react';
import { CargoProps } from './types';

const PAGE_NAMES = [
  'Gateway', 'Gateway Flow', 'Transport', 'Transport Usage',
  'Stock', 'Stock Flow', 'Stock Vehicles Usage', 'Pallet', 'Pit Production',
  'Pit Utilization', 'AGV Utilization', 'By Hour',
];

const colors = {
  navy: '#002157',
  ink: '#233746',
  muted: '#667982',
  border: '#d4dadd',
  page: '#eeeeee',
  teal: '#117c8a',
  red: '#931116',
};

const styles: Record<string, CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 672, minHeight: 0, width: '100%', overflow: 'hidden', background: colors.page, color: colors.ink, boxSizing: 'border-box', fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif" },
  nav: { display: 'flex', flexShrink: 0, alignItems: 'center', height: 42, overflowX: 'auto', padding: '0 8px', background: colors.navy, borderBottom: `3px solid ${colors.red}`, boxSizing: 'border-box', boxShadow: '0 1px 0 rgba(0,0,0,.16)' },
  navButton: { flexShrink: 0, height: 34, padding: '0 9px', border: 0, background: 'transparent', color: '#d8e1ec', cursor: 'pointer', fontSize: 10, whiteSpace: 'nowrap' },
  dateBand: { display: 'flex', alignItems: 'center', height: 36, margin: '2px 8px 0 141px', padding: '0 8px', background: 'transparent', border: 0, boxSizing: 'border-box' },
  dateLabel: { marginRight: 14, color: colors.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 },
  dateControls: { display: 'grid', flex: 1, gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'center' },
  dateControl: { display: 'grid', gridTemplateColumns: '34px minmax(0, 1fr)', gap: 6, alignItems: 'center', color: colors.muted, fontSize: 9 },
  dateSelect: { width: '100%', height: 24, border: `1px solid ${colors.border}`, borderRadius: 3, background: '#fff', color: colors.ink, fontSize: 9 },
  body: { display: 'flex', flex: 1, minHeight: 0, gap: 10, padding: '6px 8px 8px', boxSizing: 'border-box' },
  filters: { display: 'flex', flexDirection: 'column', flexShrink: 0, width: 125, gap: 6, overflow: 'hidden' },
  filterPanel: { minHeight: 0, padding: '6px', overflowY: 'auto', background: 'transparent', border: `1px solid ${colors.navy}`, borderRadius: 6, boxSizing: 'border-box' },
  filterTitle: { margin: '0 0 4px', color: colors.ink, fontSize: 9, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase' },
  filterValue: { display: 'block', width: '100%', overflow: 'hidden', padding: '2px', border: 0, background: 'transparent', color: colors.muted, cursor: 'pointer', fontSize: 9, textAlign: 'left', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  resetButton: { flexShrink: 0, height: 24, border: `1px solid ${colors.navy}`, borderRadius: 4, background: '#fff', color: colors.navy, cursor: 'pointer', fontSize: 9, fontWeight: 700 },
  content: { display: 'flex', flex: 1, minHeight: 0, minWidth: 0, flexDirection: 'column', gap: 8, overflow: 'hidden' },
  gatewayContent: { display: 'flex', flex: 1, minHeight: 0, minWidth: 0, flexDirection: 'column', gap: 5, overflow: 'hidden' },
  title: { display: 'flex', flexShrink: 0, alignItems: 'center', justifyContent: 'space-between', minHeight: 22, padding: '0 2px' },
  titleText: { margin: 0, color: colors.ink, fontSize: 14, fontWeight: 600 },
  titleMeta: { color: colors.muted, fontSize: 10 },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))', gap: 10 },
  card: { minWidth: 0, padding: '10px 12px', background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,33,87,.07)', boxSizing: 'border-box' },
  cardLabel: { overflow: 'hidden', color: colors.muted, fontSize: 10, fontWeight: 600, letterSpacing: .4, textOverflow: 'ellipsis', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  cardValue: { marginTop: 7, color: colors.navy, fontSize: 22, fontWeight: 600 },
  cardMeta: { marginTop: 3, color: '#6f7c84', fontSize: 10 },
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 },
  gatewayChartGrid: { display: 'grid', flex: 1, minHeight: 0, gridTemplateRows: 'repeat(3, minmax(0, 1fr))', gap: 6 },
  chartPanel: { minWidth: 0, minHeight: 0, padding: '6px 10px 4px', overflow: 'hidden', background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 8, boxShadow: '0 2px 7px rgba(0,33,87,.12)', boxSizing: 'border-box' },
  chartTitle: { margin: '0 0 2px', color: colors.ink, fontSize: 10, fontWeight: 600, letterSpacing: .4 },
  chart: { display: 'block', width: '100%', height: 'calc(100% - 42px)', minHeight: 48 },
  xAxis: { display: 'flex', justifyContent: 'space-between', height: 12, overflow: 'hidden', color: colors.muted, fontSize: 7, lineHeight: '10px', whiteSpace: 'nowrap' },
  legend: { display: 'flex', gap: 12, color: colors.muted, fontSize: 9 },
  tablePanel: { minWidth: 0, padding: '10px 14px', background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,33,87,.07)' },
  table: { width: '100%', borderCollapse: 'collapse', color: colors.ink, fontSize: 10 },
  th: { padding: '7px 8px', background: '#f5f5f5', color: colors.muted, fontSize: 9, fontWeight: 700, textAlign: 'left', textTransform: 'uppercase' },
  td: { padding: '7px 8px', borderTop: '1px solid #edf0f2' },
  palletPage: { display: 'grid', flex: 1, minHeight: 0, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 28, padding: '18px 28px 28px', overflow: 'hidden', boxSizing: 'border-box' },
  palletColumn: { display: 'flex', minHeight: 0, flexDirection: 'column', gap: 14 },
  palletBanner: { display: 'flex', height: 38, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 9, color: '#fff', fontSize: 15, fontWeight: 700, boxShadow: '0 4px 10px rgba(0,0,0,.22)' },
  palletKpi: { display: 'flex', minHeight: 62, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #fff', borderRadius: 10, background: '#eeeeee', boxShadow: '0 4px 11px rgba(0,0,0,.18)' },
  palletKpiLabel: { color: '#666', fontSize: 10, fontWeight: 400, textTransform: 'uppercase' },
  palletKpiValue: { marginTop: 3, color: '#252423', fontSize: 20, fontWeight: 600 },
  palletRates: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  palletGlobal: { position: 'relative', display: 'grid', flex: 1, minHeight: 0, gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'repeat(3, 1fr)', gap: '14px 48px', alignItems: 'center' },
  palletConnectorH: { position: 'absolute', left: '22%', right: '22%', top: '48%', height: 1, background: '#aaa' },
  palletConnectorV: { position: 'absolute', left: '50%', top: 0, bottom: '15%', width: 1, background: '#aaa' },
  operationalPage: { display: 'flex', flex: 1, minHeight: 0, minWidth: 0, flexDirection: 'column', gap: 8, overflow: 'hidden' },
  operationalCards: { display: 'grid', flexShrink: 0, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 },
  operationalCharts: { display: 'grid', flex: 1, minHeight: 0, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridAutoRows: 'minmax(0, 1fr)', gap: 8 },
};

const PAGE_LAYOUTS: Record<string, { cards: string[]; charts: Array<{ title: string; type?: 'bar' }> }> = {
  'Gateway Flow': {
    cards: ['PALLETS OUT', 'FRACTIONS IN', 'PALLETS IN', 'FRACTIONS OUT'],
    charts: [{ title: 'PALLETS OVER TIME' }, { title: 'FRACTIONS OVER TIME' }, { title: 'PALLETS IN BY GATEWAY', type: 'bar' }, { title: 'FRACTIONS OUT BY GATEWAY', type: 'bar' }],
  },
  Stock: { cards: ['USED (aver.)'], charts: [{ title: 'OCCUPANCY OVER TIME' }] },
  'Stock Vehicles Usage': { cards: [], charts: [{ title: 'OCCUPANCY OVER TIME' }] },
  'Stock Flow': { cards: ['PALLETS', 'FRACTIONS'], charts: [{ title: 'PALLETS AND FRACTIONS OVER TIME' }] },
  Transport: { cards: ['PALLETS', 'FRACTIONS'], charts: [{ title: 'PALLETS AND FRACTIONS OVER TIME' }] },
  'Transport Usage': { cards: [], charts: [{ title: 'CROSS-DOCK OCCUPANCY OVER TIME' }, { title: 'MANUAL TRANSPORT OCCUPANCY OVER TIME' }] },
  'Pit Utilization': { cards: [], charts: [{ title: 'UTILIZATION OVER TIME' }] },
  'Pit Production': { cards: ['BUILD UPS', 'BREAKDOWNS'], charts: [{ title: 'BUILD UPS OVER TIME' }, { title: 'BREAKDOWNS OVER TIME' }] },
  'AGV Utilization': { cards: ['USED (aver.)'], charts: [{ title: 'AGV UTILIZATION OVER TIME' }] },
  'By Hour': { cards: ['PALLETS', 'FRACTIONS'], charts: [{ title: 'PALLETS AND FRACTIONS OVER TIME' }] },
};

function valuesFor(data: CargoProps['data'], key: string) {
  return data.map((row) => {
    const value = Number(row[key]);
    return Number.isFinite(value) ? value : 0;
  });
}

function chartPoints(values: number[], max: number) {
  return values.map((value, index) => {
    const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100;
    const y = 92 - (value / max) * 70;
    return `${x},${y}`;
  }).join(' ');
}

function timestampValue(value: unknown) {
  if (typeof value === 'number') return value < 100000000000 ? value * 1000 : value;
  const numeric = Number(value);
  if (String(value).trim() !== '' && Number.isFinite(numeric)) return numeric < 100000000000 ? numeric * 1000 : numeric;
  return Date.parse(String(value));
}

function dayValue(value: unknown) {
  const date = new Date(timestampValue(value));
  return Number.isNaN(date.getTime()) ? Number.NaN : new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function formatDayLabel(value: number) {
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTimeLabel(value: unknown) {
  const date = new Date(typeof value === 'number' ? value : timestampValue(value));
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function poolSeries(data: CargoProps['data'], pool: string, timeColumn: string | undefined, poolColumn: string | undefined, gatewayColumn: string | undefined, usedColumn: string | undefined, capacityColumn: string | undefined) {
  if (!timeColumn || !poolColumn || !usedColumn || !capacityColumn) return { labels: [], used: [], capacity: [] };
  const grouped = new Map<string, { raw: string; used: number; capacities: Map<string, number> }>();
  data.forEach((row) => {
    if (String(row[poolColumn] ?? '').toLowerCase() !== pool) return;
    const raw = String(timestampValue(row[timeColumn]));
    const current = grouped.get(raw) || { raw, used: 0, capacities: new Map<string, number>() };
    const used = Number(row[usedColumn]);
    const capacity = Number(row[capacityColumn]);
    const gateway = gatewayColumn ? String(row[gatewayColumn] ?? 'all') : 'all';
    current.used += Number.isFinite(used) ? used : 0;
    current.capacities.set(gateway, Math.max(current.capacities.get(gateway) || 0, Number.isFinite(capacity) ? capacity : 0));
    grouped.set(raw, current);
  });
  const entries = Array.from(grouped.values()).sort((left, right) => Number(left.raw) - Number(right.raw));
  return {
    labels: entries.map((entry) => formatTimeLabel(Number(entry.raw))),
    used: entries.map((entry) => entry.used),
    capacity: entries.map((entry) => Array.from(entry.capacities.values()).reduce((sum, value) => sum + value, 0)),
  };
}

function metricSeries(data: CargoProps['data'], timeColumn: string | undefined, metricColumn: string) {
  if (!timeColumn) return { labels: [], values: valuesFor(data, metricColumn) };
  const grouped = new Map<number, number>();
  data.forEach((row) => {
    const timestamp = timestampValue(row[timeColumn]);
    const value = Number(row[metricColumn]);
    if (Number.isFinite(timestamp) && Number.isFinite(value)) grouped.set(timestamp, (grouped.get(timestamp) || 0) + value);
  });
  const entries = Array.from(grouped.entries()).sort((left, right) => left[0] - right[0]);
  return { labels: entries.map(([timestamp]) => formatTimeLabel(timestamp)), values: entries.map(([, value]) => value) };
}

function ScenarioChart({ title, values, secondValues, labels, color }: { title: string; values: number[]; secondValues?: number[]; labels?: string[]; color: string }) {
  const primary = values.length > 0 ? values : [0, 0];
  const secondary = secondValues && secondValues.length > 0 ? secondValues : [];
  const axisLabels = labels && labels.length > 0 ? labels.slice(0, primary.length) : [];
  const chartMax = Math.max(...primary, ...secondary, 1);
  const points = chartPoints(primary, chartMax);
  const secondaryPoints = secondary.length > 0 ? chartPoints(secondary, chartMax) : '';
  const visibleLabels = axisLabels.filter((_, index) => {
    const labelStep = Math.max(1, Math.ceil(axisLabels.length / 6));
    return index % labelStep === 0 || index === axisLabels.length - 1;
  });
  return (
    <section style={styles.chartPanel}>
      <h3 style={styles.chartTitle}>{title}</h3>
      <svg style={styles.chart} viewBox="0 0 100 92" preserveAspectRatio="none" role="img" aria-label={title}>
        {[20, 43, 66, 89].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#cbd2d8" strokeWidth=".55" strokeDasharray="1.5 1.5" />)}
        <polygon points={`0,92 ${points} 100,92`} fill={color} opacity=".12" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.7" vectorEffect="non-scaling-stroke" />
        {secondaryPoints && <polyline points={secondaryPoints} fill="none" stroke={colors.red} strokeWidth="1.2" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />}
      </svg>
      <div style={styles.xAxis}>{visibleLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}</div>
      <div style={styles.legend}><span style={{ color }}>&mdash; Used</span>{secondaryPoints && <span style={{ color: colors.red }}>- - Capacity</span>}</div>
    </section>
  );
}

function BarChart({ title, values, color }: { title: string; values: number[]; color: string }) {
  const bars = (values.length > 0 ? values : [0, 0, 0, 0]).slice(0, 6);
  const max = Math.max(...bars, 1);
  return (
    <section style={styles.chartPanel}>
      <h3 style={styles.chartTitle}>{title}</h3>
      <svg style={styles.chart} viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={title}>
        {[20, 43, 66, 89].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#dfe5e9" strokeWidth=".55" strokeDasharray="1.5 1.5" />)}
        {bars.map((value, index) => {
          const barWidth = 11;
          const x = 5 + index * 15;
          const height = (value / max) * 70;
          return <rect key={`${value}-${index}`} x={x} y={92 - height} width={barWidth} height={height} rx="1" fill={color} />;
        })}
      </svg>
      <div style={styles.legend}><span style={{ color }}>Current scenario</span></div>
    </section>
  );
}

function metricValue(data: CargoProps['data'], field: string) {
  const normalizedField = field.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const keys = data.length > 0 ? Object.keys(data[0]) : [];
  const column = keys.find((key) => key.replace(/[^a-z0-9]/gi, '').toLowerCase() === normalizedField)
    || keys.find((key) => key.replace(/[^a-z0-9]/gi, '').toLowerCase().includes(normalizedField));
  if (!column) return 0;
  const values = data.map((row) => Number(row[column])).filter(Number.isFinite);
  if (values.length === 0) return 0;
  return field.startsWith('pct_') ? values.reduce((sum, value) => sum + value, 0) / values.length : values.reduce((sum, value) => sum + value, 0);
}

function formatMetric(value: number, percentage = false) {
  const normalized = percentage && Math.abs(value) <= 1 ? value * 100 : value;
  return percentage ? `${normalized.toFixed(1)}%` : new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(normalized);
}

function PalletCard({ label, value, percentage = false }: { label: string; value: number; percentage?: boolean }) {
  return <section style={styles.palletKpi}><span style={styles.palletKpiLabel}>{label}</span><strong style={styles.palletKpiValue}>{formatMetric(value, percentage)}</strong></section>;
}

function PalletPage({ data }: { data: CargoProps['data'] }) {
  const value = (field: string) => metricValue(data, field);
  return <main style={styles.palletPage}>
    <section style={styles.palletColumn}>
      <h2 style={{ ...styles.palletBanner, background: '#1f4478' }}>GLOBAL VIEW</h2>
      <PalletCard label="Total Pallets" value={value('total_pallets')} />
      <div style={styles.palletGlobal}>
        <div style={styles.palletConnectorH} /><div style={styles.palletConnectorV} />
        <PalletCard label="EXPORT" value={value('pallet_count_export')} />
        <PalletCard label="IMPORT" value={value('pallet_count_import')} />
        <PalletCard label="MULD" value={value('pallet_count_muld')} />
        <PalletCard label="TULD" value={value('pallet_count_tuld')} />
        <div style={{ gridColumn: '1 / 3', width: '46%', justifySelf: 'center' }}><PalletCard label="INTACT" value={value('pallet_count_intact')} /></div>
      </div>
    </section>
    <section style={styles.palletColumn}>
      <h2 style={{ ...styles.palletBanner, background: '#ae3d45' }}>PALLETS DELAYED</h2>
      <PalletCard label="% Pallets Delayed - ECOR" value={value('pct_ecor_late')} percentage />
      <PalletCard label="% Pallets Delayed - EXIT" value={value('pct_export_late')} percentage />
      <div style={styles.palletRates}>
        <PalletCard label="PAX" value={value('pct_export_late_pax')} percentage />
        <PalletCard label="FRT" value={value('pct_export_late_frt')} percentage />
        <PalletCard label="LOCAL" value={value('pct_export_late_local')} percentage />
        <PalletCard label="RFS" value={value('pct_export_late_rfs')} percentage />
      </div>
    </section>
  </main>;
}

function OperationalPage({ page, data, numericColumns, timeColumn }: { page: string; data: CargoProps['data']; numericColumns: string[]; timeColumn?: string }) {
  const layout = PAGE_LAYOUTS[page] || PAGE_LAYOUTS['By Hour'];
  const timeSeries = numericColumns.map((column) => metricSeries(data, timeColumn, column));
  const series = timeSeries.map(({ values }) => values);
  const labels = timeSeries[0]?.labels || [];
  const totals = series.map((values) => values.reduce((sum, value) => sum + value, 0));
  return <main style={styles.operationalPage}>
    <header style={styles.title}><h2 style={styles.titleText}>{page}</h2><span style={styles.titleMeta}>{data.length} rows | Scenario View</span></header>
    {layout.cards.length > 0 && <div style={{ ...styles.operationalCards, gridTemplateColumns: `repeat(${layout.cards.length}, minmax(0, 1fr))` }}>{layout.cards.map((label, index) => <PalletCard key={label} label={label} value={totals[index] || 0} percentage={label.toLowerCase().includes('utilization')} />)}</div>}
    <div style={{ ...styles.operationalCharts, gridTemplateColumns: layout.charts.length === 1 ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))' }}>
      {layout.charts.map((chart, index) => chart.type === 'bar'
        ? <BarChart key={chart.title} title={chart.title} values={series[index % Math.max(series.length, 1)] || []} color={index % 2 ? colors.teal : colors.navy} />
        : <ScenarioChart key={chart.title} title={chart.title} values={series[index % Math.max(series.length, 1)] || []} secondValues={series.length > 1 ? series[(index + 1) % series.length] : undefined} labels={labels} color={colors.navy} />)}
    </div>
  </main>;
}

export default function CargoGateway(props: CargoProps) {
  const { data, height, width, initialPage, showNavigation } = props;
  const [activePage, setActivePage] = useState(PAGE_NAMES.includes(initialPage) ? initialPage : 'Gateway');
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [dateStart, setDateStart] = useState(0);
  const [dateEnd, setDateEnd] = useState(Number.MAX_SAFE_INTEGER);
  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const numericColumns = columns.filter((column) => valuesFor(data, column).some((value) => value !== 0));
  const timeColumn = columns.find((column) => /^(time|date|datetime|timestamp|ds)$/i.test(column));
  const usedColumn = columns.find((column) => column.toLowerCase().includes('used'));
  const capacityColumn = columns.find((column) => column.toLowerCase().includes('capacity'));
  const gatewayColumn = columns.find((column) => column.toLowerCase() === 'gateway');
  const poolColumn = columns.find((column) => column.toLowerCase() === 'pool');
  const transportTypeColumn = columns.find((column) => column.toLowerCase() === 'transport_type');
  const timestamps = useMemo(() => timeColumn ? Array.from(new Set(data.map((row) => dayValue(row[timeColumn])).filter(Number.isFinite))).sort((left, right) => left - right) : [], [data, timeColumn]);
  const lastDateIndex = Math.max(0, timestamps.length - 1);
  const effectiveDateStart = Math.min(dateStart, lastDateIndex);
  const effectiveDateEnd = Math.min(dateEnd, lastDateIndex);
  const preferredFilters = [transportTypeColumn, gatewayColumn, poolColumn].filter((column): column is string => Boolean(column));
  const otherDimensions = columns.filter((column) => column !== timeColumn
    && !numericColumns.includes(column)
    && !preferredFilters.includes(column)
    && !/(^id$|_id$|run)/i.test(column));
  const filterColumns = [...preferredFilters, ...otherDimensions].slice(0, 6);
  const filterValues = useMemo(() => filterColumns.map((column) => ({
    column,
    values: Array.from(new Set(data.map((row) => String(row[column] ?? '')).filter(Boolean))).sort(),
  })), [data, columns.join('|')]);
  const filteredData = useMemo(() => data.filter((row) => {
    const time = timeColumn ? dayValue(row[timeColumn]) : Number.NaN;
    if (timestamps.length > 0 && (time < timestamps[effectiveDateStart] || time > timestamps[effectiveDateEnd])) return false;
    return filterColumns.every((column) => {
      const selection = selected[column] || [];
      return selection.length === 0 || selection.includes(String(row[column] ?? ''));
    });
  }), [data, effectiveDateEnd, effectiveDateStart, selected, timeColumn, timestamps, filterColumns.join('|')]);
  const linesSeries = poolSeries(filteredData, 'lines', timeColumn, poolColumn, gatewayColumn, usedColumn, capacityColumn);
  const palletsSeries = poolSeries(filteredData, 'pallets', timeColumn, poolColumn, gatewayColumn, usedColumn, capacityColumn);
  const fractionsSeries = poolSeries(filteredData, 'fractions', timeColumn, poolColumn, gatewayColumn, usedColumn, capacityColumn);
  const isGateway = activePage === 'Gateway';
  const isPallet = activePage === 'Pallet';
  const toggleFilter = (column: string, value: string) => setSelected((current) => {
    const values = current[column] || [];
    return { ...current, [column]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] };
  });

  return (
    <div style={{ ...styles.root, height: Math.min(height, 672), width }}>
      {showNavigation && <nav style={styles.nav} aria-label="Scenario View pages">
        {PAGE_NAMES.map((page) => <button key={page} type="button" onClick={() => setActivePage(page)} style={{ ...styles.navButton, ...(activePage === page ? { background: '#fff', color: colors.navy, fontWeight: 700 } : {}) }}>{page}</button>)}
      </nav>}
      {!isPallet && timestamps.length > 0 && <div style={styles.dateBand}>
        <span style={styles.dateLabel}>DAY</span>
        <div style={styles.dateControls}>
          <label style={styles.dateControl}><span>From</span><select aria-label="Start date" value={effectiveDateStart} onChange={(event) => setDateStart(Math.min(Number(event.target.value), effectiveDateEnd))} style={styles.dateSelect}>{timestamps.map((timestamp, index) => <option key={timestamp} value={index}>{formatDayLabel(timestamp)}</option>)}</select></label>
          <label style={styles.dateControl}><span>To</span><select aria-label="End date" value={effectiveDateEnd} onChange={(event) => setDateEnd(Math.max(Number(event.target.value), effectiveDateStart))} style={styles.dateSelect}>{timestamps.map((timestamp, index) => <option key={timestamp} value={index}>{formatDayLabel(timestamp)}</option>)}</select></label>
        </div>
      </div>}
      {isPallet ? <PalletPage data={data} /> : <div style={styles.body}>
        {filterValues.length > 0 && <aside style={styles.filters}>
          <button type="button" onClick={() => { setSelected({}); setDateStart(0); setDateEnd(Number.MAX_SAFE_INTEGER); }} style={styles.resetButton}>Reset filters</button>
          {filterValues.map(({ column, values }) => {
            const selection = selected[column] || [];
            return <section key={column} style={{ ...styles.filterPanel, flex: column === gatewayColumn ? 1.4 : 1 }}><h4 style={styles.filterTitle}>{column.replace('_', ' ')}</h4><button type="button" onClick={() => setSelected((current) => ({ ...current, [column]: [] }))} style={{ ...styles.filterValue, color: selection.length === 0 ? '#fff' : colors.muted, background: selection.length === 0 ? colors.navy : 'transparent', fontWeight: selection.length === 0 ? 700 : 400 }}>Select all</button>{values.map((value) => <button key={value} type="button" onClick={() => toggleFilter(column, value)} style={{ ...styles.filterValue, color: selection.includes(value) ? '#fff' : colors.muted, background: selection.includes(value) ? colors.navy : 'transparent', fontWeight: selection.includes(value) ? 700 : 400 }}>{value}</button>)}</section>;
          })}
        </aside>}
        {isGateway ? <main style={styles.gatewayContent}>
          <header style={styles.title}><h2 style={styles.titleText}>{activePage}</h2><span style={styles.titleMeta}>{filteredData.length} / {data.length} rows | Scenario View</span></header>
          <div style={styles.gatewayChartGrid}>
              <ScenarioChart title="LINES OVER TIME" values={linesSeries.used} secondValues={linesSeries.capacity} labels={linesSeries.labels} color={colors.teal} />
              <ScenarioChart title="PALLETS OVER TIME" values={palletsSeries.used} secondValues={palletsSeries.capacity} labels={palletsSeries.labels} color={colors.teal} />
              <ScenarioChart title="FRACTIONS OVER TIME" values={fractionsSeries.used} secondValues={fractionsSeries.capacity} labels={fractionsSeries.labels} color={colors.teal} />
          </div>
        </main> : <OperationalPage page={activePage} data={filteredData} numericColumns={numericColumns} timeColumn={timeColumn} />}
      </div>}
    </div>
  );
}
