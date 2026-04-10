const fs = require('fs');
let file = 'd:/My Web Projects/nesh-ecommerce-react-app/client/src/components/admin/InventoryTab.tsx';

let content = fs.readFileSync(file, 'utf8');
content = content.replace(/parseFloat\(newProduct\.discount_percentage\)/g, 'parseFloat(String(newProduct.discount_percentage))');
content = content.replace(/parseInt\(newProduct\.sales_count, 10\)/g, 'parseInt(String(newProduct.sales_count), 10)');
content = content.replace(/parseFloat\(newProduct\.price\)/g, 'parseFloat(String(newProduct.price))');
content = content.replace(/parseInt\(newProduct\.stock_quantity, 10\)/g, 'parseInt(String(newProduct.stock_quantity), 10)');
fs.writeFileSync(file, content);
console.log('Fixed parse');
