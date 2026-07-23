const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  { search: /bg-\[#0B1120\]/g, replace: 'bg-black' },
  { search: /bg-\[#1E293B\]/g, replace: 'bg-zinc-900' },
  { search: /bg-\[#0F172A\]/g, replace: 'bg-zinc-950' },
  { search: /border-\[#334155\]/g, replace: 'border-white/10' },
  { search: /border-\[#1E293B\]/g, replace: 'border-white/5' },
  { search: /text-\[#94A3B8\]/g, replace: 'text-zinc-400' },
  { search: /bg-\[#334155\]/g, replace: 'bg-white/10' },
  { search: /hover:bg-\[#334155\]/g, replace: 'hover:bg-white/10' },
  { search: /hover:bg-\[#0B1120\]/g, replace: 'hover:bg-black' },
  { search: /hover:bg-\[#151f32\]/g, replace: 'hover:bg-zinc-800/50' },
  { search: /bg-slate-800/g, replace: 'bg-zinc-800' },
  { search: /text-slate-300/g, replace: 'text-zinc-300' },
  { search: /text-slate-400/g, replace: 'text-zinc-400' },
  { search: /text-slate-200/g, replace: 'text-zinc-200' },
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
console.log('Color replacement complete.');
