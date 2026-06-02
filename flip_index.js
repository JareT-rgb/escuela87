const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('c:/Users/DELL/OneDrive/Escritorio/escuela87/index.html', 'utf8');
const $ = cheerio.load(html);

// Add CSS to head
$('style').append(`
  .perspective-1000 { perspective: 1000px; }
  .flip-container {
    width: 100%;
    height: 100%;
    position: relative;
    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform-style: preserve-3d;
  }
  .flipped { transform: rotateY(180deg); }
  .flip-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  .flip-front { transform: rotateY(0deg); z-index: 2; }
  .flip-back { transform: rotateY(180deg); }
`);

// Find the grid container
const grid = $('.grid.grid-cols-1.lg\\:grid-cols-2');

// Find the two cards
const cards = grid.find('.glow-card');
const staffCard = $(cards[0]);
const alumnoCard = $(cards[1]);

// Add flip-face classes to the cards, also make sure they take full height
staffCard.addClass('flip-face flip-back h-full');
alumnoCard.addClass('flip-face flip-front h-full');

// Add toggle buttons to both cards
// For Alumno card:
alumnoCard.find('form').append(`
  <div class="mt-4 text-center z-20">
    <button type="button" onclick="document.getElementById('flip-container').classList.add('flipped')" class="text-[11px] font-bold text-gray-500 hover:text-[#006341] uppercase tracking-widest transition-colors flex items-center justify-center gap-1 mx-auto">
      Eres Personal de la Escuela?
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
    </button>
  </div>
`);

// For Staff card:
staffCard.find('form').append(`
  <div class="mt-4 text-center z-20">
    <button type="button" onclick="document.getElementById('flip-container').classList.remove('flipped')" class="text-[11px] font-bold text-gray-500 hover:text-[#691C32] uppercase tracking-widest transition-colors flex items-center justify-center gap-1 mx-auto">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
      Volver al Portal de Alumnos
    </button>
  </div>
`);

// Change the grid to the new flip container layout
grid.removeClass('grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full max-w-5xl');
grid.addClass('w-full max-w-md perspective-1000 mx-auto');
// We need a fixed height for absolute positioned faces to work
grid.css('height', '500px');

// Wrap the cards in the inner flip-container
grid.empty();
grid.append('<div id="flip-container" class="flip-container"></div>');
const inner = grid.find('#flip-container');

// Note: Alumno is front, Staff is back. So we append Alumno first visually (z-index 2).
inner.append(alumnoCard);
inner.append(staffCard);

// Remove default "Accede a tu portal correspondiente interactuando con las tarjetas a continuacin." 
// because there is only one card now.
const heroP = $('.animate-float-hero p');
heroP.text('Selecciona tu portal de acceso deslizando la tarjeta.');

fs.writeFileSync('c:/Users/DELL/OneDrive/Escritorio/escuela87/index.html', $.html());
console.log('Successfully flipped index.html');
