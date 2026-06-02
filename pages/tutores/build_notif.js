const fs = require('fs');

let content = fs.readFileSync('notificaciones.html', 'utf8');

const newMainContent = `
      <div class="p-6 md:p-10 space-y-8 max-w-4xl mx-auto w-full">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-2xl font-black text-sepGreenDark font-heading">Notificaciones Recientes</h3>
          <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-wider">Actualizado ahora</span>
        </div>
        
        <div id="notifications-container" class="space-y-4">
          <div class="text-center py-10 text-gray-400 font-medium animate-pulse">Cargando notificaciones...</div>
        </div>
      </div>
    </main>
`;

// Replace from <div class="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full"> to </main>
content = content.replace(/<div class=\"p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full\">[\s\S]*?<\/main>/i, newMainContent);

const newScript = `
  <script src="../../assets/js/main.js"></script>
  <script type="module">
    import { checkAuth } from '../../assets/js/auth-guard.js';
    import { getTutorAlumno, getAsistenciasAlumno } from '../../assets/js/api-client.js';

    document.addEventListener('DOMContentLoaded', async () => {
      const session = checkAuth(['tutor']);
      if (!session) return;

      const tutorNombre = session.nombre || 'Tutor';
      const firstName = tutorNombre.split(' ')[0];
      document.getElementById('sidebar-name').textContent = tutorNombre;
      document.getElementById('welcome-header').textContent = \`Bienvenido/a, \${firstName}\`;

      let alumno = null;
      try { alumno = await getTutorAlumno(tutorNombre); } catch(e) {}

      const container = document.getElementById('notifications-container');

      if (alumno) {
        try {
          const asistencias = await getAsistenciasAlumno(alumno.id, 10); // get last 10
          if (!asistencias || asistencias.length === 0) {
            container.innerHTML = '<div class="glass-panel p-8 text-center text-gray-400 rounded-3xl border border-gray-100">No hay notificaciones recientes.</div>';
            return;
          }

          container.innerHTML = asistencias.map((a, i) => {
            const isToday = new Date().toISOString().split('T')[0] === a.date;
            
            let icon = '';
            let color = '';
            let message = '';
            
            let timeStr = '';
            if (a.entry_time) {
              const [h, m] = a.entry_time.split(':');
              const ampm = Number(h) >= 12 ? 'PM' : 'AM';
              const h12 = (Number(h) % 12) || 12;
              timeStr = \`\${h12.toString().padStart(2,'0')}:\${m} \${ampm}\`;
            }

            if (a.status === 'A tiempo') {
              color = 'text-green-600 bg-green-50 border-green-100';
              icon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
              message = \`Su hijo(a) \${alumno.nombre_completo} ha registrado su entrada a tiempo a las \${timeStr}.\`;
            } else if (a.status === 'Retardo') {
              color = 'text-yellow-600 bg-yellow-50 border-yellow-100';
              icon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
              message = \`Su hijo(a) \${alumno.nombre_completo} ha registrado un retardo a las \${timeStr}.\`;
            } else if (a.status === 'Falta') {
              color = 'text-red-600 bg-red-50 border-red-100';
              icon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';
              message = \`Se ha registrado una FALTA para su hijo(a) \${alumno.nombre_completo}.\`;
            } else {
              color = 'text-blue-600 bg-blue-50 border-blue-100';
              icon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
              message = \`Estado de asistencia actualizado a \${a.status} para \${alumno.nombre_completo}.\`;
            }

            const fechaObj = new Date(a.date + 'T00:00:00');
            const fechaStr = isToday ? 'Hoy' : fechaObj.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

            return \`
              <div class="glass-panel p-5 md:p-6 rounded-2xl border \${color} shadow-sm flex items-start gap-4 hover:-translate-y-1 transition-all duration-300">
                <div class="p-3 rounded-full bg-white/60 shadow-sm flex-shrink-0">
                  \${icon}
                </div>
                <div class="flex-1">
                  <div class="flex justify-between items-start">
                    <h4 class="font-extrabold text-sm md:text-base mb-1 font-heading">Actualización de Asistencia</h4>
                    <span class="text-xs font-bold opacity-70 capitalize">\${fechaStr}</span>
                  </div>
                  <p class="text-sm font-medium opacity-90 leading-relaxed">\${message}</p>
                </div>
              </div>
            \`;
          }).join('');

        } catch(e) {
          container.innerHTML = '<div class="text-center text-red-500 font-bold">Error al cargar notificaciones.</div>';
        }
      } else {
        container.innerHTML = '<div class="glass-panel p-8 text-center text-gray-400 rounded-3xl border border-gray-100">No se encontró información del alumno.</div>';
      }
    });
  </script>
`;

content = content.replace(/<script src=\"\.\.\/\.\.\/assets\/js\/main\.js\"><\/script>[\s\S]*?<\/html>/i, newScript + '\n</body>\n</html>');

fs.writeFileSync('notificaciones.html', content);
console.log('Modified notificaciones.html');
