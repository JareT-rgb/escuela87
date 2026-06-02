const fs = require('fs');

let content = fs.readFileSync('c:/Users/DELL/OneDrive/Escritorio/escuela87/assets/js/api-client.js', 'utf8');

// Replace registrarAsistencia
const oldCode = `    const { data: existing } = await supabase
      .from('asistencias').select('id')
      .eq('student_id', studentId).eq('date', dateToUse).maybeSingle();
    if (existing) {
      await supabase.from('asistencias')
        .update({ status, entry_time: now, parcial_id: parcialId })
        .eq('student_id', studentId).eq('date', dateToUse);
    } else {
      await supabase.from('asistencias')
        .insert({ student_id: studentId, date: dateToUse, entry_time: now, status, parcial_id: parcialId });
    }`;

const newCode = `    const { data: existings } = await supabase
      .from('asistencias').select('id')
      .eq('student_id', studentId).eq('date', dateToUse);

    if (existings && existings.length > 0) {
      await supabase.from('asistencias')
        .update({ status, entry_time: now, parcial_id: parcialId })
        .eq('student_id', studentId).eq('date', dateToUse);

      if (existings.length > 1) {
        const idsToDelete = existings.slice(1).map(e => e.id);
        await supabase.from('asistencias').delete().in('id', idsToDelete);
      }
    } else {
      await supabase.from('asistencias')
        .insert({ student_id: studentId, date: dateToUse, entry_time: now, status, parcial_id: parcialId });
    }`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('c:/Users/DELL/OneDrive/Escritorio/escuela87/assets/js/api-client.js', content);
console.log('Fixed registrarAsistencia in api-client.js');
