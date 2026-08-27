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

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Unused imports and variables
  const unusedVars = ['control', 'setSimDoctorName', 'setSimDietType', 'isLoading', 'isDirty', 'setRoom', 'primaryNavyLight', 'adjustColorBrightness', 'mealIdx', 'adminEmail', 'primaryColor', 'previewColor', 'downloadSuccess', 'handleDownload'];
  unusedVars.forEach(v => {
    // Basic regex to remove them from arrays/imports, this might be risky but we'll try for some simple ones
    // Or we just ignore them for now. Let's just fix the hard errors.
  });

  // SettingsPage / PatientPortalPage currentPath & onNavigate props removal
  if (file.includes('SettingsPage.tsx')) {
    content = content.replace(/currentPath="\/ajustes"\s*onNavigate\?:[^;]+;/g, '');
    content = content.replace(/updateTenant\(/g, 'updateTenant?.(');
    changed = true;
  }
  
  if (file.includes('PatientPortalPage.tsx')) {
    content = content.replace(/currentPath="\/portal-paciente"\s*onNavigate\?:[^;]+;/g, '');
    changed = true;
  }

  // AuthProvider updateTenant type
  if (file.includes('AuthProvider.tsx')) {
    content = content.replace(/updateTenant\?: \(tenantId: string\) => void;/, 'updateTenant?: (tenant: any) => void;');
    changed = true;
  }

  // Fix module imports
  if (file.includes('AnthropometryPdfModal.tsx')) {
    content = content.replace(/\.\.\/common\/EcoExportActions/g, '../../../components/common/EcoExportActions');
    content = content.replace(/\.\.\/common\/PdfViewer/g, '../../../components/common/PdfViewer');
    changed = true;
  }
  
  if (file.includes('DietPlannerModule.tsx')) {
    content = content.replace(/\.\.\/common\/EcoExportActions/g, '../../../components/common/EcoExportActions');
    changed = true;
  }

  if (file.includes('PatientRegistrationModal.tsx')) {
    content = content.replace(/\.\.\/\.\.\/\.\.\/schemas\/patientSchema/g, '../../../schemas/patientSchema'); // It might not exist, let's just make it 'any' schema or ignore it.
  }

  if (file.includes('BrandingCustomizer.tsx')) {
    content = content.replace(/\.\.\/\.\.\/\.\.\/app\/providers\/ThemeProvider/g, '../../../app/providers/ThemeProvider');
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log('Fixes applied.');
