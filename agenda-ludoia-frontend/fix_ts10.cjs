const fs = require('fs');
const path = require('path');

let file1 = path.join(__dirname, 'src/app/providers/ThemeProvider.tsx');
if (fs.existsSync(file1)) {
  let content = fs.readFileSync(file1, 'utf8');
  content = content.replace(/await\s+updateTenant\(\{/g, 'if (updateTenant) await updateTenant({');
  fs.writeFileSync(file1, content, 'utf8');
}
console.log('Fixed TS2722 for updateTenant');
