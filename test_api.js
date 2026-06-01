const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://krgyqrebnfwzplpayitx.supabase.co', 'sb_publishable_Z1CnbY2zxmyjom4dO9YCZw_-t0fLlIM');

async function test() {
  const { data, error } = await supabase.from('config_periodos').insert({
    activo: true, 
    tipo_ciclo: 'bimestre', 
    fecha_inicio_ciclo: '2026-08-20', 
    duracion_ciclo_semanas: 40, 
    num_parciales_por_periodo: 2, 
    duracion_parcial_semanas: 4
  }).select();
  console.log('Config Insert:', error || data);
}
test();
