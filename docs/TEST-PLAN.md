# TindaHalin - Test Plan

## 1. Domain Unit Tests
- Integer centavo addition, discounting, change, refund logic.
- Thousandths quantity conversions (pieces, sachets, cups, kilos).
- Inventory movement sign conventions (`sale` -> negative delta, `stock_in` -> positive delta).
- Daily payment mix aggregation (cash, qrph, credit).

## 2. Database Integration Tests
- Complete sale commits all related rows atomically.
- Forced write failure rolls back entire transaction (zero partial sale).
- Product cached stock equals sum of inventory movements.
- Backup download and clean restore yields identical row count and financial totals.

## 3. Physical Device / Usability Scenarios
- Airplane mode / offline operation for cash and QR sales.
- App force-close during cart checkout.
- Low memory and font scale scaling.
