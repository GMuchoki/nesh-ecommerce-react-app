const fs = require('fs');

let cc = 'd:/My Web Projects/nesh-ecommerce-react-app/client/src/context/CartContext.tsx';
let cdata = fs.readFileSync(cc, 'utf8');
cdata = cdata.replace('qty?: number;', 'qty: number;');
fs.writeFileSync(cc, cdata);

let pc = 'd:/My Web Projects/nesh-ecommerce-react-app/client/src/components/ProductDetailClient.tsx';
let pdata = fs.readFileSync(pc, 'utf8');
pdata = pdata.replace(/variant: selectedVariant\?\.name \|\| null \}, Number\(qty\)\)/g, "variant: selectedVariant?.name || null, qty: Number(qty) }");
fs.writeFileSync(pc, pdata);

console.log('Reverted CartItem interface, explicitly provided qty');
