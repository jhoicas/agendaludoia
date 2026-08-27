const fs = require('fs');
const path = require('path');
const file1 = path.join(__dirname, 'src/features/patients/components/ProfessionalCard.tsx');
const file2 = path.join(__dirname, 'src/features/patients/components/ProfessionalProfileModal.tsx');

let c1 = fs.readFileSync(file1, 'utf8');
c1 = c1.replace(/<className="w-3\.5 h-3\.5" \/>/g, '<span className="w-3.5 h-3.5">Social</span>');
fs.writeFileSync(file1, c1, 'utf8');

let c2 = fs.readFileSync(file2, 'utf8');
c2 = c2.replace(/<className="w-3\.5 h-3\.5" \/>/g, '<span className="w-3.5 h-3.5">Social</span>');
fs.writeFileSync(file2, c2, 'utf8');

console.log('Fixed JSX');
