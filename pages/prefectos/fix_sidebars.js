const fs = require('fs');
const files = ['dashboard.html', 'escaner.html', 'asistencias.html', 'busqueda.html', 'reportes.html'];
const activeClass = 'flex items-center space-x-3 p-3.5 rounded-xl bg-gradient-to-r from-sepGold/20 to-transparent border-l-4 border-sepGold shadow-[inset_0_0_20px_rgba(188,149,92,0.05)] text-sepGold group relative overflow-hidden';
const inactiveClass = 'flex items-center space-x-3 p-3.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 hover:translate-x-1 transition-all duration-300 group';
const activeSvgClass = 'h-5 w-5 relative z-10';
const inactiveSvgClass = 'h-5 w-5 group-hover:text-sepGold transition-colors';
const activeSpanClass = 'font-semibold relative z-10 font-heading tracking-wide';
const inactiveSpanClass = 'font-medium tracking-wide';

const items = [
  { id: 'dashboard.html', label: 'Panel Principal', svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>' },
  { id: 'escaner.html', label: 'Escáner QR', svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>' },
  { id: 'asistencias.html', label: 'Pase de Lista', svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>' },
  { id: 'busqueda.html', label: 'Búsqueda Alumnos', svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>' },
  { id: 'reportes.html', label: 'Gestión de Reportes', svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>' }
];

for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let navHtml = '<nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">\n';
  for (let item of items) {
    let isActive = item.id === file;
    navHtml += `        <a class="${isActive ? activeClass : inactiveClass}" href="${item.id}">\n`;
    navHtml += `          <svg class="${isActive ? activeSvgClass : inactiveSvgClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">${item.svg}</svg>\n`;
    navHtml += `          <span class="${isActive ? activeSpanClass : inactiveSpanClass}">${item.label}</span>\n`;
    navHtml += `        </a>\n`;
  }
  navHtml += '      </nav>';

  // Reemplazar la etiqueta nav existente
  content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/i, navHtml);
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
}
