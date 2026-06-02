const fs = require('fs');

const directivosAsistencias = fs.readFileSync('../directivos/asistencias.html', 'utf8');
const directivosBusqueda = fs.readFileSync('../directivos/busqueda.html', 'utf8');

function adaptToPrefecto(content) {
  // 1. Auth check
  content = content.replace(/checkAuth\(\['directivo'\]\)/g, "checkAuth(['prefecto'])");
  
  // 2. Sidebar Role text
  content = content.replace(/<p id="sidebar-role"[^>]*>Directivo<\/p>/g, '<p id="sidebar-role" class="text-xs text-white/50 font-medium">Prefecto</p>');

  // 3. Sidebar Color
  content = content.replace(/bg-sepBurgundyDark/g, 'bg-sepGreenDark');
  
  // 4. Panel Header
  content = content.replace(/Panel Directivo/g, 'Panel de Prefectura');

  // 5. Replace 'directivos' in paths if any? No, paths are relative.
  
  return content;
}

fs.writeFileSync('asistencias.html', adaptToPrefecto(directivosAsistencias));
fs.writeFileSync('busqueda.html', adaptToPrefecto(directivosBusqueda));
console.log('Files copied and adapted');
