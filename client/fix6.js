const fs = require('fs');
let file = 'd:/My Web Projects/nesh-ecommerce-react-app/client/src/components/admin/InventoryTab.tsx';

let content = fs.readFileSync(file, 'utf8');
content = content.replace(/variants: \[\]/g, 'variants: [] as any[]');
fs.writeFileSync(file, content);
console.log('Fixed variants state');
