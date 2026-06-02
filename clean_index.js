const fs = require('fs');

const indexFile = 'c:/Users/DELL/OneDrive/Escritorio/escuela87/index.html';
let content = fs.readFileSync(indexFile, 'utf8');

// Header title
content = content.replace(
  /<h1 class="text-lg font-extrabold tracking-tight text-gray-900 heading-font transition-colors">\s*Secretaría de Educación Pública\s*<\/h1>/,
  '<h1 class="text-lg font-extrabold tracking-tight text-gray-900 heading-font transition-colors">\n            Plataforma de Asistencia\n          </h1>'
);

// Footer text
content = content.replace(
  /© 2026 SECRETARÍA DE EDUCACIÓN PÚBLICA/g,
  '© 2026 SISTEMA DE GESTIÓN ESCOLAR'
);

// Remove links in footer
const linksToRemove = `<div class="flex gap-4 sm:gap-6 flex-wrap justify-center">
        <a href="#" class="hover:text-[#691C32] transition-colors">Aviso de Privacidad</a>
        <span class="hidden sm:inline opacity-30"> | </span>
        <a href="#" class="hover:text-[#691C32] transition-colors">Términos de Uso</a>
        <span class="hidden sm:inline opacity-30"> | </span>
        <a href="#" class="hover:text-[#691C32] transition-colors">Soporte Técnico</a>
      </div>`;

// Actually the exact spacing might differ, let's use a broader regex
content = content.replace(
  /<div class="flex gap-4 sm:gap-6 flex-wrap justify-center">[\s\S]*?<\/div>/,
  ''
);

fs.writeFileSync(indexFile, content);
console.log('Removed specific texts from index.html');
