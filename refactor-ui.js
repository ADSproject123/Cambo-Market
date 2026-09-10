import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p, callback);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      callback(p);
    }
  }
}

// Ensure the regexes don't match substrings of other words by using word boundaries
const replacements = [
  { regex: /\bbg-neutral-50(\/\d+)?\b/g, replacement: 'bg-background$1' },
  { regex: /\bdark:bg-neutral-950(\/\d+)?\b/g, replacement: '' },
  
  { regex: /\bbg-white(\/\d+)?\b/g, replacement: 'bg-card$1' },
  { regex: /\bdark:bg-neutral-900(\/\d+)?\b/g, replacement: '' },
  
  { regex: /\btext-neutral-900(\/\d+)?\b/g, replacement: 'text-foreground$1' },
  { regex: /\bdark:text-neutral-50(\/\d+)?\b/g, replacement: '' },
  
  { regex: /\bborder-neutral-200(\/\d+)?\b/g, replacement: 'border-border$1' },
  { regex: /\bdark:border-neutral-800(\/\d+)?\b/g, replacement: '' },
];

walk('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  for (const { regex, replacement } of replacements) {
    content = content.replace(regex, replacement);
  }

  // cleanup double spaces only inside classNames
  content = content.replace(/className="([^"]+)"/g, (match, classNames) => {
    return `className="${classNames.replace(/  +/g, ' ').trim()}"`;
  });

  if (content !== original) {
    console.log(`Updated ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf-8');
  }
});
