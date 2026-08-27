const fs = require('fs');
const path = require('path');

let file1 = path.join(__dirname, 'src/services/patientPortalService.ts');
if (fs.existsSync(file1)) {
  let content = fs.readFileSync(file1, 'utf8');
  content = content.replace(/import\s*\{\s*type\s+User,\s*ProfessionalProfile,\s*type\s+Review,\s*type\s+ProfessionalWithDetails\s*\}\s*from/g, 'import type { User, ProfessionalProfile, Review, ProfessionalWithDetails } from');
  fs.writeFileSync(file1, content, 'utf8');
}

console.log('Fixed patientPortalService missing export.');
