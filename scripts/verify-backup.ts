export function verifyBackup(jsonData: string): boolean {
  try {
    const parsed = JSON.parse(jsonData);
    const requiredKeys = ['store', 'products', 'sales', 'sale_items', 'payments', 'inventory_movements', 'customers', 'credit_entries'];
    for (const key of requiredKeys) {
      if (!(key in parsed)) {
        console.error(`Backup verification failed: Missing required key ${key}`);
        return false;
      }
    }
    console.log('✅ Backup JSON verification passed!');
    return true;
  } catch (e) {
    console.error('Backup verification error:', e);
    return false;
  }
}
