const fs = require('fs');

let content = fs.readFileSync('c:/Users/DELL/OneDrive/Escritorio/escuela87/assets/js/api-client.js', 'utf8');

const oldStats = `    const { data: hoyData } = await supabase
      .from('asistencias').select('status').eq('date', today);
    const presentes_hoy = (hoyData || []).filter(r => r.status === 'A tiempo' || r.status === 'Retardo').length;
    const faltas_hoy    = (hoyData || []).filter(r => r.status === 'Falta').length;
    const justificadas_hoy = (hoyData || []).filter(r => r.status === 'Justificada').length;
    const totalHoy = (hoyData || []).length;`;

const newStats = `    const { data: hoyDataRaw } = await supabase
      .from('asistencias').select('student_id, status').eq('date', today);
      
    // Eliminar duplicados en el cliente para estadísticas reales
    const uniqueMap = {};
    if (hoyDataRaw) {
      hoyDataRaw.forEach(row => uniqueMap[row.student_id] = row.status);
    }
    const hoyData = Object.values(uniqueMap).map(status => ({ status }));
    
    const presentes_hoy = hoyData.filter(r => r.status === 'A tiempo' || r.status === 'Retardo').length;
    const faltas_hoy    = hoyData.filter(r => r.status === 'Falta').length;
    const justificadas_hoy = hoyData.filter(r => r.status === 'Justificada').length;
    const totalHoy = hoyData.length;`;

if (content.includes(oldStats)) {
  content = content.replace(oldStats, newStats);
  fs.writeFileSync('c:/Users/DELL/OneDrive/Escritorio/escuela87/assets/js/api-client.js', content);
  console.log('Fixed stats in api-client.js');
} else {
  console.log('Could not find old stats code in api-client.js');
}
