const fs = require('fs');
let base = 'd:/My Web Projects/nesh-ecommerce-react-app/client/src/components/admin/';

let files = fs.readdirSync(base).map(f => base + f);
files.forEach(f => {
  if (f.endsWith('.tsx')) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/\(\(v, i\) =>/g, '((v: any, i: any) =>');
    content = content.replace(/\(b =>/g, '((b: any) =>');
    content = content.replace(/\(p =>/g, '((p: any) =>');
    content = content.replace(/\(cust =>/g, '((cust: any) =>');
    content = content.replace(/\(o =>/g, '((o: any) =>');
    content = content.replace(/\(brand =>/g, '((brand: any) =>');
    content = content.replace(/\(product =>/g, '((product: any) =>');
    content = content.replace(/\(order =>/g, '((order: any) =>');
    content = content.replace(/\(agent =>/g, '((agent: any) =>');
    content = content.replace(/\(cust, i\) =>/g, '((cust: any, i: any) =>');
    fs.writeFileSync(f, content);
  }
});
console.log('Fixed mapping params');
