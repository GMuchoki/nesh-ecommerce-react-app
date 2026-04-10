const fs = require('fs');
const files = [
  'd:/My Web Projects/nesh-ecommerce-react-app/client/src/components/admin/InventoryTab.tsx',
  'd:/My Web Projects/nesh-ecommerce-react-app/client/src/components/admin/BrandsTab.tsx',
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/rows="3"/g, 'rows={3}');
  fs.writeFileSync(f, content);
});
console.log('Fixed rows props');
