# 🏪 TindaHalin V1 — Sari-Sari Store & Carinderia POS System

**TindaHalin** is an offline-first, high-performance Point of Sale (POS) and inventory management system purpose-built for Philippine micro-merchants (Sari-Sari Stores, Carinderias, and local neighborhood kiosks). 

---

## 📌 Development Roadmap: Phases & Checkpoints

### 🟢 Phase 1: Core Architecture & Offline Foundation (**COMPLETED — CURRENT STATE**)
- [x] **Local Storage Engine**: Single-file IndexedDB / local database service (`/lib/db/database.ts`) with schema isolation and full offline fallback.
- [x] **Trilingual Localization (i18n)**: English (EN), Tagalog/Filipino (FIL), and Cebuano/Bisaya (CEB) translation engine with immediate reactive switching.
- [x] **Point of Sale (POS) Terminal**: 
  - Express Cart with piece/pack fractional quantity support.
  - Multi-payment reconciliation: Cash, QR Ph Digital (GCash/Maya), and Suki Credit (*Utang*).
  - Open-Item Custom Sale entry (*Patak-Patak* sales).
- [x] **Suki Utang Ledger**: Customer credit profiling, balance tracking, and credit limit guardrails (default ₱2,000 cap).
- [x] **Carinderia & Inventory Management**:
  - Daily prepared dish batch tracking (e.g. Adobo, Menudo morning servings).
  - Wastage / Spoilage recording (*Tapon/Luto* logs).
  - Low-stock visual alerts and fractional stock-in entries.
- [x] **Daily Reconciliation (`TodayScreen`)**: Gross sales, cash drawer variance auditor, QR Ph confirmation counter, and store lock-day workflow.
- [x] **Disaster Recovery & Backup**: Full JSON database snapshot export & single-click restore engine.

---

### 🟡 Phase 2: Enhanced Business Analytics & Multi-Terminal Sync (**PLANNED / NEXT**)
- [ ] **Suki Credit Payment History**: Dedicated repayment log screen allowingpartial repayments (e.g., "Aling Nena paid ₱500 toward her ₱1,200 balance").
- [ ] **Receipt Printer Integration**: ESC/POS thermal bluetooth/USB printer support for physical receipt printing.
- [ ] **Barcode Scanner Camera Support**: In-browser camera barcode scanning (`html5-qrcode` integration) for instant item selection.
- [ ] **Advanced Profit Analytics**: Cost of Goods Sold (COGS) vs Margin trend breakdown charts over 7-day, 30-day, and year-to-date spans.

---

### 🔴 Phase 3: Cloud Synchronization & Enterprise Scale (**FUTURE RE-EVALUATION**)
- [ ] **Firestore / Cloud Database Sync**: Sync local IndexedDB records to Firebase Cloud Firestore when internet connectivity is restored.
- [ ] **Multi-Branch & Cashier Accounts**: Role-based access control (RBAC) separating Cashier permissions from Store Owner audit reports.
- [ ] **Supplier Restock Auto-Orders**: Automated purchase order generation when stock breaches safety margins.

---

## 🛠️ Architecture, Dependencies & Refactors to Revisit

### 1. Database & Persistence Layer
- **Current State**: Client-side local state store with persistent LocalStorage / IndexedDB fallback engine.
- **Future Refactor**: When scaling past 50,000 transaction records on low-end hardware, transition from pure client memory arrays to WebWorker-backed IndexedDB or SQLite WASM (`@sqlite.org/sqlite-wasm`) to prevent UI main-thread blocking during complex queries.

### 2. State & Bundle Optimization
- **Current State**: React state hooks synchronized via single `db` singleton service.
- **Future Refactor**: Extract domain state management into Zustand or TanStack Query for finer-grained selector re-renders as component depth increases.

### 3. Dependencies Audit
- `next`: Next.js 15 App Router (`app/` directory architecture).
- `lucide-react`: Lightweight vector icons.
- `tailwindcss` v4: PostCSS CSS styling with high-contrast dark theme utilities.

---

## 🚀 Scaling & Security Considerations for Future Evaluation

1. **Transaction Log Compaction / Archiving**:
   - High-volume Sari-Sari stores generate ~200+ micro-transactions per day.
   - *Future Task*: Implement an end-of-month transaction rollup/compaction job to aggregate itemized sales into monthly historical summaries, maintaining system speed on low-spec Android tablets.

2. **QR Ph Payment Verification Integrity**:
   - Currently relies on manual cashier verification of reference numbers.
   - *Future Task*: Direct GCash / Maya Merchant API webhook integration for automated real-time payment confirmation alerts.

3. **Multi-Tab Conflict Avoidance**:
   - Implement `BroadcastChannel` API events across browser tabs to synchronize live stock numbers instantaneously if the POS is opened in multiple browser tabs simultaneously.

---

## 🏁 Current Checkpoint Summary
> **Status**: **Phase 1 Complete & Verified Production Build Passing Green**  
> All TypeScript definitions, i18n contexts, Dexie compatibility adapters, and Next.js static asset build workers are fully compiled without warnings or errors.
