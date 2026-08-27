const fs = require('fs');
const path = require('path');

let file = path.join(__dirname, 'src/features/landing/pages/LandingPage.tsx');
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/from '\.\.\/services\/supabaseClient'/g, "from '../../../services/supabaseClient'");
  content = content.replace(/from '\.\.\/types'/g, "from '../../../types'");
  content = content.replace(/from '\.\.\/components\/common\/LanguageSelector'/g, "from '../../../components/common/LanguageSelector'");
  content = content.replace(/from '\.\.\/app\/providers\/I18nProvider'/g, "from '../../../app/providers/I18nProvider'");
  
  // Fix the implicit any types
  content = content.replace(/PRICING_PLANS\.map\(\(plan\)/g, "PRICING_PLANS.map((plan: PricingPlanConfig)");
  content = content.replace(/plan\.features\.map\(\(feat, i\)/g, "plan.features.map((feat: string, i: number)");

  // Fix unused variable 't'
  content = content.replace(/const { t } = useI18n\(\);/g, "// const { t } = useI18n();");
  
  fs.writeFileSync(file, content, 'utf8');
}

console.log('Fixed LandingPage imports and types.');
