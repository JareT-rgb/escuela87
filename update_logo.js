const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('pages', function(filePath) {
  if (filePath.endsWith('.html')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    if (content.includes('>SEP<')) {
      content = content.replace(/>SEP</g, '><svg class="w-8 h-8 md:w-10 md:h-10 inline-block group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log('Updated logo in', filePath);
    }
  }
});
