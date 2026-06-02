const fs = require('fs');

// 1. Fix Auth in Directivos
const directivosFiles = [
  '../directivos/busqueda.html',
  '../directivos/asistencias.html',
  '../directivos/reportes.html'
];

directivosFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/checkAuth\(\['directivo'\]\)/g, "checkAuth(['director', 'directivo'])");
    fs.writeFileSync(file, content);
    console.log('Fixed Auth in', file);
  }
});

// 2. Replace Burgundy with Green in Prefectos
const prefectosFiles = [
  '../prefectos/busqueda.html',
  '../prefectos/asistencias.html',
  '../prefectos/reportes.html'
];

prefectosFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Replace all sepBurgundy variants with sepGreen variants (except in the sidebar overlay bg if there's any strict match needed, but usually we just replace string)
    content = content.replace(/sepBurgundyLight/g, 'sepGreenLight');
    content = content.replace(/sepBurgundyDark/g, 'sepGreenDark');
    content = content.replace(/sepBurgundy/g, 'sepGreen');
    fs.writeFileSync(file, content);
    console.log('Fixed Colors in', file);
  }
});
