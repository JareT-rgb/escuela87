const fs = require('fs');
let html = fs.readFileSync('c:/Users/DELL/OneDrive/Escritorio/escuela87/pages/directivos/busqueda.html', 'utf8');

const firstIdx = html.indexOf('<script src="../../assets/js/main.js"></script>');
const lastIdx = html.lastIndexOf('<script src="../../assets/js/main.js"></script>');

if (firstIdx !== -1 && lastIdx !== -1 && firstIdx !== lastIdx) {
    const finalHtml = html.substring(0, firstIdx) + html.substring(lastIdx);
    fs.writeFileSync('c:/Users/DELL/OneDrive/Escritorio/escuela87/pages/directivos/busqueda.html', finalHtml);
    console.log('Fixed duplicate script tag.');
} else {
    console.log('No duplicate found.');
}
