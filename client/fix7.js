const fs = require('fs');
let base = 'd:/My Web Projects/nesh-ecommerce-react-app/client/src/components/admin/';

let inv = fs.readFileSync(base + 'InventoryTab.tsx', 'utf8');
inv = inv.replace('const [newProduct, setNewProduct] = useState({', 'const [newProduct, setNewProduct] = useState<any>({');
fs.writeFileSync(base + 'InventoryTab.tsx', inv);

let brand = fs.readFileSync(base + 'BrandsTab.tsx', 'utf8');
brand = brand.replace('const [newBrand, setNewBrand] = useState({', 'const [newBrand, setNewBrand] = useState<any>({');
fs.writeFileSync(base + 'BrandsTab.tsx', brand);

let team = fs.readFileSync(base + 'TeamTab.tsx', 'utf8');
team = team.replace('const [newStaff, setNewStaff] = useState({', 'const [newStaff, setNewStaff] = useState<any>({');
fs.writeFileSync(base + 'TeamTab.tsx', team);
console.log('Fixed states');
