const fs = require('fs');
const path = require('path');

let file1 = path.join(__dirname, 'src/services/patientPortalService.ts');
if (fs.existsSync(file1)) {
  let content = fs.readFileSync(file1, 'utf8');
  content = content.replace(/import\s*\{\s*ProfessionalProfile\s*\}\s*from/g, 'import type { ProfessionalProfile } from');
  fs.writeFileSync(file1, content, 'utf8');
}

console.log('Fixed ProfessionalProfile missing export.');
