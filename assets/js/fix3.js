const fs = require('fs');
const file = 'c:/Users/DELL/OneDrive/Escritorio/escuela87/pages/prefectos/asistencias.html';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(/icon = 'V';/g, "icon = '&#10003;';");
content = content.replace(/icon = '\?';/g, "icon = '&#10007;';");

content = content.replace(/<span class="text-green-600 font-bold text-base">V<\/span>/g, '<span class="text-green-600 font-bold text-base">&#10003;</span>');
content = content.replace(/<span class="text-red-600 font-bold text-base">\?<\/span>/g, '<span class="text-red-600 font-bold text-base">&#10007;</span>');

fs.writeFileSync(file, content);
console.log('Fixed asistencias.html marks');
