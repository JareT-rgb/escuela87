const fs = require('fs');

const apiFile = 'c:/Users/DELL/OneDrive/Escritorio/escuela87/assets/js/api-client.js';
let content = fs.readFileSync(apiFile, 'utf8');

const badDate = "new Date().toISOString().split('T')[0]";
const goodDate = "new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]";

content = content.replace(new RegExp(badDate.replace(/[.*+?^$\/{}()|[\\]\\]/g, '\\$&'), 'g'), goodDate);

fs.writeFileSync(apiFile, content);
console.log('Fixed timezones in api-client.js');
