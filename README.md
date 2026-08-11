# 🏪 TindaHalin V1 — Sari-Sari Store & Carinderia POS System

**TindaHalin** is an offline-first, high-performance Point of Sale (POS) and inventory management system purpose-built for Philippine micro-merchants (Sari-Sari Stores, Carinderias, and local neighborhood kiosks). 

---

## 📌 Development Roadmap: Phases & Checkpoints

### 🟢 Phase 1: Core Architecture & Offline Foundation (**COMPLETED**)
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

### 🟢 Phase 2: Enhanced Business Analytics, Receipts & Hardware Integrations (**COMPLETED — CURRENT STATE**)
- [x] **Suki Credit Payment History & Repayment Ledger (`UtangLedgerScreen`)**:
  - Dedicated Suki Directory with real-time balance tracking across all registered profiles.
  - Complete chronological transaction history (credit charges vs repayments).
  - Partial repayment entry modal with preset pills (₱50, ₱100, ₱200, ₱500) and custom note logs.
  - One-click SMS/Messenger statement copy for reminding Sukis of pending balance.
- [x] **Thermal Receipt & ESC/POS Engine (`ReceiptModal`)**:
  - Authentically styled 58mm / 80mm thermal receipt modal for any sale.
  - Browser `window.print()` trigger for ESC/POS hardware print support.
  - Formatted text summary copy for digital receipt sharing via Messenger / SMS.
- [x] **In-Browser Camera Barcode Scanner (`BarcodeScannerModal`)**:
  - Built-in camera scanner powered by `html5-qrcode` with manual input fallback.
  - Scan product barcodes directly in POS checkout for instant item add-to-cart.
  - Scan product barcodes directly when creating or editing products in catalog.
- [x] **Advanced Profit & COGS Analytics (`AnalyticsScreen`)**:
  - Area trend charts for Revenue vs Gross Profit Margin powered by `recharts` (7-day & 30-day spans).
  - Payment Method distribution pie chart (Cash vs QR Ph vs Suki Utang).
  - Cost of Goods Sold (COGS) tracking and average basket size metrics.
  - Top performing products ranking table by volume and gross revenue.

---

### 🟢 Phase 3: Cloud Synchronization & Enterprise Scale (**COMPLETED**)
- [x] **Firestore / Cloud Sync Outbox Engine**: Idempotent offline-first queue (`sync_outbox`), header outbox indicator ("Synced" vs "Outbox: N Pending"), and manual/automatic cloud flush engine.
- [x] **Multi-Branch & Cashier Accounts with Owner PIN (RBAC)**: Role-based Cashier Mode toggle with 6-digit/4-digit Owner PIN protection (`PinModal`) restricting store analytics, cost prices, and configuration settings.
- [x] **Supplier Restock Auto-Orders**: Automatic calculation of reorder needs based on safety stock thresholds, with 1-click **Copy PO for Viber/SMS** and **Batch Stock-In** delivery reception.

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
> **Status**: **Phase 1, Phase 2 & Phase 3 Fully Complete — Verified Production Build Passing Green**  
> All features across Phase 1, Phase 2, and Phase 3 are implemented: Suki credit repayments, ESC/POS receipts, barcode camera scanner, COGS analytics, Cloud sync outbox, Cashier PIN mode, and Supplier Restock POs.
