const fs = require('fs');
const file = 'c:/Users/DELL/OneDrive/Escritorio/escuela87/assets/js/api-client.js';
let content = fs.readFileSync(file, 'utf-8');

const replacement = `export async function deleteAlumno(id) {
  try {
    // Primero, eliminar registros dependientes
    await supabase.from('asistencias').delete().eq('student_id', id);
    await supabase.from('reportes_disciplinarios').delete().eq('student_id', id);

    // Luego eliminar al alumno
    const { error } = await supabase.from('alumnos').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('deleteAlumno:', e);
    return false;
  }
}

export async function updateAlumno(id, updates) {
  try {
    const { error } = await supabase.from('alumnos').update(updates).eq('id', id);
    if (error) throw error;
    return true;
  } catch (e) { console.error('updateAlumno:', e); return false; }
}`;

// Reemplazar la seccion corrompida.
const fixRegex = /export async function deleteAlumno[\s\S]*?catch \(e\) \{ console\.error\('updateAlumno:', e\); return false; \}/;

if(content.match(fixRegex)) {
  content = content.replace(fixRegex, replacement);
  fs.writeFileSync(file, content);
  console.log("Fixed syntax error");
} else {
  console.log("Not found");
}
