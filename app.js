// =============================================================
// Idle Fishing Calculator - Application Logic
// =============================================================

const STORAGE_KEY = 'idleFishingCalc_v2';
let state = {};

// --- Initialization ---
function init() {
  loadState();
  renderBaseUpgrades();
  renderEnhanceUpgrades();
  renderSkillTree();
  renderBarUpgrades();
  renderCards();
  bindGlobalEvents();
  recalculate();
}

// --- State Management ---
function getDefaultState() {
  const s = { dock: 'lake' };
  BASE_UPGRADES.forEach(u => s[u.id] = 0);
  ENHANCE_UPGRADES.forEach(u => s[u.id] = 0);
  SKILL_TREE.forEach(u => s[u.id] = 0);
  BAR_UPGRADES.forEach(u => s[u.id] = u.default);
  for (let i = 0; i < T1_CARD_SLOTS; i++) s['t1card' + i] = 0;
  for (let i = 0; i < T2_CARD_SLOTS; i++) s['t2card' + i] = 0;
  for (let i = 0; i < OTHER_CARD_SLOTS; i++) s['othercard' + i] = 0;
  return s;
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const defaults = getDefaultState();
  if (saved) {
    try {
      state = { ...defaults, ...JSON.parse(saved) };
    } catch { state = defaults; }
  } else {
    state = defaults;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// --- Formatting ---
function fmt(n) {
  if (n == null) return '-';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e4) return (n / 1e3).toFixed(1) + 'K';
  if (n >= 1000) return n.toLocaleString('en-US');
  return String(Math.round(n * 100) / 100);
}

function fmtPct(n) {
  if (n == null) return '-';
  if (n >= 100) return n.toFixed(0) + '%';
  if (n >= 10) return n.toFixed(1) + '%';
  if (n >= 1) return n.toFixed(2) + '%';
  return n.toFixed(3) + '%';
}

// --- Cost Lookup ---
function getNextCost(costKey, level) {
  const costs = UPGRADE_COSTS[costKey];
  if (!costs || level < 0 || level >= costs.length) return null;
  return costs[level];
}

// --- Power Model ---
// The total fishing output is modeled as:
//   Output = BasePower × FishMult × TickMod × ShinyMod
// Where BasePower = RodContribution + DroneContribution
// Growth from upgrading X = (Output_new - Output_old) / Output_old

function calcState(s) {
  // Rod
  const rodLevel = s.fishingRod || 0;
  const rodBase = rodLevel * 2 + 4;
  const rodMultBase = 1 + (s.rodMultiplier || 0) * 0.1;
  const rodMultEnh = 1 + (s.enhRodMult || 0) * 0.08;
  const rodPower = rodBase * rodMultBase * rodMultEnh;

  // Drones
  const droneCount = (s.fishingDrone || 0) + (s.fishingDroneX2 || 0) * 2
    + (s.enhFishingDrone || 0) + (s.enhDroneX3 || 0) * 3;
  const droneBaseLevel = 3 + (s.droneBasePower || 0) * 0.5;
  const droneBarPower = (s.barDroneBasePower || 0) * 0.1 + (s.barDronePower || 0) * 0.1;
  const droneBase = droneBaseLevel + droneBarPower;
  const droneMultBase = 1 + (s.droneMultiplier || 0) * 0.08;
  const droneMultEnh = 1 + (s.enhDroneMult || 0) * 0.06;
  const dronePower = droneCount * droneBase * droneMultBase * droneMultEnh;

  // Base power
  const basePower = rodPower + dronePower;

  // Fish multiplier
  const fishMult = 1 + (s.fishMultiplier || 0) * 0.03 + (s.enhFishMult || 0) * 0.05
    + (s.barSuperStar || 0) * 0.01;

  // Token multiplier (affects overall output)
  const tokenMult = 1 + (s.enhTokenMult || 0) * 0.05;

  // Tick speed
  const baseTicks = 60 + (s.tickSpeed || 0) * 0.5 + (s.enhTickSpeed || 0) * 0.5
    + (s.skillLPUP || 0) * 2;
  const bar3x = s.bar3xTickSpeed ? 3 : 1;
  const effectiveTicks = baseTicks * bar3x;

  // Tick chance bonuses
  const doubleTick = Math.min((s.doubleTickChance || 0) * 0.5 + (s.enhDoubleTick || 0) * 0.5, 100);
  const tripleTick = Math.min((s.tripleTickChance || 0) * 0.35 + (s.enhTripleTick || 0) * 0.4, 100);
  const fiveTick = (s.barTickChance5x || 0) * 2;
  const tickMod = 1 + doubleTick / 100 + 2 * tripleTick / 100 + 4 * fiveTick / 100;

  // Shiny
  const shinyChance = (s.shinyFishChance || 0) * 0.5;
  const shinyMult = 5 + (s.enhShinyMult || 0) * 0.25 + (s.barShinyMult10 ? 0.5 : 0);
  const shinyMod = 1 + (shinyChance / 100) * (shinyMult - 1);

  // Super shiny
  const superShinyMult = 1 + (s.enhSuperShinyMult || 0) * 0.03;

  // Boat / dock bonus
  const dock = DOCKS[s.dock] || DOCKS.lake;
  const boatLevel = s.upgradeBoat || 0;
  const boatMult = 1 + boatLevel * 0.1;

  // T2 dock power
  const t2DockPower = 1 + (s.enhT2DockPower || 0) * 0.05;

  // T2 dock ticks
  const t2DockTicks = 1 + (s.enhT2DockTicks || 0) * 0.03;

  // Tiny notice
  const tinyNoticeMult = 1 + (s.enhTinyNotice || 0) * 0.02;

  // Poly card multi
  const polyCardMult = 1 + (s.enhPolyCardMult || 0) * 0.04;

  // Skill tree bonuses
  const fwfMult = 1 + (s.skillFWF || 0) * 0.5;
  const fewtMult = 1 + (s.skillFEWT || 0) * 0.05;
  const wtfiMult = 1 + (s.skillWTFI || 0) * 0.03;
  const msMult = 1 + (s.skillMS || 0) * 0.06;
  const cgMult = 1 + (s.skillCG || 0) * 0.03;

  // Card bonus
  let cardBonus = 1;
  for (let i = 0; i < T1_CARD_SLOTS; i++) cardBonus += (s['t1card' + i] || 0) * 0.02;
  for (let i = 0; i < T2_CARD_SLOTS; i++) cardBonus += (s['t2card' + i] || 0) * 0.03;
  for (let i = 0; i < OTHER_CARD_SLOTS; i++) cardBonus += (s['othercard' + i] || 0) * 0.025;
  cardBonus *= polyCardMult;

  // Total output
  const totalOutput = basePower * fishMult * tokenMult * effectiveTicks * tickMod
    * shinyMod * superShinyMult * boatMult * t2DockPower * t2DockTicks * tinyNoticeMult
    * fwfMult * fewtMult * wtfiMult * msMult * cgMult * cardBonus;

  return {
    rodPower, dronePower, basePower, fishMult, tokenMult,
    effectiveTicks, tickMod, shinyMod, superShinyMult, boatMult,
    t2DockPower, t2DockTicks, tinyNoticeMult, polyCardMult,
    fwfMult, fewtMult, wtfiMult, msMult, cgMult,
    cardBonus, totalOutput,
    rodBase, rodMultBase, rodMultEnh,
    droneCount, droneBase, droneMultBase, droneMultEnh,
    doubleTick, tripleTick, fiveTick, shinyChance, shinyMult,
    dock, baseTicks, bar3x
  };
}

function calcGrowth(upgradeId, s) {
  // Calculate current output
  const current = calcState(s);
  if (current.totalOutput <= 0) return 0;

  // Create modified state with +1 level
  const modified = { ...s };
  modified[upgradeId] = (s[upgradeId] || 0) + 1;

  const next = calcState(modified);
  return ((next.totalOutput / current.totalOutput) - 1) * 100;
}

// --- Growth Calculation ---
function calculateGrowthData() {
  const results = [];

  // Base upgrades (fish cost)
  BASE_UPGRADES.forEach(u => {
    const level = state[u.id] || 0;
    const maxLvl = UPGRADE_COSTS[u.costKey] ? UPGRADE_COSTS[u.costKey].length : u.maxLevel;
    const cost = getNextCost(u.costKey, level);
    if (level >= maxLvl || cost === null) {
      results.push({ ...u, level, cost: null, growth: 0, efficiency: 0, maxed: true, costType: 'fish' });
      return;
    }
    const growth = calcGrowth(u.id, state);
    const efficiency = cost > 0 ? (growth / cost) * 10000 : 0;
    results.push({ ...u, level, cost, growth, efficiency, maxed: false, costType: 'fish' });
  });

  // Enhance upgrades (gem cost)
  ENHANCE_UPGRADES.forEach(u => {
    const level = state[u.id] || 0;
    if (level >= u.maxLevel) {
      results.push({ ...u, level, cost: null, growth: 0, efficiency: 0, maxed: true, costType: 'gem' });
      return;
    }
    const cost = u.gemCost;
    const growth = calcGrowth(u.id, state);
    const efficiency = cost > 0 ? (growth / cost) * 10000 : 0;
    results.push({ ...u, level, cost, growth, efficiency, maxed: false, costType: 'gem' });
  });

  // Skill tree (gem cost)
  SKILL_TREE.forEach(u => {
    const level = state[u.id] || 0;
    if (level >= u.maxLevel) {
      results.push({ ...u, level, cost: null, growth: 0, efficiency: 0, maxed: true, costType: 'gem' });
      return;
    }
    const cost = u.gemCost;
    const growth = calcGrowth(u.id, state);
    const efficiency = cost > 0 ? (growth / cost) * 10000 : 0;
    results.push({ ...u, level, cost, growth, efficiency, maxed: false, costType: 'gem' });
  });

  return results;
}

// --- Rendering ---
function renderBaseUpgrades() {
  const container = document.getElementById('upgrades-list');
  container.innerHTML = BASE_UPGRADES.map(u => {
    const level = state[u.id] || 0;
    const maxLvl = UPGRADE_COSTS[u.costKey] ? UPGRADE_COSTS[u.costKey].length : u.maxLevel;
    return upgradeRowHTML(u.id, u.name, level, maxLvl, 'fish');
  }).join('');
}

function renderEnhanceUpgrades() {
  const container = document.getElementById('enhance-list');
  container.innerHTML = ENHANCE_UPGRADES.map(u => {
    const level = state[u.id] || 0;
    return upgradeRowHTML(u.id, u.name, level, u.maxLevel, 'gem', u.desc);
  }).join('');
}

function renderSkillTree() {
  const container = document.getElementById('skill-list');
  container.innerHTML = SKILL_TREE.map(u => {
    const level = state[u.id] || 0;
    return upgradeRowHTML(u.id, u.name, level, u.maxLevel, 'gem', u.desc);
  }).join('');
}

function upgradeRowHTML(id, name, level, maxLevel, costType, desc) {
  const isMaxed = level >= maxLevel;
  return `
    <div class="upgrade-row${isMaxed ? ' maxed' : ''}" data-id="${id}"${desc ? ` title="${desc}"` : ''}>
      <div class="upgrade-name">${name}</div>
      <div class="upgrade-level">
        <button class="level-btn" data-action="dec" data-id="${id}">−</button>
        <input type="number" id="input-${id}" value="${level}" min="0" max="${maxLevel}" data-id="${id}">
        <button class="level-btn" data-action="inc" data-id="${id}">+</button>
        <span class="upgrade-max">/ ${maxLevel}</span>
      </div>
      <span class="upgrade-cost ${costType}" id="cost-${id}">-</span>
      <span class="upgrade-growth" id="growth-${id}">-</span>
    </div>
  `;
}

function renderBarUpgrades() {
  const container = document.getElementById('bar-list');
  container.innerHTML = BAR_UPGRADES.map(u => {
    if (u.type === 'toggle') {
      return `
        <div class="bar-item">
          <label>${u.name}</label>
          <label class="toggle">
            <input type="checkbox" id="input-${u.id}" data-id="${u.id}" data-type="toggle"${state[u.id] ? ' checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      `;
    }
    return `
      <div class="bar-item">
        <label>${u.name}</label>
        <input type="number" id="input-${u.id}" value="${state[u.id] || 0}" min="0" data-id="${u.id}" data-type="bar-number">
      </div>
    `;
  }).join('');
}

function renderCards() {
  renderCardSlots('t1-cards', 't1card', T1_CARD_SLOTS);
  renderCardSlots('t2-cards', 't2card', T2_CARD_SLOTS);
  renderCardSlots('other-cards', 'othercard', OTHER_CARD_SLOTS);
}

function renderCardSlots(containerId, prefix, count) {
  const container = document.getElementById(containerId);
  let html = '';
  for (let i = 0; i < count; i++) {
    const key = prefix + i;
    const val = state[key] || 0;
    html += `
      <div class="card-slot">
        <label>Slot ${i + 1}</label>
        <select id="input-${key}" data-id="${key}" data-type="card">
          ${CARD_OPTIONS.map(o => `<option value="${o.value}"${o.value === val ? ' selected' : ''}>${o.label}</option>`).join('')}
        </select>
      </div>
    `;
  }
  container.innerHTML = html;
}

// --- Recommendations ---
function renderRecommendations(allResults) {
  const container = document.getElementById('rec-list');

  const fishUpgrades = allResults
    .filter(r => r.costType === 'fish' && !r.maxed && r.growth > 0)
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 5);

  const gemUpgrades = allResults
    .filter(r => r.costType === 'gem' && !r.maxed && r.growth > 0)
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 5);

  if (fishUpgrades.length === 0 && gemUpgrades.length === 0) {
    container.innerHTML = '<p style="color:var(--text3);font-size:.85rem;grid-column:1/-1">Enter your levels to see recommendations</p>';
    return;
  }

  const makeCards = (list, icon) => list.map((r, i) => {
    const rank = i + 1;
    const cls = rank === 1 ? ' top1' : rank === 2 ? ' top2' : rank === 3 ? ' top3' : '';
    const costStr = r.costType === 'gem' ? `💎 ${fmt(r.cost)}` : `🐟 ${fmt(r.cost)}`;
    return `
      <div class="rec-card">
        <span class="rec-rank${cls}">${icon}${rank}</span>
        <div class="rec-info">
          <div class="rec-name">${r.name}</div>
          <div class="rec-details">
            <span>Lv ${r.level} → ${r.level + 1}</span>
            <span>${costStr}</span>
          </div>
        </div>
        <span class="rec-growth">+${fmtPct(r.growth)}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = makeCards(fishUpgrades, '🐟') + makeCards(gemUpgrades, '💎');
}

// --- Stats ---
function updateStats() {
  const c = calcState(state);
  const fpm = c.totalOutput;

  document.getElementById('stat-power').textContent = fmt(Math.round(c.basePower));
  document.getElementById('stat-fpm').textContent = fmt(Math.round(fpm));
  document.getElementById('stat-ticks').textContent = fmt(Math.round(c.effectiveTicks * c.tickMod * 10) / 10);
  document.getElementById('stat-shiny').textContent = c.shinyMod.toFixed(2) + 'x';
}

// --- Update Display ---
function updateCostsAndGrowth(results) {
  results.forEach(r => {
    const costEl = document.getElementById('cost-' + r.id);
    const growthEl = document.getElementById('growth-' + r.id);
    if (costEl) {
      if (r.maxed) {
        costEl.textContent = 'MAX';
        costEl.className = 'upgrade-cost';
      } else {
        const icon = r.costType === 'gem' ? '💎' : '🐟';
        costEl.textContent = `${icon} ${fmt(r.cost)}`;
        costEl.className = `upgrade-cost ${r.costType === 'gem' ? 'gem' : 'fish'}`;
      }
    }
    if (growthEl) {
      if (r.maxed) {
        growthEl.textContent = '✓ Max';
        growthEl.className = 'upgrade-growth negative';
      } else if (r.growth > 0) {
        growthEl.textContent = '+' + fmtPct(r.growth);
        growthEl.className = 'upgrade-growth';
      } else {
        growthEl.textContent = '-';
        growthEl.className = 'upgrade-growth negative';
      }
    }
  });
}

// --- Recalculate ---
function recalculate() {
  const results = calculateGrowthData();
  updateStats();
  updateCostsAndGrowth(results);
  renderRecommendations(results);
  saveState();
}

// --- Events ---
function bindGlobalEvents() {
  const dockSelect = document.getElementById('dock-select');
  dockSelect.value = state.dock || 'lake';
  dockSelect.addEventListener('change', e => { state.dock = e.target.value; recalculate(); });

  // Level +/- buttons (delegated)
  document.addEventListener('click', e => {
    const btn = e.target.closest('.level-btn');
    if (!btn) return;
    const id = btn.dataset.id;
    const input = document.getElementById('input-' + id);
    if (!input) return;
    let val = parseInt(input.value) || 0;
    const max = parseInt(input.max) || 999;
    if (btn.dataset.action === 'inc' && val < max) val++;
    else if (btn.dataset.action === 'dec' && val > 0) val--;
    input.value = val;
    state[id] = val;
    toggleMaxed(id, val, max);
    recalculate();
  });

  // All inputs (delegated)
  document.addEventListener('input', e => {
    const el = e.target;
    const id = el.dataset?.id;
    if (!id) return;
    const dt = el.dataset.type;
    if (dt === 'toggle') { state[id] = el.checked; }
    else if (dt === 'card') { state[id] = parseInt(el.value) || 0; }
    else if (dt === 'bar-number') { state[id] = parseFloat(el.value) || 0; }
    else if (el.type === 'number') {
      let v = parseInt(el.value) || 0;
      const mx = parseInt(el.max) || 999;
      v = Math.max(0, Math.min(v, mx));
      state[id] = v;
      toggleMaxed(id, v, mx);
    }
    recalculate();
  });

  // Selects & checkboxes
  document.addEventListener('change', e => {
    const el = e.target;
    const id = el.dataset?.id;
    if (!id) return;
    if (el.dataset.type === 'toggle') { state[id] = el.checked; recalculate(); }
    else if (el.dataset.type === 'card') { state[id] = parseInt(el.value) || 0; recalculate(); }
  });

  // Reset
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('Are you sure you want to reset all values?')) return;
    state = getDefaultState();
    rerender(dockSelect);
    showToast('All values have been reset');
  });

  // Export
  document.getElementById('btn-export').addEventListener('click', () => {
    const json = JSON.stringify(state);
    navigator.clipboard.writeText(json).then(
      () => showToast('Data copied to clipboard!'),
      () => { copyFallback(json); showToast('Data copied!'); }
    );
  });

  // Import
  document.getElementById('btn-import').addEventListener('click', () => {
    document.getElementById('import-modal').classList.remove('hidden');
    const ta = document.getElementById('import-text');
    ta.value = '';
    ta.focus();
  });
  document.getElementById('btn-import-cancel').addEventListener('click', closeModal);
  document.getElementById('btn-import-confirm').addEventListener('click', () => {
    try {
      state = { ...getDefaultState(), ...JSON.parse(document.getElementById('import-text').value.trim()) };
      rerender(dockSelect);
      closeModal();
      showToast('Data imported!');
    } catch { showToast('Invalid data — check the format'); }
  });
  document.getElementById('import-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
}

function rerender(dockSelect) {
  renderBaseUpgrades();
  renderEnhanceUpgrades();
  renderSkillTree();
  renderBarUpgrades();
  renderCards();
  dockSelect.value = state.dock || 'lake';
  recalculate();
}

function toggleMaxed(id, val, max) {
  const row = document.querySelector(`.upgrade-row[data-id="${id}"]`);
  if (row) row.classList.toggle('maxed', val >= max);
}

function closeModal() { document.getElementById('import-modal').classList.add('hidden'); }

function copyFallback(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

// --- Toast ---
let toastTimer;
function showToast(msg) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// --- Start ---
document.addEventListener('DOMContentLoaded', init);
