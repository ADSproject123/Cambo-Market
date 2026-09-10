import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function fixImports(dir) {
  walkDir(dir, function(filePath) {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.mts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Matches import/export ... from '... .js' or " ... .js"
      let newContent = content.replace(/(import|export)\s+(.*?)\s+from\s+(['"])(.*?)\.js(\3)/g, '$1 $2 from $3$4$5');
      // Also match dynamic imports: import('... .js')
      newContent = newContent.replace(/import\((['"])(.*?)\.js(\1)\)/g, 'import($1$2$3)');
      // Also match bare imports like `import './foo.js'`
      newContent = newContent.replace(/import\s+(['"])(.*?)\.js(\1)/g, 'import $1$2$3');
      
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Fixed', filePath);
      }
    }
  });
}

fixImports('./src');
