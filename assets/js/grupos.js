import { supabase, getGrupos, createGrupo, getAlumnosSinGrupo, getAlumnosPorGrupo, asignarAlumnosAGrupo, removerAlumnosDeGrupo, promoverCicloMasivo, insertAlumno, insertAlumnosMasivo } from './api-client.js';
import { checkAuth, logout } from './auth-guard.js';

let currentGrupoId = null;
let currentGrupoName = 'Ninguno';
let alumnosSinGrupo = [];
let alumnosEnGrupo = [];

document.addEventListener('DOMContentLoaded', async () => {
  const user = await checkAuth(['director']);
  if (!user) return;

  await loadGrupos();
  await loadAlumnosSinGrupo();

  // Mobile menu
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.querySelector('aside');
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('hidden');
      sidebar.classList.toggle('absolute');
      sidebar.classList.toggle('z-50');
      sidebar.classList.toggle('h-full');
    });
  }

  // Create Grupo
  document.getElementById('btn-crear-grupo').addEventListener('click', async () => {
    const grado = document.getElementById('nuevo-grado').value.trim();
    const grupo = document.getElementById('nuevo-grupo').value.trim();
    const ciclo = document.getElementById('nuevo-ciclo').value.trim();
    const tutor = document.getElementById('nuevo-tutor').value.trim();

    if (!grado || !grupo) {
      Swal.fire('Error', 'Grado y Grupo son obligatorios', 'error');
      return;
    }

    try {
      const btn = document.getElementById('btn-crear-grupo');
      btn.disabled = true;
      btn.innerHTML = 'Creando...';
      
      await createGrupo({
        grado: grado,
        grupo: grupo,
        ciclo_escolar: ciclo,
        tutor_nombre: tutor
      });

      Swal.fire('Éxito', 'Grupo creado correctamente', 'success');
      document.getElementById('nuevo-grado').value = '';
      document.getElementById('nuevo-grupo').value = '';
      document.getElementById('nuevo-ciclo').value = '';
      document.getElementById('nuevo-tutor').value = '';
      
      await loadGrupos();
    } catch (e) {
      Swal.fire('Error', 'No se pudo crear el grupo', 'error');
    } finally {
      const btn = document.getElementById('btn-crear-grupo');
      btn.disabled = false;
      btn.innerHTML = 'Crear Grupo';
    }
  });

  // Search sin grupo
  document.getElementById('search-sin-grupo').addEventListener('input', (e) => {
    renderSinGrupo(e.target.value);
  });

  // Assign buttons
  document.getElementById('btn-mover-derecha').addEventListener('click', async () => {
    if (!currentGrupoId) return;
    const selected = getSelectedIds('lista-sin-grupo');
    if (selected.length === 0) return;

    // Get the selected group details from DOM or state
    const grupoEl = document.querySelector(`[data-id="${currentGrupoId}"]`);
    const gradoStr = grupoEl.dataset.grado;
    const grupoStr = grupoEl.dataset.grupo;

    const ok = await asignarAlumnosAGrupo(currentGrupoId, selected, gradoStr, grupoStr);
    if (ok) {
      await loadAlumnosSinGrupo();
      await selectGrupo(currentGrupoId, currentGrupoName, gradoStr, grupoStr);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Alumnos asignados', showConfirmButton: false, timer: 1500 });
    }
  });

  document.getElementById('btn-mover-izquierda').addEventListener('click', async () => {
    if (!currentGrupoId) return;
    const selected = getSelectedIds('lista-en-grupo');
    if (selected.length === 0) return;

    const ok = await removerAlumnosDeGrupo(selected);
    if (ok) {
      await loadAlumnosSinGrupo();
      await selectGrupo(currentGrupoId, currentGrupoName, '?', '?'); // refresh
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Alumnos removidos', showConfirmButton: false, timer: 1500 });
    }
  });

  // Promover Ciclo
  document.getElementById('btn-promover').addEventListener('click', async () => {
    const res = await Swal.fire({
      title: '¿Paso de Año Automático?',
      text: "Esto moverá a todos los alumnos de 1° a 2°, de 2° a 3°, y a los de 3° los marcará como Egresados. Esta acción modificará todos los grupos. ¿Estás seguro?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#93222D',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, Promover',
      cancelButtonText: 'Cancelar'
    });

    if (res.isConfirmed) {
      Swal.fire({ title: 'Promoviendo...', didOpen: () => { Swal.showLoading() } });
      try {
        await promoverCicloMasivo();
        await loadGrupos();
        await loadAlumnosSinGrupo();
        currentGrupoId = null;
        document.getElementById('grupo-destino-lbl').textContent = 'Ninguno';
        document.getElementById('lista-en-grupo').innerHTML = '<div class="h-full flex items-center justify-center text-sm text-gray-400 font-medium text-center p-4">Selecciona un grupo a la izquierda para ver sus alumnos</div>';
        document.getElementById('badge-en-grupo').textContent = '0';
        document.getElementById('btn-mover-derecha').disabled = true;
        document.getElementById('btn-mover-izquierda').disabled = true;
        document.getElementById('btn-print-qrs').disabled = true;

        Swal.fire('¡Éxito!', 'Los grupos y alumnos han sido promovidos.', 'success');
      } catch (e) {
        Swal.fire('Error', 'Hubo un problema al promover el ciclo', 'error');
      }
    }
  });

  // Imprimir QRs
  document.getElementById('btn-print-qrs').addEventListener('click', () => {
    if (!currentGrupoId || alumnosEnGrupo.length === 0) {
      Swal.fire('Error', 'No hay alumnos en el grupo para imprimir.', 'error');
      return;
    }
    
    // Create a printable window
    const printWindow = window.open('', '_blank');
    let html = `
      <html>
      <head>
        <title>Gafetes - ${currentGrupoName}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .card { border: 2px dashed #ccc; padding: 15px; text-align: center; border-radius: 8px; page-break-inside: avoid; }
          .qr-placeholder { width: 120px; height: 120px; border: 1px solid #eee; margin: 10px auto; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #aaa; }
          h3 { margin: 0 0 5px 0; font-size: 14px; }
          p { margin: 0; font-size: 12px; color: #555; }
          @media print {
            button { display: none; }
          }
        </style>
        <!-- Import qrcode.js to generate real QRs -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
      </head>
      <body>
        <button onclick="window.print()" style="padding: 10px 20px; margin-bottom: 20px; cursor:pointer;">Imprimir Gafetes</button>
        <h2>Grupo: ${currentGrupoName}</h2>
        <div class="grid">
    `;

    alumnosEnGrupo.forEach(a => {
      const code = a.codigo_acceso || a.matricula;
      html += `
        <div class="card">
          <h3>${a.nombre_completo}</h3>
          <p>Matrícula: ${a.matricula || 'N/A'}</p>
          <div class="qr-placeholder" id="qr-${a.id}"></div>
          <p><strong>${code}</strong></p>
        </div>
      `;
    });

    html += `
        </div>
        <script>
          window.onload = () => {
    `;
    alumnosEnGrupo.forEach(a => {
      const code = a.codigo_acceso || a.matricula;
      if (code) {
        html += `new QRCode(document.getElementById("qr-${a.id}"), { text: "${code}", width: 120, height: 120 });\n`;
      }
    });
    html += `
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  });
});

async function loadGrupos() {
  const container = document.getElementById('lista-grupos');
  const grupos = await getGrupos();
  
  if (grupos.length === 0) {
    container.innerHTML = '<p class="text-sm text-gray-400 p-2 text-center">No hay grupos creados</p>';
    return;
  }

  container.innerHTML = '';
  grupos.forEach(g => {
    const div = document.createElement('div');
    const name = `${g.grado} "${g.grupo}"`;
    div.className = `p-3 mb-2 border rounded-lg cursor-pointer transition-colors ${currentGrupoId === g.id ? 'bg-sepBurgundy/10 border-sepBurgundy' : 'bg-white border-gray-200 hover:border-sepBurgundy/50'}`;
    div.dataset.id = g.id;
    div.dataset.grado = g.grado;
    div.dataset.grupo = g.grupo;
    
    div.innerHTML = `
      <div class="flex justify-between items-center">
        <h4 class="font-bold text-gray-800">${name}</h4>
        <span class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">${g.ciclo_escolar || ''}</span>
      </div>
      <p class="text-xs text-gray-500 mt-1">Tutor: ${g.tutor_nombre || 'N/A'}</p>
    `;

    div.addEventListener('click', () => {
      document.querySelectorAll('#lista-grupos > div').forEach(el => {
        el.classList.remove('bg-sepBurgundy/10', 'border-sepBurgundy');
        el.classList.add('bg-white', 'border-gray-200');
      });
      div.classList.remove('bg-white', 'border-gray-200');
      div.classList.add('bg-sepBurgundy/10', 'border-sepBurgundy');
      selectGrupo(g.id, name, g.grado, g.grupo);
    });

    container.appendChild(div);
  });
}

async function selectGrupo(id, name, grado, grupo) {
  currentGrupoId = id;
  currentGrupoName = name;
  document.getElementById('grupo-destino-lbl').textContent = name;
  document.getElementById('btn-mover-derecha').disabled = false;
  document.getElementById('btn-mover-izquierda').disabled = false;
  document.getElementById('btn-print-qrs').disabled = false;

  const container = document.getElementById('lista-en-grupo');
  container.innerHTML = '<div class="flex justify-center p-4"><div class="animate-spin h-5 w-5 border-2 border-sepBurgundy border-t-transparent rounded-full"></div></div>';

  alumnosEnGrupo = await getAlumnosPorGrupo(id);
  document.getElementById('badge-en-grupo').textContent = alumnosEnGrupo.length;

  renderEnGrupo();
}

async function loadAlumnosSinGrupo() {
  alumnosSinGrupo = await getAlumnosSinGrupo();
  renderSinGrupo();
}

function renderSinGrupo(filter = '') {
  const container = document.getElementById('lista-sin-grupo');
  let list = alumnosSinGrupo;
  if (filter) {
    const f = filter.toLowerCase();
    list = list.filter(a => a.nombre_completo.toLowerCase().includes(f) || (a.matricula && a.matricula.toLowerCase().includes(f)));
  }

  document.getElementById('badge-sin-grupo').textContent = list.length;

  if (list.length === 0) {
    container.innerHTML = '<div class="text-center text-xs text-gray-400 p-4">No hay alumnos</div>';
    return;
  }

  container.innerHTML = '';
  list.forEach(a => {
    container.appendChild(createStudentRow(a));
  });
}

function renderEnGrupo() {
  const container = document.getElementById('lista-en-grupo');
  if (alumnosEnGrupo.length === 0) {
    container.innerHTML = '<div class="text-center text-xs text-gray-400 p-4">El grupo está vacío</div>';
    return;
  }

  container.innerHTML = '';
  alumnosEnGrupo.forEach(a => {
    container.appendChild(createStudentRow(a));
  });
}

function createStudentRow(a) {
  const div = document.createElement('div');
  div.className = 'flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer border-b border-gray-50 last:border-0';
  
  div.innerHTML = `
    <input type="checkbox" class="rounded text-sepBurgundy focus:ring-sepBurgundy w-4 h-4 cursor-pointer" data-id="${a.id}">
    <div>
      <p class="text-sm font-bold text-gray-800 leading-tight">${a.nombre_completo}</p>
      <p class="text-xs text-gray-500">${a.matricula || 'Sin Matrícula'}</p>
    </div>
  `;

  // Toggle checkbox on row click
  div.addEventListener('click', (e) => {
    if (e.target.tagName !== 'INPUT') {
      const cb = div.querySelector('input');
      cb.checked = !cb.checked;
    }
  });

  return div;
}

function getSelectedIds(containerId) {
  const container = document.getElementById(containerId);
  const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(cb => cb.dataset.id);
}

// ─── LOGICA DEL MODAL ALTA DE ALUMNOS ────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const btnAbrirModal = document.getElementById('btn-importar-masivo');
  const btnCerrarModal = document.getElementById('btn-cerrar-modal-alta');
  const modalAlta = document.getElementById('modal-alta-alumnos');
  const modalContent = document.getElementById('modal-alta-content');

  // Tabs
  const tabInd = document.getElementById('tab-individual');
  const tabMas = document.getElementById('tab-masiva');
  const formInd = document.getElementById('form-individual');
  const formMas = document.getElementById('form-masiva');

  if(btnAbrirModal) {
    btnAbrirModal.addEventListener('click', () => {
      modalAlta.classList.remove('hidden');
      setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
      }, 10);
    });
  }

  if(btnCerrarModal) {
    btnCerrarModal.addEventListener('click', cerrarModal);
  }

  function cerrarModal() {
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      modalAlta.classList.add('hidden');
    }, 300);
  }

  tabInd.addEventListener('click', () => {
    tabInd.className = 'pb-3 px-4 font-bold text-sm text-sepBurgundy border-b-2 border-sepBurgundy transition-colors focus:outline-none';
    tabMas.className = 'pb-3 px-4 font-bold text-sm text-gray-500 border-b-2 border-transparent hover:text-gray-700 transition-colors focus:outline-none';
    formInd.classList.remove('hidden');
    formMas.classList.add('hidden');
  });

  tabMas.addEventListener('click', () => {
    tabMas.className = 'pb-3 px-4 font-bold text-sm text-sepBurgundy border-b-2 border-sepBurgundy transition-colors focus:outline-none';
    tabInd.className = 'pb-3 px-4 font-bold text-sm text-gray-500 border-b-2 border-transparent hover:text-gray-700 transition-colors focus:outline-none';
    formMas.classList.remove('hidden');
    formInd.classList.add('hidden');
  });

  // Guardar Individual
  const btnGuardarInd = document.getElementById('btn-guardar-individual');
  btnGuardarInd.addEventListener('click', async () => {
    const nombres = document.getElementById('alta-nombres').value.trim();
    const apellidos = document.getElementById('alta-apellidos').value.trim();
    let matricula = document.getElementById('alta-matricula').value.trim();
    const curp = document.getElementById('alta-curp').value.trim();

    if(!nombres || !apellidos) {
      return Swal.fire('Faltan Datos', 'Nombres y apellidos son obligatorios.', 'warning');
    }

    if(!matricula) {
      matricula = 'MAT' + Date.now().toString().slice(-6); // Auto mat
    }

    btnGuardarInd.disabled = true;
    btnGuardarInd.textContent = 'Guardando...';

    try {
      await insertAlumno({
        nombre_completo: nombres + ' ' + apellidos,
        matricula,
        curp,
        grado: '0',
        grupo: '0'
      });
      Swal.fire('Éxito', 'Alumno registrado correctamente. Ahora puedes asignarle grupo.', 'success');
      document.getElementById('alta-nombres').value = '';
      document.getElementById('alta-apellidos').value = '';
      document.getElementById('alta-matricula').value = '';
      document.getElementById('alta-curp').value = '';
      cerrarModal();
      location.reload();
    } catch(e) {
      Swal.fire('Error', 'Hubo un error al registrar al alumno.', 'error');
    }

    btnGuardarInd.disabled = false;
    btnGuardarInd.textContent = 'Guardar Alumno';
  });

  // Excel a JSON / Descarga Plantilla
  const btnDescargarPlantilla = document.getElementById('btn-descargar-plantilla');
  btnDescargarPlantilla.addEventListener('click', () => {
    const csvData = "nombres,apellidos,matricula,curp\nJuan,Perez,MAT001,CURP01\nMaria,Gomez,,";
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'plantilla_alumnos.csv');
    a.click();
  });

  const fileMasivo = document.getElementById('file-masivo');
  const masivoPreview = document.getElementById('masivo-preview');
  const masivoFilename = document.getElementById('masivo-filename');
  const btnProcesarMasivo = document.getElementById('btn-procesar-masivo');
  let parsedData = [];

  fileMasivo.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;

    masivoFilename.textContent = "Archivo seleccionado: " + file.name;
    masivoPreview.classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = function(evt) {
      const data = evt.target.result;
      const workbook = XLSX.read(data, {type: 'binary'});
      const firstSheet = workbook.SheetNames[0];
      const excelRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
      parsedData = excelRows;
    };
    reader.readAsBinaryString(file);
  });

  btnProcesarMasivo.addEventListener('click', async () => {
    if(parsedData.length === 0) return Swal.fire('Error', 'El archivo no tiene datos válidos o faltan columnas.', 'error');

    btnProcesarMasivo.disabled = true;
    btnProcesarMasivo.textContent = 'Procesando...';

    const cleanData = parsedData.map(r => {
      const nom = r.nombres || r.Nombre || r.Nombres || r.NOMBRES || '';
      const ape = r.apellidos || r.Apellidos || r.APELLIDOS || '';
      let mat = r.matricula || r.Matricula || r.MATRICULA || '';
      const curp = r.curp || r.Curp || r.CURP || '';
      
      if(!mat) mat = 'MAT' + Math.floor(Math.random()*1000000);
      
      return {
        nombre_completo: nom + ' ' + ape,
        matricula: mat,
        curp: curp,
        grado: '0',
        grupo: '0'
      };
    }).filter(x => x.nombre_completo.trim() !== '');

    if(cleanData.length === 0) {
      btnProcesarMasivo.disabled = false;
      btnProcesarMasivo.textContent = 'Procesar Archivo';
      return Swal.fire('Error', 'No se encontraron registros válidos (nombres, apellidos) en el archivo.', 'error');
    }

    try {
      await insertAlumnosMasivo(cleanData);
      Swal.fire('Éxito', `Se importaron ${cleanData.length} alumnos masivamente.`, 'success');
      fileMasivo.value = '';
      masivoPreview.classList.add('hidden');
      cerrarModal();
      location.reload();
    } catch(e) {
      Swal.fire('Error', 'Hubo un problema al insertar los datos. Revisa la consola para más detalles.', 'error');
    }

    btnProcesarMasivo.disabled = false;
    btnProcesarMasivo.textContent = 'Procesar Archivo';
  });
});
