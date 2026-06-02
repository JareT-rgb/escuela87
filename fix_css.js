const fs = require('fs');

const htmlFile = 'c:/Users/DELL/OneDrive/Escritorio/escuela87/index.html';
let content = fs.readFileSync(htmlFile, 'utf8');

// The CSS snippet I added:
const oldCss = `.flip-front { transform: rotateY(0deg); z-index: 2; }
  .flip-back { transform: rotateY(180deg); }`;

const newCss = `.flip-front { transform: rotateY(0deg); z-index: 2; }
  .flip-back { transform: rotateY(180deg); z-index: 1; }
  .flipped .flip-front { z-index: 1; pointer-events: none; }
  .flipped .flip-back { z-index: 2; pointer-events: auto; }
  .flip-front { pointer-events: auto; }
  .flip-back { pointer-events: none; }`;

if (content.includes(oldCss)) {
  content = content.replace(oldCss, newCss);
  fs.writeFileSync(htmlFile, content);
  console.log('Fixed pointer-events and z-index for flip cards.');
} else {
  console.log('Could not find old CSS.');
}
