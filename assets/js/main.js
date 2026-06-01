// Shared Logic for SEP Dashboard

// Global Toast Notification System
window.showToast = function(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `<svg class="w-5 h-5 toast-icon p-1 rounded-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
    } else if (type === 'error') {
        iconSvg = `<svg class="w-5 h-5 toast-icon p-1 rounded-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    } else {
        iconSvg = `<svg class="w-5 h-5 toast-icon p-1 rounded-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
    }
    
    toast.innerHTML = `
        ${iconSvg}
        <span class="text-sm font-bold text-gray-800">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Animate out and remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
};


document.addEventListener("DOMContentLoaded", () => {
    console.log("SEP Dashboard Logic Initialized");
    
    // 1. Mobile Sidebar Logic
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const btn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-sidebar-btn');

    if(!sidebar) console.warn("Sidebar element not found");
    if(!btn) console.warn("Mobile menu button not found");

    function toggleSidebar() {
      console.log("Toggling sidebar");
      if(!sidebar) return;
      sidebar.classList.toggle('-translate-x-full');
      if(overlay) {
        if(overlay.classList.contains('hidden')) {
          overlay.classList.remove('hidden');
          setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        } else {
          overlay.classList.add('opacity-0');
          setTimeout(() => overlay.classList.add('hidden'), 300);
        }
      }
    }

    if(btn) btn.addEventListener('click', toggleSidebar);
    if(closeBtn) closeBtn.addEventListener('click', toggleSidebar);
    if(overlay) overlay.addEventListener('click', toggleSidebar);

    window.addEventListener('resize', () => {
       if(sidebar && overlay) {
         if(window.innerWidth >= 768) {
           sidebar.classList.remove('-translate-x-full');
           overlay.classList.add('opacity-0');
           setTimeout(() => overlay.classList.add('hidden'), 300);
         } else {
           sidebar.classList.add('-translate-x-full');
         }
       }
    });

    // 4.3: Swipe gestures for mobile sidebar
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isSwiping = true;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (!isSwiping || !sidebar) return;
      isSwiping = false;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = Math.abs(touchEndY - touchStartY);
      
      // Only trigger if horizontal swipe is dominant and > 60px
      if (Math.abs(diffX) > 60 && diffX > diffY) {
        const sidebarOpen = !sidebar.classList.contains('-translate-x-full');
        if (diffX > 0 && !sidebarOpen && touchStartX < 40) {
          // Swipe right from left edge → open
          toggleSidebar();
        } else if (diffX < 0 && sidebarOpen) {
          // Swipe left → close
          toggleSidebar();
        }
      }
    }, { passive: true });

    // 2. Dynamic Premium Chart Rendering (3.2: real chart with Supabase data)
    const canvas = document.getElementById('attendanceChart');
    if (canvas) {
      console.log("Attendance Chart Canvas detected, rendering...");
      const resizeCanvas = () => {
        const parent = canvas.parentElement;
        canvas.width = parent.offsetWidth - 32; 
        canvas.height = parent.offsetHeight - 32;
        renderChart();
      };

      let chartData = null;

      // Load real data from the last 7 days
      async function loadChartData() {
        try {
          const { supabase } = await import('./api-client.js');
          const days = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            // Skip weekends
            if (d.getDay() === 0 || d.getDay() === 6) continue;
            days.push(d.toISOString().split('T')[0]);
          }

          const { data } = await supabase
            .from('asistencias')
            .select('date, status')
            .in('date', days);

          const grouped = {};
          days.forEach(d => grouped[d] = { presentes: 0, retardos: 0, faltas: 0 });
          if (data) {
            data.forEach(r => {
              if (!grouped[r.date]) return;
              if (r.status === 'A tiempo') grouped[r.date].presentes++;
              else if (r.status === 'Retardo') grouped[r.date].retardos++;
              else if (r.status === 'Falta') grouped[r.date].faltas++;
            });
          }

          chartData = days.map(d => ({
            label: new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }),
            ...grouped[d]
          }));
          renderChart();
        } catch (e) {
          console.warn('Error loading chart data:', e);
        }
      }

      const renderChart = () => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!chartData || chartData.length === 0) {
          ctx.font = "bold 14px sans-serif";
          ctx.fillStyle = "#cbd5e1";
          ctx.textAlign = "center";
          ctx.fillText("Cargando datos de asistencia...", canvas.width / 2, canvas.height / 2);
          return;
        }

        const padding = { top: 20, right: 20, bottom: 50, left: 50 };
        const chartW = canvas.width - padding.left - padding.right;
        const chartH = canvas.height - padding.top - padding.bottom;
        const barGroupW = chartW / chartData.length;
        const barW = Math.min(barGroupW * 0.25, 20);
        const maxVal = Math.max(...chartData.map(d => Math.max(d.presentes + d.retardos + d.faltas, 1)));

        // Grid lines
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
          const y = padding.top + (chartH * i / 4);
          ctx.beginPath();
          ctx.moveTo(padding.left, y);
          ctx.lineTo(canvas.width - padding.right, y);
          ctx.stroke();
          // Y-axis labels
          ctx.fillStyle = '#94a3b8';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(Math.round(maxVal * (4 - i) / 4), padding.left - 8, y + 4);
        }

        // Bars
        chartData.forEach((d, i) => {
          const x = padding.left + i * barGroupW + barGroupW / 2;
          
          // Presentes (green)
          const hP = (d.presentes / maxVal) * chartH;
          const grad1 = ctx.createLinearGradient(0, padding.top + chartH - hP, 0, padding.top + chartH);
          grad1.addColorStop(0, '#34d399');
          grad1.addColorStop(1, '#10b981');
          ctx.fillStyle = grad1;
          ctx.beginPath();
          ctx.roundRect(x - barW * 1.5 - 1, padding.top + chartH - hP, barW, hP, [3, 3, 0, 0]);
          ctx.fill();

          // Retardos (yellow)
          const hR = (d.retardos / maxVal) * chartH;
          const grad2 = ctx.createLinearGradient(0, padding.top + chartH - hR, 0, padding.top + chartH);
          grad2.addColorStop(0, '#fbbf24');
          grad2.addColorStop(1, '#f59e0b');
          ctx.fillStyle = grad2;
          ctx.beginPath();
          ctx.roundRect(x - barW / 2, padding.top + chartH - hR, barW, hR, [3, 3, 0, 0]);
          ctx.fill();

          // Faltas (red)
          const hF = (d.faltas / maxVal) * chartH;
          const grad3 = ctx.createLinearGradient(0, padding.top + chartH - hF, 0, padding.top + chartH);
          grad3.addColorStop(0, '#f87171');
          grad3.addColorStop(1, '#ef4444');
          ctx.fillStyle = grad3;
          ctx.beginPath();
          ctx.roundRect(x + barW / 2 + 1, padding.top + chartH - hF, barW, hF, [3, 3, 0, 0]);
          ctx.fill();

          // X-axis labels
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(d.label, x, padding.top + chartH + 20);
        });

        // Legend
        const legendY = canvas.height - 12;
        const legendX = canvas.width / 2 - 100;
        [['#10b981', 'Presentes'], ['#f59e0b', 'Retardos'], ['#ef4444', 'Faltas']].forEach(([c, t], i) => {
          const lx = legendX + i * 80;
          ctx.fillStyle = c;
          ctx.beginPath();
          ctx.roundRect(lx, legendY - 5, 10, 10, 2);
          ctx.fill();
          ctx.fillStyle = '#64748b';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(t, lx + 14, legendY + 4);
        });
      };

      window.addEventListener('resize', resizeCanvas);
      setTimeout(resizeCanvas, 100);
      loadChartData();
    }
    
    // 3. Login Forms Logic
    const formDirector = document.getElementById("form-director");
    if (formDirector) {
        formDirector.addEventListener("submit", (e) => {
            e.preventDefault();
            const password = document.getElementById("director-password").value;
            if (password === "admin123" || password.length > 0) { // Permitir acceder con cualquier password para propósito de demo o usar admin123
                window.location.href = "pages/directivos/dashboard.html";
            }
        });
    }

    const formAlumno = document.getElementById("form-alumno");
    if (formAlumno) {
        formAlumno.addEventListener("submit", (e) => {
            e.preventDefault();
            const usuario = document.getElementById("alumno-usuario").value;
            const curp = document.getElementById("alumno-curp").value;
            if (usuario.trim() && curp.trim()) {
                // Save user info for dashboard personalization
                localStorage.setItem("sep_student_name", usuario);
                window.location.href = "pages/alumnos/dashboard.html";
            }
        });
    }

    // Personalize Alumno Dashboard
    const studentNameEl = document.getElementById("student-welcome-name");
    const studentSidebarNameEl = document.getElementById("student-sidebar-name");
    const studentInitialsEl = document.getElementById("student-sidebar-initials");
    
    if (studentNameEl || studentSidebarNameEl) {
        const studentName = localStorage.getItem("sep_student_name") || "Juan Pablo García";
        
        if (studentNameEl) {
            studentNameEl.textContent = "¡Hola, " + studentName.split(' ')[0] + "!";
        }
        if (studentSidebarNameEl) {
            studentSidebarNameEl.textContent = studentName;
        }
        if (studentInitialsEl) {
            // Get initials from first two words
            const words = studentName.trim().split(' ');
            let initials = "AL";
            if (words.length >= 2) {
                initials = (words[0][0] + words[1][0]).toUpperCase();
            } else if (words.length === 1 && words[0].length > 0) {
                initials = words[0][0].toUpperCase() + (words[0][1] ? words[0][1].toUpperCase() : '');
            }
            studentInitialsEl.textContent = initials;
        }
    }

    // 4. Excel Upload Logic
    const excelInput = document.getElementById("excel-file-input");
    const uploadBtn = document.getElementById("upload-excel-btn");
    const uploadStatus = document.getElementById("upload-status-msg");

    if (excelInput && uploadBtn) {
        excelInput.addEventListener("change", () => {
            if (excelInput.files.length > 0) {
                uploadBtn.classList.remove("hidden");
                uploadBtn.textContent = "Subir " + excelInput.files[0].name;
            } else {
                uploadBtn.classList.add("hidden");
            }
        });

        uploadBtn.addEventListener("click", async () => {
            if (excelInput.files.length === 0) return;
            const file = excelInput.files[0];
            const formData = new FormData();
            formData.append("archivo", file);

            uploadBtn.textContent = "Cargando...";
            uploadBtn.disabled = true;
            uploadStatus.classList.remove("hidden", "text-green-600", "text-red-600");
            uploadStatus.textContent = "Procesando y mandando a la base de datos...";

            try {
                const { uploadAlumnosFromData } = await import('./api-client.js');
                
                // Parse excel data client-side using SheetJS
                // We need to load xlsx if it's not already in window
                if (!window.XLSX) {
                    await import('https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs')
                      .then(m => { window.XLSX = m; })
                      .catch(e => {
                          // fallback if esm fails
                          const script = document.createElement('script');
                          script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
                          document.head.appendChild(script);
                          return new Promise(resolve => script.onload = resolve);
                      });
                }

                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        const rows = XLSX.utils.sheet_to_json(worksheet);

                        if (rows.length === 0) throw new Error("El archivo está vacío");

                        const result = await uploadAlumnosFromData(rows);

                        if (result && result.success) {
                            uploadStatus.classList.add("text-green-600");
                            uploadStatus.textContent = "✅ " + (result.message || "Subido con éxito");
                            if (window.loadStudentsList) window.loadStudentsList();
                        } else {
                            uploadStatus.classList.add("text-red-600");
                            uploadStatus.textContent = "❌ Error: " + (result ? result.error : "Desconocido");
                        }
                    } catch (err) {
                        uploadStatus.classList.add("text-red-600");
                        uploadStatus.textContent = "❌ Error procesando Excel: " + err.message;
                    } finally {
                        uploadBtn.disabled = false;
                        excelInput.value = ""; // Reset
                        setTimeout(() => uploadBtn.classList.add("hidden"), 3000); // Hide button after a bit
                    }
                };
                reader.readAsArrayBuffer(file);
            } catch (error) {
                console.error(error);
                uploadStatus.classList.add("text-red-600");
                uploadStatus.textContent = "❌ Error de conexión con Supabase.";
                uploadBtn.disabled = false;
            }
        });
    }

    // 5. Fetch and Render Student List (Dashboard)
    const studentsTableBody = document.getElementById("students-table-body");
    
    window.loadStudentsList = async () => {
        if (!studentsTableBody) return;
        try {
            const { getAlumnos } = await import('./api-client.js');
            const students = await getAlumnos();
            
            if (students.length === 0) {
               studentsTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-gray-500 font-bold">No hay alumnos registrados. ¡Sube un Excel!</td></tr>`;
               return;
            }
            
            studentsTableBody.innerHTML = students.map(s => `
                <tr class="hover:bg-emerald-50/50 transition-colors group">
                    <td class="px-6 py-4 font-bold text-gray-800">${s.nombre_completo}</td>
                    <td class="px-6 py-4 font-medium text-gray-500">${s.grado || '-'} ${s.grupo || '-'}</td>
                    <td class="px-6 py-4 text-gray-600 font-medium">${s.matricula || '---'}</td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="deleteStudent(${s.id})" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors" title="Eliminar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            console.error("Error loading students", e);
            studentsTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-red-500 font-bold">Error cargando alumnos.</td></tr>`;
        }
    };

    window.deleteStudent = async (id) => {
        if (!confirm("¿Seguro que deseas eliminar a este alumno del sistema?")) return;
        try {
            const { deleteAlumno } = await import('./api-client.js');
            const success = await deleteAlumno(id);
            if (success) {
                window.loadStudentsList();
                if(window.showToast) window.showToast("Alumno eliminado.", "success");
            } else {
                if(window.showToast) window.showToast("Error eliminando alumno de la base.", "error");
            }
        } catch(e) {
            console.error(e);
        }
    };

    if (studentsTableBody) {
        window.loadStudentsList();
    }
});
