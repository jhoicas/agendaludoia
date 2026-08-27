const fs = require('fs');
const path = require('path');

let file1 = path.join(__dirname, 'src/components/common/PatientSearchCombobox.tsx');
if (fs.existsSync(file1)) {
  let content = fs.readFileSync(file1, 'utf8');
  content = content.replace(/\{results\.map\(\(patient\)\s*=>\s*\{/g, '{results.map((patient, idx) => {');
  fs.writeFileSync(file1, content, 'utf8');
}

let file2 = path.join(__dirname, 'src/components/layout/RoleSwitcherBanner.tsx');
if (fs.existsSync(file2)) {
  let content = fs.readFileSync(file2, 'utf8');
  content = content.replace(/trialDaysLeft\s*>\s*0/g, '(trialDaysLeft ?? 0) > 0');
  fs.writeFileSync(file2, content, 'utf8');
}

let file3 = path.join(__dirname, 'src/features/settings/components/BrandingCustomizer.tsx');
if (fs.existsSync(file3)) {
  let content = fs.readFileSync(file3, 'utf8');
  content = content.replace(/clinicalPresets\.map\(\(preset\)\s*=>\s*\{/g, 'clinicalPresets.map((preset: any) => {');
  fs.writeFileSync(file3, content, 'utf8');
}

console.log('Very final fixes applied.');
