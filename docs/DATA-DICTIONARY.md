# TindaHalin - Data Dictionary

## Schema Rules
- All primary keys are UUIDs generated on the device.
- All monetary values are integer centavos (`100` = ₱1.00).
- All stock quantities are integer thousandths (`1000` = 1.000 unit, `500` = 0.500 unit).

## Tables
1. **`stores`**: Business profile settings.
2. **`products`**: Catalog items (retail goods, dishes, ingredients).
3. **`sales`**: Header records for completed transactions.
4. **`sale_items`**: Line items with product snapshot names and prices.
5. **`payments`**: Payment method records (cash, qrph, credit).
6. **`inventory_movements`**: Immutable append-only audit log of stock changes.
7. **`customers`**: Utang balance profiles.
8. **`credit_entries`**: Charges, payments, and credit adjustments per customer.
9. **`sync_outbox`**: Queue for future multi-device / cloud synchronization.
