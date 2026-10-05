/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { CSSProperties, useState } from 'react';
import { CargoProps } from './types';

const PAGES = [
  'Gateway', 'Gateway Flow', 'Transport', 'Transport Usage',
  'Stock', 'Stock Flow', 'Stock Vehicles Usage', 'Pallet', 'Pit Production',
  'Pit Utilization', 'AGV Utilization', 'By Hour',
];

const COLORS = ['#117c8a', '#e39b3d', '#d45d5d', '#4f8f69'];

const dashboardStyles: Record<string, CSSProperties> = {
  shell: { display: 'flex', height: '100%', minHeight: 520, width: '100%', overflow: 'hidden', background: '#eef1f3', color: '#20313b', fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif" },
  sidebar: { display: 'flex', flexDirection: 'column', flexShrink: 0, width: 190, background: '#173746', color: '#d9e7e9' },
  brand: { padding: '20px 18px 18px', borderBottom: '1px solid rgba(255,255,255,.12)' },
  brandTitle: { margin: 0, color: '#fff', fontSize: 20, letterSpacing: 1 },
  brandSub: { margin: '5px 0 0', color: '#8bbcc1', fontSize: 11 },
  nav: { flex: 1, overflowY: 'auto', padding: '14px 10px' },
  navGroup: { margin: '12px 8px 6px', color: '#7eabb1', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' },
  navButton: { display: 'block', width: '100%', padding: '8px 10px', border: 0, borderLeft: '3px solid transparent', background: 'transparent', color: '#c3d8db', cursor: 'pointer', fontSize: 12, textAlign: 'left' },
  main: { display: 'flex', flex: 1, minWidth: 0, flexDirection: 'column' },
  topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 66, padding: '0 24px', background: '#fff', borderBottom: '1px solid #d9e0e3' },
  eyebrow: { margin: 0, color: '#6c7e85', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  title: { margin: '4px 0 0', color: '#173746', fontSize: 24, fontWeight: 600 },
  status: { padding: '7px 12px', border: '1px solid #a7d3c0', borderRadius: 3, background: '#eff9f3', color: '#28734f', fontSize: 11, fontWeight: 700 },
  content: { flex: 1, overflow: 'auto', padding: 20 },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  subtitle: { margin: 0, color: '#5e7077', fontSize: 13 },
  filter: { padding: '7px 10px', border: '1px solid #cbd5d9', borderRadius: 3, background: '#fff', color: '#49616a', fontSize: 11 },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))', gap: 12, marginBottom: 16 },
  card: { padding: '14px 16px', background: '#fff', border: '1px solid #dce4e7', borderRadius: 3 },
  cardLabel: { color: '#71828a', fontSize: 11, textTransform: 'uppercase' },
  cardValue: { marginTop: 8, color: '#173746', fontSize: 23, fontWeight: 600 },
  cardDelta: { marginTop: 4, color: '#39805d', fontSize: 11 },
  grid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.65fr) minmax(230px, .85fr)', gap: 16, marginBottom: 16 },
  panel: { minWidth: 0, padding: 16, background: '#fff', border: '1px solid #dce4e7', borderRadius: 3 },
  panelTitle: { margin: '0 0 14px', color: '#264751', fontSize: 14, fontWeight: 600 },
  chart: { display: 'block', width: '100%', height: 210 },
  legend: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, color: '#667980', fontSize: 10 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: '50%' },
  flowRow: { marginBottom: 16 },
  flowHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#526870', fontSize: 11 },
  track: { height: 9, overflow: 'hidden', borderRadius: 2, background: '#e8edef' },
  fill: { height: '100%', borderRadius: 2 },
  dataTable: { width: '100%', borderCollapse: 'collapse', fontSize: 11 },
  th: { padding: '9px 10px', background: '#f3f6f7', color: '#61747c', fontSize: 10, textAlign: 'left', textTransform: 'uppercase' },
  td: { padding: '9px 10px', borderTop: '1px solid #edf1f2', color: '#334d57' },
};

function numericValues(data: CargoProps['data'], key: string) {
  return data.map((row) => {
    const value = Number(row[key]);
    return Number.isFinite(value) ? value : 0;
  });
}

function formatValue(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
}

export default function Cargo(props: CargoProps) {
  const { data, height, width, boldText, headerFontSize, headerText, initialPage } = props;
  const [activePage, setActivePage] = useState(initialPage === 'Overview' ? 'Gateway' : initialPage || 'Gateway');
  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const numericColumns = columns.filter((column) => numericValues(data, column).some((value) => value !== 0));
  const metricColumns = numericColumns.length > 0 ? numericColumns : columns.slice(1);
  const values = metricColumns.length > 0 ? numericValues(data, metricColumns[0]) : [];
  const total = values.reduce((sum, value) => sum + value, 0);
  const average = values.length > 0 ? total / values.length : 0;
  const peak = values.length > 0 ? Math.max(...values) : 0;
  const utilization = peak > 0 ? Math.min(100, (average / peak) * 100) : 0;
  const chartValues = values.length > 0 ? values.slice(0, 24) : [0, 0, 0, 0, 0, 0, 0, 0];
  const chartMax = Math.max(...chartValues, 1);
  const chartPoints = chartValues.map((value, index) => {
    const x = chartValues.length === 1 ? 50 : (index / (chartValues.length - 1)) * 100;
    const y = 96 - (value / chartMax) * 78;
    return `${x},${y}`;
  }).join(' ');
  const visibleRows = data.slice(0, 8);

  return (
    <div style={{ ...dashboardStyles.shell, height, width }}>
      <aside style={dashboardStyles.sidebar}>
        <div style={dashboardStyles.brand}>
          <h1 style={{ ...dashboardStyles.brandTitle, fontWeight: boldText ? 700 : 500 }}>CARGO</h1>
          <p style={dashboardStyles.brandSub}>SCENARIO VIEW</p>
        </div>
        <nav style={dashboardStyles.nav} aria-label="Scenario pages">
          <div style={dashboardStyles.navGroup}>Operations</div>
          {PAGES.map((page) => {
            const active = page === activePage;
            return <button key={page} type="button" onClick={() => setActivePage(page)} style={{ ...dashboardStyles.navButton, ...(active ? { borderLeftColor: '#e39b3d', background: '#255263', color: '#fff', fontWeight: 700 } : {}) }}>{page}</button>;
          })}
        </nav>
      </aside>
      <main style={dashboardStyles.main}>
        <header style={dashboardStyles.topbar}>
          <div>
            <p style={dashboardStyles.eyebrow}>{headerText || 'Scenario View'} / {activePage}</p>
            <h2 style={{ ...dashboardStyles.title, fontSize: headerFontSize === 'xxl' ? 28 : 24 }}>Cargo Operations</h2>
          </div>
          <div style={dashboardStyles.status}>LIVE SCENARIO</div>
        </header>
        <section style={dashboardStyles.content}>
          <div style={dashboardStyles.toolbar}>
            <p style={dashboardStyles.subtitle}>Operational overview and capacity monitoring</p>
            <div style={dashboardStyles.filter}>Rows loaded: {data.length}</div>
          </div>
          <div style={dashboardStyles.cards}>
            {[['Throughput', total, '+ 8.4%'], ['Average load', average, '+ 3.1%'], ['Peak capacity', peak, 'Current window'], ['Utilization', utilization, 'Target 85%']].map(([label, value, delta], index) => (
              <div key={String(label)} style={dashboardStyles.card}>
                <div style={dashboardStyles.cardLabel}>{label}</div>
                <div style={dashboardStyles.cardValue}>{index === 3 ? `${formatValue(Number(value))}%` : formatValue(Number(value))}</div>
                <div style={{ ...dashboardStyles.cardDelta, color: index === 3 && Number(value) > 85 ? '#bd5c4c' : '#39805d' }}>{delta}</div>
              </div>
            ))}
          </div>
          <div style={dashboardStyles.grid}>
            <section style={dashboardStyles.panel}>
              <h3 style={dashboardStyles.panelTitle}>{activePage} trend</h3>
              <svg style={dashboardStyles.chart} viewBox="0 0 100 110" preserveAspectRatio="none" role="img" aria-label={`${activePage} trend`}>
                {[20, 45, 70, 95].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#e8edef" strokeWidth=".5" />)}
                <polygon points={`0,96 ${chartPoints} 100,96`} fill="#117c8a" opacity=".12" />
                <polyline points={chartPoints} fill="none" stroke="#117c8a" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
                {chartValues.map((value, index) => {
                  const x = chartValues.length === 1 ? 50 : (index / (chartValues.length - 1)) * 100;
                  const y = 96 - (value / chartMax) * 78;
                  return <circle key={`${value}-${index}`} cx={x} cy={y} r="1.6" fill="#e39b3d" />;
                })}
              </svg>
              <div style={dashboardStyles.legend}><span style={dashboardStyles.legendItem}><span style={{ ...dashboardStyles.dot, background: '#117c8a' }} />Actual flow</span><span style={dashboardStyles.legendItem}><span style={{ ...dashboardStyles.dot, background: '#e39b3d' }} />Scenario points</span></div>
            </section>
            <section style={dashboardStyles.panel}>
              <h3 style={dashboardStyles.panelTitle}>Flow monitor</h3>
              {['Inbound', 'Processing', 'Outbound', 'Available capacity'].map((label, index) => {
                const value = Math.min(100, Math.max(8, utilization + (index * 7) - 12));
                return <div key={label} style={dashboardStyles.flowRow}><div style={dashboardStyles.flowHeader}><span>{label}</span><strong>{formatValue(value)}%</strong></div><div style={dashboardStyles.track}><div style={{ ...dashboardStyles.fill, width: `${value}%`, background: COLORS[index] }} /></div></div>;
              })}
            </section>
          </div>
          <section style={dashboardStyles.panel}>
            <h3 style={dashboardStyles.panelTitle}>Scenario data</h3>
            {visibleRows.length > 0 ? <div style={{ overflowX: 'auto' }}><table style={dashboardStyles.dataTable}><thead><tr>{columns.map((column) => <th key={column} style={dashboardStyles.th}>{column}</th>)}</tr></thead><tbody>{visibleRows.map((row, rowIndex) => <tr key={rowIndex}>{columns.map((column) => <td key={column} style={dashboardStyles.td}>{row[column] == null ? '' : String(row[column])}</td>)}</tr>)}</tbody></table></div> : <div style={{ color: '#71828a', fontSize: 12 }}>Configure a dataset to populate this scenario view.</div>}
          </section>
        </section>
      </main>
    </div>
  );
}
