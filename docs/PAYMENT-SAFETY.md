# TindaHalin - Payment Safety Policy & Workflow

## Core Principle
**Displaying a QR code or viewing a customer's phone screenshot is NOT proof of payment.**

## Payment States
1. `pending`: Merchant displayed QR code; customer hasn't paid or merchant hasn't checked notification.
2. `merchant_confirmed`: Store owner/cashier verified receipt via SMS, merchant app notification, or terminal alert.
3. `provider_confirmed`: Payment validated via authenticated API webhook callback (post-MVP).
4. `failed`: Payment was declined or cancelled.
5. `refunded`: Payment returned to customer.
6. `disputed`: Customer claims payment made, but store cannot verify in provider account.

## Safe Cashier Workflow for QR Ph
1. Present enrolled merchant QR Ph code at checkout with total amount.
2. Direct customer to scan using GCash, Maya, BDO Pay, or any QR Ph bank app.
3. **Wait for Merchant SMS / Portal Alert** on store receiving device.
4. Verify exact amount and reference suffix (last 4-6 digits).
5. Tap **"Payment Received (Merchant Confirmed)"** and log reference code.
6. Never release goods on customer screenshot alone.
