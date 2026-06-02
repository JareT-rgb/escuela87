const fs = require('fs');

function addAuthCheck(file, role) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Update sidebar info too
  content = content.replace(/<div class="overflow-hidden">\s*<p class="text-sm font-bold truncate text-white group-hover:text-[^"]+"[^>]*>Director General<\/p>\s*<p class="text-xs text-white\/50 font-medium">Ciclo 2025-2026<\/p>\s*<\/div>/g, 
  '<div class="overflow-hidden">\n            <p id="sidebar-name" class="text-sm font-bold truncate text-white group-hover:text-sepGold transition-colors font-heading tracking-wide">Cargando...</p>\n            <p id="sidebar-role" class="text-xs text-white/50 font-medium">Prefecto</p>\n          </div>');

  content = content.replace(/<div class="w-10 h-10 rounded-full[^"]+"[^>]*>D<\/div>/g,
  '<div id="sidebar-avatar" class="w-10 h-10 rounded-full bg-gradient-to-br from-sepGold to-yellow-600 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-glow transition-all duration-300">P</div>');

  // Insert checkAuth in module script
  if (!content.includes('checkAuth')) {
    content = content.replace(/<script type="module">\n/g, 
    `<script type="module">\n    import { checkAuth } from '../../assets/js/auth-guard.js';\n    document.addEventListener('DOMContentLoaded', () => {\n      const session = checkAuth(['${role}']);\n      if(session) {\n        document.getElementById('sidebar-name').textContent = session.nombre || '${role.charAt(0).toUpperCase() + role.slice(1)}';\n        const initials = (session.nombre || '${role}').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();\n        document.getElementById('sidebar-avatar').textContent = initials;\n      }\n    });\n`);
  }
  
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}

addAuthCheck('../prefectos/busqueda.html', 'prefecto');
addAuthCheck('../prefectos/asistencias.html', 'prefecto');
addAuthCheck('../directivos/busqueda.html', 'directivo');
addAuthCheck('../directivos/asistencias.html', 'directivo');
