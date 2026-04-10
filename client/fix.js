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
  if (f.includes('AnalyticsTab')) content = content.replace(/colSpan=\{\}/g, "colSpan={5}");
  else if (f.includes('BrandsTab')) content = content.replace(/colSpan=\{\}/g, "colSpan={4}");
  else if (f.includes('CRMTab')) content = content.replace(/colSpan=\{\}/g, "colSpan={4}");
  else if (f.includes('InventoryTab')) content = content.replace(/colSpan=\{\}/g, "colSpan={6}");
  else if (f.includes('OrdersTab')) content = content.replace(/colSpan=\{\}/g, "colSpan={5}");
  else if (f.includes('TeamTab')) content = content.replace(/colSpan=\{\}/g, "colSpan={4}");

  fs.writeFileSync(f, content);
});
console.log('Fixed');
