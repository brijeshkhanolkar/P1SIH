# ⚖️ METROLOGY — NAWI Testing & Verification Platform

> **Smart India Hackathon 2026** | **Problem Statement ID:** SIH26035  
> **Problem Title:** Development of a Software Program / Application for Generation of Test Reports for Non-Automatic Weighing Instruments (NAWI) as per OIML Recommendation R-76.  
> **Standard Compliance:** OIML R 76-1 (Edition 2006 E) & OIML R 76-2 (Edition 2007 E)  
> **Deployment Target:** [Vercel](https://vercel.com/) | **Repository:** [github.com/brijeshkhanolkar/P1SIH](https://github.com/brijeshkhanolkar/P1SIH)

---

## 📑 Table of Contents

1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [The Real-World Challenge in Legal Metrology](#-the-real-world-challenge-in-legal-metrology)
3. [The METROLOGY Solution](#-the-metrology-solution)
4. [Metrological Engine & OIML R-76 Mathematics](#-metrological-engine--oiml-r-76-mathematics)
5. [Core Features & Architecture](#-core-features--architecture)
6. [System Modules Walkthrough](#-system-modules-walkthrough)
7. [Role-Based Access Control & Demo Accounts](#-role-based-access-control--demo-accounts)
8. [Technology Stack](#-technology-stack)
9. [Project Structure](#-project-structure)
10. [Local Installation & Setup](#-local-installation--setup)
11. [Deploying to Vercel (Step-by-Step)](#-deploying-to-vercel-step-by-step)
12. [Presentation & Demo Script Guide](#-presentation--demo-script-guide)
13. [Compliance Standards & References](#-compliance-standards--references)

---

## 🏛️ Executive Summary & Problem Statement

In legal metrology, commerce, healthcare, and industrial manufacturing, weighing accuracy is paramount. A single inaccurate scale can lead to millions in financial discrepancies, unfair trade, or hazardous pharmaceutical dosages. 

Under international law, Non-Automatic Weighing Instruments (NAWI)—ranging from micro-analytical balances in pharmaceutical labs to 100-tonne highway weighbridges—must undergo stringent verification in accordance with **OIML Recommendation R-76**.

### The Challenge Today:
* **Manual Paper Testing:** Metrology officers and calibration laboratories record test loads, indicated values, and turning points manually on paper sheets or static spreadsheets.
* **Calculation Errors:** Complex calculations (such as rounding error correction via added fractional weights $\Delta L$, class-based verification intervals $n$, and dynamic Maximum Permissible Errors $MPE$) are prone to human oversight.
* **Auditability & Fraud Vulnerability:** Paper certificates and static PDFs lack cryptographic verification, tamper-evident audit trails, and deterministic traceability.
* **Delayed Certification:** Generating compliant OIML R-76 Part 2 test reports takes hours or days per instrument.

---

## 💡 The METROLOGY Solution

**METROLOGY** is a digital testing, verification, and automated report generation platform engineered specifically to solve SIH Problem Statement **SIH26035**.

It transforms NAWI verification into an automated, error-free workflow:
* **Mathematical R-76 Engine:** Real-time computation of true error $E$, corrected error $E_c$, and dynamic MPE tolerances according to instrument class.
* **Interactive Guided Testing:** Step-by-step test execution (Weighing Performance, Eccentricity, Repeatability, Discrimination, Tare).
* **Turning Point Calculator:** Dedicated modal for determination of changeover points with small added weights $\Delta L$.
* **Automated OIML R-76 Certificate Generator:** Creates official metrological certificates formatted strictly per OIML R 76-2 with digital signature verification.
* **Instant Vector PDF Export:** High-fidelity print-ready vector PDF certificates generated directly in the browser via `jsPDF`.
* **21 CFR Part 11 Style Audit Trail:** Immutable, chronological record of every measurement, adjustment, operator action, and approval.

---

## 🔬 Metrological Engine & OIML R-76 Mathematics

The platform's metrology calculation engine (`src/lib/r76-engine.ts`) enforces the exact statutory requirements of OIML R 76-1:

### 1. Classification & Verification Scale Intervals ($n = \text{Max} / e$)

Instruments are classified into four international accuracy classes based on verification scale interval ($e$) and the number of verification intervals ($n$):

| Accuracy Class | Symbol | Verification Scale Interval ($e$) | Minimum Capacity ($\text{Min}$) | Minimum $n$ | Maximum $n$ |
| :--- | :---: | :--- | :--- | :---: | :---: |
| **Special Accuracy** | **Class I** | $0.001\,\text{g} \le e$ | $100\,e$ | $50,000$ | No limit |
| **High Accuracy** | **Class II** | $0.001\,\text{g} \le e \le 0.05\,\text{g}$<br>$0.1\,\text{g} \le e$ | $20\,e$<br>$50\,e$ | $100$<br>$5,000$ | $100,000$<br>$100,000$ |
| **Medium Accuracy** | **Class III** | $0.1\,\text{g} \le e \le 2\,\text{g}$<br>$5\,\text{g} \le e$ | $20\,e$<br>$20\,e$ | $100$<br>$500$ | $10,000$<br>$10,000$ |
| **Ordinary Accuracy** | **Class IIII** | $5\,\text{g} \le e$ | $10\,e$ | $100$ | $1,000$ |

The platform dynamically validates instrument registration inputs against these boundary constraints and alerts the operator if an invalid combination of $\text{Max}$, $e$, and Class is supplied.

---

### 2. Maximum Permissible Error (MPE) Thresholds

During verification, errors must not exceed the statutory MPE thresholds defined in OIML R 76-1 §3.5.1:

```
              ┌─────────────────────────────────────────────────────────┐
              │           LOAD RANGE IN VERIFICATION SCALE INTERVALS (n) │
┌─────────────┼─────────────────────────┬───────────────────────────────┬───────────────────────────────┐
│     MPE     │         Class I         │           Class II            │           Class III           │
├─────────────┼─────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│  ±0.5 e     │     0 ≤ m ≤ 50,000 e    │        0 ≤ m ≤ 5,000 e        │         0 ≤ m ≤ 500 e         │
│  ±1.0 e     │  50,000 < m ≤ 200,000 e │     5,000 < m ≤ 20,000 e      │       500 < m ≤ 2,000 e       │
│  ±1.5 e     │       m > 200,000 e     │    20,000 < m ≤ 100,000 e     │      2,000 < m ≤ 10,000 e     │
└─────────────┴─────────────────────────┴───────────────────────────────┴───────────────────────────────┘
```
*(Note: For service verification / in-service inspection, statutory tolerances are typically double the initial verification values).*

---

### 3. Turning Point & True Error Calculation Formula

On digital instruments, the displayed reading $I$ is rounded. To find the true, unrounded error, additional weights $\Delta L$ (fractions of $e$, typically $0.1\,e$) are placed on the load receptor until the indication changes to $I + e$:

$$E = I + \frac{1}{2}e - \Delta L - L$$

Where:
* $I$ = Indicated reading on the digital display
* $e$ = Verification scale interval
* $\Delta L$ = Sum of additional fractional weights added until display transitions to $I + e$
* $L$ = Nominal reference test load

#### Corrected Error ($E_c$):
To eliminate zero-setting offset, the corrected error is computed as:
$$E_c = E - E_0$$
Where $E_0$ is the calculated error at zero or near-zero load.

The platform provides an on-screen **Turning Point Calculator** allowing operators to key in $\Delta L$ or use direct reading mode with instant real-time formula evaluation.

---

### 4. Mandatory OIML R-76 Test Procedures

1. **Weighing Performance Test (§A.4.4):**
   - Minimum 5 test load levels across the operating range (including Min, transition points at $500e, 2000e$, and Max).
   - Ascending (increasing) and descending (decreasing) load sequences.
   - Evaluates linearity and hysteresis.
2. **Eccentricity Test (§A.4.7):**
   - Applies test load of $L = \text{Max} / 3$ (or appropriate platform ratio) successively at four quadrants/corners and center.
   - Ensures load placement variations do not exceed permissible limits.
3. **Repeatability Test (§A.4.10):**
   - At least 3 series of weighings at $\sim 50\%$ Max and at Max.
   - Difference between maximum and minimum readings must not exceed absolute MPE for that load.
4. **Discrimination & Tare Verification (§A.4.8):**
   - Verifies instrument response to extra load equal to $1.4d$ (scale division).

---

## 🚀 Core Features & Architecture

* ⚡ **High-Speed Industrial UI:** Engineered with precision slate-and-amber metrology styling, dark-mode ergonomics, micro-animations, and live data binding.
* ⌨️ **Quick Command Palette (`Ctrl + K` / `Cmd + K`):** Instant search and navigation across all instruments, test plans, active sessions, and reports.
* 📊 **Dynamic Radial Progress & Live Metrics:** Visual indicators showing test completion, compliance rate, and pass/fail distributions.
* 🛡️ **Cryptographic Verification Signatures:** Reports are hashed using SHA-256 with timestamped inspector signatures to guarantee tamper evidence.
* 🗄️ **Instrument Registry:** Centralized database capturing serial numbers, manufacturers, accuracy classes, verification intervals, and environmental conditions.
* 📋 **Deterministic Test Plan Generator:** Generates automated test load sequences tailored to the instrument's capacity and OIML class.
* 📑 **One-Click OIML R 76-2 Test Certificate PDF:** Generates official calibration certificates formatted for regulatory submission and auditing.

---

## 🖥️ System Modules Walkthrough

| Module | Route | Functionality |
| :--- | :---: | :--- |
| **Testing Control Dashboard** | `/` | Operational overview, active session card, radial progress, live test counters, quick-action registry. |
| **Instruments Registry** | `/instruments` | Grid and list view of registered weighing instruments, search, class filtering, and registration modal. |
| **Instrument Profile** | `/instruments/:id` | Deep-dive specification view, verification parameters ($e$, $n$, Min, Max), calibration history, and test plans. |
| **Test Plans Sequence** | `/test-plans` | Generates and reviews step-by-step test sequences per OIML R-76 requirements. |
| **Active Testing Workstation** | `/testing` & `/testing/:id` | Real-time testing interface with turning point calculator, MPE tolerance bar, and automated pass/fail detection. |
| **Official Test Reports** | `/reports` & `/reports/:id` | Complete OIML R 76-2 compliant test certificates, inspector sign-off, hash verification, and vector PDF download. |
| **Instrument Repository** | `/repository` | Archival storage for active, verified, decommissioned, and maintenance-queued instruments. |
| **Metrology Audit Trail** | `/audit` | 21 CFR Part 11 compliant immutable log of all operator actions, modifications, and verifications. |
| **R-76 Rules & Engine** | `/rules` | Inspection and customization of accuracy classes, MPE tolerance tables, and test requirements. |
| **Settings & Laboratory Config** | `/settings` | Metrology institute metadata, calibration laboratory credentials, ambient environment thresholds, and system preferences. |

---

## 👥 Role-Based Access Control & Demo Accounts

The platform features built-in authentication with persona switching for seamless demonstration:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| 🧑‍🔬 **Operator** | `operator@lab.gov` | `operator123` | Execute tests, input measurements, use turning point calculator, upload evidence. |
| 📋 **Reviewer** | `reviewer@lab.gov` | `reviewer123` | Review test sessions, approve/reject test reports, apply cryptographic sign-offs. |
| 🕵️‍♂️ **Auditor** | `auditor@lab.gov` | `auditor123` | View-only audit mode, inspect chronological tamper-proof audit trail and system events. |
| ⚙️ **Administrator** | `admin@lab.gov` | `admin123` | Full access, modify R-76 rule versions, user management, and laboratory system configuration. |

*Quick login buttons are available directly on the login screen.*

---

## 💻 Technology Stack

* **Frontend Framework:** React 19, TypeScript
* **Build Tooling:** Vite 8 (Ultra-fast Hot Module Replacement and production bundling)
* **State Management:** Zustand 5 (Reactive, zero-boilerplate state store)
* **Styling & Design System:** Pure CSS3 Design System with CSS Custom Properties, Glassmorphism, and responsive CSS Grid / Flexbox
* **Animation Engine:** Framer Motion / Motion
* **Vector Document Generation:** `jspdf` & `jspdf-autotable`
* **Icons:** Lucide React
* **Client-side Routing:** React Router DOM v6 with SPA Fallback
* **Hosting & CDN:** Vercel Optimized with `vercel.json` SPA rewrites

---

## 📂 Project Structure

```
d:/SIH/
├── index.html                     # HTML5 Entry Point with typography & viewport configs
├── package.json                   # Project dependencies and build scripts
├── tsconfig.json                  # TypeScript compiler options
├── vercel.json                    # Vercel SPA routing rewrite rules
├── public/                        # Static assets, SVG icons, and favicons
└── src/
    ├── main.tsx                   # React root mount
    ├── App.tsx                    # Top-level router and layout definitions
    ├── index.css                  # Custom Metrology Design System & CSS variables
    ├── components/
    │   ├── CommandPalette.tsx     # Global quick-search & keyboard shortcut modal
    │   └── InstrumentRegistrationModal.tsx # New instrument modal with R-76 auto-calculation
    ├── layouts/
    │   └── AppLayout.tsx          # Topbar, navigation sidebar, quick role switch, and status bar
    ├── lib/
    │   ├── demo-data.ts           # Initial metrology sample instruments, tests, and audit logs
    │   ├── r76-engine.ts          # Core OIML R-76 metrology formulas and MPE evaluator
    │   └── store.ts               # Zustand application store with local persistence
    ├── pages/
    │   ├── DashboardPage.tsx      # Testing workstation dashboard & metrics
    │   ├── InstrumentsPage.tsx    # Instruments registry with filters
    │   ├── InstrumentProfilePage.tsx # Instrument detail & metrological specifications
    │   ├── TestPlansPage.tsx      # Test sequence generation
    │   ├── TestingPage.tsx        # Active test list
    │   ├── TestExecutionPage.tsx  # Interactive step-by-step test execution workstation
    │   ├── ReportsPage.tsx        # Test reports list
    │   ├── ReportDetailPage.tsx   # Detailed OIML R 76-2 certificate & PDF generator
    │   ├── RepositoryPage.tsx     # Archive repository
    │   ├── AuditPage.tsx          # Metrological chronological audit trail
    │   ├── RulesPage.tsx          # OIML R-76 rule version & MPE table inspector
    │   ├── SettingsPage.tsx       # Laboratory settings & environment controls
    │   ├── UsersPage.tsx          # User management
    │   └── LoginPage.tsx          # Secure login & quick persona switch
    └── types/
        └── index.ts               # TypeScript interfaces & domain types
```

---

## 🛠️ Local Installation & Setup

### Prerequisites
* **Node.js** (v18.0.0 or later recommended)
* **npm** (v9.0.0 or later) or **yarn** / **pnpm**
* **Git** installed on your system

### Quick Start:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/brijeshkhanolkar/P1SIH.git
   cd P1SIH
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will start immediately at `http://localhost:5173`.

4. **Verify Production Build:**
   ```bash
   npm run build
   npm run preview
   ```

---

## 🚀 Deploying to Vercel (Step-by-Step)

This repository is pre-configured for deployment on **Vercel** with zero extra setup.

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub:**
   Ensure all changes are pushed to `https://github.com/brijeshkhanolkar/P1SIH`.

2. **Login to Vercel:**
   Go to [vercel.com](https://vercel.com) and log in with your GitHub account.

3. **Import Project:**
   - Click **"Add New..."** -> **"Project"**.
   - Under **"Import Git Repository"**, select `brijeshkhanolkar/P1SIH`.

4. **Configure Project Settings:**
   - **Framework Preset:** `Vite` (Vercel automatically detects this).
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (or `tsc && vite build`)
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Deploy:**
   - Click **"Deploy"**.
   - In less than 60 seconds, your site will be live with a production HTTPS URL (e.g., `https://p1sih.vercel.app`).

### Method 2: Deploy via Vercel CLI

If you prefer using the command line:

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel

# 4. Deploy to production
vercel --prod
```

### Why `vercel.json` is Included:
Single Page Applications (SPAs) that use client-side routing (`react-router-dom`) require rewrite rules so that reloading on routes like `/testing/session-01` or `/reports/rep-001` serves `index.html` instead of returning a 404 error. The included `vercel.json` handles this automatically:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🎤 Presentation & Demo Script Guide

A complete, stage-ready presentation script has been crafted for hackathon presentations, jury demonstrations, and metrology evaluations:

👉 **Read the full script:** [`PRESENTATION_SCRIPT.md`](./PRESENTATION_SCRIPT.md)

It contains:
* **7-Minute Hackathon Pitch Script** with exact speaker notes and slide breakdown.
* **Live Demo Clickthrough Route** showing exactly what to click and say at each step.
* **Metrology Q&A Defense Guide** with answers to anticipated technical questions from judges regarding OIML R-76, turning point calculations, and digital data integrity.

---

## 📜 Compliance Standards & References

1. **OIML R 76-1 (Edition 2006 E):** Non-automatic weighing instruments — Part 1: Metrological and technical requirements - Tests. International Organization of Legal Metrology.
2. **OIML R 76-2 (Edition 2007 E):** Non-automatic weighing instruments — Part 2: Test report format.
3. **Legal Metrology (General) Rules, 2011:** Department of Consumer Affairs, Government of India.
4. **FDA 21 CFR Part 11:** Electronic Records; Electronic Signatures (Principles adapted for Metrological Audit Logging).

---

## 👨‍💻 Author & Team

* **Developed for:** Smart India Hackathon (SIH 2026)
* **Problem Statement:** SIH26035 — NAWI OIML R-76 Test Report Generator
* **Repository:** [https://github.com/brijeshkhanolkar/P1SIH](https://github.com/brijeshkhanolkar/P1SIH)
