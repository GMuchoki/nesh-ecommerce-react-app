const fs = require('fs');
const files = [
  'AnalyticsTab.tsx',
  'BrandsTab.tsx',
  'CRMTab.tsx',
  'InventoryTab.tsx',
  'OrdersTab.tsx',
  'TeamTab.tsx'
].map(f => 'd:/My Web Projects/nesh-ecommerce-react-app/client/src/components/admin/' + f);

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/(?<=const handle[A-Za-z0-9_]* = (?:async )?)\(e\)/g, '(e: any)');
  content = content.replace(/(?<=const handle[A-Za-z0-9_]* = (?:async )?)\(brand\)/g, '(brand: any)');
  content = content.replace(/(?<=const handle[A-Za-z0-9_]* = (?:async )?)\(product\)/g, '(product: any)');
  content = content.replace(/(?<=const handle[A-Za-z0-9_]* = (?:async )?)\(id\)/g, '(id: any)');
  content = content.replace(/(?<=const handle[A-Za-z0-9_]* = (?:async )?)\(index\)/g, '(index: any)');
  content = content.replace(/(?<=const handle[A-Za-z0-9_]* = (?:async )?)\(index, field, value\)/g, '(index: any, field: any, value: any)');
  fs.writeFileSync(f, content);
});
console.log('Fixed implicitly typed params in handlers');
