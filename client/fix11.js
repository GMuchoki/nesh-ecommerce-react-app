const fs = require('fs');
let base = 'd:/My Web Projects/nesh-ecommerce-react-app/client/src/components/admin/';

let files = fs.readdirSync(base).map(f => base + f);
files.forEach(f => {
  if (f.endsWith('.tsx')) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/\(agentId\)/g, '(agentId: any)');
    content = content.replace(/\(sum, o\)/g, '(sum: any, o: any)');
    fs.writeFileSync(f, content);
  }
});
console.log('Fixed agentId and sum params');
