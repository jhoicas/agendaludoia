const fs = require('fs');
const path = require('path');

let file = path.join(__dirname, 'src/services/supabaseClient.ts');
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/export const PRICING_PLANS = \[/g, "export const PRICING_PLANS: any[] = [");
  fs.writeFileSync(file, content, 'utf8');
}

console.log('Fixed PRICING_PLANS type.');
