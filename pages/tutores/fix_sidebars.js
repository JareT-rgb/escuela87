const fs = require('fs');
const files = ['dashboard.html', 'asistencias.html', 'notificaciones.html'];

const activeClass = 'flex items-center space-x-3 p-3.5 rounded-xl bg-gradient-to-r from-sepGold/20 to-transparent border-l-4 border-sepGold shadow-[inset_0_0_20px_rgba(188,149,92,0.05)] text-sepGold group relative overflow-hidden';
const inactiveClass = 'flex items-center space-x-3 p-3.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 hover:translate-x-1 transition-all duration-300 group';
const activeSvgClass = 'h-5 w-5 relative z-10';
const inactiveSvgClass = 'h-5 w-5 group-hover:text-sepGold transition-colors';
const activeSpanClass = 'font-semibold relative z-10 font-heading tracking-wide';
const inactiveSpanClass = 'font-medium tracking-wide';

const items = [
  { id: 'dashboard.html', label: 'Resumen General', svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>' },
  { id: 'asistencias.html', label: 'Historial Asistencias', svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>' },
  { id: 'notificaciones.html', label: 'Notificaciones', svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>' }
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

  content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/i, navHtml);
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
}
