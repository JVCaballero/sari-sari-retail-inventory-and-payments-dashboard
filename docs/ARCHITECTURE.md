# TindaHalin - Technical Architecture

## Overview
TindaHalin follows a strict offline-first, layer-separated architecture where UI components **never** directly manipulate inventory or databases. All state mutations pass through domain use-case services and atomic SQLite transactions.

## Architecture Shape
```
   [ UI Components / Views ]
               │
               ▼
     [ Use-case Services ]
  (completeSale, receiveStock, recordWaste, recordCreditPayment, closeBusinessDay)
               │
       ┌───────┴───────┐
       ▼               ▼
 [ SQLite Database ]  [ Payment Adapters ]
  (Source of Truth)   (Manual QR Ph / API)
       │
       ▼
 [ Sync Outbox ]
 (Append-only local queue)
```

## Storage Strategy
- **Primary Source of Truth**: Embedded SQLite database (or IndexedDB-backed browser SQLite persistence).
- **Transient State**: React Context / Pinia state for cart, current filters, and active session.
- **Preferences**: Non-sensitive settings (language, business type) in `ApplicationSettings` / `localStorage`.
- **Secrets**: Owner PIN and security tokens stored in encrypted local storage.

## Transaction Atomic Guarantee
When a sale is completed, `completeSale()` executes a single database transaction containing:
1. `sales` row insert.
2. `sale_items` rows insert.
3. `payments` row insert.
4. `inventory_movements` rows insert (negative delta).
5. `products` stock cached quantity update.
6. `sync_outbox` row insert.

If any operation fails, the transaction rolls back completely with zero partial mutations.
