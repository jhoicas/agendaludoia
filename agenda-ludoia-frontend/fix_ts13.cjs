const fs = require('fs');
const path = require('path');

let file1 = path.join(__dirname, 'src/features/ehr/components/SoapEditorModule.tsx');
if (fs.existsSync(file1)) {
  let content = fs.readFileSync(file1, 'utf8');
  content = content.replace(/import\s+type\s*\{\s*type\s+PacienteClinico,\s*type\s+ConsultaSOP,\s*Icd10Diagnosis,\s*VitalSignsObservation\s*\}\s*from/g, 'import type { PacienteClinico, ConsultaSOP, Icd10Diagnosis, VitalSignsObservation } from');
  fs.writeFileSync(file1, content, 'utf8');
}

let file2 = path.join(__dirname, 'src/features/ehr/components/PrescriptionModule.tsx');
if (fs.existsSync(file2)) {
  let content = fs.readFileSync(file2, 'utf8');
  content = content.replace(/import\s+type\s*\{\s*type\s+PacienteClinico,\s*type\s+PrescripcionMedica,\s*MedicationItem\s*\}\s*from/g, 'import type { PacienteClinico, PrescripcionMedica, MedicationItem } from');
  fs.writeFileSync(file2, content, 'utf8');
}

console.log('Fixed double type modifiers.');
