const fs = require('fs');
const path = require('path');

let file1 = path.join(__dirname, 'src/components/common/PatientSearchCombobox.tsx');
if (fs.existsSync(file1)) {
  let content = fs.readFileSync(file1, 'utf8');
  content = content.replace(/\(patient,\s*idx\)/g, '(patient, _idx)'); // or just '(patient)' if we can safely do it, or better just use `_idx`. `_idx` doesn't suppress TS6133 if not configured, let's use `(patient)`
  content = content.replace(/\(patient,\s*_idx\)/g, '(patient)'); 
  // actually better to just replace `idx` entirely in that line.
  content = content.replace(/patient,\s*idx\s*\)/g, 'patient)');
  fs.writeFileSync(file1, content, 'utf8');
}

let file2 = path.join(__dirname, 'src/components/layout/RoleSwitcherBanner.tsx');
if (fs.existsSync(file2)) {
  let content = fs.readFileSync(file2, 'utf8');
  content = content.replace(/trialDaysLeft\s*</g, '(trialDaysLeft || 0) <');
  fs.writeFileSync(file2, content, 'utf8');
}

let file3 = path.join(__dirname, 'src/features/settings/components/BrandingCustomizer.tsx');
if (fs.existsSync(file3)) {
  let content = fs.readFileSync(file3, 'utf8');
  content = content.replace(/onChange=\{\(preset\)/g, 'onChange={(preset: any)');
  fs.writeFileSync(file3, content, 'utf8');
}

console.log('Final fixes applied.');
