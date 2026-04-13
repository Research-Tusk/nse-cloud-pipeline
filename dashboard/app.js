// app.js — Unified NSE+BSE Analytics Dashboard
// Data loaded dynamically from ./data/ via fetch()

// ========================
// GLOBAL STATE
// ========================

let DATA = {};
let ENRICHED_DATA = {};
let currentExchange = 'nse';
const charts = {};

// ========================
// UTILITIES
// ========================

function fmt(num, decimals = 2) {
  if (num == null || isNaN(num)) return '—';
  const n = Number(num);
  return '₹ ' + n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + ' Cr';
}

function fmtNum(num, decimals = 2) {
  if (num == null || isNaN(num)) return '—';
  return Number(num).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtPct(num) {
  if (num == null || isNaN(num)) return '—';
  const pct = (Number(num) * 100).toFixed(1);
  return pct + '%';
}

function fmtPctRaw(num) {
  if (num == null || isNaN(num)) return '—';
  return Number(num).toFixed(1) + '%';
}

function fmtPctSigned(val) {
  if (val == null || isNaN(val)) return '<span class="neutral">—</span>';
  const pct = (Number(val) * 100).toFixed(1);
  const sign = val > 0 ? '+' : '';
  const cls = val > 0.001 ? 'positive' : val < -0.001 ? 'negative' : 'neutral';
  return `<span class="${cls}">${sign}${pct}%</span>`;
}

function deltaClass(val) {
  if (val > 0.001) return 'positive';
  if (val < -0.001) return 'negative';
  return 'neutral';
}

function deltaStr(val) {
  if (val == null || isNaN(val)) return '';
  const pct = (val * 100).toFixed(1);
  const arrow = val > 0 ? '▲' : val < 0 ? '▼' : '—';
  return arrow + ' ' + Math.abs(pct) + '%';
}

function fmtPrice(num) {
  if (num == null || isNaN(num)) return '—';
  return '₹ ' + Number(num).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ========================
// CHART COLORS — Apple Palette
// ========================

const CHART_COLORS = ['#2997ff', '#ff6b6b', '#30d158', '#bf5af2', '#ff9f0a', '#64d2ff'];
const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif";

function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

function getGridColor() {
  return getTheme() === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
}

function getTickColor() {
  return getTheme() === 'light' ? '#6e6e73' : '#86868b';
}

function getTooltipBg() {
  return getTheme() === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(28, 28, 30, 0.95)';
}

function getTooltipText() {
  return getTheme() === 'light' ? '#1d1d1f' : '#f5f5f7';
}

function getDonutBorderColor() {
  return getTheme() === 'light' ? '#f5f5f7' : '#1c1c1e';
}

function getScaleBorderColor() {
  return getTheme() === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
}

function getHeatmapRgb() {
  return '0, 113, 227';
}

function applyChartDefaults() {
  Chart.defaults.color = getTickColor();
  Chart.defaults.font.family = FONT_FAMILY;
  Chart.defaults.font.size = 11;
  Chart.defaults.plugins.legend.labels.boxWidth = 10;
  Chart.defaults.plugins.legend.labels.padding = 14;
  Chart.defaults.plugins.tooltip.backgroundColor = getTooltipBg();
  Chart.defaults.plugins.tooltip.titleColor = getTooltipText();
  Chart.defaults.plugins.tooltip.bodyColor = getTooltipText();
  Chart.defaults.plugins.tooltip.borderColor = getTheme() === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.titleFont = { size: 11, weight: '600' };
  Chart.defaults.plugins.tooltip.bodyFont = { size: 11 };
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.scale.grid = { color: getGridColor() };
  Chart.defaults.scale.border = { color: getScaleBorderColor() };
  Chart.defaults.elements.line.tension = 0.3;
  Chart.defaults.elements.line.borderWidth = 2;
  Chart.defaults.elements.point.radius = 0;
  Chart.defaults.elements.point.hoverRadius = 5;
  Chart.defaults.animation.duration = 700;
  Chart.defaults.responsive = true;
  Chart.defaults.maintainAspectRatio = false;
}

applyChartDefaults();

function setCanvasHeight(id, h) {
  const c = document.getElementById(id);
  if (c) c.parentElement.style.height = h + 'px';
}

// ========================
// THEME TOGGLE
// ========================

function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  toggle.addEventListener('click', () => {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    updateChartsForTheme();
  });
}

function updateChartsForTheme() {
  applyChartDefaults();
  Object.entries(charts).forEach(([key, chart]) => {
    if (!chart) return;
    if (chart.options && chart.options.scales) {
      Object.values(chart.options.scales).forEach(scale => {
        if (scale.grid) scale.grid.color = getGridColor();
        if (scale.border) scale.border.color = getScaleBorderColor();
        if (scale.ticks) scale.ticks.color = getTickColor();
      });
    }
    if (chart.options && chart.options.plugins && chart.options.plugins.tooltip) {
      chart.options.plugins.tooltip.backgroundColor = getTooltipBg();
      chart.options.plugins.tooltip.titleColor = getTooltipText();
      chart.options.plugins.tooltip.bodyColor = getTooltipText();
      chart.options.plugins.tooltip.borderColor = getTheme() === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
    }
    if (key === 'donut' && chart.data && chart.data.datasets[0]) {
      chart.data.datasets[0].borderColor = getDonutBorderColor();
      chart.data.datasets[0].hoverBorderColor = getDonutBorderColor();
    }
    chart.update('none');
  });
  // Rebuild heatmap if NSE
  const hm = document.getElementById('heatmapContainer');
  if (currentExchange === 'nse' && hm && hm.innerHTML) {
    buildHeatmap();
  }
}

initThemeToggle();

// ========================
// LOADING OVERLAY
// ========================

function showLoading(exchange) {
  const overlay = document.getElementById('loadingOverlay');
  document.getElementById('loadingText').textContent = 'Loading ' + exchange.toUpperCase() + ' data...';
  overlay.classList.add('visible');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('visible');
}

// ========================
// NAV ICONS (SVG strings)
// ========================

const NAV_ICONS = {
  revenue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/></svg>',
  segment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/><path d="M2 12h20"/></svg>',
  temporal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  prediction: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  advanced: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
  executive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  weekly: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  live: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M2 12h3M19 12h3M12 2v3M12 19v3"/><path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
};

// ========================
// TAB DEFINITIONS PER EXCHANGE
// ========================

const EXCHANGE_TABS = {
  nse: [
    { id: 'revenue',    label: 'Revenue Summary',    icon: 'revenue' },
    { id: 'segment',    label: 'Segment Deep-Dive',  icon: 'segment' },
    { id: 'temporal',   label: 'Temporal Analysis',   icon: 'temporal' },
    { id: 'prediction', label: 'PAT Prediction',      icon: 'prediction' },
    { id: 'advanced',   label: 'Advanced Analytics',  icon: 'advanced' },
    { id: 'executive',  label: 'Executive Summary',   icon: 'executive' },
    { id: 'live',       label: 'Live Market',          icon: 'live' },
  ],
  bse: [
    { id: 'revenue',    label: 'Revenue Summary',     icon: 'revenue' },
    { id: 'segment',    label: 'Segment Deep-Dive',   icon: 'segment' },
    { id: 'temporal',   label: 'Quarterly Analysis',   icon: 'temporal' },
    { id: 'prediction', label: 'Revenue Predictor',    icon: 'prediction' },
    { id: 'advanced',   label: 'Monthly Analysis',     icon: 'advanced' },
    { id: 'executive',  label: 'Executive Summary',    icon: 'executive' },
    { id: 'weekly',     label: 'Weekly Analysis',      icon: 'weekly' },
    { id: 'live',       label: 'Live Market',           icon: 'live' },
  ],
};

const TAB_TITLES = {
  nse: {
    revenue: 'Revenue Summary',
    segment: 'Segment Deep-Dive',
    temporal: 'Temporal Analysis',
    prediction: 'PAT Prediction Engine',
    advanced: 'Advanced Analytics',
    executive: 'Executive Summary',
    live: 'NSE Live Market',
  },
  bse: {
    revenue: 'Revenue Summary',
    segment: 'Segment Deep-Dive',
    temporal: 'Quarterly Analysis',
    prediction: 'Revenue Predictor',
    advanced: 'Monthly Analysis',
    executive: 'Executive Summary',
    weekly: 'Weekly Analysis',
    live: 'NSE Live Market',
  }
};

// ========================
// SIDEBAR NAV BUILDER
// ========================

function buildSidebarNav(exchange) {
  const nav = document.getElementById('sidebarNav');
  const tabs = EXCHANGE_TABS[exchange];
  nav.innerHTML = tabs.map((t, i) =>
    `<button class="nav-item${i === 0 ? ' active' : ''}" data-tab="${t.id}" aria-label="${t.label}">
      ${NAV_ICONS[t.icon]}
      ${t.label}
    </button>`
  ).join('');
  attachTabListeners();
}

// ========================
// TAB NAVIGATION
// ========================

function attachTabListeners() {
  document.querySelectorAll('.nav-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      const tabEl = document.getElementById('tab-' + tab);
      if (tabEl) tabEl.classList.add('active');
      const titles = TAB_TITLES[currentExchange] || {};
      document.getElementById('headerTitle').textContent = titles[tab] || tab;
      // Close mobile nav
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebarOverlay').classList.remove('open');
      // Resize charts after tab switch
      setTimeout(() => {
        Object.values(charts).forEach(c => { if (c && c.resize) c.resize(); });
      }, 50);
    });
  });
}

// Sub-tabs — use event delegation since content is dynamic
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.sub-tab');
  if (!btn) return;
  const st = btn.dataset.subtab;
  if (!st) return;
  const tabContent = btn.closest('.tab-content') || btn.closest('[id^="nse"]') || btn.closest('[id^="bse"]') || btn.parentElement.parentElement;
  const container = btn.closest('.tab-content') || document.getElementById('tab-segment');
  // Deactivate siblings
  btn.parentElement.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Find the correct scope for sub-content toggling
  const scope = btn.closest('#nseSegmentContent') || btn.closest('#bseSegmentContent') || container;
  scope.querySelectorAll('.sub-content').forEach(c => c.classList.remove('active'));
  const target = document.getElementById('subtab-' + st);
  if (target) target.classList.add('active');
  setTimeout(() => {
    Object.values(charts).forEach(c => { if (c && c.resize) c.resize(); });
  }, 50);
});

// Mobile nav
document.getElementById('mobileNavToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
});
document.getElementById('sidebarOverlay').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
});

// ========================
// EXCHANGE SWITCHER
// ========================

function initExchangeSwitcher() {
  document.querySelectorAll('.exchange-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const exchange = btn.dataset.exchange;
      if (exchange === currentExchange) return;
      document.querySelectorAll('.exchange-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      await switchExchange(exchange);
    });
  });
}

async function switchExchange(exchange) {
  showLoading(exchange);
  // Destroy all existing charts
  Object.values(charts).forEach(c => { if (c && c.destroy) c.destroy(); });
  Object.keys(charts).forEach(k => delete charts[k]);
  currentExchange = exchange;
  // Update logo
  document.getElementById('logoText').textContent = exchange.toUpperCase() + ' Analytics';
  // Update sidebar nav
  buildSidebarNav(exchange);
  // Show/hide exchange-specific content sections
  toggleExchangeContent(exchange);
  // Load data
  await loadExchangeData(exchange);
  // Update header info
  updateHeaderInfo();
  // Build all visualizations
  rebuildAll();
  hideLoading();
  // Activate first tab
  const firstNavItem = document.querySelector('.nav-item[data-tab]');
  if (firstNavItem) firstNavItem.click();
}

function toggleExchangeContent(exchange) {
  const isNSE = exchange === 'nse';
  // Segment tab content
  const nseSegment = document.getElementById('nseSegmentContent');
  const bseSegment = document.getElementById('bseSegmentContent');
  if (nseSegment) nseSegment.style.display = isNSE ? '' : 'none';
  if (bseSegment) bseSegment.style.display = isNSE ? 'none' : '';
  // Temporal/Quarterly tab content
  const nseTemporal = document.getElementById('nseTemporalContent');
  const bseQuarterly = document.getElementById('bseQuarterlyContent');
  if (nseTemporal) nseTemporal.style.display = isNSE ? '' : 'none';
  if (bseQuarterly) bseQuarterly.style.display = isNSE ? 'none' : '';
  // Prediction tab content
  const nsePred = document.getElementById('nsePredictionContent');
  const bsePred = document.getElementById('bsePredictionContent');
  if (nsePred) nsePred.style.display = isNSE ? '' : 'none';
  if (bsePred) bsePred.style.display = isNSE ? 'none' : '';
  // Advanced/Monthly tab content
  const nseAdv = document.getElementById('nseAdvancedContent');
  const bseMonthly = document.getElementById('bseMonthlyContent');
  if (nseAdv) nseAdv.style.display = isNSE ? '' : 'none';
  if (bseMonthly) bseMonthly.style.display = isNSE ? 'none' : '';
  // Executive extras
  const nseExec = document.getElementById('nseExecExtras');
  const bseExec = document.getElementById('bseExecExtras');
  if (nseExec) nseExec.style.display = isNSE ? '' : 'none';
  if (bseExec) bseExec.style.display = isNSE ? 'none' : '';
}

// ========================
// DATA LOADING
// ========================

async function loadExchangeData(exchange) {
  const prefix = exchange === 'nse' ? 'nse' : 'bse';
  const [dashRes, enrichRes] = await Promise.all([
    fetch(`./data/${prefix}_dashboard_data.json`),
    fetch(`./data/${prefix}_enriched_data.json`)
  ]);
  DATA = await dashRes.json();
  ENRICHED_DATA = await enrichRes.json();
}

// ========================
// HEADER INFO UPDATE
// ========================

function updateHeaderInfo() {
  const dailyAll = DATA.daily_all || DATA.daily;
  if (dailyAll && dailyAll.length > 0) {
    const lastDate = dailyAll[dailyAll.length - 1].date;
    const d = new Date(lastDate + 'T00:00:00');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const formatted = ('0' + d.getDate()).slice(-2) + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    const span = document.getElementById('lastUpdatedSpan');
    if (span) span.textContent = 'Last Updated: ' + formatted;
  }
  const cqSpan = document.getElementById('currentQuarterSpan');
  if (cqSpan && DATA.summary) {
    cqSpan.textContent = DATA.summary.current_quarter;
  }
}

// ========================
// REBUILD ALL
// ========================

function rebuildAll() {
  applyChartDefaults();
  // Shared
  buildRevenueSummary();
  buildExecutiveSummary();

  if (currentExchange === 'nse') {
    buildNSESegmentCharts();
    buildNSETemporalCharts();
    buildNSEQuarterlyCharts();
    initNSEQuarterCompare();
    buildNSEExtrapolationKPIs();
    buildNSEPredictedPnLTable();
    initNSEPATPredictor();
    initNSEPEValuation();
    initNSEPrediction();
    buildNSEAdvancedCharts();
    buildNSEMonthlyAnalysis();
  } else {
    buildBSESegmentCharts();
    buildBSEQuarterlyAnalysis();
    buildBSERevenuePredictor();
    buildBSEMonthlyAnalysis();
    buildBSEWeeklyAnalysis();
  }
}

// ========================
// REVENUE SUMMARY — SHARED
// ========================

function getRevFieldObj(segKey) {
  // Returns field names for quarterly and monthly data
  if (segKey === 'total') return { qField: 'total_rev', mField: 'total_rev', dField: 'total_rev' };
  if (segKey === 'options') return { qField: 'opt_rev', mField: 'opt_rev', dField: 'opt_rev' };
  if (segKey === 'futures') return { qField: 'fut_rev', mField: 'fut_rev', dField: 'fut_rev' };
  if (segKey === 'cash') return { qField: 'cash_rev', mField: 'cash_rev', dField: 'cash_rev' };
  return { qField: 'total_rev', mField: 'total_rev', dField: 'total_rev' };
}

function getYoYQuarter(qLabel) {
  const m = qLabel.match(/^(Q\d) FY (\d{4})$/);
  if (!m) return null;
  return m[1] + ' FY ' + (parseInt(m[2]) - 1);
}

function computeQuarterMetrics(qIdx, segKey) {
  const rf = getRevFieldObj(segKey);
  const allQ = DATA.quarterly;
  const sel = allQ[qIdx];
  const days = sel.days || sel.trading_days || 1;
  const selAvg = sel[rf.qField] / days;
  const prev = qIdx > 0 ? allQ[qIdx - 1] : null;
  const prevDays = prev ? (prev.days || prev.trading_days || 1) : 1;
  const prevAvg = prev ? prev[rf.qField] / prevDays : null;
  const qoq = prevAvg ? (selAvg - prevAvg) / prevAvg : null;

  const yoyLabel = getYoYQuarter(sel.quarter);
  const yoyQ = yoyLabel ? allQ.find(q => q.quarter === yoyLabel) : null;
  const yoyDays = yoyQ ? (yoyQ.days || yoyQ.trading_days || 1) : 1;
  const yoyAvg = yoyQ ? yoyQ[rf.qField] / yoyDays : null;
  const yoy = yoyAvg ? (selAvg - yoyAvg) / yoyAvg : null;

  return {
    label: sel.quarter,
    value: selAvg,
    prevLabel: prev ? prev.quarter : '—',
    prevValue: prevAvg,
    qoq: qoq,
    yoyLabel: yoyLabel || '—',
    yoyValue: yoyAvg,
    yoy: yoy
  };
}

function computeMonthMetrics(mIdx, segKey) {
  const rf = getRevFieldObj(segKey);
  const allM = DATA.monthly;
  const sel = allM[mIdx];
  const days = sel.trading_days || sel.days || 1;
  const selAvg = sel[rf.mField] / days;
  const prev = mIdx > 0 ? allM[mIdx - 1] : null;
  const prevDays = prev ? (prev.trading_days || prev.days || 1) : 1;
  const prevAvg = prev ? prev[rf.mField] / prevDays : null;
  const mom = prevAvg ? (selAvg - prevAvg) / prevAvg : null;

  let sumAvg = 0, cnt = 0;
  for (let i = Math.max(0, mIdx - 5); i <= mIdx; i++) {
    const mDays = allM[i].trading_days || allM[i].days || 1;
    sumAvg += allM[i][rf.mField] / mDays;
    cnt++;
  }
  const avg6m = cnt > 0 ? sumAvg / cnt : null;
  const mo6m = avg6m ? (selAvg - avg6m) / avg6m : null;

  return {
    label: sel.month,
    value: selAvg,
    prevLabel: prev ? prev.month : '—',
    prevValue: prevAvg,
    mom: mom,
    avg6mValue: avg6m,
    mo6m: mo6m
  };
}

function buildRevSummaryContent(segData, containerId, isTotal, segKey) {
  const s = segData;
  const wl5 = s.weekly.last5;
  const wp5 = s.weekly.prev5;
  const w50 = s.weekly.last50;
  const dow = s.day_of_week;

  const allQ = DATA.quarterly;
  const defaultQIdx = allQ.length - 1;
  const qOptions = allQ.map((q, i) => `<option value="${i}"${i === defaultQIdx ? ' selected' : ''}>${q.quarter}</option>`).join('');

  const allM = DATA.monthly;
  const defaultMIdx = allM.length - 1;
  const mOptions = allM.map((m, i) => `<option value="${i}"${i === defaultMIdx ? ' selected' : ''}>${m.month}</option>`).join('');

  const qSelId = `revQSel_${segKey}`;
  const mSelId = `revMSel_${segKey}`;
  const qTbodyId = `revQTbody_${segKey}`;
  const mTbodyId = `revMTbody_${segKey}`;

  const qm = computeQuarterMetrics(defaultQIdx, segKey);
  const qTbody = `
    <tr><td>${qm.label}</td><td>${fmt(qm.value)}</td><td>—</td></tr>
    <tr><td>vs Previous (${qm.prevLabel})</td><td>${qm.prevValue != null ? fmt(qm.prevValue) : '—'}</td><td>QoQ: ${fmtPctSigned(qm.qoq)}</td></tr>
    <tr><td>vs Year Ago (${qm.yoyLabel})</td><td>${qm.yoyValue != null ? fmt(qm.yoyValue) : '—'}</td><td>YoY: ${fmtPctSigned(qm.yoy)}</td></tr>`;

  const mm = computeMonthMetrics(defaultMIdx, segKey);
  const mTbody = `
    <tr><td>${mm.label}</td><td>${fmt(mm.value)}</td><td>—</td></tr>
    <tr><td>vs Previous (${mm.prevLabel})</td><td>${mm.prevValue != null ? fmt(mm.prevValue) : '—'}</td><td>MoM: ${fmtPctSigned(mm.mom)}</td></tr>
    <tr><td>vs 6-Month Avg</td><td>${mm.avg6mValue != null ? fmt(mm.avg6mValue) : '—'}</td><td>Mo6M: ${fmtPctSigned(mm.mo6m)}</td></tr>`;

  let quarterlyHTML = `
    <div class="rev-card">
      <h4>Quarterly Revenue <span class="rev-badge">Daily Avg</span></h4>
      <div class="rev-dropdown-row"><label>Quarter</label><select class="rev-select" id="${qSelId}">${qOptions}</select></div>
      <table class="data-table">
        <thead><tr><th>Period</th><th>Daily Avg Rev</th><th>Change</th></tr></thead>
        <tbody id="${qTbodyId}">${qTbody}</tbody>
      </table>
    </div>`;

  let monthlyHTML = `
    <div class="rev-card">
      <h4>Monthly Revenue <span class="rev-badge">Daily Avg</span></h4>
      <div class="rev-dropdown-row"><label>Month</label><select class="rev-select" id="${mSelId}">${mOptions}</select></div>
      <table class="data-table">
        <thead><tr><th>Period</th><th>Daily Avg Rev</th><th>Change</th></tr></thead>
        <tbody id="${mTbodyId}">${mTbody}</tbody>
      </table>
    </div>`;

  let weeklyHTML = `
    <div class="rev-card">
      <h4>Weekly Revenue <span class="rev-badge">Daily Avg</span></h4>
      <table class="data-table">
        <thead><tr><th>Period</th><th>Daily Avg Rev</th><th>Change</th></tr></thead>
        <tbody>
          <tr><td>Last 5 Trading Days</td><td>${fmt(wl5.value)}</td><td>—</td></tr>
          <tr><td>Previous 5 Trading Days</td><td>${fmt(wp5.value)}</td><td>WoW: ${fmtPctSigned(wl5.wow)}</td></tr>
          <tr><td>Last 50 Trading Days</td><td>${fmt(w50.value)}</td><td>Wo10W: ${fmtPctSigned(wl5.wo10w)}</td></tr>
        </tbody>
      </table>
    </div>`;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  let dowRows = days.map(d => {
    const dd = dow[d];
    return `<tr>
      <td>${d}</td>
      <td>${fmt(dd.latest)}</td>
      <td>${fmt(dd.avg_3d)}</td>
      <td>${fmtPctSigned(dd.do3d)}</td>
      <td>${fmt(dd.avg_10d)}</td>
      <td>${fmtPctSigned(dd.do10d)}</td>
    </tr>`;
  }).join('');

  let dowHTML = `
    <div class="rev-card">
      <h4>Day-of-Week Analysis</h4>
      <table class="data-table">
        <thead><tr><th>Day</th><th>Latest (₹ Cr)</th><th>3-Day Avg</th><th>Do3D %</th><th>10-Day Avg</th><th>Do10D %</th></tr></thead>
        <tbody>${dowRows}</tbody>
      </table>
    </div>`;

  let prevWeekHTML = '';
  if (s.previous_week) {
    const pw = s.previous_week;
    let pwRows = days.map(d => `<tr><td>${d}</td><td>${pw[d] != null ? fmt(pw[d]) : '—'}</td></tr>`).join('');
    prevWeekHTML = `
    <div class="rev-card rev-full-width">
      <h4>Previous Week Breakdown</h4>
      <table class="data-table">
        <thead><tr><th>Day</th><th>Revenue (₹ Cr)</th></tr></thead>
        <tbody>${pwRows}</tbody>
      </table>
    </div>`;
  }

  document.getElementById(containerId).innerHTML = `
    <div class="rev-summary-grid">
      <div>
        ${quarterlyHTML}
        <div style="margin-top:var(--space-4)">${weeklyHTML}</div>
      </div>
      <div>
        ${monthlyHTML}
        <div style="margin-top:var(--space-4)">${dowHTML}</div>
      </div>
      ${prevWeekHTML}
    </div>
  `;

  document.getElementById(qSelId).addEventListener('change', function() {
    const idx = parseInt(this.value);
    const q = computeQuarterMetrics(idx, segKey);
    document.getElementById(qTbodyId).innerHTML = `
      <tr><td>${q.label}</td><td>${fmt(q.value)}</td><td>—</td></tr>
      <tr><td>vs Previous (${q.prevLabel})</td><td>${q.prevValue != null ? fmt(q.prevValue) : '—'}</td><td>QoQ: ${fmtPctSigned(q.qoq)}</td></tr>
      <tr><td>vs Year Ago (${q.yoyLabel})</td><td>${q.yoyValue != null ? fmt(q.yoyValue) : '—'}</td><td>YoY: ${fmtPctSigned(q.yoy)}</td></tr>`;
  });

  document.getElementById(mSelId).addEventListener('change', function() {
    const idx = parseInt(this.value);
    const m = computeMonthMetrics(idx, segKey);
    document.getElementById(mTbodyId).innerHTML = `
      <tr><td>${m.label}</td><td>${fmt(m.value)}</td><td>—</td></tr>
      <tr><td>vs Previous (${m.prevLabel})</td><td>${m.prevValue != null ? fmt(m.prevValue) : '—'}</td><td>MoM: ${fmtPctSigned(m.mom)}</td></tr>
      <tr><td>vs 6-Month Avg</td><td>${m.avg6mValue != null ? fmt(m.avg6mValue) : '—'}</td><td>Mo6M: ${fmtPctSigned(m.mo6m)}</td></tr>`;
  });
}

function buildRevenueSummary() {
  buildRevSummaryContent(ENRICHED_DATA.summary_total, 'subtab-rev-total', true, 'total');
  buildRevSummaryContent(ENRICHED_DATA.seg_options, 'subtab-rev-options', false, 'options');
  buildRevSummaryContent(ENRICHED_DATA.seg_futures, 'subtab-rev-futures', false, 'futures');
  buildRevSummaryContent(ENRICHED_DATA.seg_cash, 'subtab-rev-cash', false, 'cash');
}

// ========================
// EXECUTIVE SUMMARY — SHARED
// ========================

function buildExecutiveSummary() {
  const q = DATA.quarterly;
  const cq = q[q.length - 1];
  const pq = q.length > 1 ? q[q.length - 2] : null;
  const cqDays = cq.days || cq.trading_days || 1;

  if (currentExchange === 'nse') {
    buildNSEExecutiveKPIs(cq, pq);
  } else {
    buildBSEExecutiveKPIs(cq, pq, cqDays);
  }

  // Donut chart — shared
  const donutLabel = document.getElementById('donutQuarterLabel');
  if (donutLabel) donutLabel.textContent = cq.quarter;
  setCanvasHeight('chartDonut', 260);
  charts.donut = new Chart(document.getElementById('chartDonut'), {
    type: 'doughnut',
    data: {
      labels: ['Options', 'Futures', 'Cash'],
      datasets: [{
        data: [cq.opt_rev, cq.fut_rev, cq.cash_rev],
        backgroundColor: [CHART_COLORS[0], CHART_COLORS[1], CHART_COLORS[3]],
        borderColor: getDonutBorderColor(),
        borderWidth: 2,
        hoverBorderColor: getDonutBorderColor(),
      }]
    },
    options: {
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16 } },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((ctx.raw / total) * 100).toFixed(1);
              return ctx.label + ': ' + fmt(ctx.raw) + ' (' + pct + '%)';
            }
          }
        }
      }
    }
  });

  // Quarterly revenue bar chart — shared
  setCanvasHeight('chartExecQuarterlyRev', 300);
  charts.execQuarterlyRev = new Chart(document.getElementById('chartExecQuarterlyRev'), {
    type: 'bar',
    data: {
      labels: q.map(x => { const p = x.quarter.split(' '); return p[0] + " '" + p[2].slice(2); }),
      datasets: [
        { label: 'Cash', data: q.map(x => x.cash_rev), backgroundColor: CHART_COLORS[3], borderRadius: 2, stack: 'stack', order: 3 },
        { label: 'Futures', data: q.map(x => x.fut_rev), backgroundColor: CHART_COLORS[1], borderRadius: 2, stack: 'stack', order: 2 },
        { label: 'Options', data: q.map(x => x.opt_rev), backgroundColor: CHART_COLORS[0], borderRadius: 2, stack: 'stack', order: 1 },
      ]
    },
    options: {
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw),
            footer: items => 'Total: ' + fmt(items.reduce((s, i) => s + i.raw, 0))
          }
        }
      },
      scales: {
        x: { stacked: true, ticks: { maxRotation: 45, font: { size: 10 } } },
        y: { stacked: true, ticks: { callback: v => '₹' + fmtNum(v, 0) } }
      }
    }
  });

  if (currentExchange === 'nse') {
    buildNSEWeeklyRevChart();
  } else {
    buildBSEExecExtras();
  }
}

function buildNSEExecutiveKPIs(cq, pq) {
  const qoq = pq ? (cq.total_rev - pq.total_rev) / pq.total_rev : 0;
  const optQoq = pq ? (cq.opt_rev - pq.opt_rev) / pq.opt_rev : 0;
  const futQoq = pq ? (cq.fut_rev - pq.fut_rev) / pq.fut_rev : 0;
  const cashQoq = pq ? (cq.cash_rev - pq.cash_rev) / pq.cash_rev : 0;

  // Latest PAT from pnl
  const actualPnl = (DATA.pnl || []).filter(p => !p.is_predicted);
  const lastPnl = actualPnl.length > 0 ? actualPnl[actualPnl.length - 1] : null;
  const prevPnl = actualPnl.length > 1 ? actualPnl[actualPnl.length - 2] : null;
  const patQoq = lastPnl && prevPnl ? (lastPnl.pat - prevPnl.pat) / prevPnl.pat : 0;

  const kpis = [
    { label: 'Quarter Revenue', value: fmt(cq.total_rev), delta: qoq, sub: cq.quarter },
    { label: 'Options Revenue', value: fmt(cq.opt_rev), delta: optQoq, sub: fmtPct(cq.opt_rev / cq.total_rev) + ' of total' },
    { label: 'Futures Revenue', value: fmt(cq.fut_rev), delta: futQoq, sub: '' },
    { label: 'Cash Revenue', value: fmt(cq.cash_rev), delta: cashQoq, sub: '' },
  ];

  if (lastPnl) {
    kpis.push({ label: 'Latest PAT', value: fmt(lastPnl.pat), delta: patQoq, sub: lastPnl.quarter });
    kpis.push({ label: 'EBITDA Margin', value: fmtPct(lastPnl.ebitda_margin), delta: prevPnl ? (lastPnl.ebitda_margin - prevPnl.ebitda_margin) / prevPnl.ebitda_margin : 0, sub: 'vs ' + (prevPnl ? fmtPct(prevPnl.ebitda_margin) : '—') });
  }

  renderKPIs(kpis);
}

function buildBSEExecutiveKPIs(cq, pq, cqDays) {
  const dailyAvg = cq.total_rev / cqDays;
  const prevDailyAvg = pq ? pq.total_rev / (pq.days || pq.trading_days || 1) : null;
  const qoq = prevDailyAvg ? (dailyAvg - prevDailyAvg) / prevDailyAvg : 0;
  const optPct = cq.total_rev > 0 ? cq.opt_rev / cq.total_rev : 0;

  const kpis = [
    { label: 'Quarter Revenue', value: fmt(cq.total_rev), delta: qoq, sub: cq.quarter },
    { label: 'Options Revenue', value: fmt(cq.opt_rev), delta: null, sub: fmtPct(optPct) + ' of total' },
    { label: 'Cash Revenue', value: fmt(cq.cash_rev), delta: null, sub: '' },
    { label: 'Daily Avg Revenue', value: fmt(dailyAvg), delta: qoq, sub: cqDays + ' trading days' },
  ];

  renderKPIs(kpis);
}

function renderKPIs(kpis) {
  const grid = document.getElementById('kpiGrid');
  grid.innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.value}</div>
      ${k.delta != null ? `<span class="kpi-delta ${deltaClass(k.delta)}">${deltaStr(k.delta)}</span>` : ''}
      ${k.sub ? `<div style="font-size:var(--text-xs);color:var(--color-text-faint);margin-top:4px">${k.sub}</div>` : ''}
    </div>
  `).join('');
}

function buildNSEWeeklyRevChart() {
  const w = DATA.weekly;
  setCanvasHeight('chartWeeklyRev', 260);
  charts.weeklyRev = new Chart(document.getElementById('chartWeeklyRev'), {
    type: 'bar',
    data: {
      labels: w.map(x => {
        const d = new Date(x.week);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      }),
      datasets: [
        { label: 'Cash', data: w.map(x => x.cash_rev), backgroundColor: CHART_COLORS[3], stack: 's', borderRadius: 2, order: 3 },
        { label: 'Futures', data: w.map(x => x.fut_rev), backgroundColor: CHART_COLORS[1], stack: 's', borderRadius: 2, order: 2 },
        { label: 'Options', data: w.map(x => x.opt_rev), backgroundColor: CHART_COLORS[0], stack: 's', borderRadius: 2, order: 1 },
      ]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw),
            footer: items => 'Total: ' + fmt(items.reduce((s, i) => s + i.raw, 0))
          }
        }
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, ticks: { callback: v => '₹' + fmtNum(v, 0) } }
      }
    }
  });
}

function buildBSEExecExtras() {
  // Daily Revenue with 10-day MA
  const daily = DATA.daily;
  const dailyLabels = daily.map(x => {
    const dt = new Date(x.date);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  });
  const dailyRev = daily.map(x => x.total_rev);
  const ma10 = dailyRev.map((_, i) => {
    if (i < 9) return null;
    let sum = 0;
    for (let j = i - 9; j <= i; j++) sum += dailyRev[j];
    return sum / 10;
  });

  setCanvasHeight('chartExecDailyMA', 280);
  charts.execDailyMA = new Chart(document.getElementById('chartExecDailyMA'), {
    type: 'line',
    data: {
      labels: dailyLabels,
      datasets: [
        { label: 'Daily Revenue', data: dailyRev, borderColor: CHART_COLORS[0] + '60', borderWidth: 1, pointRadius: 0 },
        { label: '10-Day MA', data: ma10, borderColor: CHART_COLORS[4], borderWidth: 2.5, pointRadius: 0 },
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw) } } },
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });

  // Summary table
  const s = DATA.summary;
  const dailyAll = DATA.daily_all || DATA.daily;
  const firstDate = dailyAll[0].date;
  const lastDate = dailyAll[dailyAll.length - 1].date;
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return ('0' + d.getDate()).slice(-2) + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  };
  const cq = DATA.quarterly[DATA.quarterly.length - 1];

  let summaryHTML = `<thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>`;
  summaryHTML += `<tr><td>Last Updated</td><td>${formatDate(s.last_date)}</td></tr>`;
  summaryHTML += `<tr><td>Total Trading Days</td><td>${fmtNum(s.total_trading_days, 0)}</td></tr>`;
  summaryHTML += `<tr><td>Date Range</td><td>${formatDate(firstDate)} — ${formatDate(lastDate)}</td></tr>`;
  summaryHTML += `<tr><td>Current Quarter</td><td>${s.current_quarter}</td></tr>`;
  summaryHTML += `<tr><td>Current Quarter Days</td><td>${cq.days || cq.trading_days}</td></tr>`;
  summaryHTML += `<tr><td>Current Quarter Total Revenue</td><td>${fmt(cq.total_rev)}</td></tr>`;
  summaryHTML += `<tr><td>Current Quarter Options Revenue</td><td>${fmt(cq.opt_rev)}</td></tr>`;
  summaryHTML += `<tr><td>Current Quarter Cash Revenue</td><td>${fmt(cq.cash_rev)}</td></tr>`;
  summaryHTML += `</tbody>`;
  document.getElementById('tableExecSummary').innerHTML = summaryHTML;
}

// ========================
// NSE: SEGMENT DEEP-DIVE
// ========================

function buildNSESegmentCharts() {
  const d = DATA.daily;
  const labels = d.map(x => {
    const dt = new Date(x.date);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  });

  // IO vs SO
  setCanvasHeight('chartIOSO', 280);
  charts.ioso = new Chart(document.getElementById('chartIOSO'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'IO Revenue', data: d.map(x => x.io_rev), borderColor: CHART_COLORS[0], backgroundColor: CHART_COLORS[0] + '20', fill: true },
        { label: 'SO Revenue', data: d.map(x => x.so_rev), borderColor: CHART_COLORS[1], backgroundColor: CHART_COLORS[1] + '20', fill: true },
      ]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) } }
      },
      plugins: { tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw) } } }
    }
  });

  // IO Premium
  setCanvasHeight('chartPremium', 280);
  charts.premium = new Chart(document.getElementById('chartPremium'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'IO Premium (₹ Cr)',
        data: d.map(x => x.io_premium),
        borderColor: CHART_COLORS[0],
        backgroundColor: CHART_COLORS[0] + '15',
        fill: true
      }]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });

  // IO PCR
  setCanvasHeight('chartPCR', 260);
  charts.pcr = new Chart(document.getElementById('chartPCR'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'IO Put-Call Ratio',
        data: d.map(x => x.io_pcr),
        borderColor: CHART_COLORS[5],
        pointRadius: 1,
      }]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 15, font: { size: 10 } } },
        y: { suggestedMin: 0.5, suggestedMax: 1.5 }
      }
    }
  });

  // IF vs SF
  setCanvasHeight('chartIFSF', 280);
  charts.ifsf = new Chart(document.getElementById('chartIFSF'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'IF Revenue', data: d.map(x => x.if_rev), borderColor: CHART_COLORS[2], backgroundColor: CHART_COLORS[2] + '20', fill: true },
        { label: 'SF Revenue', data: d.map(x => x.sf_rev), borderColor: CHART_COLORS[5], backgroundColor: CHART_COLORS[5] + '20', fill: true },
      ]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 1) } }
      },
      plugins: { tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw) } } }
    }
  });

  // Futures Turnover
  setCanvasHeight('chartFutTurnover', 280);
  charts.futTurnover = new Chart(document.getElementById('chartFutTurnover'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'IF Turnover', data: d.map(x => x.if_turnover), backgroundColor: CHART_COLORS[2] },
        { label: 'SF Turnover', data: d.map(x => x.sf_turnover), backgroundColor: CHART_COLORS[5] },
      ]
    },
    options: {
      scales: {
        x: { stacked: true, ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y: { stacked: true, ticks: { callback: v => '₹' + (v / 1000).toFixed(0) + 'K Cr' } }
      }
    }
  });

  // Cash: Traded Value
  setCanvasHeight('chartCashValue', 280);
  charts.cashValue = new Chart(document.getElementById('chartCashValue'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Cash Traded Value (₹ Cr)',
        data: d.map(x => x.cash_traded_value),
        backgroundColor: CHART_COLORS[3],
        borderRadius: 2,
      }]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) } }
      }
    }
  });

  // Cash Revenue
  setCanvasHeight('chartCashRev', 280);
  charts.cashRev = new Chart(document.getElementById('chartCashRev'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Cash Revenue',
        data: d.map(x => x.cash_rev),
        borderColor: CHART_COLORS[0],
        backgroundColor: CHART_COLORS[0] + '20',
        fill: true,
      }]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 1) + ' Cr' } }
      }
    }
  });
}

// ========================
// BSE: SEGMENT DEEP-DIVE
// ========================

function buildBSESegmentCharts() {
  const d = DATA.daily;
  const labels = d.map(x => {
    const dt = new Date(x.date);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  });

  // Options Premium Turnover
  setCanvasHeight('chartBseOptPremium', 280);
  charts.bseOptPremium = new Chart(document.getElementById('chartBseOptPremium'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Options Premium Turnover (₹ Cr)',
        data: d.map(x => x.options_premium_turnover || 0),
        borderColor: CHART_COLORS[0],
        backgroundColor: CHART_COLORS[0] + '15',
        fill: true
      }]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });

  // Cash Traded Value
  setCanvasHeight('chartBseCashValue', 280);
  charts.bseCashValue = new Chart(document.getElementById('chartBseCashValue'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Cash Traded Value (₹ Cr)',
        data: d.map(x => x.cash_traded_value),
        backgroundColor: CHART_COLORS[3],
        borderRadius: 2,
      }]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) } }
      }
    }
  });

  // Contract Volume
  setCanvasHeight('chartBseContracts', 280);
  charts.bseContracts = new Chart(document.getElementById('chartBseContracts'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Contract Volume',
        data: d.map(x => x.total_contracts / 1e6),
        backgroundColor: CHART_COLORS[2] + '80',
        borderColor: CHART_COLORS[2],
        borderWidth: 1,
        borderRadius: 2,
      }]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y: { ticks: { callback: v => fmtNum(v, 1) + ' Mn' } }
      },
      plugins: {
        tooltip: { callbacks: { label: ctx => 'Contracts: ' + fmtNum(ctx.raw, 2) + ' Mn' } }
      }
    }
  });
}

// ========================
// NSE: TEMPORAL ANALYSIS
// ========================

function buildNSETemporalCharts() {
  // Day-of-week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dowData = days.map(d => (DATA.dow_avg || {})[d] || { avg_total: 0, avg_options: 0, avg_futures: 0, avg_cash: 0 });

  setCanvasHeight('chartDOW', 280);
  charts.dow = new Chart(document.getElementById('chartDOW'), {
    type: 'bar',
    data: {
      labels: days,
      datasets: [
        { label: 'Options', data: dowData.map(x => x.avg_options), backgroundColor: CHART_COLORS[0], stack: 's', borderRadius: 2 },
        { label: 'Futures', data: dowData.map(x => x.avg_futures), backgroundColor: CHART_COLORS[1], stack: 's', borderRadius: 2 },
        { label: 'Cash', data: dowData.map(x => x.avg_cash), backgroundColor: CHART_COLORS[3], stack: 's', borderRadius: 2 },
      ]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw),
            footer: items => 'Total Avg: ' + fmt(items.reduce((s, i) => s + i.raw, 0))
          }
        }
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });

  // Monthly revenue
  const m = DATA.monthly;
  setCanvasHeight('chartMonthlyRev', 280);
  charts.monthlyRev = new Chart(document.getElementById('chartMonthlyRev'), {
    type: 'line',
    data: {
      labels: m.map(x => x.month),
      datasets: [{
        label: 'Monthly Revenue',
        data: m.map(x => x.total_rev),
        borderColor: CHART_COLORS[0],
        backgroundColor: CHART_COLORS[0] + '15',
        fill: true,
        pointRadius: 2,
      }]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 18, maxRotation: 45, font: { size: 9 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });

  // Daily with 10-day MA
  const d = DATA.daily;
  const dailyLabels = d.map(x => {
    const dt = new Date(x.date);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  });
  const dailyRev = d.map(x => x.total_rev);
  const ma10 = dailyRev.map((_, i) => {
    if (i < 9) return null;
    let sum = 0;
    for (let j = i - 9; j <= i; j++) sum += dailyRev[j];
    return sum / 10;
  });

  setCanvasHeight('chartDailyMA', 280);
  charts.dailyMA = new Chart(document.getElementById('chartDailyMA'), {
    type: 'line',
    data: {
      labels: dailyLabels,
      datasets: [
        { label: 'Daily Revenue', data: dailyRev, borderColor: CHART_COLORS[0] + '60', borderWidth: 1, pointRadius: 1 },
        { label: '10-day MA', data: ma10, borderColor: CHART_COLORS[5], borderWidth: 2.5 },
      ]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 15, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) } }
      }
    }
  });

  // Quarterly table
  buildNSEQuarterlyTable();
}

function buildNSEQuarterlyTable() {
  const q = DATA.quarterly;
  let html = '<thead><tr><th>Quarter</th><th>Options</th><th>Futures</th><th>Cash</th><th>Total</th><th>QoQ %</th><th>YoY %</th></tr></thead><tbody>';
  for (let i = 0; i < q.length; i++) {
    const r = q[i];
    const qoq = i > 0 ? ((r.total_rev - q[i-1].total_rev) / q[i-1].total_rev) : null;
    const yoy = i >= 4 ? ((r.total_rev - q[i-4].total_rev) / q[i-4].total_rev) : null;
    html += `<tr>
      <td>${r.quarter}</td>
      <td>${fmt(r.opt_rev)}</td>
      <td>${fmt(r.fut_rev)}</td>
      <td>${fmt(r.cash_rev)}</td>
      <td style="font-weight:600">${fmt(r.total_rev)}</td>
      <td class="${qoq !== null ? deltaClass(qoq) : ''}">${qoq !== null ? deltaStr(qoq) : '—'}</td>
      <td class="${yoy !== null ? deltaClass(yoy) : ''}">${yoy !== null ? deltaStr(yoy) : '—'}</td>
    </tr>`;
  }
  html += '</tbody>';
  document.getElementById('tableQuarterly').innerHTML = html;
}

// ========================
// NSE: QUARTER COMPARISON
// ========================

function initNSEQuarterCompare() {
  const quarters = [...new Set(DATA.daily.map(d => d.fy_quarter))];
  const sel1 = document.getElementById('qtrSelect1');
  const sel2 = document.getElementById('qtrSelect2');
  sel1.innerHTML = '';
  sel2.innerHTML = '<option value="">None</option>';

  const reversedQ = [...quarters].reverse();
  reversedQ.forEach(q => {
    sel1.innerHTML += `<option value="${q}">${q}</option>`;
    sel2.innerHTML += `<option value="${q}">${q}</option>`;
  });
  sel1.value = reversedQ[0];

  function renderQtrCompare() {
    if (charts.qtrCompare) charts.qtrCompare.destroy();
    const q1 = sel1.value;
    const q2 = sel2.value;
    if (!q1) return;

    const q1Data = DATA.daily.filter(d => d.fy_quarter === q1);
    const maxDays = q1Data.length;
    const labels = q1Data.map((_, i) => 'Day ' + (i + 1));
    const datasets = [{
      label: q1,
      data: q1Data.map(d => d.total_rev),
      borderColor: CHART_COLORS[0],
      backgroundColor: CHART_COLORS[0] + '15',
      fill: true, borderWidth: 2, pointRadius: 2, pointHoverRadius: 5,
    }];

    if (q2) {
      const q2Data = DATA.daily.filter(d => d.fy_quarter === q2);
      if (q2Data.length > maxDays) {
        for (let i = maxDays; i < q2Data.length; i++) labels.push('Day ' + (i + 1));
      }
      datasets.push({
        label: q2,
        data: q2Data.map(d => d.total_rev),
        borderColor: CHART_COLORS[1],
        backgroundColor: CHART_COLORS[1] + '15',
        fill: true, borderWidth: 2, borderDash: [5, 3], pointRadius: 2, pointHoverRadius: 5,
      });
    }

    charts.qtrCompare = new Chart(document.getElementById('chartQtrCompare'), {
      type: 'line',
      data: { labels, datasets },
      options: {
        interaction: { mode: 'index', intersect: false },
        plugins: {
          tooltip: {
            callbacks: {
              title: items => items[0].label,
              label: ctx => {
                const qData = ctx.dataset.label === q1
                  ? DATA.daily.filter(d => d.fy_quarter === q1)
                  : DATA.daily.filter(d => d.fy_quarter === q2);
                const actualDate = qData[ctx.dataIndex] ? qData[ctx.dataIndex].date : '';
                return ctx.dataset.label + ': ' + fmt(ctx.raw) + (actualDate ? ' (' + actualDate + ')' : '');
              }
            }
          }
        },
        scales: {
          x: { ticks: { maxTicksLimit: 20, font: { size: 10 } } },
          y: { ticks: { callback: v => '\u20b9' + fmtNum(v, 0) + ' Cr' } }
        }
      }
    });
  }

  sel1.addEventListener('change', renderQtrCompare);
  sel2.addEventListener('change', renderQtrCompare);
  renderQtrCompare();
}

// ========================
// NSE: PAT PREDICTION ENGINE
// ========================

function buildNSEExtrapolationKPIs() {
  const p = ENRICHED_DATA.pnl_predictor;
  if (!p) return;
  const otherIncome = p.total_revenue_predicted - p.transaction_rev_extrapolated;

  const kpis = [
    { label: 'Daily Avg Txn Rev', value: fmt(p.daily_avg_rev) },
    { label: 'Trading Days (Actual / Expected)', value: `${p.q4_fy2026_trading_days_so_far || p.trading_days_so_far} / ${p.q4_fy2025_total_trading_days || p.expected_trading_days}` },
    { label: 'Extrapolated Qtr Txn Rev', value: fmt(p.transaction_rev_extrapolated) },
    { label: `Other Income (${fmtPct(p.other_income_ratio)} of Txn Rev)`, value: fmt(otherIncome) },
    { label: 'Total Revenue (Predicted)', value: fmt(p.total_revenue_predicted), highlight: true },
    { label: 'Predicted PAT', value: fmt(p.pat_predicted), highlight: true },
  ];

  document.getElementById('extrapKpis').innerHTML = kpis.map(k => `
    <div class="extrap-card${k.highlight ? ' highlight' : ''}">
      <div class="extrap-label">${k.label}</div>
      <div class="extrap-value">${k.value}</div>
    </div>
  `).join('');
}

function buildNSEPredictedPnLTable() {
  const quarters = ENRICHED_DATA.pnl_predicted_quarters;
  if (!quarters) return;
  let html = '<thead><tr><th>Quarter</th><th>Txn Rev</th><th>Other Income</th><th>Total Rev</th><th>Total Exp</th><th>EBITDA</th><th>EBITDA %</th><th>PAT</th><th>PAT %</th><th>EPS</th></tr></thead><tbody>';

  let isFirst = true;
  for (const [qName, q] of Object.entries(quarters)) {
    const otherIncome = q.total_revenue - q.transaction_rev;
    const tag = isFirst ? ' <span style="color:var(--color-warning);font-size:10px;font-weight:600">CURRENT</span>' : '';
    const cls = isFirst ? '' : 'predicted';
    html += `<tr class="${cls}">
      <td>${qName}${tag}</td>
      <td>${fmt(q.transaction_rev)}</td>
      <td>${fmt(otherIncome)}</td>
      <td>${fmt(q.total_revenue)}</td>
      <td>${fmt(q.total_expense)}</td>
      <td>${fmt(q.ebitda)}</td>
      <td>${fmtPct(q.ebitda_margin)}</td>
      <td style="font-weight:600">${fmt(q.pat)}</td>
      <td>${fmtPct(q.pat_margin)}</td>
      <td>₹ ${fmtNum(q.eps)}</td>
    </tr>`;
    isFirst = false;
  }
  html += '</tbody>';
  document.getElementById('tablePredictedPnL').innerHTML = html;
}

function initNSEPATPredictor() {
  const p = ENRICHED_DATA.pnl_predictor;
  if (!p || !DATA.cost_ratios) return;
  const lastCostQ = Object.keys(DATA.cost_ratios).pop();
  const cr = DATA.cost_ratios[lastCostQ];

  const dailyRevInput = document.getElementById('inputDailyRev');
  const tradingDaysInput = document.getElementById('inputTradingDays');
  const otherIncomeInput = document.getElementById('inputOtherIncomeRatio');
  const taxInput = document.getElementById('inputTaxRate');
  const sharesInput = document.getElementById('inputShares');

  dailyRevInput.value = p.daily_avg_rev.toFixed(1);
  otherIncomeInput.value = (p.other_income_ratio * 100).toFixed(1);

  document.getElementById('predictorHint').textContent =
    'Current Q4 FY 2026 avg: ₹ ' + p.daily_avg_rev.toFixed(2) + ' Cr/day';

  const costParams = {
    emp_pct: cr.employee_pct || 0.044,
    reg_pct: cr.regulatory_pct || 0.045,
    tech_pct: cr.technology_pct || 0.07,
    dep_pct: cr.depreciation_pct || 0.035,
    csr_other_pct: 0.035,
  };

  function computePredictor() {
    const dailyRev = Number(dailyRevInput.value) || 0;
    const tradingDays = Number(tradingDaysInput.value) || 62;
    const otherIncomeRatio = (Number(otherIncomeInput.value) || 0) / 100;
    const taxRate = (Number(taxInput.value) || 25.2) / 100;
    const shares = Number(sharesInput.value) || 247.5;

    if (dailyRev <= 0) {
      document.getElementById('predictorOutput').innerHTML = '';
      document.getElementById('predictorPEResults').innerHTML = '';
      return;
    }

    const qtrTxnRev = dailyRev * tradingDays;
    const otherIncome = qtrTxnRev * otherIncomeRatio;
    const totalRev = qtrTxnRev + otherIncome;

    const empCost = totalRev * costParams.emp_pct;
    const regCost = totalRev * costParams.reg_pct;
    const techCost = totalRev * costParams.tech_pct;
    const depCost = totalRev * costParams.dep_pct;
    const csrOther = totalRev * costParams.csr_other_pct;
    const totalExp = empCost + regCost + techCost + depCost + csrOther;

    const pbt = totalRev - totalExp;
    const tax = pbt * taxRate;
    const pat = pbt - tax;

    const qtrEPS = pat / shares;
    const annualEPS = qtrEPS * 4;

    document.getElementById('predictorOutput').innerHTML = `
      <div class="pred-card">
        <div class="pred-label">Qtr Txn Revenue</div>
        <div class="pred-value">${fmt(qtrTxnRev)}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px">${fmt(dailyRev)}/day × ${tradingDays} days</div>
      </div>
      <div class="pred-card">
        <div class="pred-label">Other Income</div>
        <div class="pred-value">${fmt(otherIncome)}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px">${(otherIncomeRatio * 100).toFixed(1)}% of Txn Rev</div>
      </div>
      <div class="pred-card">
        <div class="pred-label">Total Revenue</div>
        <div class="pred-value">${fmt(totalRev)}</div>
      </div>
      <div class="pred-card">
        <div class="pred-label">Total Expenses</div>
        <div class="pred-value">${fmt(totalExp)}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px">${fmtPct(totalExp / totalRev)} of revenue</div>
      </div>
      <div class="pred-card highlight">
        <div class="pred-label">Quarterly PAT</div>
        <div class="pred-value" style="color:var(--color-success)">${fmt(pat)}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px">${fmtPct(pat / totalRev)} margin</div>
      </div>
      <div class="pred-card">
        <div class="pred-label">EPS (Quarterly)</div>
        <div class="pred-value">₹ ${qtrEPS.toFixed(2)}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px">Annualized: ₹ ${annualEPS.toFixed(2)}</div>
      </div>
    `;

    updatePredictorPE(annualEPS);
  }

  function updatePredictorPE(annualEPS) {
    if (!annualEPS || annualEPS <= 0) {
      document.getElementById('predictorPEResults').innerHTML = '';
      return;
    }
    const bearPE = Number(document.getElementById('predBearPE').value) || 25;
    const basePE = Number(document.getElementById('predBasePE').value) || 35;
    const bullPE = Number(document.getElementById('predBullPE').value) || 45;

    document.getElementById('predictorPEResults').innerHTML = `
      <div class="pe-card bear">
        <div class="pe-scenario-label">Bear Case</div>
        <div class="pe-subtitle">${bearPE}x PE × ₹${annualEPS.toFixed(2)} EPS</div>
        <div class="pe-price">${fmtPrice(bearPE * annualEPS)}</div>
      </div>
      <div class="pe-card base">
        <div class="pe-scenario-label">Base Case</div>
        <div class="pe-subtitle">${basePE}x PE × ₹${annualEPS.toFixed(2)} EPS</div>
        <div class="pe-price">${fmtPrice(basePE * annualEPS)}</div>
      </div>
      <div class="pe-card bull">
        <div class="pe-scenario-label">Bull Case</div>
        <div class="pe-subtitle">${bullPE}x PE × ₹${annualEPS.toFixed(2)} EPS</div>
        <div class="pe-price">${fmtPrice(bullPE * annualEPS)}</div>
      </div>
    `;
  }

  [dailyRevInput, tradingDaysInput, otherIncomeInput, taxInput, sharesInput].forEach(el => {
    el.addEventListener('input', computePredictor);
  });
  ['predBearPE', 'predBasePE', 'predBullPE'].forEach(id => {
    document.getElementById(id).addEventListener('input', computePredictor);
  });
  computePredictor();
}

function initNSEPEValuation() {
  const bearInput = document.getElementById('peBear');
  const baseInput = document.getElementById('peBase');
  const bullInput = document.getElementById('peBull');

  function updatePEResults() {
    const quarters = ENRICHED_DATA.pnl_predicted_quarters;
    if (!quarters) return;
    const q4Data = quarters['Q4 FY 2026'];
    if (!q4Data || !q4Data.eps) return;

    const quarterlyEPS = q4Data.eps;
    const annualizedEPS = quarterlyEPS * 4;

    const bearPE = Number(bearInput.value) || 25;
    const basePE = Number(baseInput.value) || 35;
    const bullPE = Number(bullInput.value) || 45;

    document.getElementById('peResults').innerHTML = `
      <div class="pe-card bear">
        <div class="pe-scenario-label">Bear Case</div>
        <div class="pe-subtitle">${bearPE}x PE</div>
        <div class="pe-price">${fmtPrice(bearPE * annualizedEPS)}</div>
      </div>
      <div class="pe-card base">
        <div class="pe-scenario-label">Base Case</div>
        <div class="pe-subtitle">${basePE}x PE</div>
        <div class="pe-price">${fmtPrice(basePE * annualizedEPS)}</div>
      </div>
      <div class="pe-card bull">
        <div class="pe-scenario-label">Bull Case</div>
        <div class="pe-subtitle">${bullPE}x PE</div>
        <div class="pe-price">${fmtPrice(bullPE * annualizedEPS)}</div>
      </div>
    `;
  }

  bearInput.addEventListener('input', updatePEResults);
  baseInput.addEventListener('input', updatePEResults);
  bullInput.addEventListener('input', updatePEResults);
  updatePEResults();
}

let predState = {};

function initNSEPrediction() {
  if (!DATA.pnl || !DATA.cost_ratios) return;
  const actualPnl = DATA.pnl.filter(p => !p.is_predicted);
  const lastActual = actualPnl[actualPnl.length - 1];
  const lastQ = lastActual.quarter;
  const cr = DATA.cost_ratios[lastQ] || Object.values(DATA.cost_ratios)[Object.values(DATA.cost_ratios).length - 1];

  const cq = DATA.quarterly[DATA.quarterly.length - 1];
  const days = cq.days || 62;
  const annualFactor = 62 / Math.max(days, 1);

  predState = {
    optRev: Math.round(cq.opt_rev * annualFactor),
    futRev: Math.round(cq.fut_rev * annualFactor),
    cashRev: Math.round(cq.cash_rev * annualFactor),
    empPct: (cr.employee_pct * 100) || 4.0,
    regPct: (cr.regulatory_pct * 100) || 4.5,
    techPct: (cr.technology_pct * 100) || 7.0,
    depPct: (cr.depreciation_pct * 100) || 3.5,
    otherIncome: (cr.other_income_ratio * 100) || 45,
  };

  setSlider('sliderOpt', 'valOpt', predState.optRev, v => fmt(v));
  setSlider('sliderFut', 'valFut', predState.futRev, v => fmt(v));
  setSlider('sliderCash', 'valCash', predState.cashRev, v => fmt(v));
  setSlider('sliderEmp', 'valEmp', predState.empPct, v => v.toFixed(1) + '%');
  setSlider('sliderReg', 'valReg', predState.regPct, v => v.toFixed(1) + '%');
  setSlider('sliderTech', 'valTech', predState.techPct, v => v.toFixed(1) + '%');
  setSlider('sliderDep', 'valDep', predState.depPct, v => v.toFixed(1) + '%');
  setSlider('sliderOther', 'valOther', predState.otherIncome, v => v.toFixed(0) + '%');

  const sliders = ['sliderOpt', 'sliderFut', 'sliderCash', 'sliderEmp', 'sliderReg', 'sliderTech', 'sliderDep', 'sliderOther'];
  sliders.forEach(id => {
    document.getElementById(id).addEventListener('input', () => updateNSEPrediction());
  });

  document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyNSEScenario(btn.dataset.scenario);
    });
  });

  updateNSEPrediction();
  buildNSEPnLTable();
  buildNSEPATHistoryChart();
}

function setSlider(sliderId, valId, value, formatter) {
  const sl = document.getElementById(sliderId);
  const vl = document.getElementById(valId);
  if (!sl || !vl) return;
  sl.value = value;
  vl.textContent = formatter(value);
  sl.addEventListener('input', () => {
    vl.textContent = formatter(Number(sl.value));
  });
}

function applyNSEScenario(scenario) {
  const cq = DATA.quarterly[DATA.quarterly.length - 1];
  const days = cq.days || 62;
  const annualFactor = 62 / Math.max(days, 1);
  let factor = 1;
  if (scenario === 'bear') factor = 0.85;
  if (scenario === 'bull') factor = 1.15;

  document.getElementById('sliderOpt').value = Math.round(cq.opt_rev * annualFactor * factor);
  document.getElementById('sliderFut').value = Math.round(cq.fut_rev * annualFactor * factor);
  document.getElementById('sliderCash').value = Math.round(cq.cash_rev * annualFactor * factor);

  document.getElementById('valOpt').textContent = fmt(Number(document.getElementById('sliderOpt').value));
  document.getElementById('valFut').textContent = fmt(Number(document.getElementById('sliderFut').value));
  document.getElementById('valCash').textContent = fmt(Number(document.getElementById('sliderCash').value));

  updateNSEPrediction();
}

function updateNSEPrediction() {
  const optRev = Number(document.getElementById('sliderOpt').value);
  const futRev = Number(document.getElementById('sliderFut').value);
  const cashRev = Number(document.getElementById('sliderCash').value);
  const empPct = Number(document.getElementById('sliderEmp').value) / 100;
  const regPct = Number(document.getElementById('sliderReg').value) / 100;
  const techPct = Number(document.getElementById('sliderTech').value) / 100;
  const depPct = Number(document.getElementById('sliderDep').value) / 100;
  const otherIncome = Number(document.getElementById('sliderOther').value) / 100;

  const transactionRev = optRev + futRev + cashRev;
  const otherRev = transactionRev * otherIncome;
  const totalRev = transactionRev + otherRev;

  const empCost = totalRev * empPct;
  const regCost = totalRev * regPct;
  const techCost = totalRev * techPct;
  const depCost = totalRev * depPct;
  const csrOther = totalRev * 0.035;
  const totalExp = empCost + regCost + techCost + depCost + csrOther;

  const ebitda = totalRev - totalExp + depCost;
  const ebitdaMargin = ebitda / totalRev;
  const pbt = totalRev - totalExp;
  const tax = pbt * 0.252;
  const pat = pbt - tax;
  const patMargin = pat / totalRev;

  const container = document.getElementById('predResult');
  container.innerHTML = `
    <div class="pred-card">
      <div class="pred-label">Total Revenue</div>
      <div class="pred-value">${fmt(totalRev)}</div>
    </div>
    <div class="pred-card">
      <div class="pred-label">EBITDA</div>
      <div class="pred-value">${fmt(ebitda)}</div>
      <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px">${fmtPct(ebitdaMargin)} margin</div>
    </div>
    <div class="pred-card highlight">
      <div class="pred-label">Predicted PAT</div>
      <div class="pred-value" style="color:var(--color-primary-hover)">${fmt(pat)}</div>
      <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px">${fmtPct(patMargin)} margin</div>
    </div>
    <div class="pred-card">
      <div class="pred-label">EPS (est.)</div>
      <div class="pred-value">₹ ${(pat / 247.5).toFixed(2)}</div>
      <div style="font-size:var(--text-xs);color:var(--color-text-faint);margin-top:4px">~247.5 Cr shares</div>
    </div>
  `;

  buildNSEWaterfallChart(transactionRev, otherRev, totalRev, totalExp, empCost, regCost, techCost, depCost, csrOther, ebitda, pbt, tax, pat);
}

function buildNSEWaterfallChart(txnRev, otherRev, totalRev, totalExp, emp, reg, tech, dep, csrOther, ebitda, pbt, tax, pat) {
  if (charts.waterfall) charts.waterfall.destroy();
  setCanvasHeight('chartWaterfall', 300);

  const labels = ['Txn Rev', 'Other Income', 'Total Rev', 'Employee', 'Regulatory', 'Technology', 'Depreciation', 'Other Exp', 'PBT', 'Tax', 'PAT'];
  let running = 0;
  const floatingData = [];
  const colors = [];

  floatingData.push([0, txnRev]); colors.push(CHART_COLORS[0]);
  floatingData.push([txnRev, txnRev + otherRev]); colors.push(CHART_COLORS[3]);
  floatingData.push([0, totalRev]); colors.push(CHART_COLORS[0]);
  running = totalRev;
  floatingData.push([running - emp, running]); running -= emp; colors.push(CHART_COLORS[4]);
  floatingData.push([running - reg, running]); running -= reg; colors.push(CHART_COLORS[4]);
  floatingData.push([running - tech, running]); running -= tech; colors.push(CHART_COLORS[4]);
  floatingData.push([running - dep, running]); running -= dep; colors.push(CHART_COLORS[4]);
  floatingData.push([running - csrOther, running]); running -= csrOther; colors.push(CHART_COLORS[4]);
  floatingData.push([0, pbt]); colors.push(CHART_COLORS[5]);
  floatingData.push([pat, pbt]); colors.push(CHART_COLORS[1]);
  floatingData.push([0, pat]); colors.push('#30d158');

  charts.waterfall = new Chart(document.getElementById('chartWaterfall'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'P&L Waterfall',
        data: floatingData,
        backgroundColor: colors,
        borderRadius: 3,
        borderSkipped: false,
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const range = ctx.raw;
              const value = Math.abs(range[1] - range[0]);
              return ctx.label + ': ' + fmt(value);
            }
          }
        }
      },
      scales: {
        x: { ticks: { maxRotation: 45, font: { size: 9 } } },
        y: { beginAtZero: true, ticks: { callback: v => '₹' + fmtNum(v, 0) } }
      }
    }
  });
}

function buildNSEPATHistoryChart() {
  const p = DATA.pnl;
  if (!p || p.length === 0) return;
  setCanvasHeight('chartPATHistory', 300);

  const allLabels = p.map(x => {
    const parts = x.quarter.split(' ');
    return parts[0] + " '" + parts[2].slice(2);
  });
  const barColors = p.map(x => x.is_predicted ? CHART_COLORS[5] : CHART_COLORS[0]);
  const patValues = p.map(x => x.pat);

  if (charts.patHistory) charts.patHistory.destroy();
  charts.patHistory = new Chart(document.getElementById('chartPATHistory'), {
    type: 'bar',
    data: {
      labels: allLabels,
      datasets: [{
        label: 'PAT',
        data: patValues,
        backgroundColor: barColors,
        borderColor: barColors,
        borderWidth: 1,
        borderRadius: 3,
      }]
    },
    options: {
      plugins: {
        legend: {
          display: true,
          labels: {
            generateLabels: function() {
              return [
                { text: 'Actual PAT', fillStyle: CHART_COLORS[0], strokeStyle: CHART_COLORS[0], lineWidth: 0, hidden: false },
                { text: 'Predicted PAT', fillStyle: CHART_COLORS[5], strokeStyle: CHART_COLORS[5], lineWidth: 0, hidden: false },
              ];
            }
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const isPred = DATA.pnl[ctx.dataIndex].is_predicted;
              return (isPred ? 'Predicted: ' : 'Actual: ') + fmt(ctx.raw);
            }
          }
        }
      },
      scales: {
        x: { ticks: { maxRotation: 45, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });
}

function buildNSEPnLTable() {
  const p = DATA.pnl;
  if (!p) return;
  let html = '<thead><tr><th>Quarter</th><th>Txn Rev</th><th>Total Rev</th><th>Total Exp</th><th>EBITDA</th><th>EBITDA %</th><th>PAT</th><th>PAT %</th><th>EPS</th></tr></thead><tbody>';
  for (const q of p) {
    const cls = q.is_predicted ? 'predicted' : '';
    html += `<tr class="${cls}">
      <td>${q.quarter}</td>
      <td>${fmt(q.transaction_rev)}</td>
      <td>${fmt(q.total_revenue)}</td>
      <td>${fmt(q.total_expense)}</td>
      <td>${fmt(q.ebitda)}</td>
      <td>${fmtPct(q.ebitda_margin)}</td>
      <td style="font-weight:600">${fmt(q.pat)}</td>
      <td>${fmtPct(q.pat_margin)}</td>
      <td>₹ ${fmtNum(q.eps)}</td>
    </tr>`;
  }
  html += '</tbody>';
  document.getElementById('tablePnL').innerHTML = html;
}

// ========================
// NSE: ADVANCED ANALYTICS
// ========================

function buildNSEAdvancedCharts() {
  const d = DATA.daily;
  const hasVix = d.some(x => x.vix > 0);
  const labels = d.map(x => {
    const dt = new Date(x.date);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  });

  // PN ratio vs VIX
  setCanvasHeight('chartPNVix', 300);
  if (hasVix) {
    charts.pnVix = new Chart(document.getElementById('chartPNVix'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'P/N Ratio (bps)',
            data: d.map(x => x.pn_ratio * 10000),
            borderColor: CHART_COLORS[0],
            yAxisID: 'y1',
            borderWidth: 1.5,
            pointRadius: 1,
          },
          {
            label: 'India VIX',
            data: d.map(x => x.vix),
            borderColor: CHART_COLORS[5],
            yAxisID: 'y2',
            borderWidth: 2,
            borderDash: [4, 3],
            pointRadius: 0,
          },
        ]
      },
      options: {
        scales: {
          x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
          y1: { position: 'left', title: { display: true, text: 'P/N Ratio (bps)', color: CHART_COLORS[0], font: { size: 10 } } },
          y2: { position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'India VIX', color: CHART_COLORS[5], font: { size: 10 } } },
        }
      }
    });
  }

  // Scatter
  setCanvasHeight('chartScatter', 300);
  if (hasVix) {
    charts.scatter = new Chart(document.getElementById('chartScatter'), {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Daily Revenue vs VIX',
          data: d.map(x => ({ x: x.vix, y: x.total_rev })),
          backgroundColor: CHART_COLORS[0] + '80',
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        scales: {
          x: { title: { display: true, text: 'India VIX', font: { size: 10 } }, ticks: { font: { size: 10 } } },
          y: { title: { display: true, text: 'Total Revenue (₹ Cr)', font: { size: 10 } }, ticks: { callback: v => '₹' + fmtNum(v, 0) } },
        },
        plugins: {
          tooltip: { callbacks: { label: ctx => 'VIX: ' + fmtNum(ctx.raw.x, 1) + ', Rev: ' + fmt(ctx.raw.y) } }
        }
      }
    });
  }

  // Contracts vs Revenue
  setCanvasHeight('chartContracts', 300);
  charts.contracts = new Chart(document.getElementById('chartContracts'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Revenue',
          data: d.map(x => x.total_rev),
          borderColor: CHART_COLORS[0],
          yAxisID: 'y1',
          borderWidth: 1.5,
        },
        {
          label: 'Contracts (Mn)',
          data: d.map(x => x.total_contracts / 1e6),
          borderColor: CHART_COLORS[4],
          yAxisID: 'y2',
          borderWidth: 1.5,
          borderDash: [4, 3],
        },
      ]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y1: { position: 'left', title: { display: true, text: 'Revenue (₹ Cr)', color: CHART_COLORS[0], font: { size: 10 } } },
        y2: { position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Contracts (Mn)', color: CHART_COLORS[4], font: { size: 10 } } },
      }
    }
  });

  buildHeatmap();
}

function buildHeatmap() {
  const q = DATA.quarterly;
  const fys = {};
  q.forEach(item => {
    const parts = item.quarter.split(' ');
    const qNum = parts[0];
    const fy = parts[1] + ' ' + parts[2];
    if (!fys[fy]) fys[fy] = {};
    fys[fy][qNum] = item;
  });

  const allVals = q.map(x => x.total_rev);
  const minRev = Math.min(...allVals);
  const maxRev = Math.max(...allVals);
  const rgb = getHeatmapRgb();

  let html = '<table class="data-table"><thead><tr><th>FY</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th></tr></thead><tbody>';
  Object.keys(fys).forEach(fy => {
    html += `<tr><td>${fy}</td>`;
    ['Q1', 'Q2', 'Q3', 'Q4'].forEach(qn => {
      const item = fys[fy][qn];
      if (item) {
        const intensity = (item.total_rev - minRev) / (maxRev - minRev);
        const bg = `rgba(${rgb}, ${(0.1 + intensity * 0.5).toFixed(2)})`;
        html += `<td style="background:${bg};font-weight:600">${fmt(item.total_rev)}</td>`;
      } else {
        html += `<td style="color:var(--color-text-faint)">—</td>`;
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  document.getElementById('heatmapContainer').innerHTML = html;
}

// ========================
// BSE: REVENUE PREDICTOR
// ========================

function buildBSERevenuePredictor() {
  const p = ENRICHED_DATA.pnl_predictor;
  if (!p) return;
  const otherIncome = p.total_revenue_predicted - p.transaction_rev_extrapolated;
  const progressPct = ((p.trading_days_so_far / p.expected_trading_days) * 100).toFixed(0);

  const kpis = [
    { label: 'Daily Avg Transaction Rev', value: fmt(p.daily_avg_rev) },
    { label: 'Trading Days (Actual / Expected)', value: `${p.trading_days_so_far} / ${p.expected_trading_days}` },
    { label: 'Extrapolated Qtr Transaction Rev', value: fmt(p.transaction_rev_extrapolated) },
    { label: `Other Income (~${fmtPct(p.other_income_ratio)} of Txn)`, value: fmt(otherIncome) },
  ];

  document.getElementById('bsePredictorKpis').innerHTML = kpis.map(k => `
    <div class="extrap-card${k.highlight ? ' highlight' : ''}">
      <div class="extrap-label">${k.label}</div>
      <div class="extrap-value">${k.value}</div>
    </div>
  `).join('') + `
    <div class="extrap-card highlight" style="grid-column: 1 / -1">
      <div class="extrap-label">Total Estimated Quarterly Revenue</div>
      <div class="extrap-value" style="font-size:var(--text-xl)">${fmt(p.total_revenue_predicted)}</div>
    </div>
  `;

  document.getElementById('bseProgressBarFill').style.width = progressPct + '%';
  document.getElementById('bseProgressLabel').textContent =
    `Quarter Progress: ${p.trading_days_so_far} of ${p.expected_trading_days} trading days completed (${progressPct}%)`;

  // Composition table
  const q = DATA.quarterly;
  const cq = q[q.length - 1];
  const cqDays = cq.days || cq.trading_days || 1;
  const optPct = cq.total_rev > 0 ? (cq.opt_rev / cq.total_rev * 100).toFixed(1) : 0;
  const cashPct = cq.total_rev > 0 ? (cq.cash_rev / cq.total_rev * 100).toFixed(1) : 0;
  const futPct = cq.total_rev > 0 ? (cq.fut_rev / cq.total_rev * 100).toFixed(1) : 0;

  let compositionHTML = `<thead><tr><th>Segment</th><th>Current Qtr Rev</th><th>% of Total</th><th>Days</th><th>Daily Avg</th></tr></thead><tbody>`;
  compositionHTML += `<tr><td>Options</td><td>${fmt(cq.opt_rev)}</td><td>${optPct}%</td><td>${cqDays}</td><td>${fmt(cq.opt_rev / cqDays)}</td></tr>`;
  compositionHTML += `<tr><td>Futures</td><td>${fmt(cq.fut_rev)}</td><td>${futPct}%</td><td>${cqDays}</td><td>${fmt(cq.fut_rev / cqDays)}</td></tr>`;
  compositionHTML += `<tr><td>Cash</td><td>${fmt(cq.cash_rev)}</td><td>${cashPct}%</td><td>${cqDays}</td><td>${fmt(cq.cash_rev / cqDays)}</td></tr>`;
  compositionHTML += `<tr style="font-weight:600"><td>Total</td><td>${fmt(cq.total_rev)}</td><td>100%</td><td>${cqDays}</td><td>${fmt(cq.total_rev / cqDays)}</td></tr>`;
  compositionHTML += `</tbody>`;
  document.getElementById('tableBseRevComposition').innerHTML = compositionHTML;
}

// ========================
// BSE: QUARTERLY ANALYSIS
// ========================

// ========================
// NSE QUARTERLY CHARTS (mirrors BSE quarterly analysis)
// ========================

function buildNSEQuarterlyCharts() {
  const q = DATA.quarterly;
  const shortLabels = q.map(x => { const p = x.quarter.split(' '); return p[0] + " '" + p[2].slice(2); });

  setCanvasHeight('chartNseQuarterlyRev', 300);
  charts.nseQuarterlyRev = new Chart(document.getElementById('chartNseQuarterlyRev'), {
    type: 'bar',
    data: {
      labels: shortLabels,
      datasets: [
        { label: 'Cash',    data: q.map(x => x.cash_rev), backgroundColor: CHART_COLORS[3], borderRadius: 2, stack: 'stack', order: 3 },
        { label: 'Futures', data: q.map(x => x.fut_rev),  backgroundColor: CHART_COLORS[1], borderRadius: 2, stack: 'stack', order: 2 },
        { label: 'Options', data: q.map(x => x.opt_rev),  backgroundColor: CHART_COLORS[0], borderRadius: 2, stack: 'stack', order: 1 },
      ]
    },
    options: {
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw),
            footer: items => 'Total: ' + fmt(items.reduce((s, i) => s + i.raw, 0))
          }
        }
      },
      scales: {
        x: { stacked: true, ticks: { maxRotation: 45, font: { size: 10 } } },
        y: { stacked: true, ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });

  setCanvasHeight('chartNseQuarterlyLine', 300);
  charts.nseQuarterlyLine = new Chart(document.getElementById('chartNseQuarterlyLine'), {
    type: 'line',
    data: {
      labels: shortLabels,
      datasets: [{
        label: 'Total Revenue',
        data: q.map(x => x.total_rev),
        borderColor: CHART_COLORS[0],
        backgroundColor: CHART_COLORS[0] + '20',
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
      }]
    },
    options: {
      plugins: { tooltip: { callbacks: { label: ctx => 'Total Revenue: ' + fmt(ctx.raw) } } },
      scales: {
        x: { ticks: { maxRotation: 45, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });
}

// ========================
// NSE MONTHLY ANALYSIS (mirrors BSE monthly analysis)
// ========================

function buildNSEMonthlyAnalysis() {
  const m = DATA.monthly;
  const last12 = m.slice(-12);
  const labels = last12.map(x => {
    const parts = x.month.split(' ');
    return parts[parts.length - 1].slice(0, 3) + " '" + parts[1].slice(2);
  });

  setCanvasHeight('chartNseMonthlyRev', 300);
  charts.nseMonthlyRev = new Chart(document.getElementById('chartNseMonthlyRev'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total Revenue',
        data: last12.map(x => x.total_rev),
        backgroundColor: CHART_COLORS[0] + '80',
        borderColor: CHART_COLORS[0],
        borderWidth: 1,
        borderRadius: 2
      }]
    },
    options: {
      plugins: { tooltip: { callbacks: { label: ctx => 'Total Revenue: ' + fmt(ctx.raw) } } },
      scales: {
        x: { ticks: { maxRotation: 45, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });

  setCanvasHeight('chartNseMonthlySegment', 300);
  charts.nseMonthlySegment = new Chart(document.getElementById('chartNseMonthlySegment'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Cash',    data: last12.map(x => x.cash_rev), backgroundColor: CHART_COLORS[3], borderRadius: 2, stack: 's', order: 3 },
        { label: 'Futures', data: last12.map(x => x.fut_rev),  backgroundColor: CHART_COLORS[1], borderRadius: 2, stack: 's', order: 2 },
        { label: 'Options', data: last12.map(x => x.opt_rev),  backgroundColor: CHART_COLORS[0], borderRadius: 2, stack: 's', order: 1 },
      ]
    },
    options: {
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw),
            footer: items => 'Total: ' + fmt(items.reduce((s, i) => s + i.raw, 0))
          }
        }
      },
      scales: {
        x: { stacked: true, ticks: { maxRotation: 45, font: { size: 10 } } },
        y: { stacked: true, ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });

  // Monthly table — all months
  let html = '<thead><tr><th>Month</th><th>Options</th><th>Futures</th><th>Cash</th><th>Total</th><th>Days</th><th>Daily Avg</th><th>MoM</th></tr></thead><tbody>';
  for (let i = 0; i < m.length; i++) {
    const r = m[i];
    const rDays = r.trading_days || r.days || 1;
    const dailyAvg = r.total_rev / rDays;
    const prev = i > 0 ? m[i - 1] : null;
    const prevDays = prev ? (prev.trading_days || prev.days || 1) : 1;
    const prevAvg = prev ? prev.total_rev / prevDays : null;
    const mom = prevAvg ? (dailyAvg - prevAvg) / prevAvg : null;
    html += `<tr>
      <td>${r.month}</td>
      <td>${fmt(r.opt_rev)}</td>
      <td>${fmt(r.fut_rev)}</td>
      <td>${fmt(r.cash_rev)}</td>
      <td style="font-weight:600">${fmt(r.total_rev)}</td>
      <td>${rDays}</td>
      <td>${fmt(dailyAvg)}</td>
      <td>${fmtPctSigned(mom)}</td>
    </tr>`;
  }
  html += '</tbody>';
  document.getElementById('tableNseMonthly').innerHTML = html;
}

function buildBSEQuarterlyAnalysis() {
  const q = DATA.quarterly;
  const shortLabels = q.map(x => { const p = x.quarter.split(' '); return p[0] + " '" + p[2].slice(2); });

  // Stacked bar
  setCanvasHeight('chartBseQuarterlyRev', 300);
  charts.bseQuarterlyRev = new Chart(document.getElementById('chartBseQuarterlyRev'), {
    type: 'bar',
    data: {
      labels: shortLabels,
      datasets: [
        { label: 'Cash', data: q.map(x => x.cash_rev), backgroundColor: CHART_COLORS[3], borderRadius: 2, stack: 'stack', order: 3 },
        { label: 'Futures', data: q.map(x => x.fut_rev), backgroundColor: CHART_COLORS[1], borderRadius: 2, stack: 'stack', order: 2 },
        { label: 'Options', data: q.map(x => x.opt_rev), backgroundColor: CHART_COLORS[0], borderRadius: 2, stack: 'stack', order: 1 },
      ]
    },
    options: {
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw),
            footer: items => 'Total: ' + fmt(items.reduce((s, i) => s + i.raw, 0))
          }
        }
      },
      scales: {
        x: { stacked: true, ticks: { maxRotation: 45, font: { size: 10 } } },
        y: { stacked: true, ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });

  // Line chart — total quarterly trend
  setCanvasHeight('chartBseQuarterlyLine', 300);
  charts.bseQuarterlyLine = new Chart(document.getElementById('chartBseQuarterlyLine'), {
    type: 'line',
    data: {
      labels: shortLabels,
      datasets: [{
        label: 'Total Revenue',
        data: q.map(x => x.total_rev),
        borderColor: CHART_COLORS[0],
        backgroundColor: CHART_COLORS[0] + '20',
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
      }]
    },
    options: {
      plugins: {
        tooltip: { callbacks: { label: ctx => 'Total Revenue: ' + fmt(ctx.raw) } }
      },
      scales: {
        x: { ticks: { maxRotation: 45, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });

  // Table
  let html = '<thead><tr><th>Quarter</th><th>Options</th><th>Futures</th><th>Cash</th><th>Total</th><th>Days</th><th>Daily Avg</th><th>QoQ</th><th>YoY</th></tr></thead><tbody>';
  for (let i = 0; i < q.length; i++) {
    const r = q[i];
    const rDays = r.days || r.trading_days || 1;
    const dailyAvg = r.total_rev / rDays;
    const prev = i > 0 ? q[i - 1] : null;
    const prevDays = prev ? (prev.days || prev.trading_days || 1) : 1;
    const prevAvg = prev ? prev.total_rev / prevDays : null;
    const qoq = prevAvg ? (dailyAvg - prevAvg) / prevAvg : null;
    
    const yoyLabel = getYoYQuarter(r.quarter);
    const yoyQ = yoyLabel ? q.find(x => x.quarter === yoyLabel) : null;
    const yoyDays = yoyQ ? (yoyQ.days || yoyQ.trading_days || 1) : 1;
    const yoyAvg = yoyQ ? yoyQ.total_rev / yoyDays : null;
    const yoy = yoyAvg ? (dailyAvg - yoyAvg) / yoyAvg : null;

    html += `<tr>
      <td>${r.quarter}</td>
      <td>${fmt(r.opt_rev)}</td>
      <td>${fmt(r.fut_rev)}</td>
      <td>${fmt(r.cash_rev)}</td>
      <td style="font-weight:600">${fmt(r.total_rev)}</td>
      <td>${rDays}</td>
      <td>${fmt(dailyAvg)}</td>
      <td>${fmtPctSigned(qoq)}</td>
      <td>${fmtPctSigned(yoy)}</td>
    </tr>`;
  }
  html += '</tbody>';
  document.getElementById('tableBseQuarterly').innerHTML = html;
}

// ========================
// BSE: MONTHLY ANALYSIS
// ========================

function buildBSEMonthlyAnalysis() {
  const m = DATA.monthly;
  const last12 = m.slice(-12);
  const labels = last12.map(x => {
    const parts = x.month.split(' ');
    return parts[parts.length - 1].slice(0, 3) + " '" + parts[1].slice(2);
  });

  // Monthly revenue trend
  setCanvasHeight('chartBseMonthlyRev', 300);
  charts.bseMonthlyRev = new Chart(document.getElementById('chartBseMonthlyRev'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total Revenue',
        data: last12.map(x => x.total_rev),
        backgroundColor: CHART_COLORS[0] + '80',
        borderColor: CHART_COLORS[0],
        borderWidth: 1,
        borderRadius: 2
      }]
    },
    options: {
      plugins: { tooltip: { callbacks: { label: ctx => 'Total Revenue: ' + fmt(ctx.raw) } } },
      scales: {
        x: { ticks: { maxRotation: 45, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });

  // Monthly segment chart
  setCanvasHeight('chartBseMonthlySegment', 300);
  charts.bseMonthlySegment = new Chart(document.getElementById('chartBseMonthlySegment'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Cash', data: last12.map(x => x.cash_rev), backgroundColor: CHART_COLORS[3], borderRadius: 2, stack: 's', order: 3 },
        { label: 'Futures', data: last12.map(x => x.fut_rev), backgroundColor: CHART_COLORS[1], borderRadius: 2, stack: 's', order: 2 },
        { label: 'Options', data: last12.map(x => x.opt_rev), backgroundColor: CHART_COLORS[0], borderRadius: 2, stack: 's', order: 1 },
      ]
    },
    options: {
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw),
            footer: items => 'Total: ' + fmt(items.reduce((s, i) => s + i.raw, 0))
          }
        }
      },
      scales: {
        x: { stacked: true, ticks: { maxRotation: 45, font: { size: 10 } } },
        y: { stacked: true, ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });

  // Monthly Table
  let html = '<thead><tr><th>Month</th><th>Options</th><th>Futures</th><th>Cash</th><th>Total</th><th>Days</th><th>Daily Avg</th><th>MoM</th></tr></thead><tbody>';
  for (let i = 0; i < m.length; i++) {
    const r = m[i];
    const rDays = r.trading_days || r.days || 1;
    const dailyAvg = r.total_rev / rDays;
    const prev = i > 0 ? m[i - 1] : null;
    const prevDays = prev ? (prev.trading_days || prev.days || 1) : 1;
    const prevAvg = prev ? prev.total_rev / prevDays : null;
    const mom = prevAvg ? (dailyAvg - prevAvg) / prevAvg : null;

    html += `<tr>
      <td>${r.month}</td>
      <td>${fmt(r.opt_rev)}</td>
      <td>${fmt(r.fut_rev)}</td>
      <td>${fmt(r.cash_rev)}</td>
      <td style="font-weight:600">${fmt(r.total_rev)}</td>
      <td>${rDays}</td>
      <td>${fmt(dailyAvg)}</td>
      <td>${fmtPctSigned(mom)}</td>
    </tr>`;
  }
  html += '</tbody>';
  document.getElementById('tableBseMonthly').innerHTML = html;
}

// ========================
// BSE: WEEKLY ANALYSIS
// ========================

function buildBSEWeeklyAnalysis() {
  const w = DATA.weekly;
  const last20 = w.slice(-20);

  // Weekly bar chart
  setCanvasHeight('chartBseWeeklyRev', 280);
  charts.bseWeeklyRev = new Chart(document.getElementById('chartBseWeeklyRev'), {
    type: 'bar',
    data: {
      labels: last20.map(x => {
        const d = new Date(x.week);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      }),
      datasets: [
        { label: 'Cash', data: last20.map(x => x.cash_rev), backgroundColor: CHART_COLORS[3], stack: 's', borderRadius: 2, order: 3 },
        { label: 'Futures', data: last20.map(x => x.fut_rev), backgroundColor: CHART_COLORS[1], stack: 's', borderRadius: 2, order: 2 },
        { label: 'Options', data: last20.map(x => x.opt_rev), backgroundColor: CHART_COLORS[0], stack: 's', borderRadius: 2, order: 1 },
      ]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw),
            footer: items => 'Total: ' + fmt(items.reduce((s, i) => s + i.raw, 0))
          }
        }
      },
      scales: {
        x: { stacked: true, ticks: { maxRotation: 45, font: { size: 10 } } },
        y: { stacked: true, ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });

  // Day-of-Week bar chart
  const dowData = ENRICHED_DATA.summary_total.day_of_week;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  setCanvasHeight('chartBseDOW', 280);
  charts.bseDOW = new Chart(document.getElementById('chartBseDOW'), {
    type: 'bar',
    data: {
      labels: days.map(d => d.slice(0, 3)),
      datasets: [
        { label: 'Latest', data: days.map(d => dowData[d].latest), backgroundColor: CHART_COLORS[0], borderRadius: 2 },
        { label: '3-Day Avg', data: days.map(d => dowData[d].avg_3d), backgroundColor: CHART_COLORS[4], borderRadius: 2 },
        { label: '10-Day Avg', data: days.map(d => dowData[d].avg_10d), backgroundColor: CHART_COLORS[2], borderRadius: 2 },
      ]
    },
    options: {
      plugins: { tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw) } } },
      scales: { y: { ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } } }
    }
  });

  // Weekly Averages Table
  const s = ENRICHED_DATA.summary_total;
  const wl5 = s.weekly.last5;
  const wp5 = s.weekly.prev5;
  const w50 = s.weekly.last50;
  let waHTML = `<thead><tr><th>Period</th><th>Daily Avg Rev</th><th>Change</th></tr></thead><tbody>`;
  waHTML += `<tr><td>Last 5 Trading Days</td><td>${fmt(wl5.value)}</td><td>—</td></tr>`;
  waHTML += `<tr><td>Previous 5 Trading Days</td><td>${fmt(wp5.value)}</td><td>WoW: ${fmtPctSigned(wl5.wow)}</td></tr>`;
  waHTML += `<tr><td>Last 50 Trading Days Avg</td><td>${fmt(w50.value)}</td><td>Wo10W: ${fmtPctSigned(wl5.wo10w)}</td></tr>`;
  waHTML += `</tbody>`;
  document.getElementById('tableBseWeeklyAvg').innerHTML = waHTML;

  // Day-of-Week Table
  let dowHTML = `<thead><tr><th>Day</th><th>Latest</th><th>3-Day Avg</th><th>Do3D</th><th>10-Day Avg</th><th>Do10D</th></tr></thead><tbody>`;
  days.forEach(d => {
    const dd = dowData[d];
    dowHTML += `<tr>
      <td>${d}</td>
      <td>${fmt(dd.latest)}</td>
      <td>${fmt(dd.avg_3d)}</td>
      <td>${fmtPctSigned(dd.do3d)}</td>
      <td>${fmt(dd.avg_10d)}</td>
      <td>${fmtPctSigned(dd.do10d)}</td>
    </tr>`;
  });
  dowHTML += `</tbody>`;
  document.getElementById('tableBseDOW').innerHTML = dowHTML;

  // Previous Week Table
  const pw = ENRICHED_DATA.summary_total.previous_week;
  if (pw) {
    let pwHTML = `<thead><tr><th>Day</th><th>Revenue (₹ Cr)</th></tr></thead><tbody>`;
    let pwTotal = 0;
    days.forEach(d => {
      const val = pw[d];
      if (val != null) pwTotal += val;
      pwHTML += `<tr><td>${d}</td><td>${val != null ? fmt(val) : '—'}</td></tr>`;
    });
    pwHTML += `<tr style="font-weight:600;border-top:2px solid var(--color-border-strong)"><td>Total</td><td>${fmt(pwTotal)}</td></tr>`;
    pwHTML += `</tbody>`;
    document.getElementById('tableBsePrevWeek').innerHTML = pwHTML;
  }
}

// ========================
// INIT
// ========================

async function init() {
  showLoading('nse');
  initExchangeSwitcher();
  buildSidebarNav('nse');
  toggleExchangeContent('nse');
  await loadExchangeData('nse');
  updateHeaderInfo();
  rebuildAll();
  hideLoading();
  // Activate first tab
  const firstNavItem = document.querySelector('.nav-item[data-tab]');
  if (firstNavItem) firstNavItem.click();
}

// ========================
// WEEKLY REPORT PDF DOWNLOAD
// ========================

async function downloadWeeklyReport() {
  // Fetch both exchanges fresh — ENRICHED_DATA only holds the currently selected exchange
  const [nseEnrich, bseEnrich, nseDash, bseDash] = await Promise.all([
    fetch('./data/nse_enriched_data.json').then(r => r.json()),
    fetch('./data/bse_enriched_data.json').then(r => r.json()),
    fetch('./data/nse_dashboard_data.json').then(r => r.json()),
    fetch('./data/bse_dashboard_data.json').then(r => r.json()),
  ]);

  // Compute Mon–Fri week range from latest NSE daily date
  const nseDaily = nseDash.daily_all || nseDash.daily || [];
  const latestDateStr = nseDaily.length > 0 ? nseDaily[nseDaily.length - 1].date : null;

  function getWeekRange(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDay(); // 0=Sun,1=Mon..5=Fri
    const daysToMon = day === 0 ? -6 : 1 - day;
    const mon = new Date(d); mon.setDate(d.getDate() + daysToMon);
    const fri = new Date(mon); fri.setDate(mon.getDate() + 4);
    function ordinal(n) {
      const s = ['th','st','nd','rd'], v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }
    // If Mon and Fri are in different months, include month for Mon too
    const monMonth = mon.toLocaleString('en-IN', { month: 'short' });
    const friStr = ordinal(fri.getDate()) + ' ' + fri.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
    if (mon.getMonth() !== fri.getMonth()) {
      return `${ordinal(mon.getDate())} ${monMonth} – ${friStr}`;
    }
    return `${ordinal(mon.getDate())} – ${friStr}`;
  }

  const weekRange = getWeekRange(latestDateStr);
  const genTime = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  function n(num) {
    if (num == null || isNaN(num)) return '—';
    return fmtNum(num);
  }

  // PDF-style % formatting: positive = plain green text, negative = yellow highlight
  function prFmt(val) {
    if (val == null || isNaN(val)) return '—';
    const pct = (val * 100).toFixed(1);
    if (val > 0.0001) return `<span class="pr-pos">+${pct}%</span>`;
    if (val < -0.0001) return `<span class="pr-neg">${pct}%</span>`;
    return '0.0%';
  }

  function buildTotalRevenueTable(enriched) {
    const s = enriched.summary_total;
    if (!s) return '';
    const wl5 = s.weekly.last5 || {};
    const wp5 = s.weekly.prev5 || {};
    const w50 = s.weekly.last50 || {};
    const mc = s.monthly.current || {};
    const mp = s.monthly.previous || {};
    const m6 = s.monthly.avg_6m || {};
    const qc = s.quarterly.current || {};
    const qp = s.quarterly.previous || {};
    const q2 = s.quarterly.prev2 || {};
    return `<div class="pr-sub-header">Total Revenue (Daily Avg, ₹ Cr)</div>
    <table class="pr-table">
      <colgroup><col style="width:60%"><col style="width:20%"><col style="width:20%"></colgroup>
      <thead><tr><th>Metric</th><th>₹ Cr</th><th>% Change</th></tr></thead>
      <tbody>
        <tr class="pr-group-label"><td colspan="3">Weekly</td></tr>
        <tr><td>L5 – This Week</td><td>${n(wl5.value)}</td><td>${prFmt(wl5.wow)}</td></tr>
        <tr><td>Prev5 – Last Week</td><td>${n(wp5.value)}</td><td>—</td></tr>
        <tr><td>L50 – 10-Week Avg</td><td>${n(w50.value)}</td><td>${prFmt(wl5.wo10w)}</td></tr>
        <tr class="pr-separator"><td colspan="3"></td></tr>
        <tr class="pr-group-label"><td colspan="3">Monthly</td></tr>
        <tr><td>${mc.label || 'Current Month'} Avg</td><td>${n(mc.value)}</td><td>${prFmt(mc.mom)}</td></tr>
        <tr><td>${mp.label || 'Prev Month'} Avg</td><td>${n(mp.value)}</td><td>—</td></tr>
        <tr><td>6-Month Avg</td><td>${n(m6.value)}</td><td>${prFmt(mc.mo6m)}</td></tr>
        <tr class="pr-separator"><td colspan="3"></td></tr>
        <tr class="pr-group-label"><td colspan="3">Quarterly</td></tr>
        <tr><td>${qc.label || 'Current Q'}</td><td>${n(qc.value)}</td><td>${prFmt(qc.qoq)}</td></tr>
        <tr><td>${qp.label || 'Prev Q'}</td><td>${n(qp.value)}</td><td>—</td></tr>
        <tr><td>${q2.label || 'YoY Q'}</td><td>${n(q2.value)}</td><td>${prFmt(qc.yoy)}</td></tr>
      </tbody>
    </table>`;
  }

  function buildDowTable(enriched) {
    const dow = (enriched.summary_total || {}).day_of_week || {};
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const rows = dayNames.map(day => {
      const dd = dow[day] || {};
      return `<tr><td>${day}</td><td>${n(dd.latest)}</td><td>${n(dd.avg_3d)}</td><td>${prFmt(dd.do3d)}</td><td>${n(dd.avg_10d)}</td><td>${prFmt(dd.do10d)}</td></tr>`;
    }).join('');
    return `<div class="pr-sub-header">Day-of-Week Performance</div>
    <table class="pr-table">
      <colgroup><col style="width:22%"><col style="width:15.6%"><col style="width:15.6%"><col style="width:15.6%"><col style="width:15.6%"><col style="width:15.6%"></colgroup>
      <thead><tr><th>Day</th><th>This Week (₹ Cr)</th><th>L3 Avg</th><th>Do3D</th><th>L10 Avg</th><th>Do10D</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  function buildSegmentTable(enriched) {
    const segs = [
      { label: 'Options', data: enriched.seg_options },
      { label: 'Futures', data: enriched.seg_futures },
      { label: 'Cash',    data: enriched.seg_cash },
    ];
    const rows = segs.map(seg => {
      const l5 = ((seg.data || {}).weekly || {}).last5 || {};
      return `<tr><td>${seg.label}</td><td>${n(l5.value)}</td><td>${prFmt(l5.wow)}</td><td>${prFmt(l5.wo10w)}</td></tr>`;
    }).join('');
    return `<div class="pr-sub-header">Segment Revenue (L5 Daily Avg, ₹ Cr)</div>
    <table class="pr-table">
      <colgroup><col style="width:28%"><col style="width:24%"><col style="width:24%"><col style="width:24%"></colgroup>
      <thead><tr><th>Segment</th><th>L5 Avg</th><th>WoW</th><th>Wo10W</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  function buildSummaryPara(exchangeName, enriched) {
    const s = enriched.summary_total;
    if (!s) return '';
    const wl5 = s.weekly.last5 || {};
    const wp5 = s.weekly.prev5 || {};
    const qc = s.quarterly.current || {};
    const wowPct = wl5.wow != null ? Math.abs(wl5.wow * 100).toFixed(1) : null;
    const dir = wl5.wow > 0 ? 'up' : wl5.wow < 0 ? 'down' : 'flat';
    const wowStr = wowPct ? `, ${dir} ${wowPct}% WoW vs ₹${n(wp5.value)} Cr prior week` : '';
    return `<p class="pr-summary">${exchangeName} daily avg revenue for L5 was ₹${n(wl5.value)} Cr${wowStr}. Current quarter (${qc.label || ''}) daily avg: ₹${n(qc.value)} Cr (${prFmt(qc.qoq)} QoQ).</p>`;
  }

  function buildExchangeSection(label, enriched, includeSegments) {
    return `<div class="pr-section">
      <div class="pr-section-header">${label}</div>
      <div class="pr-section-body">
        ${buildTotalRevenueTable(enriched)}
        ${buildDowTable(enriched)}
        ${includeSegments ? buildSegmentTable(enriched) : ''}
        ${buildSummaryPara(label.replace(' Update', ''), enriched)}
      </div>
    </div>`;
  }

  function buildValuationSection() {
    // Get annualised EPS from latest predicted quarter
    function getAnnualEPS(enriched, dashData) {
      const pq = enriched.pnl_predicted_quarters || {};
      const keys = Object.keys(pq).sort().reverse();
      if (keys.length > 0 && pq[keys[0]] && pq[keys[0]].eps) return pq[keys[0]].eps * 4;
      const allQ = dashData.quarterly || [];
      if (allQ.length > 0) {
        const latest = allQ[allQ.length - 1];
        if (latest.eps) return latest.eps * 4;
      }
      return null;
    }

    const nseEPS = getAnnualEPS(nseEnrich, nseDash);
    const bseEPS = getAnnualEPS(bseEnrich, bseDash);

    const bearPE = parseFloat(document.getElementById('predBearPE')?.value) || 35;
    const basePE = parseFloat(document.getElementById('predBasePE')?.value) || 40;
    const bullPE = parseFloat(document.getElementById('predBullPE')?.value) || 45;

    function pt(eps, pe) {
      if (!eps) return '—';
      return '₹' + Math.round(eps * pe).toLocaleString('en-IN');
    }

    return `<div class="pr-section">
      <div class="pr-section-header">Valuation Models – FY27E Estimates</div>
      <div class="pr-section-body">
        <table class="pr-table" style="max-width:320px">
          <thead><tr><th>Scenario</th><th>NSE</th><th>BSE</th></tr></thead>
          <tbody>
            <tr><td>Est. EPS (FY27E)</td><td>${nseEPS ? '₹' + nseEPS.toFixed(0) : '—'}</td><td>${bseEPS ? '₹' + bseEPS.toFixed(0) : '—'}</td></tr>
            <tr><td>Bear (${bearPE}x)</td><td>${pt(nseEPS, bearPE)}</td><td>${pt(bseEPS, bearPE)}</td></tr>
            <tr><td>Base (${basePE}x)</td><td>${pt(nseEPS, basePE)}</td><td>${pt(bseEPS, basePE)}</td></tr>
            <tr><td>Bull (${bullPE}x)</td><td>${pt(nseEPS, bullPE)}</td><td>${pt(bseEPS, bullPE)}</td></tr>
          </tbody>
        </table>
        <p class="pr-summary" style="font-size:8px;color:#888;margin-top:4px">EPS annualised from latest predicted quarter. PE multiples are indicative estimates.</p>
      </div>
    </div>`;
  }

  const html = `<div class="pr-wrapper">
    <div class="pr-header">
      <span class="pr-title">NSE/BSE Weekly Update – Week of ${weekRange}</span>
      <span class="pr-subtitle">Generated: ${genTime}</span>
    </div>
    ${buildExchangeSection('NSE Update', nseEnrich, true)}
    ${buildExchangeSection('BSE Update', bseEnrich, false)}
    <div class="pr-footer">NSE/BSE Analytics Dashboard — Auto-generated report</div>
  </div>`;

  const el = document.getElementById('print-report');
  el.innerHTML = html;
  el.style.display = 'block';
  setTimeout(() => { window.print(); el.style.display = 'none'; }, 150);
}

// ─── Live Market Tab ──────────────────────────────────────────────────────────
// Self-contained IIFE — reads nse_live.json or bse_live.json depending on
// currentExchange. Does NOT touch any existing variables/DOM outside #tab-live.
(function() {
  function liveJsonPath()   { return `./data/${currentExchange}_live.json`; }
  function hourlyJsonPath() { return `./data/${currentExchange}_live_hourly.json`; }
  const POLL_MS     = 5 * 60 * 1000;
  let   liveTimer   = null;
  let   liveChart   = null;

  // ── Formatters (scoped) ──
  function _cr(v, d) {
    d = (d == null) ? 1 : d;
    if (v == null || isNaN(+v)) return '—';
    const n = +v;
    if (Math.abs(n) >= 1e5) return '₹' + (n / 1e5).toFixed(d) + ' L Cr';
    return '₹' + n.toFixed(d) + ' Cr';
  }
  function _num(v, d) {
    if (v == null || isNaN(+v)) return '—';
    d = (d == null) ? 0 : d;
    return (+v).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function _pct(v) {
    if (v == null || isNaN(+v)) return '';
    const n = +v; return (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
  }
  function _time(iso) {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
  }
  function _age(iso) {
    if (!iso) return null;
    return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  }

  // ── Fetch both files ──
  async function fetchAndRender() {
    const el = document.getElementById('tab-live');
    if (!el) return;
    try {
      const bust = Date.now();
      const [liveRes, hourlyRes] = await Promise.all([
        fetch(liveJsonPath()   + '?t=' + bust),
        fetch(hourlyJsonPath() + '?t=' + bust).catch(() => null),
      ]);
      if (!liveRes.ok) throw new Error('HTTP ' + liveRes.status);
      const liveData   = await liveRes.json();
      const hourlyData = (hourlyRes && hourlyRes.ok) ? await hourlyRes.json() : null;
      renderLive(el, liveData, hourlyData);
    } catch (e) {
      el.querySelector('#live-inner').innerHTML =
        '<div class="chart-panel" style="text-align:center;padding:40px;color:var(--text-secondary)">' +
        '<p style="margin:0 0 8px;font-weight:600">Could not load nse_live.json</p>' +
        '<p style="margin:0;font-size:12px;opacity:.6">' + e.message + '</p></div>';
    }
  }

  function renderLive(el, d, hourly) {
    const isBSE    = currentExchange === 'bse';
    const rev      = d.revenue || null;
    const upd      = d.updated_at;
    const age      = _age(upd);
    const hasRev   = rev && rev.has_data;

    // ── NSE-specific market data ──
    const ms       = d.market_status || {};
    const nifty    = (ms.marketState || []).find(m => m.market === 'Capital Market') || {};
    const mktcap   = ms.marketcap  || {};
    const gift     = ms.giftnifty  || {};
    const segments = ms.marketState || [];
    const niftyUp  = +nifty.percentChange >= 0;
    const giftUp   = +gift.PERCHANGE >= 0;

    // ── BSE-specific market data ──
    const sensex   = d.sensex       || {};
    const stat     = d.market_stat  || {};
    const sensexUp = (sensex.pct_change || 0) >= 0;

    // pill helper
    const pill = open =>
      open ? '<span style="display:inline-flex;align-items:center;gap:4px;padding:1px 8px;border-radius:4px;font-size:10px;font-weight:700;background:rgba(48,209,88,.12);color:#30d158;border:1px solid rgba(48,209,88,.25)"><span style="width:5px;height:5px;border-radius:50%;background:#30d158;display:inline-block;animation:pulse 1.5s infinite"></span>OPEN</span>'
           : '<span style="display:inline-flex;align-items:center;gap:4px;padding:1px 8px;border-radius:4px;font-size:10px;font-weight:700;background:rgba(120,120,120,.08);color:#666;border:1px solid rgba(120,120,120,.2)"><span style="width:5px;height:5px;border-radius:50%;background:#555;display:inline-block"></span>CLOSED</span>';

    // revenue segment card
    const segCard = (label, revVal, color) => `
      <div style="background:var(--color-surface-2);border:1px solid var(--color-border-strong);border-radius:6px;padding:20px 16px;text-align:center">
        <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:${color};margin-bottom:12px">${label}</div>
        <div style="font-size:28px;font-weight:700;color:var(--color-text);font-variant-numeric:tabular-nums;letter-spacing:-.5px">${hasRev ? _cr(revVal) : '—'}</div>
      </div>`;

    // hourly table rows
    const snaps = (hourly && hourly.snapshots) || [];
    const hourlyRows = snaps.map((s, i) => {
      const isLast = i === snaps.length - 1;
      const showPred = s.predicted_eod && Math.abs(s.predicted_eod - s.total_revenue) > 0.05;
      return `<tr style="${isLast ? 'font-weight:600' : ''}">
        <td style="padding:4px 8px;font-variant-numeric:tabular-nums">${s.hour_label}</td>
        <td style="padding:4px 8px;text-align:right;font-variant-numeric:tabular-nums">${s.has_data ? _cr(s.total_revenue) : '—'}</td>
        <td style="padding:4px 8px;text-align:right;font-variant-numeric:tabular-nums;color:#60a5fa">${s.has_data ? _cr(s.futures_revenue) : '—'}</td>
        <td style="padding:4px 8px;text-align:right;font-variant-numeric:tabular-nums;color:#a78bfa">${s.has_data ? _cr(s.options_revenue) : '—'}</td>
        <td style="padding:4px 8px;text-align:right;font-variant-numeric:tabular-nums;color:#34d399">${s.has_data ? _cr(s.cash_revenue) : '—'}</td>
        <td style="padding:4px 8px;text-align:right;font-variant-numeric:tabular-nums;color:var(--color-text-muted)">${showPred ? _cr(s.predicted_eod) : '—'}</td>
      </tr>`;
    }).join('');

    // segment status rows
    const segRows = segments.map(m => `
      <tr>
        <td style="padding:4px 8px">${m.market}</td>
        <td style="padding:4px 8px">${pill(String(m.marketStatus).toLowerCase() === 'open')}</td>
        <td style="padding:4px 8px;color:var(--text-secondary)">${m.index || m.underlying || '—'}</td>
        <td style="padding:4px 8px;text-align:right;font-variant-numeric:tabular-nums">${m.last !== '' && m.last != null ? _num(m.last, 1) : '—'}</td>
        <td style="padding:4px 8px;text-align:right;color:${+m.percentChange >= 0 ? '#30d158' : '#ff453a'};font-variant-numeric:tabular-nums">
          ${m.percentChange !== '' && m.percentChange != null ? _pct(m.percentChange) : '—'}
        </td>
      </tr>`).join('');

    // staleness
    const ageStr = age != null
      ? `<span style="color:${age > 10 ? '#854d0e' : 'var(--text-secondary)'};font-size:11px">${age === 0 ? 'just now' : age + 'm ago'}</span>`
      : '';

    // last hourly predicted EOD
    const lastPred = snaps.length ? snaps[snaps.length - 1].predicted_eod : null;

    el.querySelector('#live-inner').innerHTML = `
      <!-- meta row -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          ${isBSE ? `
            ${sensex.last ? `<span style="font-size:14px;font-weight:700;font-variant-numeric:tabular-nums">${_num(sensex.last, 1)}</span>` : ''}
            ${sensex.pct_change != null ? `<span style="font-size:12px;font-weight:600;color:${sensexUp ? '#30d158' : '#ff453a'}">${sensexUp ? '▲' : '▼'}${Math.abs(sensex.pct_change).toFixed(1)}%</span>` : ''}
            ${sensex.status ? pill(sensex.status === 'Open') : ''}
            ${stat.market_cap_cr ? `<span style="font-size:11px;color:var(--color-text-muted)">Mkt Cap ₹${(+stat.market_cap_cr / 1e5).toFixed(1)} L Cr · $${stat.market_cap_usd_t}T</span>` : ''}
            ${stat.advances != null ? `<span style="font-size:11px;color:var(--color-text-muted)"><span style="color:#30d158">${stat.advances}▲</span> <span style="color:#ff453a">${stat.declines}▼</span></span>` : ''}
          ` : `
            ${nifty.last != null ? `
              <span style="font-size:14px;font-weight:700;font-variant-numeric:tabular-nums">${_num(nifty.last, 1)}</span>
              <span style="font-size:12px;font-weight:600;color:${niftyUp ? '#30d158' : '#ff453a'}">${niftyUp ? '▲' : '▼'}${Math.abs(+nifty.percentChange).toFixed(1)}%</span>
              ${pill(String(nifty.marketStatus).toLowerCase() === 'open')}
            ` : ''}
            ${gift.LASTPRICE ? `<span style="font-size:11px;color:var(--color-text-muted)">GIFT ${_num(gift.LASTPRICE, 0)} <span style="color:${giftUp ? '#30d158' : '#ff453a'}">${giftUp ? '▲' : '▼'}${Math.abs(+gift.PERCHANGE).toFixed(1)}%</span></span>` : ''}
            ${mktcap.marketCapinLACCRRupeesFormatted ? `<span style="font-size:11px;color:var(--color-text-muted)">Mkt Cap ₹${mktcap.marketCapinLACCRRupeesFormatted} L Cr</span>` : ''}
          `}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${ageStr}
          <span style="font-size:11px;color:var(--color-text-muted)">5-min updates</span>
        </div>
      </div>

      <!-- revenue hero -->
      <div class="chart-panel" style="margin-bottom:14px;text-align:center">
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em">Total Revenue Today${hasRev ? ' · ' + rev.trade_date : ''}</div>
        ${hasRev ? `
          <div style="font-size:80px;font-weight:700;color:var(--color-text);font-variant-numeric:tabular-nums;letter-spacing:-2px;line-height:1;margin-bottom:6px">${_cr(rev.total_revenue)}</div>
          ${lastPred ? `<div style="font-size:11px;color:var(--color-text-muted);margin-bottom:24px">Latest forecast <span style="color:var(--color-text);font-weight:700;font-size:28px;font-variant-numeric:tabular-nums;letter-spacing:-.5px">${_cr(lastPred)}</span></div>` : '<div style="margin-bottom:24px"></div>'}
          <div style="display:grid;grid-template-columns:repeat(${isBSE ? 2 : 3},1fr);gap:10px;text-align:center">
            ${isBSE ? `
              ${segCard('Options (Sensex)', rev.options_revenue, '#a78bfa')}
              ${segCard('Cash (Equity)',    rev.cash_revenue,    '#34d399')}
            ` : `
              ${segCard('Futures', rev.futures_revenue, '#60a5fa')}
              ${segCard('Options', rev.options_revenue, '#a78bfa')}
              ${segCard('Cash',    rev.cash_revenue,    '#34d399')}
            `}
          </div>
        ` : `
          <div style="padding:32px 0;color:var(--text-secondary)">
            <div style="font-size:13px;font-weight:600;margin-bottom:6px">Data not yet published</div>
            <div style="font-size:11px;opacity:.6">NSE publishes today's turnover 1–2 hrs after market close (3:30 PM IST)</div>
          </div>
        `}
      </div>

      <!-- hourly progression -->
      ${snaps.length ? `
        <div class="chart-panel" style="margin-bottom:14px">
          <div class="chart-title" style="margin-bottom:10px">Intraday Progression</div>
          <div style="overflow-x:auto">
            <table class="data-table" style="width:100%">
              <thead><tr>
                <th style="text-align:left">Hour (IST)</th>
                <th style="text-align:right">Revenue</th>
                <th style="text-align:right;color:#60a5fa">Futures</th>
                <th style="text-align:right;color:#a78bfa">Options</th>
                <th style="text-align:right;color:#34d399">Cash</th>
                <th style="text-align:right;color:var(--text-secondary)">Pred. EOD</th>
              </tr></thead>
              <tbody>${hourlyRows}</tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- hourly revenue chart -->
      ${snaps.length > 1 ? `
        <div class="chart-panel" style="margin-bottom:14px">
          <div class="chart-title" style="margin-bottom:12px">Revenue by Hour (IST)</div>
          <canvas id="liveRevChart" height="60"></canvas>
        </div>
      ` : ''}

      ${isBSE ? `
        <!-- BSE market stats -->
        ${stat.advances != null ? `
          <div class="chart-panel">
            <div class="chart-title" style="margin-bottom:10px">Market Breadth</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;text-align:center">
              ${[
                ['Advances',  stat.advances,  '#30d158'],
                ['Declines',  stat.declines,  '#ff453a'],
                ['Unchanged', stat.unchanged, 'var(--color-text-muted)'],
                ['Scrips Traded', stat.turnover_cr ? stat.turnover_cr.toLocaleString('en-IN', {maximumFractionDigits:0}) + ' Cr' : '—', 'var(--color-text)'],
              ].map(([label, val, color]) =>
                `<div style="border:1px solid var(--color-border);border-radius:6px;padding:12px">
                  <div style="font-size:10px;color:var(--color-text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em">${label}</div>
                  <div style="font-size:20px;font-weight:700;color:${color};font-variant-numeric:tabular-nums">${val}</div>
                </div>`
              ).join('')}
            </div>
          </div>
        ` : ''}
      ` : `
        <!-- NSE market segments table -->
        <div class="chart-panel">
          <div class="chart-title" style="margin-bottom:10px">Market Segments</div>
          <div style="overflow-x:auto">
            <table class="data-table" style="width:100%">
              <thead><tr>
                <th style="text-align:left">Market</th>
                <th style="text-align:left">Status</th>
                <th style="text-align:left">Index</th>
                <th style="text-align:right">Last</th>
                <th style="text-align:right">Change</th>
              </tr></thead>
              <tbody>${segRows}</tbody>
            </table>
          </div>
        </div>
      `}`;

    // ── Chart.js hourly revenue line ──
    if (snaps.length > 1) {
      const canvas = document.getElementById('liveRevChart');
      if (canvas) {
        if (liveChart) { liveChart.destroy(); liveChart = null; }
        liveChart = new Chart(canvas.getContext('2d'), {
          type: 'line',
          data: {
            labels: snaps.map(s => s.hour_label),
            datasets: [{
              data: snaps.map(s => s.total_revenue),
              borderColor: '#fff',
              backgroundColor: 'rgba(255,255,255,.06)',
              tension: 0.3,
              pointRadius: 4,
              pointBackgroundColor: '#fff',
              fill: true,
              borderWidth: 1.5,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: ctx => _cr(ctx.parsed.y) } },
            },
            scales: {
              x: { ticks: { color: '#555', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,.04)' } },
              y: { ticks: { color: '#555', font: { size: 10 }, callback: v => '₹' + (+v).toFixed(0) + ' Cr' }, grid: { color: 'rgba(255,255,255,.04)' } },
            },
          },
        });
      }
    }
  }

  // ── Event delegation: start/stop polling when live tab is activated ──
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.nav-item[data-tab]');
    if (!btn) return;
    if (btn.dataset.tab === 'live') {
      fetchAndRender();
      if (!liveTimer) liveTimer = setInterval(fetchAndRender, POLL_MS);
    } else {
      clearInterval(liveTimer);
      liveTimer = null;
    }
  }, true);  // capture phase — runs alongside attachTabListeners
})();
// ─────────────────────────────────────────────────────────────────────────────

init();
