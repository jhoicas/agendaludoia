const fs = require('fs');
const path = require('path');

let file1 = path.join(__dirname, 'src/app/providers/ThemeProvider.tsx');
if (fs.existsSync(file1)) {
  let content = fs.readFileSync(file1, 'utf8');
  // Fix TS1484: 'ClinicalColorPreset'
  content = content.replace(/import\s*\{\s*clinicalColorPresets,\s*ClinicalColorPreset\s*\}\s*from/g, 'import { clinicalColorPresets, type ClinicalColorPreset } from');
  
  // Fix TS2722: Cannot invoke an object which is possibly 'undefined'.
  content = content.replace(/onColorsApplied\((.*?)\)/g, 'onColorsApplied?.($1)');
  
  fs.writeFileSync(file1, content, 'utf8');
}

let file2 = path.join(__dirname, 'src/features/nutrition/components/AnthropometryEvaluationModule.tsx');
if (fs.existsSync(file2)) {
  let content = fs.readFileSync(file2, 'utf8');
  // Fix TS1484: 'AnthropometryFormData'
  content = content.replace(/import\s*\{\s*anthropometryEvaluationSchema,\s*AnthropometryFormData\s*\}\s*from/g, 'import { anthropometryEvaluationSchema, type AnthropometryFormData } from');
  fs.writeFileSync(file2, content, 'utf8');
}

console.log('Fixed copied files TS errors.');
