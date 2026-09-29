# METROLOGY — NAWI Testing & Verification Platform (OIML R-76)

> **Smart India Hackathon 2026**  
> **Problem Statement ID:** SIH26035  
> **Problem Statement:** Development of a Software Program/Application for Generation of Test Reports for Non-Automatic Weighing Instruments (NAWI) as per OIML Recommendation R-76.

---

## 🏛️ Executive Summary

**METROLOGY** is an enterprise-grade digital laboratory platform built for legal metrology officers, accredited calibration laboratories, manufacturers, and testing authorities. It digitizes the end-to-end evaluation and verification of Non-Automatic Weighing Instruments (NAWI) in accordance with the international metrological standard **OIML R-76** (Edition 2006 / Edition 1992).

---

## 🔬 Metrological Foundation & OIML R-76 Implementation

The application contains a dedicated metrological calculation engine (`src/lib/r76-engine.ts`) enforcing all statutory requirements of OIML Recommendation R-76:

### 1. Classification & Verification Intervals
- **Accuracy Classes:**
  - Class I (Special Accuracy)
  - Class II (High Accuracy)
  - Class III (Medium Accuracy)
  - Class IIII (Ordinary Accuracy)
- **Automatic Validation:** Verification of $n = \text{Max} / e$, ensuring $n$ falls within allowable limits for each accuracy class.
- **Minimum Capacity Check:** Automatic computation of $\text{Min}$ as defined by class rules (e.g. $20e$ for Class III, $100e$ for Class I).

### 2. Maximum Permissible Errors (MPE)
Dynamic lookup and validation against statutory MPE thresholds in service and initial verification:
- $\pm 0.5\,e$
- $\pm 1.0\,e$
- $\pm 1.5\,e$

### 3. Turning Point & True Error Calculation
Supports both direct scale reading errors and precise turning point (changeover point) determinations using added weights $\Delta L$:
$$E = I + \frac{1}{2}e - \Delta L - L$$
Where:
- $I$ = Indicated value
- $e$ = Verification scale interval
- $\Delta L$ = Additional fractional load until the next graduation transition
- $L$ = Reference test load

### 4. Core Verification Tests
- **Weighing Performance Test (Accuracy):** Both ascending and descending load sequences across $\ge 5$ test points (including Min, transition points $500e, 2000e$, and Max).
- **Eccentricity Test:** Evaluation of load placement at 4 corners / quadrants and center at $L = \text{Max} / 3$ (or platform-specific formula per R-76 §A.4.7).
- **Repeatability Test:** Multiple consecutive measurements at $\sim 50\%$ Max and near Max; checks that the difference between maximum and minimum values does not exceed absolute MPE.
- **Discrimination & Tare Tests:** Verification of sensitivity threshold and subtractive tare behavior.

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| 🔐 **Role-Based Authentication** | Secure workflows tailored for **Operator**, **Reviewer**, **Auditor**, and **Administrator** with permission controls. |
| ⚖️ **Instrument Registration** | Rich metadata recording: manufacturer, model, serial, class (I/II/III/IIII), Max, Min, e, d, tare limits, and environmental parameters. |
| 📋 **Automated Test Plans** | Instantly generates deterministic test loads and checklists adhering to OIML R-76 load rules. |
| 🎯 **Guided Test Execution** | Step-by-step interactive testing with real-time error computation, MPE tolerance visualization, and automated PASS/FAIL determinations. |
| 📄 **OIML R-76 Report Generator** | Produces official test certificates including full test tables, metrological summaries, pass/fail status, and laboratory digital signatures. |
| 💾 **Instant PDF Export** | Integrated vector PDF generation using `jsPDF` formatted to legal metrology standards ready for printing. |
| 🗄️ **Instruments & Reports Repository**| Searchable, filterable repository with status tracking (Compliant, Non-Compliant, Under Test, Review). |
| 📜 **Audit Trail (21 CFR Part 11 Style)** | Immutable chronological log capturing every test measurement, modification, approval, and user interaction. |
| ⚙️ **Rule Engine & Settings** | Version-controlled R-76 criteria allowing inspection and customization of MPE tables and tolerance parameters. |

---

## 💻 Tech Stack

- **Frontend Core:** React 19, TypeScript
- **Build System:** Vite 8 (sub-second HMR & optimized bundling)
- **State Management:** Zustand 5 (zero-boilerplate, lightweight, reactive persistence)
- **Styling:** Bespoke metrology dark-theme design system in Pure CSS (CSS variables, glassmorphism, responsive grid)
- **Icons:** Lucide React
- **Document & PDF Generation:** jsPDF, html2canvas
- **Routing:** React Router v6

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
# Clone the repository or navigate to directory
cd d:/SIH

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Production Build
```bash
npm run build
npm run preview
```

---

## 👥 Demo Accounts
Quick-access demo personas are provided on the login page:
- **Operator:** `operator@lab.gov` / `operator123` (Performs tests and data entry)
- **Reviewer:** `reviewer@lab.gov` / `reviewer123` (Reviews test results and signs reports)
- **Auditor:** `auditor@lab.gov` / `auditor123` (Inspects tamper-evident audit logs)
- **Administrator:** `admin@lab.gov` / `admin123` (System settings, user management, and rule configuration)

---

## 📜 Compliance Standard Reference
- **OIML R 76-1 (2006E):** Non-automatic weighing instruments — Part 1: Metrological and technical requirements - Tests.
- **OIML R 76-2 (2007E):** Part 2: Test report format.
