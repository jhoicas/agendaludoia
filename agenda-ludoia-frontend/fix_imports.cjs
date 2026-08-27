const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'src', 'features');

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

const files = walk(featuresDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const relativeDepth = path.relative(path.join(__dirname, 'src'), path.dirname(file)).split(path.sep).length;
  // relativeDepth is 3 for src/features/ehr/pages, so we need 3 '../' to get to src. i.e., '../../../'

  const correctPrefix = '../'.repeat(relativeDepth);

  // Regex to match imports starting with relative paths going up
  // Like import { x } from '../../components/common/x';
  // or import { x } from '../types';
  
  content = content.replace(/from\s+['"](\.\.\/)+([^'"]+)['"]/g, (match, dotdots, restPath) => {
    // If restPath starts with something that is in src (types, utils, data, components/common, services, store, app, i18n, hooks)
    const srcFolders = ['types', 'utils', 'data', 'components', 'services', 'store', 'app', 'i18n', 'hooks', 'i18n', 'assets'];
    const firstPart = restPath.split('/')[0];
    
    if (srcFolders.includes(firstPart)) {
      return `from '${correctPrefix}${restPath}'`;
    }
    return match; // return original if not recognized
  });

  // Also replace standard imports without from (e.g. import '../../styles.css')
  content = content.replace(/import\s+['"](\.\.\/)+([^'"]+)['"]/g, (match, dotdots, restPath) => {
    const srcFolders = ['types', 'utils', 'data', 'components', 'services', 'store', 'app', 'i18n', 'hooks', 'i18n', 'assets'];
    const firstPart = restPath.split('/')[0];
    if (srcFolders.includes(firstPart)) {
      return `import '${correctPrefix}${restPath}'`;
    }
    return match;
  });

  fs.writeFileSync(file, content, 'utf8');
});

console.log(`Fixed imports in ${files.length} files.`);
