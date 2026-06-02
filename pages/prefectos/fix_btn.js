const fs = require('fs');

function applyFixes(file) {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');

  // Replace text
  content = content.replace(/Terminar y Volver a Grupos/g, 'Guardar');

  // The button has id "btn-finish-attendance". Let's find its event listener.
  // Wait, let's just find the event listener for `btn-finish-attendance` and modify it.
  
  const oldListener = `document.getElementById('btn-finish-attendance').addEventListener('click', () => {
        document.getElementById('attendance-view').classList.add('hidden');
        document.getElementById('group-selection').classList.remove('hidden');
      });`;

  const newListener = `document.getElementById('btn-finish-attendance').addEventListener('click', () => {
        Swal.fire({
          title: '¿Estás seguro?',
          text: 'Se guardará el pase de lista actual y volverás a la selección de grupos.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#10b981',
          cancelButtonColor: '#ef4444',
          confirmButtonText: 'Sí, guardar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            document.getElementById('attendance-view').classList.add('hidden');
            document.getElementById('group-selection').classList.remove('hidden');
            Swal.fire('¡Guardado!', 'El pase de lista ha sido registrado exitosamente.', 'success');
          }
        });
      });`;

  if (content.includes(oldListener)) {
    content = content.replace(oldListener, newListener);
  } else {
    // If the exact oldListener format varies, let's use regex
    const regex = /document\.getElementById\('btn-finish-attendance'\)\.addEventListener\('click',\s*\(\)\s*=>\s*\{[\s\S]*?document\.getElementById\('group-selection'\)\.classList\.remove\('hidden'\);\s*\}\);/g;
    content = content.replace(regex, newListener);
  }

  // Ensure Swal is available
  if (!content.includes('sweetalert2')) {
    content = content.replace('</head>', '  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>\n</head>');
  }

  fs.writeFileSync(file, content);
  console.log('Fixed btn in', file);
}

applyFixes('../directivos/asistencias.html');
applyFixes('../prefectos/asistencias.html');
