const fs = require('fs');

let content = fs.readFileSync('c:/Users/DELL/OneDrive/Escritorio/escuela87/assets/js/api-client.js', 'utf8');

const regex = /const \{ data: hoyData \} = await supabase\s*\.from\('asistencias'\)\.select\('status'\)\.eq\('date', today\);\s*const presentes_hoy = \(hoyData \|\| \[\]\)\.filter\(r => r\.status === 'A tiempo' \|\| r\.status === 'Retardo'\)\.length;\s*const faltas_hoy    = \(hoyData \|\| \[\]\)\.filter\(r => r\.status === 'Falta'\)\.length;\s*const justificadas_hoy = \(hoyData \|\| \[\]\)\.filter\(r => r\.status === 'Justificada'\)\.length;\s*const totalHoy = \(hoyData \|\| \[\]\)\.length;/g;

const newStats = `const { data: hoyDataRaw } = await supabase
      .from('asistencias').select('student_id, status').eq('date', today);
    const uniqueMap = {};
    if (hoyDataRaw) {
      hoyDataRaw.forEach(row => uniqueMap[row.student_id] = row.status);
    }
    const hoyData = Object.values(uniqueMap).map(status => ({ status }));
    const presentes_hoy = hoyData.filter(r => r.status === 'A tiempo' || r.status === 'Retardo').length;
    const faltas_hoy    = hoyData.filter(r => r.status === 'Falta').length;
    const justificadas_hoy = hoyData.filter(r => r.status === 'Justificada').length;
    const totalHoy = hoyData.length;`;

content = content.replace(regex, newStats);
fs.writeFileSync('c:/Users/DELL/OneDrive/Escritorio/escuela87/assets/js/api-client.js', content);
console.log('Fixed stats correctly');
