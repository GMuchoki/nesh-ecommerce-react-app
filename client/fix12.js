const fs = require('fs');
let base = 'd:/My Web Projects/nesh-ecommerce-react-app/client/src/components/admin/';

let files = fs.readdirSync(base).map(f => base + f);
files.forEach(f => {
  if (f.endsWith('.tsx')) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/Mutation\.isLoading/g, 'Mutation.isPending');
    fs.writeFileSync(f, content);
  }
});
console.log('Fixed Mutation.isLoading to .isPending');
