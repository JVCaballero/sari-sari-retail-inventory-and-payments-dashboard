# TindaHalin - Product Requirements Document (PRD)

## Executive Summary
TindaHalin is an Android-first, offline-first "POS-lite" sales and inventory application designed for Philippine sari-sari stores and carinderias. It enables small store owners ("Aling Nena", "Tita Lorna") to record fast transactions, automatically decrement inventory, display merchant QR Ph payment codes, track customer credit ("utang"), and generate daily financial summaries—completely offline without internet dependency.

## Core Target Personas
1. **Sari-Sari Store Owner ("Aling Nena")**
   - High-volume sachet/piece sales, tingi unit conversions.
   - Accepts cash, QR Ph, and trusted neighbor credit ("utang").
2. **Carinderia Owner ("Tita Lorna")**
   - Prepared daily menu items, selling servings/orders.
   - Tracks prepared stock, sold-out dish status, and end-of-day leftovers/waste.
3. **Cashier / Family Helper**
   - Restricted cashier mode with large quick-sale buttons; no access to cost prices, owner PIN, or destructive edits.

## Product Boundaries & Guarantees
- **Offline First**: All catalog, sales, inventory, and reports run locally using SQLite.
- **Unit Representation**:
  - Money stored as integer **centavos** (₱12.50 = 1250).
  - Quantities stored as integer **thousandths** / milli-units (1 piece = 1000, 0.5 kg = 500).
- **QR Collection Safety**:
  - QR Ph displays enrolled merchant static QR image.
  - App records payment attempts and reference suffixes.
  - Payment states: `pending`, `merchant_confirmed`, `provider_confirmed`, `failed`, `refunded`, `disputed`.
  - App does **not** process live banking API settlements unless a backend callback is present.

## Navigation Destinations
1. **Sell**: Fast cart, favorites, category filter, quick quantity adjustments, checkout.
2. **Products / Menu**: Product list, stock levels, carinderia daily prepared dish toggles.
3. **Inventory**: Stock-in, adjustments, movement logs with reasons (delivery, recount, waste, personal use).
4. **Today**: Daily halin dashboard, gross sales breakdown (cash, QR, credit), margin estimate, low stock warnings, close day checklist.
