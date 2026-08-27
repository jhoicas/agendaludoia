const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, search, replacement) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(new RegExp(search, 'g'), replacement);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
}

// 1. BrandingCustomizer.tsx
replaceInFile(
  'src/features/settings/components/BrandingCustomizer.tsx',
  '\\.\\./\\.\\./\\.\\./\\.\\./app/providers/ThemeProvider',
  '../../../app/providers/ThemeProvider'
);

// 2. DoctorDashboard.tsx
replaceInFile(
  'src/features/ehr/pages/DoctorDashboard.tsx',
  '\\.\\./\\.\\./patients/components/PatientListModule',
  '../components/PatientListModule'
);

// 3. AnthropometryEvaluationModule.tsx
replaceInFile(
  'src/features/nutrition/components/AnthropometryEvaluationModule.tsx',
  '\\.\\./\\.\\./schemas/nutritionSchemas',
  '../../../schemas/nutritionSchemas'
);

// 4. DietPlannerModule.tsx
replaceInFile(
  'src/features/nutrition/components/DietPlannerModule.tsx',
  '\\.\\./\\.\\./schemas/nutritionSchemas',
  '../../../schemas/nutritionSchemas'
);
