const fs = require('fs');
const path = require('path');

let file1 = path.join(__dirname, 'src/app/providers/ThemeProvider.tsx');
if (fs.existsSync(file1)) {
  let lines = fs.readFileSync(file1, 'utf8').split('\n');
  lines = lines.map(line => {
    if (line.includes('ClinicalColorPreset,')) return line.replace('ClinicalColorPreset,', 'type ClinicalColorPreset,');
    if (line.includes('onColorsApplied(')) return line.replace('onColorsApplied(', 'onColorsApplied?.(');
    return line;
  });
  fs.writeFileSync(file1, lines.join('\n'), 'utf8');
}

let file2 = path.join(__dirname, 'src/features/nutrition/components/AnthropometryEvaluationModule.tsx');
if (fs.existsSync(file2)) {
  let lines = fs.readFileSync(file2, 'utf8').split('\n');
  lines = lines.map(line => {
    if (line.includes('AnthropometryFormData,')) return line.replace('AnthropometryFormData,', 'type AnthropometryFormData,');
    return line;
  });
  fs.writeFileSync(file2, lines.join('\n'), 'utf8');
}

console.log('Fixed TS 1484 and TS2722 properly.');
