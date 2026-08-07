import fs from 'fs';
import path from 'path';

export function generateSeed(): void {
  console.log('Generating seed sample JSON verification...');
  const seedPath = path.join(process.cwd(), 'database', 'seed.sample.json');
  if (!fs.existsSync(seedPath)) {
    throw new Error('Seed file seed.sample.json missing in /database');
  }

  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  console.log(`Store Name: ${seed.store.name}`);
  console.log(`Total Products: ${seed.products.length}`);
  console.log(`Total Customers: ${seed.customers.length}`);
  console.log('✅ Seed dataset loaded successfully!');
}

if (require.main === module) {
  generateSeed();
}
