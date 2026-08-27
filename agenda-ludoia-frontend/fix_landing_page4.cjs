const fs = require('fs');
const path = require('path');

let file = path.join(__dirname, 'src/features/landing/pages/LandingPage.tsx');
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import\s*\{\s*PricingPlanConfig\s*\}\s*from/g, "import type { PricingPlanConfig } from");
  content = content.replace(/\/\/\s*const { t } = useI18n\(\);/g, "");
  content = content.replace(/import\s*\{\s*useI18n\s*\}\s*from\s*'[^']+';/g, "");
  fs.writeFileSync(file, content, 'utf8');
}

console.log('Fixed final LandingPage errors.');
