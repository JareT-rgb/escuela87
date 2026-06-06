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

});
