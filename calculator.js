// ── State ──────────────────────────────────────────────────────────────────
let expr = '', currentMode = 'simple', progBase = 10, bitPending = null;

const $expr   = document.getElementById('expr');
const $result = document.getElementById('result');

// ── Display ─────────────────────────────────────────────────────────────────
function updateDisplay(res) {
  $expr.textContent = expr;
  $result.textContent = res !== undefined ? res : (expr || '0');
  $result.style.fontSize = String($result.textContent).length > 12 ? '24px' : '42px';
}

// ── Core input ───────────────────────────────────────────────────────────────
function inputDigit(d) {
  if (currentMode === 'programmatic') {
    const allowed = progBase === 2 ? /[01]/ : progBase === 8 ? /[0-7]/ : /[0-9]/;
    if (!allowed.test(d)) return;
  }
  expr += d;
  updateDisplay();
  if (currentMode === 'programmatic') updateProgConversions();
}

function inputDot() {
  const parts = expr.split(/[\+\-\*\/]/);
  if (!parts[parts.length - 1].includes('.')) { expr += '.'; updateDisplay(); }
}

function inputOp(op) {
  if (expr === '' && op !== '-') return;
  if (expr && /[\+\-\*\/\^%]$/.test(expr)) expr = expr.slice(0, -1);
  expr += op;
  updateDisplay();
}

function inputChar(c) { expr += c; updateDisplay(); }

function inputHex(h) {
  if (progBase !== 16) return;
  expr += h;
  updateDisplay();
  updateProgConversions();
}

function clearAll() {
  expr = ''; bitPending = null;
  updateDisplay('0');
  if (currentMode === 'programmatic') updateProgConversions();
}

function backspace() {
  expr = expr.slice(0, -1);
  updateDisplay(expr || '0');
  if (currentMode === 'programmatic') updateProgConversions();
}

function toggleSign() {
  if (!expr) return;
  expr = expr.startsWith('-') ? expr.slice(1) : '-' + expr;
  updateDisplay();
}

// ── Calculate ────────────────────────────────────────────────────────────────
function calculate() {
  if (!expr) return;
  try {
    let evalExpr = expr
      .replace(/÷/g, '/')
      .replace(/×/g, '*')
      .replace(/\^/g, '**')
      .replace(/π/g, Math.PI)
      .replace(/e(?![0-9])/g, Math.E);

    // eslint-disable-next-line no-new-func
    let res = Function('"use strict"; return (' + evalExpr + ')')();
    res = parseFloat(res.toPrecision(12));
    $expr.textContent = expr + ' =';
    $result.textContent = res;
    $result.style.fontSize = String(res).length > 12 ? '24px' : '42px';
    expr = String(res);
    if (currentMode === 'programmatic') updateProgConversions();
  } catch {
    $result.textContent = 'Error';
    expr = '';
  }
}

// ── Scientific ───────────────────────────────────────────────────────────────
function sciFunc(fn) {
  const val = parseFloat(expr) || 0;
  const map = {
    sin:  () => Math.sin(val * Math.PI / 180),
    cos:  () => Math.cos(val * Math.PI / 180),
    tan:  () => Math.tan(val * Math.PI / 180),
    log:  () => Math.log10(val),
    ln:   () => Math.log(val),
    sqrt: () => Math.sqrt(val),
    sq:   () => val ** 2,
    cube: () => val ** 3,
    inv:  () => 1 / val,
    fact: () => factorial(val),
    pi:   () => { expr += 'π'; updateDisplay(); return null; },
    e:    () => { expr += 'e'; updateDisplay(); return null; },
  };
  const result = map[fn]?.();
  if (result === null) return;
  if (result !== undefined) {
    const r = parseFloat(result.toPrecision(12));
    $expr.textContent = `${fn}(${val}) =`;
    $result.textContent = r;
    expr = String(r);
  }
}

function factorial(n) {
  n = Math.floor(n);
  if (n < 0) return NaN;
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// ── Programmatic ─────────────────────────────────────────────────────────────
document.querySelectorAll('.base-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.base-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    progBase = parseInt(btn.dataset.base);
    updateHexButtons();
    clearAll();
  });
});

function updateHexButtons() {
  document.querySelectorAll('.hex-btn').forEach(b => b.disabled = progBase !== 16);
  document.querySelectorAll('.btn.num').forEach(b => {
    const d = parseInt(b.textContent);
    if (!isNaN(d)) b.disabled = d >= progBase;
  });
}

function bitOp(op) {
  const val = parseInt(expr, progBase);
  if (op === 'NOT') {
    const r = ~val >>> 0;
    expr = r.toString(progBase).toUpperCase();
    updateDisplay(expr);
    updateProgConversions();
    return;
  }
  bitPending = { op, val };
  expr = '';
  $expr.textContent = `${val.toString(progBase).toUpperCase()} ${op}`;
  $result.textContent = '0';
}

function updateProgConversions() {
  let dec;
  try {
    if (bitPending && expr) {
      const a = bitPending.val, b = parseInt(expr, progBase);
      const ops = { AND: a & b, OR: a | b, XOR: a ^ b };
      dec = ops[bitPending.op] ?? parseInt(expr, progBase);
      if (!isNaN(dec)) { bitPending = null; }
    } else {
      dec = parseInt(expr || '0', progBase);
    }
  } catch { dec = 0; }
  if (isNaN(dec)) dec = 0;
  document.getElementById('phex').textContent = dec.toString(16).toUpperCase() || '0';
  document.getElementById('pdec').textContent = dec.toString(10) || '0';
  document.getElementById('poct').textContent = dec.toString(8) || '0';
  document.getElementById('pbin').textContent = dec.toString(2) || '0';
}

// ── Financial ────────────────────────────────────────────────────────────────
function calcEMI() {
  const P = parseFloat(document.getElementById('fin-principal').value);
  const r = parseFloat(document.getElementById('fin-rate').value) / 100 / 12;
  const n = parseInt(document.getElementById('fin-months').value);
  if (!P || !r || !n) return;
  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = emi * n;
  document.getElementById('fin-emi-result').innerHTML =
    `EMI: <span>$${emi.toFixed(2)}</span> | Total: $${total.toFixed(2)} | Interest: $${(total - P).toFixed(2)}`;
}

function calcCI() {
  const P = parseFloat(document.getElementById('ci-principal').value);
  const r = parseFloat(document.getElementById('ci-rate').value) / 100;
  const t = parseFloat(document.getElementById('ci-years').value);
  const n = parseFloat(document.getElementById('ci-n').value) || 1;
  if (!P || !r || !t) return;
  const A = P * Math.pow(1 + r / n, n * t);
  document.getElementById('fin-ci-result').innerHTML =
    `Amount: <span>$${A.toFixed(2)}</span> | Interest: $${(A - P).toFixed(2)}`;
}

function calcROI() {
  const init = parseFloat(document.getElementById('roi-init').value);
  const fin  = parseFloat(document.getElementById('roi-final').value);
  if (!init || !fin) return;
  const roi = ((fin - init) / init) * 100;
  document.getElementById('fin-roi-result').innerHTML =
    `ROI: <span>${roi.toFixed(2)}%</span> | Gain: $${(fin - init).toFixed(2)}`;
}

// ── Unit Conversion ──────────────────────────────────────────────────────────
const unitData = {
  length:  { m:1, km:1e-3, cm:100, mm:1000, mi:0.000621371, yd:1.09361, ft:3.28084, inch:39.3701 },
  weight:  { kg:1, g:1000, mg:1e6, lb:2.20462, oz:35.274, ton:0.001 },
  temp:    { C:1, F:1, K:1 },
  area:    { 'm²':1, 'km²':1e-6, 'cm²':1e4, 'ft²':10.7639, 'acre':0.000247105 },
  volume:  { L:1, mL:1000, 'm³':0.001, gal:0.264172, 'fl oz':33.814 },
  speed:   { 'km/h':1, 'm/s':0.277778, mph:0.621371, knot:0.539957 },
  time:    { s:1, min:1/60, h:1/3600, day:1/86400, week:1/604800 },
};

function updateUnitOptions() {
  const cat = document.getElementById('unit-category').value;
  const units = Object.keys(unitData[cat]);
  ['unit-from','unit-to'].forEach((id, i) => {
    const sel = document.getElementById(id);
    sel.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
    if (i === 1 && units.length > 1) sel.selectedIndex = 1;
  });
  convertUnit();
}

function convertUnit() {
  const cat  = document.getElementById('unit-category').value;
  const from = document.getElementById('unit-from').value;
  const to   = document.getElementById('unit-to').value;
  const val  = parseFloat(document.getElementById('unit-input').value);
  if (isNaN(val)) { document.getElementById('unit-output').value = ''; return; }

  let result;
  if (cat === 'temp') {
    result = convertTemp(val, from, to);
  } else {
    const base = val / unitData[cat][from];
    result = base * unitData[cat][to];
  }
  document.getElementById('unit-output').value = parseFloat(result.toPrecision(8));
}

function convertTemp(val, from, to) {
  let c;
  if (from === 'C') c = val;
  else if (from === 'F') c = (val - 32) * 5/9;
  else c = val - 273.15;
  if (to === 'C') return c;
  if (to === 'F') return c * 9/5 + 32;
  return c + 273.15;
}

// ── Currency Conversion ──────────────────────────────────────────────────────
const staticRates = {
  USD:1, EUR:0.92, GBP:0.79, JPY:149.5, INR:83.1, CAD:1.36, AUD:1.53,
  CHF:0.89, CNY:7.24, MXN:17.2, BRL:4.97, KRW:1325, SGD:1.34, HKD:7.82,
  NOK:10.6, SEK:10.4, DKK:6.88, NZD:1.63, ZAR:18.6, AED:3.67,
  TRY:32.1, THB:35.8, MYR:4.72, IDR:15700, PHP:56.8, VND:24500,
  SAR:3.75, QAR:3.64, KWD:0.307, BHD:0.377, EGP:30.9, NGN:1550,
  PKR:278, BDT:110, LKR:320, NPR:133, CZK:23.1, PLN:4.02, HUF:360
};

let liveRates = null;

function populateCurrencies(rates) {
  const currencies = Object.keys(rates).sort();
  ['cur-from','cur-to'].forEach((id, i) => {
    const sel = document.getElementById(id);
    const prev = sel.value;
    sel.innerHTML = currencies.map(c => `<option value="${c}">${c}</option>`).join('');
    sel.value = prev || (i === 0 ? 'USD' : 'EUR');
    if (!sel.value) sel.value = currencies[i];
  });
}

async function fetchLiveRates() {
  const status = document.getElementById('currency-status');
  const refreshBtn = document.getElementById('cur-refresh');
  status.textContent = '⟳ Fetching live rates...';
  status.className = 'currency-status';
  if (refreshBtn) refreshBtn.disabled = true;

  // Try two free APIs in sequence
  const apis = [
    () => fetch('https://open.er-api.com/v6/latest/USD').then(r => r.json()).then(d => d.result === 'success' ? d.rates : null),
    () => fetch('https://api.frankfurter.app/latest?from=USD').then(r => r.json()).then(d => d.rates ? { USD:1, ...d.rates } : null),
  ];

  for (const api of apis) {
    try {
      const rates = await api();
      if (rates) {
        liveRates = rates;
        populateCurrencies(liveRates);
        convertCurrency();
        status.textContent = `🟢 Live · ${new Date().toLocaleTimeString()}`;
        status.className = 'currency-status live';
        if (refreshBtn) refreshBtn.disabled = false;
        return;
      }
    } catch { /* try next */ }
  }

  // All APIs failed — use static
  populateCurrencies(staticRates);
  status.textContent = '🔴 Offline — static rates';
  status.className = 'currency-status offline';
  if (refreshBtn) refreshBtn.disabled = false;
}

function convertCurrency() {
  const rates = liveRates || staticRates;
  const from  = document.getElementById('cur-from').value;
  const to    = document.getElementById('cur-to').value;
  const val   = parseFloat(document.getElementById('cur-input').value);
  if (isNaN(val) || !rates[from] || !rates[to]) { document.getElementById('cur-output').value = ''; return; }
  const result = (val / rates[from]) * rates[to];
  document.getElementById('cur-output').value = parseFloat(result.toFixed(6));
  // Show rate hint
  const hint = document.getElementById('cur-rate-hint');
  if (hint) hint.textContent = `1 ${from} = ${parseFloat((rates[to]/rates[from]).toFixed(6))} ${to}`;
}

function swapCurrency() {
  const from = document.getElementById('cur-from');
  const to   = document.getElementById('cur-to');
  [from.value, to.value] = [to.value, from.value];
  convertCurrency();
}

// ── Matrix ───────────────────────────────────────────────────────────────────
function getMatrix(prefix) {
  return [
    [parseFloat(document.getElementById(`${prefix}00`).value)||0, parseFloat(document.getElementById(`${prefix}01`).value)||0],
    [parseFloat(document.getElementById(`${prefix}10`).value)||0, parseFloat(document.getElementById(`${prefix}11`).value)||0]
  ];
}
function det2(m) { return m[0][0]*m[1][1] - m[0][1]*m[1][0]; }
function fmtMat(m) { return `[${m[0][0]}, ${m[0][1]}]<br>[${m[1][0]}, ${m[1][1]}]`; }
function matOp(op) {
  const A = getMatrix('ma'), B = getMatrix('mb');
  const el = document.getElementById('mat-result');
  let res;
  if (op === 'add') res = fmtMat([[A[0][0]+B[0][0],A[0][1]+B[0][1]],[A[1][0]+B[1][0],A[1][1]+B[1][1]]]);
  else if (op === 'sub') res = fmtMat([[A[0][0]-B[0][0],A[0][1]-B[0][1]],[A[1][0]-B[1][0],A[1][1]-B[1][1]]]);
  else if (op === 'mul') res = fmtMat([
    [A[0][0]*B[0][0]+A[0][1]*B[1][0], A[0][0]*B[0][1]+A[0][1]*B[1][1]],
    [A[1][0]*B[0][0]+A[1][1]*B[1][0], A[1][0]*B[0][1]+A[1][1]*B[1][1]]
  ]);
  else if (op === 'detA') res = `det(A) = ${det2(A)}`;
  else if (op === 'trA') res = `tr(A) = ${A[0][0]+A[1][1]}`;
  else if (op === 'invA') {
    const d = det2(A);
    if (d === 0) { el.textContent = 'Singular (no inverse)'; return; }
    res = fmtMat([[A[1][1]/d, -A[0][1]/d],[-A[1][0]/d, A[0][0]/d]].map(r => r.map(v => parseFloat(v.toFixed(6)))));
  }
  el.innerHTML = res;
}

// ── Statistics ────────────────────────────────────────────────────────────────
function getDataSet() {
  return document.getElementById('stats-input').value.split(',').map(Number).filter(n => !isNaN(n));
}
function calcStats(type) {
  const d = getDataSet();
  if (!d.length) return;
  const sorted = [...d].sort((a,b)=>a-b);
  const mean = d.reduce((s,v)=>s+v,0)/d.length;
  const variance = d.reduce((s,v)=>s+(v-mean)**2,0)/d.length;
  const std = Math.sqrt(variance);
  const median = d.length%2 ? sorted[Math.floor(d.length/2)] : (sorted[d.length/2-1]+sorted[d.length/2])/2;
  const freq = {}; d.forEach(v => freq[v]=(freq[v]||0)+1);
  const maxF = Math.max(...Object.values(freq));
  const mode = Object.keys(freq).filter(k=>freq[k]===maxF).join(', ');
  const el = document.getElementById('stats-result');
  const fmt = v => parseFloat(v.toFixed(6));
  const results = {
    mean: `Mean: ${fmt(mean)}`,
    median: `Median: ${median}`,
    mode: `Mode: ${mode}`,
    std: `Std Dev: ${fmt(std)}`,
    variance: `Variance: ${fmt(variance)}`,
    all: `Mean: ${fmt(mean)} | Median: ${median} | Mode: ${mode}<br>Std Dev: ${fmt(std)} | Variance: ${fmt(variance)}<br>Min: ${sorted[0]} | Max: ${sorted[sorted.length-1]} | Range: ${sorted[sorted.length-1]-sorted[0]}`
  };
  el.innerHTML = results[type];
}

// ── Date & Time ───────────────────────────────────────────────────────────────
function calcDateDiff() {
  const a = new Date(document.getElementById('dt-from').value);
  const b = new Date(document.getElementById('dt-to').value);
  if (isNaN(a)||isNaN(b)) return;
  const ms = Math.abs(b-a), days = Math.floor(ms/864e5);
  const weeks = Math.floor(days/7), months = Math.floor(days/30.44), years = Math.floor(days/365.25);
  document.getElementById('dt-diff-result').innerHTML =
    `${days} days | ${weeks} weeks | ${months} months | ${years} years`;
}
function calcDateAdd() {
  const base = new Date(document.getElementById('dt-base').value);
  const days = parseInt(document.getElementById('dt-days').value);
  if (isNaN(base)||isNaN(days)) return;
  base.setDate(base.getDate()+days);
  document.getElementById('dt-add-result').textContent = base.toDateString();
}
function convertTZ() {
  const val = document.getElementById('tz-input').value;
  const tz  = document.getElementById('tz-target').value;
  if (!val) return;
  const d = new Date(val);
  const converted = d.toLocaleString('en-US', { timeZone: tz, dateStyle:'medium', timeStyle:'short' });
  document.getElementById('tz-result').textContent = `${tz}: ${converted}`;
}

// ── Health ────────────────────────────────────────────────────────────────────
function calcBMI() {
  const w = parseFloat(document.getElementById('bmi-weight').value);
  const h = parseFloat(document.getElementById('bmi-height').value) / 100;
  if (!w||!h) return;
  const bmi = w/(h*h);
  const cat = bmi<18.5?'Underweight':bmi<25?'Normal':bmi<30?'Overweight':'Obese';
  document.getElementById('bmi-result').textContent = `BMI: ${bmi.toFixed(1)} — ${cat}`;
}
function calcTDEE() {
  const age = parseFloat(document.getElementById('tdee-age').value);
  const w   = parseFloat(document.getElementById('tdee-weight').value);
  const h   = parseFloat(document.getElementById('tdee-height').value);
  const sex = document.getElementById('tdee-gender').value;
  const act = parseFloat(document.getElementById('tdee-activity').value);
  if (!age||!w||!h) return;
  const bmr = sex==='male' ? 10*w+6.25*h-5*age+5 : 10*w+6.25*h-5*age-161;
  const tdee = bmr*act;
  document.getElementById('tdee-result').innerHTML =
    `BMR: ${Math.round(bmr)} kcal | TDEE: ${Math.round(tdee)} kcal`;
}
function calcBodyFat() {
  const waist = parseFloat(document.getElementById('bf-waist').value);
  const neck  = parseFloat(document.getElementById('bf-neck').value);
  const h     = parseFloat(document.getElementById('bf-height').value);
  const hip   = parseFloat(document.getElementById('bf-hip').value);
  const sex   = document.getElementById('bf-gender').value;
  if (!waist||!neck||!h) return;
  let bf;
  if (sex==='male') bf = 495/(1.0324-0.19077*Math.log10(waist-neck)+0.15456*Math.log10(h))-450;
  else { if(!hip) return; bf = 495/(1.29579-0.35004*Math.log10(waist+hip-neck)+0.22100*Math.log10(h))-450; }
  document.getElementById('bf-result').textContent = `Body Fat: ${bf.toFixed(1)}%`;
}

// ── Color ─────────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return {r,g,b};
}
function rgbToHex(r,g,b) { return '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''); }
function rgbToHsl(r,g,b) {
  r/=255;g/=255;b/=255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b);
  let h,s,l=(max+min)/2;
  if(max===min){h=s=0;}else{
    const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
    h=max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4; h/=6;
  }
  return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};
}
function hslToRgb(h,s,l) {
  s/=100;l/=100;h/=360;
  const q=l<0.5?l*(1+s):l+s-l*s, p=2*l-q;
  const hue2rgb=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};
  return {r:Math.round(hue2rgb(p,q,h+1/3)*255),g:Math.round(hue2rgb(p,q,h)*255),b:Math.round(hue2rgb(p,q,h-1/3)*255)};
}
function updateColorUI(hex) {
  const {r,g,b} = hexToRgb(hex);
  const {h,s,l} = rgbToHsl(r,g,b);
  document.getElementById('color-hex').value = hex;
  document.getElementById('color-picker').value = hex;
  document.getElementById('color-r').value = r;
  document.getElementById('color-g').value = g;
  document.getElementById('color-b').value = b;
  document.getElementById('color-h').value = h;
  document.getElementById('color-s').value = s;
  document.getElementById('color-l').value = l;
  document.getElementById('color-preview').style.background = hex;
  document.getElementById('color-css').innerHTML =
    `HEX: ${hex} | RGB: rgb(${r},${g},${b}) | HSL: hsl(${h},${s}%,${l}%)`;
}
function onColorPick() { updateColorUI(document.getElementById('color-picker').value); }
function fromHex() {
  const hex = document.getElementById('color-hex').value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) updateColorUI(hex);
}
function fromRGB() {
  const r=parseInt(document.getElementById('color-r').value)||0;
  const g=parseInt(document.getElementById('color-g').value)||0;
  const b=parseInt(document.getElementById('color-b').value)||0;
  updateColorUI(rgbToHex(r,g,b));
}
function fromHSL() {
  const h=parseInt(document.getElementById('color-h').value)||0;
  const s=parseInt(document.getElementById('color-s').value)||0;
  const l=parseInt(document.getElementById('color-l').value)||0;
  const {r,g,b}=hslToRgb(h,s,l);
  updateColorUI(rgbToHex(r,g,b));
}
function relativeLuminance(r,g,b) {
  return [r,g,b].map(v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[0.2126,0.7152,0.0722][i],0);
}
function checkContrast() {
  const fg = hexToRgb(document.getElementById('fg-color').value);
  const bg = hexToRgb(document.getElementById('bg-color').value);
  const L1 = relativeLuminance(fg.r,fg.g,fg.b), L2 = relativeLuminance(bg.r,bg.g,bg.b);
  const ratio = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
  const wcag = ratio>=7?'AAA ✓':ratio>=4.5?'AA ✓':ratio>=3?'AA Large ✓':'Fail ✗';
  const prev = document.getElementById('contrast-preview');
  prev.style.color = document.getElementById('fg-color').value;
  prev.style.background = document.getElementById('bg-color').value;
  document.getElementById('contrast-result').textContent = `Ratio: ${ratio.toFixed(2)}:1 — WCAG ${wcag}`;
}

// ── Mode Switching ───────────────────────────────────────────────────────────
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    document.getElementById(`panel-${currentMode}`).classList.add('active');
    clearAll();
    if (currentMode === 'color') { updateColorUI('#7c3aed'); checkContrast(); }
  });
});

// ── Keyboard Support ─────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (['financial','unit','currency'].includes(currentMode)) return;
  if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
  else if (e.key === '.') inputDot();
  else if (['+','-','*','/','%'].includes(e.key)) inputOp(e.key);
  else if (e.key === '^') inputOp('^');
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Backspace') backspace();
  else if (e.key === 'Escape') clearAll();
  else if (e.key === '(' || e.key === ')') inputChar(e.key);
  else if (currentMode === 'programmatic' && /[a-fA-F]/.test(e.key)) inputHex(e.key.toUpperCase());
});

// ── Init ─────────────────────────────────────────────────────────────────────
updateUnitOptions();
populateCurrencies(staticRates);
fetchLiveRates();
updateHexButtons();
updateColorUI('#7c3aed');
checkContrast();
