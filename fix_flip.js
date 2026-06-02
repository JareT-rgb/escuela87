const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('c:/Users/DELL/OneDrive/Escritorio/escuela87/index.html', 'utf8');
const $ = cheerio.load(html);

// Find the flip container
const inner = $('#flip-container');

// Find the cards
const cards = inner.children('.glow-card');
if (cards.length === 2) {
  const alumnoCard = $(cards[0]);
  const staffCard = $(cards[1]);

  // Remove flip-face and flip-front/back from cards
  alumnoCard.removeClass('flip-face flip-front');
  staffCard.removeClass('flip-face flip-back');

  // Wrap them
  alumnoCard.wrap('<div class="flip-face flip-front h-full"></div>');
  staffCard.wrap('<div class="flip-face flip-back h-full"></div>');

  // Fix the height constraint. 500px might be too restrictive.
  // We can let the flip faces take 100% of the container, and set container min-height.
  const gridContainer = $('.perspective-1000');
  gridContainer.css('height', '550px'); // A bit more room

  fs.writeFileSync('c:/Users/DELL/OneDrive/Escritorio/escuela87/index.html', $.html());
  console.log('Fixed overlapping transforms by wrapping cards.');
} else {
  // Let's check if they are already wrapped
  const frontWrapper = inner.children('.flip-front');
  if (frontWrapper.length > 0) {
    console.log('Already wrapped. Let me just fix the height.');
    $('.perspective-1000').css('height', '580px');
    fs.writeFileSync('c:/Users/DELL/OneDrive/Escritorio/escuela87/index.html', $.html());
  } else {
    console.log('Structure not recognized.');
  }
}
