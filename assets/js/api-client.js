/**
 * CLIENTE SUPABASE — CONEXIÓN DIRECTA DESDE EL FRONTEND
 * Secundaria Técnica No. 87 | Proyecto: krgyqrebnfwzplpayitx
 *
 * Usa @supabase/supabase-js vía CDN ESM. No requiere servidor Express.
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- TIMEZONE HELPERS ---
export function getMonterreyDate() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Monterrey' });
}

export function getMonterreyTime() {
  return new Date().toLocaleTimeString('en-GB', { timeZone: 'America/Monterrey' });
}
// ------------------------

// Clave pública (anon/publishable) — segura para el frontend
const SUPABASE_URL     = 'https://krgyqrebnfwzplpayitx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Z1CnbY2zxmyjom4dO9YCZw_-t0fLlIM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── 1. LOGIN ALUMNO ─────────────────────────────────────────────────────────
export async function studentLogin(matricula) {
  try {
    const { data, error } = await supabase
      .from('alumnos')
      .select('id, nombre_completo, grado, grupo')
      .or(`matricula.eq.${matricula},nombre_completo.ilike.%${matricula}%`)
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      matricula,
      nombre: data.nombre_completo,
      apellidos: '',
      grupos: { grado: data.grado || '0', grupo: data.grupo || '0' }
    };
  } catch (e) { console.error('studentLogin:', e); return null; }
}

// ─── 2. LOGIN STAFF ──────────────────────────────────────────────────────────
export async function staffLogin(email, password) {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('id, nombre, rol, tipo_personal')
      .eq('email', email.toLowerCase())
      .eq('password', password)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (e) { console.error('staffLogin:', e); return null; }
}

// ─── 2.5 REGISTRO STAFF ────────────────────────────────────────────────────────
export async function registerStaff(nombre, email, password, rol) {
  try {
    const { data, error } = await supabase
      .from('staff')
      .insert([
        {
          nombre: nombre,
          email: email.toLowerCase(),
          password: password,
          rol: rol,
          tipo_personal: rol
        }
      ])
      .select('id, nombre, rol, tipo_personal')
      .maybeSingle();
      
    if (error) throw error;
    return { success: true, data };
  } catch (e) {
    console.error('registerStaff:', e);
    return { success: false, error: e.message || 'Error al registrar.' };
  }
}

// ─── 3. RESUMEN ALUMNO ───────────────────────────────────────────────────────
export async function getStudentSummary(studentId) {
  try {
    const { data: alumno, error: aErr } = await supabase
      .from('alumnos').select('grado, grupo').eq('id', studentId).maybeSingle();
    if (aErr || !alumno) return null;

    const { data: asis } = await supabase
      .from('asistencias').select('status').eq('student_id', studentId);

    const total   = asis?.length || 0;
    const faltas  = asis?.filter(r => r.status === 'Falta').length || 0;
    const percent = total > 0 ? Math.round(((total - faltas) / total) * 100) : 100;

    return {
      attendance_percentage: percent,
      attendance_status: percent > 85 ? 'Excelente' : 'Requiere Atención',
      unjustified_absences: faltas,
      absences_period: 'Este mes',
      group_name: `${alumno.grado}° ${alumno.grupo}`,
      shift_name: 'Turno Matutino',
      grade_level: 'Secundaria'
    };
  } catch (e) { console.error('getStudentSummary:', e); return null; }
}

// ─── 4. ASISTENCIAS DE ALUMNO ────────────────────────────────────────────────
export async function getStudentAttendance(studentId) {
  try {
    const { data, error } = await supabase
      .from('asistencias')
      .select('date, entry_time, status')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
      .limit(5);
    if (error) throw error;
    return data || [];
  } catch (e) { console.error('getStudentAttendance:', e); return []; }
}

// ─── 5. ANUNCIOS ─────────────────────────────────────────────────────────────
export async function getAnnouncements() {
  try {
    const { data, error } = await supabase
      .from('anuncios').select('*').order('created_at', { ascending: false }).limit(10);
    if (error) throw error;
    return data || [];
  } catch (e) { console.error('getAnnouncements:', e); return []; }
}

export async function createAnnouncement(title, content = '') {
  try {
    const { data, error } = await supabase
      .from('anuncios').insert({ title, content }).select().single();
    if (error) throw error;
    return { success: true, anuncio: data };
  } catch (e) { console.error('createAnnouncement:', e); return null; }
}

export async function deleteAnnouncement(id) {
  try {
    const { error } = await supabase.from('anuncios').delete().eq('id', id);
    return !error;
  } catch (e) { console.error('deleteAnnouncement:', e); return false; }
}

// ─── 6. ESTADÍSTICAS GLOBALES ────────────────────────────────────────────────
export async function getStats(grado = 'Todos los Grados') {
  try {
    let q = supabase.from('alumnos').select('*', { count: 'exact', head: true });
    if (grado && grado !== 'Todos los Grados') q = q.ilike('grado', `${grado[0]}%`);
    const { count: totalAlumnos } = await q;

    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data: absData } = await supabase
      .from('asistencias').select('status')
      .gte('date', since.toISOString().split('T')[0]);

    const total      = absData?.length || 0;
    const onTime     = absData?.filter(r => r.status === 'A tiempo' || r.status === 'Retardo').length || 0;
    const absent     = absData?.filter(r => r.status === 'Falta').length || 0;
    const attPercent = total > 0 ? Math.round((onTime / total) * 100) : 100;

    return {
      total_alumnos: totalAlumnos || 0,
      asistencia_promedio: attPercent,
      alumnos_riesgo: absent,
      porcentaje_riesgo: total > 0 ? Math.round((absent / total) * 100) : 0
    };
  } catch (e) { console.error('getStats:', e); return null; }
}

// ─── 7. REPORTES DISCIPLINARIOS ───────────────────────────────────────────────
export async function getReportesDisciplina(studentId = null) {
  try {
    let q = supabase
      .from('reportes_disciplinarios')
      .select('*, alumnos(nombre_completo, grado, grupo)')
      .order('created_at', { ascending: false });
    if (studentId) q = q.eq('student_id', studentId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  } catch (e) { console.error('getReportesDisciplina:', e); return []; }
}

export async function createReporteDisciplina(studentId, tipo, descripcion, reportaPor) {
  try {
    const { data, error } = await supabase
      .from('reportes_disciplinarios')
      .insert({ student_id: studentId, tipo, descripcion: descripcion || '', reporta_por: reportaPor || 'Staff' })
      .select().single();
    if (error) throw error;
    return { success: true, reporte: data };
  } catch (e) { console.error('createReporteDisciplina:', e); return null; }
}

// ─── 8. BÚSQUEDA DE ALUMNOS ───────────────────────────────────────────────────
export async function searchStudents(q = '', grado = '', grupo = '') {
  try {
    let query = supabase
      .from('alumnos')
      .select('id, nombre_completo, grado, grupo, matricula, codigo_acceso')
      .order('nombre_completo').limit(100);
    if (q)     query = query.or(`nombre_completo.ilike.%${q}%,matricula.ilike.%${q}%`);
    if (grado) query = query.ilike('grado', `%${grado}%`);
    if (grupo) query = query.ilike('grupo', grupo);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (e) { console.error('searchStudents:', e); return []; }
}

// ─── 9. CRUD ALUMNOS ──────────────────────────────────────────────────────────
export async function getAlumnos() {
  try {
    const { data, error } = await supabase
      .from('alumnos')
      .select('id, nombre_completo, grado, grupo, matricula, codigo_acceso')
      .order('nombre_completo');
    if (error) throw error;
    return data || [];
  } catch (e) { console.error('getAlumnos:', e); return []; }
}

export async function deleteAlumno(id) {
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
}

// ─── 10. REGISTRAR ASISTENCIA ─────────────────────────────────────────────────
export async function registrarAsistencia(studentId, status, targetDate = null) {
  try {
    const dateToUse = targetDate || getMonterreyDate();
    const now   = getMonterreyTime();

    // Verificar fines de semana (sábado y domingo) usando la fecha objetivo
    const dateObj = new Date(dateToUse + 'T12:00:00'); // mediodía para evitar desfase de timezone
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { success: false, error: 'fin_de_semana', message: 'No se puede registrar asistencia en fin de semana (Sábado/Domingo)' };
    }

    // Verificar si el día es inhábil
    const inhabil = await esDiaInhabil(dateToUse);
    if (inhabil) return { success: false, error: 'dia_inhabil', message: inhabil.razon || 'Día inhábil' };

    // Obtener parcial activo para asociarlo
    const parcialActivo = await getParcialActivo();
    const parcialId = parcialActivo?.id || null;

    const { data: existing, error: existErr } = await supabase
      .from('asistencias').select('id')
      .eq('student_id', studentId).eq('date', dateToUse).maybeSingle();
    if (existErr) throw existErr;

    if (existing) {
      const { error: updErr } = await supabase.from('asistencias')
        .update({ status, entry_time: now, parcial_id: parcialId })
        .eq('student_id', studentId).eq('date', dateToUse);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await supabase.from('asistencias')
        .insert({ student_id: studentId, date: dateToUse, entry_time: now, status, parcial_id: parcialId });
      if (insErr) throw insErr;
    }
    return { success: true, parcial: parcialActivo };
  } catch (e) { console.error('registrarAsistencia:', e); return { success: false, error: e.message }; }
}

// ─── 14. CONFIG DE PERIODOS ───────────────────────────────────────────────────
export async function getConfigPeriodos() {
  try {
    const { data, error } = await supabase
      .from('config_periodos').select('*').limit(1).maybeSingle();
    if (error) throw error;
    return data || { activo: false, tipo_ciclo: 'bimestre', duracion_ciclo_semanas: 40, num_parciales_por_periodo: 2, duracion_parcial_semanas: 4 };
  } catch (e) { console.error('getConfigPeriodos:', e); return null; }
}

export async function saveConfigPeriodos(cfg) {
  try {
    const { data: existing } = await supabase.from('config_periodos').select('id').limit(1).maybeSingle();
    if (existing) {
      const { error } = await supabase.from('config_periodos')
        .update({ ...cfg, updated_at: new Date().toISOString() }).eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('config_periodos').insert({ ...cfg });
      if (error) throw error;
    }
    return { success: true };
  } catch (e) { console.error('saveConfigPeriodos:', e); return { success: false, error: e.message }; }
}

// ─── 15. PARCIALES ────────────────────────────────────────────────────────────
export async function getParciales() {
  try {
    const { data, error } = await supabase
      .from('parciales').select('*')
      .order('fecha_inicio', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (e) { console.error('getParciales:', e); return []; }
}

export async function getParcialActivo() {
  try {
    const today = getMonterreyDate();
    const { data, error } = await supabase
      .from('parciales').select('*')
      .lte('fecha_inicio', today)
      .gte('fecha_fin', today)
      .eq('activo', true)
      .limit(1).maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (e) { console.error('getParcialActivo:', e); return null; }
}

export async function createParcial(p) {
  try {
    const { data, error } = await supabase.from('parciales').insert(p).select().single();
    if (error) throw error;
    return { success: true, parcial: data };
  } catch (e) { console.error('createParcial:', e); return { success: false, error: e.message }; }
}

export async function updateParcial(id, p) {
  try {
    const { error } = await supabase.from('parciales').update(p).eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (e) { console.error('updateParcial:', e); return { success: false, error: e.message }; }
}

export async function deleteParcial(id) {
  try {
    const { error } = await supabase.from('parciales').delete().eq('id', id);
    return !error;
  } catch (e) { console.error('deleteParcial:', e); return false; }
}

export async function deleteAllParciales() {
  try {
    const { error } = await supabase.from('parciales').delete().neq('id', 0);
    return !error;
  } catch (e) { console.error('deleteAllParciales:', e); return false; }
}

// Genera automáticamente los parciales a partir de la configuración y los guarda
export async function generarParciales(cfg) {
  try {
    // cfg: { tipo_ciclo, fecha_inicio_ciclo, duracion_ciclo_semanas, num_parciales_por_periodo, duracion_parcial_semanas }
    const cicloNombres = { bimestre: ['1er','2do','3er','4to','5to','6to'], trimestre: ['1er','2do','3er','4to'], semestre: ['1er','2do'] };
    const tipoSingular = { bimestre: 'Bimestre', trimestre: 'Trimestre', semestre: 'Semestre' };
    const semanasDuPeriodo = { bimestre: 8, trimestre: 12, semestre: 18 };

    const semsPorPeriodo = semanasDuPeriodo[cfg.tipo_ciclo] || 8;
    const totalPeriodos  = Math.floor(cfg.duracion_ciclo_semanas / semsPorPeriodo);
    const ms1Day = 86400000;
    const ms7Day = 7 * ms1Day;

    let fechaActual = new Date(cfg.fecha_inicio_ciclo);
    const parciales = [];

    for (let c = 1; c <= totalPeriodos; c++) {
      const semsXParcial = Math.floor(semsPorPeriodo / cfg.num_parciales_por_periodo);
      for (let p = 1; p <= cfg.num_parciales_por_periodo; p++) {
        const durSems = cfg.duracion_parcial_semanas || semsXParcial;
        const fechaInicio = new Date(fechaActual);
        const fechaFin    = new Date(fechaActual.getTime() + durSems * ms7Day - ms1Day);
        parciales.push({
          nombre: `${cicloNombres[cfg.tipo_ciclo]?.[c-1] || c+'°'} ${tipoSingular[cfg.tipo_ciclo]} — Parcial ${p}`,
          ciclo_tipo: cfg.tipo_ciclo,
          numero_ciclo: c,
          numero_parcial: p,
          fecha_inicio: fechaInicio.toISOString().split('T')[0],
          fecha_fin:    fechaFin.toISOString().split('T')[0],
          activo: true
        });
        fechaActual = new Date(fechaFin.getTime() + ms1Day);
      }
    }

    await deleteAllParciales();
    const { error } = await supabase.from('parciales').insert(parciales);
    if (error) throw error;
    return { success: true, total: parciales.length };
  } catch (e) { console.error('generarParciales:', e); return { success: false, error: e.message }; }
}

// ─── 16. DÍAS INHÁBILES ───────────────────────────────────────────────────────
export async function getDiasInhabiles() {
  try {
    const { data, error } = await supabase
      .from('dias_inhabiles').select('*').order('fecha', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (e) { console.error('getDiasInhabiles:', e); return []; }
}

export async function esDiaInhabil(fecha) {
  try {
    const { data } = await supabase
      .from('dias_inhabiles').select('id, razon').eq('fecha', fecha).maybeSingle();
    return data || null;
  } catch (e) { return null; }
}


export async function createDiaInhabil(fecha, razon = '') {
  try {
    const { data, error } = await supabase
      .from('dias_inhabiles').upsert({ fecha, razon }, { onConflict: 'fecha' }).select().single();
    if (error) throw error;
    return { success: true, dia: data };
  } catch (e) { console.error('createDiaInhabil:', e); return { success: false, error: e.message }; }
}

export async function deleteDiaInhabil(id) {
  try {
    const { error } = await supabase.from('dias_inhabiles').delete().eq('id', id);
    return !error;
  } catch (e) { console.error('deleteDiaInhabil:', e); return false; }
}

// ─── 17. ASISTENCIAS POR PARCIAL ─────────────────────────────────────────────
export async function getAsistenciasPorParcial(parcialId, grado = '', grupo = '') {
  try {
    let q = supabase
      .from('alumnos')
      .select('id, nombre_completo, grado, grupo, matricula, asistencias!left(status, entry_time, date, parcial_id)')
      .order('nombre_completo');
    if (grado) q = q.ilike('grado', `%${grado}%`);
    if (grupo) q = q.eq('grupo', grupo);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(a => {
      const asistsParcial = a.asistencias?.filter(x => String(x.parcial_id) === String(parcialId)) || [];
      const presentes = asistsParcial.filter(x => x.status === 'A tiempo' || x.status === 'Retardo').length;
      const faltas    = asistsParcial.filter(x => x.status === 'Falta').length;
      return {
        id: a.id,
        nombre_completo: a.nombre_completo,
        grado: a.grado,
        grupo: a.grupo,
        matricula: a.matricula,
        presentes,
        faltas,
        total: asistsParcial.length,
        porcentaje: asistsParcial.length > 0 ? Math.round((presentes / asistsParcial.length) * 100) : null
      };
    });
  } catch (e) { console.error('getAsistenciasPorParcial:', e); return []; }
}

// ─── 11. LISTA DE ASISTENCIAS HOY ────────────────────────────────────────────
export async function getAsistenciasHoy(grado = '', grupo = '', targetDate = null) {
  try {
    const dateToCheck = targetDate || getMonterreyDate();
    
    // 1. Fetch students
    let q = supabase.from('alumnos').select('id, nombre_completo, grado, grupo, matricula').order('nombre_completo');
    if (grado) q = q.ilike('grado', `%${grado}%`);
    if (grupo) q = q.eq('grupo', grupo);
    
    const { data: students, error: errStudents } = await q;
    if (errStudents) throw errStudents;
    if (!students || students.length === 0) return [];

    // 2. Extract IDs and fetch ONLY today's attendances
    const studentIds = students.map(s => s.id);
    const { data: asistencias, error: errAsist } = await supabase
      .from('asistencias')
      .select('student_id, status, entry_time')
      .in('student_id', studentIds)
      .eq('date', dateToCheck);
      
    if (errAsist) throw errAsist;

    // 3. Map attendances to students
    const asisMap = {};
    if (asistencias) {
      asistencias.forEach(a => asisMap[a.student_id] = a);
    }

    return students.map(a => {
      const hoy = asisMap[a.id];
      return {
        ...a,
        asistencia_hoy: hoy?.status || 'Falta',
        entry_time: hoy?.entry_time || '--:--'
      };
    });
  } catch (e) { console.error('getAsistenciasHoy:', e); return []; }
}

// ─── 12. ASISTENCIA POR QR ────────────────────────────────────────────────────
export async function registrarAsistenciaQR(codigo, targetDate = null) {
  try {
    const trimmed = codigo.trim();
    let student = null;

    // 1. Buscar por matrícula (exacto, case-insensitive)
    const { data: byMatricula } = await supabase
      .from('alumnos').select('id, nombre_completo, grado, grupo')
      .ilike('matricula', trimmed).maybeSingle();
    if (byMatricula) student = byMatricula;

    // 2. Buscar por codigo_acceso (exacto)
    if (!student) {
      const { data: byAcceso } = await supabase
        .from('alumnos').select('id, nombre_completo, grado, grupo')
        .eq('codigo_acceso', trimmed).maybeSingle();
      if (byAcceso) student = byAcceso;
    }

    // 3. Buscar por CURP
    if (!student) {
      const { data: byCurp } = await supabase
        .from('alumnos').select('id, nombre_completo, grado, grupo')
        .ilike('curp', trimmed).maybeSingle();
      if (byCurp) student = byCurp;
    }

    // 4. Fallback: búsqueda parcial
    if (!student) {
      const arr = await searchStudents(trimmed);
      if (arr.length > 0) student = arr[0];
    }

    if (!student) return { success: false, error: 'Alumno no encontrado' };

    const now    = getMonterreyTime();
    const hour   = parseInt(now.split(':')[0]);
    const minute = parseInt(now.split(':')[1]);
    const status = (hour > 7 || (hour === 7 && minute >= 15)) ? 'Retardo' : 'A tiempo';

    const result = await registrarAsistencia(student.id, status, targetDate);
    return { ...result, student, status, entry_time: now };
  } catch (e) { console.error('registrarAsistenciaQR:', e); return { success: false, error: e.message }; }
}

// ─── 13. SUBIR ALUMNOS DESDE EXCEL (client-side) ─────────────────────────────
// Recibe rows ya parseados por SheetJS (window.XLSX)
export async function uploadAlumnosFromData(rows) {
  let count = 0;
  for (const row of rows) {
    const nombre         = row['Nombre Completo'] || row['nombre'] || row['Estudiante'] || '';
    const grado          = row['Grado']  || row['grado']  || '';
    const grupo          = row['Grupo']  || row['grupo']  || '';
    const finalMatricula = 'MAT' + Math.floor(100000 + Math.random() * 900000).toString();
    const curp           = row['CURP'] || row['Curp'] || row['curp'] || null;
    const codigo_acceso  = curp || crypto.randomUUID();
    if (nombre && curp) {
      await supabase.from('alumnos').upsert(
        { nombre_completo: nombre.toUpperCase(), grado, grupo, matricula: finalMatricula, curp, codigo_acceso },
        { onConflict: 'matricula' }
      );
      count++;
    }
  }
  return { success: true, message: `Se procesaron ${count} alumnos del Excel.` };
}

// ─── 18. LOGIN DE ALUMNO (Matrícula + CURP o NIP) ───────────────────────────────
export async function loginAlumno(matricula, password) {
  try {
    const inputUser = matricula.trim().toUpperCase();
    const { data, error } = await supabase
      .from('alumnos')
      .select('id, nombre_completo, grado, grupo, matricula, curp, codigo_acceso')
      .or(`matricula.eq.${inputUser},curp.eq.${inputUser}`)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return { success: false, error: 'Usuario no encontrado. Revisa tu matrícula o CURP.' };
    
    const inputPass = password.trim().toUpperCase();
    const isCurp = data.curp && inputPass === data.curp.toUpperCase();
    const isNip = data.codigo_acceso && inputPass === data.codigo_acceso.toUpperCase();
    const isMatricula = data.matricula && inputPass === data.matricula.toUpperCase();
    
    if (!isCurp && !isNip && !isMatricula) return { success: false, error: 'Contraseña incorrecta.' };

    return { success: true, alumno: data };
  } catch (e) { console.error('loginAlumno:', e); return { success: false, error: e.message }; }
}

export async function getMatriculaById(alumnoId) {
  try {
    const { data, error } = await supabase
      .from('alumnos')
      .select('matricula')
      .eq('id', alumnoId)
      .maybeSingle();
    if (error) throw error;
    return data ? data.matricula : null;
  } catch (e) {
    console.error('getMatriculaById:', e);
    return null;
  }
}

// ─── 19. MIS ASISTENCIAS (vista del alumno) ───────────────────────────────────
export async function getMisAsistencias(alumnoId) {
  try {
    const { data, error } = await supabase
      .from('asistencias')
      .select('id, date, entry_time, status, parcial_id, parciales(nombre, fecha_inicio, fecha_fin)')
      .eq('student_id', alumnoId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) { console.error('getMisAsistencias:', e); return []; }
}

export async function getAsistenciasCalendario(studentId, year, month) {
  try {
    const startDate = `${year}-${String(month).padStart(2,'0')}-01`;
    const nextMonthDate = new Date(year, month, 1);
    const endDate = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth()+1).padStart(2,'0')}-01`;
    
    const { data, error } = await supabase
      .from('asistencias')
      .select('date, status, entry_time')
      .eq('student_id', studentId)
      .gte('date', startDate)
      .lt('date', endDate);
      
    if (error) throw error;
    
    return (data || []).map(a => ({
      ...a,
      justificada: a.status === 'Justificada'
    }));
  } catch (e) { console.error('getAsistenciasCalendario:', e); return []; }
}

// ==========================================
// Módulo de Gestión de Grupos (Restaurado)
// ==========================================

export async function getGrupos() {
  try {
    const { data, error } = await supabase.from('grupos').select('*').order('grado').order('grupo');
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error en getGrupos:', e);
    return [];
  }
}

export async function createGrupo(grupoData) {
  try {
    const { data, error } = await supabase.from('grupos').insert([grupoData]).select().single();
    if (error) throw error;
    return { success: true, data };
  } catch (e) {
    console.error('Error en createGrupo:', e);
    return { success: false, error: e.message };
  }
}

export async function deleteGrupo(id) {
  try {
    await supabase.from('alumnos').update({ grupo_id: null, grado: null, grupo: null }).eq('grupo_id', id);
    const { error } = await supabase.from('grupos').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.error('Error en deleteGrupo:', e);
    return { success: false, error: e.message };
  }
}

export async function getAlumnosSinGrupo() {
  try {
    const { data, error } = await supabase.from('alumnos').select('*').is('grupo_id', null).order('nombre_completo');
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error en getAlumnosSinGrupo:', e);
    return [];
  }
}

export async function getAlumnosPorGrupo(grupoId) {
  try {
    const { data, error } = await supabase.from('alumnos').select('*').eq('grupo_id', grupoId).order('nombre_completo');
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error en getAlumnosPorGrupo:', e);
    return [];
  }
}

export async function asignarAlumnosAGrupo(grupoId, alumnoIds, gradoStr, grupoStr) {
  try {
    const { error } = await supabase.from('alumnos')
      .update({ grupo_id: grupoId, grado: gradoStr, grupo: grupoStr })
      .in('id', alumnoIds);
    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.error('Error en asignarAlumnosAGrupo:', e);
    return { success: false, error: e.message };
  }
}

export async function removerAlumnosDeGrupo(alumnoIds) {
  try {
    const { error } = await supabase.from('alumnos')
      .update({ grupo_id: null, grado: '0', grupo: 'Sin Asignar' })
      .in('id', alumnoIds);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('removerAlumnosDeGrupo:', e);
    return false;
  }
}

export async function promoverCicloMasivo() {
  try {
    const { data: grupos, error: gError } = await supabase.from('grupos').select('*');
    if (gError) throw gError;

    for (const g of grupos) {
      let nuevoGrado = g.grado;
      if (g.grado.includes('1')) nuevoGrado = g.grado.replace('1', '2');
      else if (g.grado.includes('2')) nuevoGrado = g.grado.replace('2', '3');
      else if (g.grado.includes('3')) nuevoGrado = 'Egresado';

      await supabase.from('grupos').update({ grado: nuevoGrado }).eq('id', g.id);

      if (nuevoGrado === 'Egresado') {
        await supabase.from('alumnos').update({ grado: 'Egresado' }).eq('grupo_id', g.id);
      } else {
        await supabase.from('alumnos').update({ grado: nuevoGrado }).eq('grupo_id', g.id);
      }
    }
    return true;
  } catch (e) {
    console.error('promoverCicloMasivo:', e);
    throw e;
  }
}

// ─── 21. ALTA INDIVIDUAL Y MASIVA DE ALUMNOS ─────────────────────────────────
export async function insertAlumno(alumno) {
  try {
    const { data, error } = await supabase
      .from('alumnos')
      .insert([{
        nombre_completo: alumno.nombre_completo.toUpperCase(),
        matricula: alumno.matricula || null,
        curp: alumno.curp || null,
        codigo_acceso: alumno.curp || null,
        grado: alumno.grado || '0',
        grupo: alumno.grupo || '0'
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('insertAlumno:', e);
    throw e;
  }
}

export async function insertAlumnosMasivo(alumnos) {
  try {
    const { data, error } = await supabase
      .from('alumnos')
      .insert(alumnos.map(a => ({
        nombre_completo: a.nombre_completo.toUpperCase(),
        matricula: a.matricula || null,
        curp: a.curp || null,
        codigo_acceso: a.curp || null,
        grado: a.grado || '0',
        grupo: a.grupo || '0'
      })))
      .select();
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('insertAlumnosMasivo:', e);
    throw e;
  }
}

export async function checkCurpsExistentes(curps = []) {
  try {
    const { data, error } = await supabase
      .from('alumnos')
      .select('curp, nombre_completo')
      .in('curp', curps);
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('checkCurpsExistentes:', e);
    return [];
  }
}

export async function getExportAsistencias(grado = '', grupo = '', periodo = '', customVal = null) {
  try {
    let q = supabase
      .from('alumnos')
      .select('id, nombre_completo, grado, grupo, asistencias(date, status)')
      .order('nombre_completo');
    
    if (grado) {
       const rawGrado = grado.replace('°', '').trim();
       q = q.ilike('grado', `%${rawGrado}%`);
    }
    if (grupo) q = q.ilike('grupo', `%${grupo}%`);
    
    const { data, error } = await q;
    if (error) throw error;
    
    return (data || []).map(a => ({
      nombre: a.nombre_completo,
      asistencias: a.asistencias || []
    }));
  } catch (e) {
    console.error('getExportAsistencias:', e);
    return [];
  }
}

// ─── 22. ASISTENCIA ÚLTIMOS 5 DÍAS (para gráfica dashboard) ──────────────────
export async function getAsistenciaUltimos5Dias() {
  try {
    const hoy = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    const dias = [];
    let d = new Date(hoy);
    while (dias.length < 5) {
      d.setDate(d.getDate() - (dias.length === 0 ? 0 : 1));
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        dias.push(d.toISOString().split('T')[0]);
      }
      if (dias.length === 0) d.setDate(d.getDate() - 1);
    }
    dias.reverse();

    const desde = dias[0];
    const { data, error } = await supabase
      .from('asistencias')
      .select('date, status')
      .gte('date', desde);
    if (error) throw error;

    return dias.map(fecha => {
      const del_dia = (data || []).filter(r => r.date === fecha);
      const presentes = del_dia.filter(r => r.status === 'A tiempo' || r.status === 'Retardo').length;
      const faltas = del_dia.filter(r => r.status === 'Falta').length;
      const total = del_dia.length;
      return {
        fecha,
        label: new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }),
        presentes,
        faltas,
        total,
        porcentaje: total > 0 ? Math.round((presentes / total) * 100) : 0
      };
    });
  } catch (e) { console.error('getAsistenciaUltimos5Dias:', e); return []; }
}

// ─── 23. ALUMNOS CON MÁS FALTAS (para tabla de riesgo) ──────────────────────
export async function getAlumnosConMasFaltas(limit = 5) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceStr = since.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('alumnos')
      .select('id, nombre_completo, grado, grupo, asistencias(status, date)')
      .order('nombre_completo');
    if (error) throw error;

    const ranked = (data || []).map(a => {
      const recientes = (a.asistencias || []).filter(x => x.date >= sinceStr);
      const faltas = recientes.filter(x => x.status === 'Falta').length;
      const total = recientes.length;
      const porcentaje = total > 0 ? Math.round(((total - faltas) / total) * 100) : 100;
      return { id: a.id, nombre: a.nombre_completo, grado: a.grado, grupo: a.grupo, faltas, total, porcentaje };
    }).filter(a => a.faltas > 0)
      .sort((a, b) => b.faltas - a.faltas)
      .slice(0, limit);


    return ranked;
  } catch (e) { console.error('getAlumnosConMasFaltas:', e); return []; }
}

// ─── 24. GUARDAR ASISTENCIA MASIVA (Bulk) ──────────────────────────────────────
export async function saveBulkAttendance(asistencias, date) {
  try {
    const parcialActivo = await getParcialActivo();
    const parcialId = parcialActivo?.id || null;

    // Verificar fin de semana
    const dateObj = new Date(date + 'T12:00:00');
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { success: false, error: 'No se puede registrar asistencia en fin de semana.' };
    }

    // Verificar día inhábil
    const inhabil = await esDiaInhabil(date);
    if (inhabil) return { success: false, error: `Día inhábil: ${inhabil.razon}` };

    const studentIds = asistencias.map(a => a.student_id);
    const { data: existentes } = await supabase
      .from('asistencias').select('id, student_id')
      .in('student_id', studentIds).eq('date', date);

    const existMap = {};
    if (existentes) existentes.forEach(r => existMap[r.student_id] = r.id);

    const toUpdate = [];
    const toInsert = [];

    asistencias.forEach(a => {
      const status = a.status || 'Falta';
      const entry_time = (status === 'A tiempo' || status === 'Retardo')
        ? (a.entry_time || getMonterreyTime().substring(0, 5))
        : null;
      if (existMap[a.student_id]) {
        toUpdate.push({ id: existMap[a.student_id], status, entry_time, parcial_id: parcialId });
      } else {
        toInsert.push({ student_id: a.student_id, date, status, entry_time, parcial_id: parcialId });
      }
    });

    for (const u of toUpdate) {
      const { id, ...fields } = u;
      await supabase.from('asistencias').update(fields).eq('id', id);
    }
    if (toInsert.length > 0) {
      const { error } = await supabase.from('asistencias').insert(toInsert);
      if (error) throw error;
    }
    return { success: true, updated: toUpdate.length, inserted: toInsert.length };
  } catch (e) { console.error('saveBulkAttendance:', e); return { success: false, error: e.message }; }
}

// ─── 25. JUSTIFICAR FALTA ─────────────────────────────────────────────────────
export async function justificarFalta(studentId, date, motivo = '') {
  try {
    const { data: existing } = await supabase
      .from('asistencias').select('id')
      .eq('student_id', studentId).eq('date', date).maybeSingle();

    if (existing) {
      const { error } = await supabase.from('asistencias')
        .update({ status: 'Justificada', justificacion: motivo })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('asistencias')
        .insert({ student_id: studentId, date, status: 'Justificada', justificacion: motivo });
      if (error) throw error;
    }
    return { success: true };
  } catch (e) { console.error('justificarFalta:', e); return { success: false, error: e.message }; }
}

// ─── 26. ACTUALIZAR PARCIALES (batch) ────────────────────────────────────────
export async function updateParciales(updates) {
  try {
    for (const u of updates) {
      const { id, nombre, fecha_inicio, fecha_fin } = u;
      const { error } = await supabase.from('parciales')
        .update({ nombre, fecha_inicio, fecha_fin }).eq('id', id);
      if (error) throw error;
    }
    return { success: true };
  } catch (e) { console.error('updateParciales:', e); return { success: false, error: e.message }; }
}

// ─── 27. ALUMNOS POR GRADO Y GRUPO (texto) ───────────────────────────────────
export async function getStudentsByGroup(grado, grupo) {
  try {
    const { data, error } = await supabase
      .from('alumnos')
      .select('id, nombre_completo, grado, grupo, matricula, codigo_acceso')
      .ilike('grado', `%${grado}%`)
      .ilike('grupo', grupo)
      .order('nombre_completo');
    if (error) throw error;
    return data || [];
  } catch (e) { console.error('getStudentsByGroup:', e); return []; }
}

// ─── 28. ESTADÍSTICAS GLOBALES HOY ───────────────────────────────────────────
export async function getEstadisticasGlobales() {
  try {
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const { count: total_alumnos } = await supabase
      .from('alumnos').select('*', { count: 'exact', head: true });
    const { data: hoyDataRaw } = await supabase
      .from('asistencias').select('student_id, status').eq('date', today);
    const uniqueMap = {};
    if (hoyDataRaw) {
      hoyDataRaw.forEach(row => uniqueMap[row.student_id] = row.status);
    }
    const hoyData = Object.values(uniqueMap).map(status => ({ status }));
    const presentes_hoy = hoyData.filter(r => r.status === 'A tiempo' || r.status === 'Retardo').length;
    const faltas_hoy    = hoyData.filter(r => r.status === 'Falta').length;
    const justificadas_hoy = hoyData.filter(r => r.status === 'Justificada').length;
    const totalHoy = hoyData.length;
    const asistencia_promedio = totalHoy > 0 ? Math.round((presentes_hoy / totalHoy) * 100) : 0;
    return { total_alumnos: total_alumnos || 0, presentes_hoy, faltas_hoy, justificadas_hoy, asistencia_promedio };
  } catch (e) { console.error('getEstadisticasGlobales:', e); return null; }
}

// ─── 29. ÚLTIMA ASISTENCIA DE ALUMNO ─────────────────────────────────────────
export async function getUltimaAsistencia(alumnoId) {
  try {
    const { data, error } = await supabase
      .from('asistencias').select('date, entry_time, status')
      .eq('student_id', alumnoId)
      .order('date', { ascending: false })
      .limit(1).maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (e) { console.error('getUltimaAsistencia:', e); return null; }
}

// ─── 30. VINCULAR TUTOR CON ALUMNO ───────────────────────────────────────────
export async function getTutorAlumno(tutorNombre) {
  try {
    const { data: staffData } = await supabase
      .from('staff').select('alumno_id, alumno_nombre')
      .ilike('nombre', `%${tutorNombre}%`).maybeSingle();
    if (staffData?.alumno_id) {
      const { data: alumno } = await supabase
        .from('alumnos').select('id, nombre_completo, grado, grupo, matricula, codigo_acceso')
        .eq('id', staffData.alumno_id).maybeSingle();
      if (alumno) return alumno;
    }
    if (staffData?.alumno_nombre) {
      const { data: alumno } = await supabase
        .from('alumnos').select('id, nombre_completo, grado, grupo, matricula, codigo_acceso')
        .ilike('nombre_completo', `%${staffData.alumno_nombre}%`).maybeSingle();
      if (alumno) return alumno;
    }
    return null;
  } catch (e) { console.error('getTutorAlumno:', e); return null; }
}

// ─── 31. ASISTENCIAS DE UN ALUMNO (para tutores y alumno) ────────────────────
export async function getAsistenciasAlumno(alumnoId, limit = 30) {
  try {
    const { data, error } = await supabase
      .from('asistencias').select('date, entry_time, status, justificacion')
      .eq('student_id', alumnoId)
      .order('date', { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  } catch (e) { console.error('getAsistenciasAlumno:', e); return []; }
}

