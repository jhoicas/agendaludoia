const fs = require('fs');
const path = require('path');

function fixImportType(filePath, searchWords) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    searchWords.forEach(word => {
      // Find `import { ... word ... }` and change to `import type { ... word ... }` if not already
      const regex = new RegExp(`import\\s+\\{([^}]*?\\b${word}\\b[^}]*?)\\}\\s+from`, 'g');
      content = content.replace(regex, (match, inner) => {
        if (match.includes('import type')) return match;
        return `import type { ${inner.trim()} } from`;
      });
    });
    fs.writeFileSync(fullPath, content, 'utf8');
  }
}

fixImportType('src/features/ehr/components/SoapEditorModule.tsx', ['Icd10Diagnosis', 'VitalSignsObservation']);
fixImportType('src/features/ehr/components/PrescriptionModule.tsx', ['MedicationItem']);
fixImportType('src/components/layout/RoleSwitcherBanner.tsx', ['UserRole']);
fixImportType('src/features/nutrition/components/DietPlannerModule.tsx', ['DietPlanFormData']);

console.log('Fixed vite build missing exports by using import type.');
