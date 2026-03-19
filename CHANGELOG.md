# Changelog

All notable changes to **Calculator** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-03-19

### 🎉 Initial Release by 7Sindhu Team

---

### Architecture

- Single-page application — `index.html` + `calculator.js` + `styles.css`
- Sidebar mode switching — 11 calculator modes in a scrollable left panel
- Shared display — expression row + large result row used across Simple and Scientific modes
- Panel system — each mode renders into its own `.panel` div, only the active one is shown
- No external dependencies — pure vanilla JavaScript, zero frameworks

---

### ✨ Features Added

#### 🔢 Simple Calculator
- Basic arithmetic: addition `+`, subtraction `−`, multiplication `×`, division `÷`
- Percentage `%` and sign toggle `+/−`
- Chained expressions with operator precedence via `Function()` eval
- Auto font-size shrink on long results (>12 chars → 24px, else 42px)
- `AC` clears all, backspace deletes last character

#### 🔬 Scientific Calculator
- Trigonometric functions: `sin`, `cos`, `tan` (degree-based input)
- Logarithms: `log` (base 10), `ln` (natural)
- Power functions: `x²`, `x³`, `xʸ` (via `^` operator)
- Root: `√` (square root)
- Reciprocal: `1/x`
- Constants: `π` (3.14159…), `e` (2.71828…)
- Factorial: `n!` (integer floor, returns NaN for negatives)
- Parentheses: `(` `)` for grouping expressions
- All results rounded to 12 significant figures via `toPrecision(12)`

#### 💻 Programmatic Calculator
- Base switching: **DEC** (10), **HEX** (16), **OCT** (8), **BIN** (2)
- Live base conversion display — HEX / DEC / OCT / BIN updated on every keystroke
- Hex digit buttons A–F (enabled only in HEX mode)
- Digit buttons auto-disabled based on active base (e.g. 8–9 disabled in OCT)
- Bitwise operations: `AND`, `OR`, `XOR`, `NOT` (unsigned 32-bit via `>>> 0`)
- Two-operand bitwise: stores first operand, waits for second, resolves on input

#### 💰 Financial Calculator
- **Loan / EMI** — principal, annual rate (%), months → monthly EMI, total payment, total interest
  - Formula: `EMI = P × r × (1+r)^n / ((1+r)^n − 1)`
- **Compound Interest** — principal, annual rate, years, compounds per year → final amount, interest earned
  - Formula: `A = P × (1 + r/n)^(n×t)`
- **ROI Calculator** — initial value, final value → ROI %, absolute gain

#### 📏 Unit Converter
- 7 categories: Length, Weight, Temperature, Area, Volume, Speed, Time
- Length: m, km, cm, mm, mi, yd, ft, inch
- Weight: kg, g, mg, lb, oz, ton
- Temperature: °C, °F, K (custom formula, not ratio-based)
- Area: m², km², cm², ft², acre
- Volume: L, mL, m³, gal, fl oz
- Speed: km/h, m/s, mph, knot
- Time: s, min, h, day, week
- Live conversion on every keystroke via `oninput`

#### 💱 Currency Converter
- **Live rates** fetched from two free APIs in sequence:
  1. `open.er-api.com/v6/latest/USD`
  2. `api.frankfurter.app/latest?from=USD`
- **Offline fallback** — 38 static rates used if both APIs fail
- Supported currencies: USD, EUR, GBP, JPY, INR, CAD, AUD, CHF, CNY, MXN, BRL, KRW, SGD, HKD, NOK, SEK, DKK, NZD, ZAR, AED, TRY, THB, MYR, IDR, PHP, VND, SAR, QAR, KWD, BHD, EGP, NGN, PKR, BDT, LKR, NPR, CZK, PLN, HUF
- Live status indicator: 🟢 Live with timestamp / 🔴 Offline — static rates
- Swap button (⇅) to instantly reverse from/to currencies
- Rate hint: shows `1 USD = 0.92 EUR` below the result
- Manual refresh button (🔄)

#### 🔲 Matrix Calculator (2×2)
- Operations: Add (A+B), Subtract (A−B), Multiply (A×B)
- Single-matrix: Determinant `det(A)`, Inverse `A⁻¹`, Trace `tr(A)`
- Singular matrix detection — shows "Singular (no inverse)" instead of crashing
- Results rounded to 6 decimal places

#### 📊 Statistics Calculator
- Input: comma-separated numbers
- Individual stats: Mean, Median, Mode, Standard Deviation, Variance
- "All Stats" button: shows all five + Min, Max, Range in one view
- Handles multi-modal datasets (all modes shown)

#### 📅 Date & Time Calculator
- **Date Difference** — from/to date pickers → days, weeks, months, years
- **Add / Subtract Days** — base date + offset (negative = subtract) → result date
- **Timezone Converter** — local datetime → 10 target timezones using `Intl` API
  - Supported: UTC, New York (ET), Los Angeles (PT), London (GMT), Paris (CET), Tokyo (JST), India (IST), Shanghai (CST), Sydney (AEST), São Paulo (BRT)

#### ❤️ Health Calculator
- **BMI** — weight (kg) + height (cm) → BMI value + category (Underweight / Normal / Overweight / Obese)
- **TDEE (Calorie Needs)** — age, weight, height, gender, activity level → BMR (Mifflin-St Jeor) + TDEE
  - Activity multipliers: Sedentary (1.2), Light (1.375), Moderate (1.55), Heavy (1.725), Athlete (1.9)
- **Body Fat % (Navy Method)** — waist, neck, height (+ hip for females) → body fat percentage

#### 🎨 Color Tool
- **Color Picker** — native `<input type="color">` synced to all fields
- **HEX input** — validates `/^#[0-9a-fA-F]{6}$/` before converting
- **RGB input** — R, G, B fields (0–255) with live sync
- **HSL input** — H (0–360), S (0–100), L (0–100) with live sync
- All three formats stay in sync on any change
- Live color preview swatch
- CSS output line: `HEX: #7c3aed | RGB: rgb(124,58,237) | HSL: hsl(263,76%,58%)`
- **WCAG Contrast Checker** — foreground + background color pickers
  - Relative luminance calculation per WCAG 2.1 spec
  - Contrast ratio displayed as `X.XX:1`
  - WCAG rating: AAA ✓ (≥7), AA ✓ (≥4.5), AA Large ✓ (≥3), Fail ✗ (<3)
  - Live preview text rendered in chosen colors

---

### ⌨️ Keyboard Support

| Key | Action |
|---|---|
| `0`–`9` | Digit input |
| `.` | Decimal point |
| `+` `-` `*` `/` `%` | Operators |
| `^` | Power operator |
| `Enter` or `=` | Calculate |
| `Backspace` | Delete last character |
| `Escape` | Clear all |
| `(` `)` | Parentheses |
| `A`–`F` | Hex digits (Programmatic mode only) |

> Keyboard input is disabled in Financial, Unit, and Currency modes to avoid conflicts with their form fields.

---

### 🎨 UI & Design

- Dark glassmorphism layout — `rgba(255,255,255,0.04)` background with `backdrop-filter: blur(20px)`
- Radial gradient background — three overlapping purple/blue/pink glows
- Sidebar with active state — gradient highlight + glow on active mode button
- Button styles:
  - Number buttons — subtle white tint
  - Operator buttons — blue tint with blue text
  - Function buttons — muted white
  - Equals button — purple-to-blue gradient with glow shadow
  - Scientific buttons — purple tint
  - Hex buttons — green tint (disabled when not in HEX mode)
- Press animation — `scale(0.95)` + white flash overlay on `:active`
- Responsive font size on result display

---

### 🔧 Technical Details

- Expression evaluation uses `new Function('"use strict"; return (' + expr + ')')()` — sandboxed, no `eval`
- All float results rounded via `parseFloat(result.toPrecision(12))` to avoid floating-point noise
- Currency fetch uses sequential API fallback — no parallel race, avoids partial failures
- Timezone conversion uses native `Intl.DateTimeFormat` — no external library needed
- Color conversions (HEX↔RGB↔HSL) implemented from scratch using standard formulas

---

## [Unreleased]

### Planned
- [ ] History panel — last 20 calculations
- [ ] Copy result to clipboard button
- [ ] Graph plotter for mathematical functions
- [ ] Equation solver (linear, quadratic)
- [ ] Base conversion for floating-point numbers
- [ ] More currencies and auto-refresh interval
- [ ] Responsive / mobile layout

---

*Maintained by [7Sindhu Team](https://github.com/7Sindhu)*
