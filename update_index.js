const fs = require('fs');

const indexFile = 'c:/Users/DELL/OneDrive/Escritorio/escuela87/index.html';
let content = fs.readFileSync(indexFile, 'utf8');

// Update Font
content = content.replace(
  'href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap"',
  'href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&family=Outfit:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap"'
);

// Replace fluid-bg with mesh-bg
content = content.replace(/class="fluid-bg"/g, 'class="fluid-bg mesh-bg"');
content = content.replace(/body class="([^"]*)"/, 'body class="$1 font-sans"');

// Enhance Inputs
content = content.replace(/class="w-full bg-white\/50/g, 'class="w-full bg-white/70 backdrop-blur-md transition-all duration-300 focus:bg-white focus:shadow-glow focus:-translate-y-1');

// Improve button hovers
content = content.replace(/hover:-translate-y-0.5/g, 'hover:-translate-y-1 hover:shadow-premium-hover');

fs.writeFileSync(indexFile, content);
console.log('Updated index.html aesthetic');
