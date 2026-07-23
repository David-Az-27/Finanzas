const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  // Layout background
  { search: /bg-black/g, replace: 'bg-transparent' },
  // Main cards
  { search: /bg-zinc-900/g, replace: 'bg-white/5 backdrop-blur-2xl shadow-xl' },
  // Inner cards / sections
  { search: /bg-zinc-950/g, replace: 'bg-black/20 backdrop-blur-md shadow-inner' },
  // Make borders a bit softer for glass
  { search: /border-white\/10/g, replace: 'border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.03)]' },
  // Fix cases where bg-transparent is duplicated
  { search: /bg-transparent\/50/g, replace: 'bg-transparent' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { search, replace } of replacements) {
        if (search.test(content)) {
          content = content.replace(search, replace);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryPath);
console.log('Glassmorphism replacement complete.');
