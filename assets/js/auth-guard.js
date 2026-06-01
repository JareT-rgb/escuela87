/**
 * GESTIÓN DE SESIONES Y PROTECCIÓN DE RUTAS
 * 
 * Este script se incluye en las páginas protegidas para validar que el
 * usuario tenga sesión iniciada y el rol adecuado.
 */

// Verifica si existe la sesión y opcionalmente si tiene uno de los roles permitidos
export function checkAuth(requiredRoles = []) {
    const sessionStr = localStorage.getItem('sep_session');
    
    // Ruta base (asumiendo que los archivos protegidos están en /pages/rol/archivo.html)
    // Regresamos 2 niveles para llegar a index.html
    const loginUrl = '../../index.html';

    if (!sessionStr) {
        window.location.replace(loginUrl);
        return null;
    }

    try {
        const session = JSON.parse(sessionStr);
        
        // Si hay roles requeridos y el tipo no está, denegar
        if (requiredRoles.length > 0 && !requiredRoles.includes(session.tipo)) {
            if(window.showToast) { window.showToast('Acceso denegado: No tienes permisos para esta área.', 'error'); } else { alert('Acceso denegado: No tienes permisos para esta área.'); }
            window.location.replace(loginUrl);
            return null;
        }
        
        // Actualizar interfaz con el nombre del usuario si hay elementos genéricos
        const userNameDisplays = document.querySelectorAll('.session-user-name');
        userNameDisplays.forEach(el => el.textContent = session.nombre);

        return session;
    } catch(e) {
        // En caso de que el JSON esté corrupto
        localStorage.removeItem('sep_session');
        window.location.replace(loginUrl);
        return null;
    }
}

// Cierra la sesión
export function logout() {
    localStorage.removeItem('sep_session');
    window.location.replace('../../index.html');
}

// Configurar los botones de logout genéricos
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtns = document.querySelectorAll('.btn-logout');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });
});
