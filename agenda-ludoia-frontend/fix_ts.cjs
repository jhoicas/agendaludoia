const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(srcDir);

const typesToFix = [
  'Tenant', 'EvaluacionAntropometrica', 'PlanNutricional', 'PacienteClinico', 
  'Country', 'Locale', 'Appointment', 'AppointmentStatus', 'ConsultaSOP', 
  'AlimentoItem', 'OrdenNutricionFHIR', 'ToastMessage', 'PricingPlanConfig', 
  'ProfessionalWithDetails', 'Review', 'User', 'ActivePatient', 
  'PrescripcionMedica', 'AnatomicalSegment', 'PainObservation', 'TiempoComida'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. Fix type imports
  typesToFix.forEach(type => {
    const regex = new RegExp(`import\\s*\\{\\s*([^}]*\\b${type}\\b[^}]*)\\s*\\}\\s*from\\s*(['"][^'"]+['"]);?`, 'g');
    content = content.replace(regex, (match, importsStr, fromStr) => {
      changed = true;
      // If the import block only contains types, we can prepend `type ` to the whole import.
      // But a safer way with TypeScript verbatimModuleSyntax is `import { type A, type B } from '...'`
      const newImports = importsStr.split(',').map(s => {
         const t = s.trim();
         if (!t) return t;
         if (t.startsWith('type ')) return t; // already has type
         if (typesToFix.includes(t.split(' ')[0])) {
           return `type ${t}`;
         }
         return t;
      }).join(', ');
      
      return `import { ${newImports} } from ${fromStr};`;
    });
  });

  // 2. Fix onNavigate
  if (content.includes('onNavigate:')) {
    content = content.replace(/onNavigate:\s*\(\w+:\s*string\)\s*=>\s*void;?/g, 'onNavigate?: (path: string) => void;');
    changed = true;
  }

  // 3. Unused imports/vars
  if (content.includes('getNutritionPlanPdfDataUrl')) {
    content = content.replace(/,\s*getNutritionPlanPdfDataUrl/g, '');
    content = content.replace(/getNutritionPlanPdfDataUrl\s*,?\s*/g, '');
    changed = true;
  }
  if (content.includes('getAnthropometryPdfDataUrl')) {
    content = content.replace(/,\s*getAnthropometryPdfDataUrl/g, '');
    content = content.replace(/getAnthropometryPdfDataUrl\s*,?\s*/g, '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log('TS fixes applied to files.');
