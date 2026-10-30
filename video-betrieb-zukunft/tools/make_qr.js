// QR code for the end card (Calendly booking link) as inline SVG
const QR = require('qrcode');
const fs = require('fs');
QR.toString('https://calendly.com/lukas-betrieb-zukunft/30min', { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#052835', light: '#0000' } })
  .then(svg => fs.writeFileSync(__dirname + '/../src/qr.js', 'window.QR_SVG = ' + JSON.stringify(svg) + ';\n'));
