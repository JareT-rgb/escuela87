const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('c:/Users/DELL/OneDrive/Escritorio/escuela87/pages', function(filePath) {
  if (filePath.endsWith('.html')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add font-sans to body if not present
    content = content.replace(/body class="([^"]*)"/, (match, p1) => {
      if (!p1.includes('font-sans')) return `body class="${p1} font-sans"`;
      return match;
    });

    // Upgrade cards: bg-white rounded-2xl shadow...
    // Replace bg-white with glass-panel in main containers
    content = content.replace(/bg-white border/g, 'glass-panel border');
    content = content.replace(/bg-white rounded-2xl/g, 'glass-panel rounded-2xl');
    content = content.replace(/bg-white rounded-xl/g, 'glass-panel rounded-xl');
    
    // Upgrade shadows
    content = content.replace(/shadow-md/g, 'shadow-premium');
    content = content.replace(/shadow-lg/g, 'shadow-premium');

    // Upgrade sidebar
    content = content.replace(/bg-white border-r/g, 'glass-header border-r');
    content = content.replace(/bg-white shadow-sm/g, 'glass-header shadow-premium');

    // Upgrade animations on buttons
    content = content.replace(/hover:-translate-y-0.5/g, 'hover:-translate-y-1 hover:shadow-premium-hover');

    // Add staggered fade-in-up to grids if missing
    if (content.includes('grid') && !content.includes('animate-fade-in-up')) {
      content = content.replace(/class="grid /g, 'class="grid animate-fade-in-up ');
    }

    // Role-specific color replacements
    if (filePath.includes('alumnos')) {
      content = content.replace(/sepBurgundyLight/g, 'sepBlueLight');
      content = content.replace(/sepBurgundyDark/g, 'sepBlueDark');
      content = content.replace(/sepBurgundy/g, 'sepBlue');
    } else if (filePath.includes('tutores')) {
      content = content.replace(/sepBurgundyLight/g, 'sepTealLight');
      content = content.replace(/sepBurgundyDark/g, 'sepTealDark');
      content = content.replace(/sepBurgundy/g, 'sepTeal');
    }

    fs.writeFileSync(filePath, content);
    console.log('Upgraded aesthetic in', filePath);
  }
});
