const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');

if (process.argv.length !== 5) {
  console.log("Usage: node generate.js <ssid> <password> <encryption>");
  process.exit(1);
}

const ssid = process.argv[2];
const password = process.argv[3];
const encryption = process.argv[4].toUpperCase();

const encryptionOptions = ["WPA", "WPA2", "WPA3"];
if (encryptionOptions.indexOf(encryption) < 0) {
    console.log("Encryption must be one of: " + encryptionOptions.join(", "));
    process.exit(1);
}

const wifiString = `WIFI:T:${encryption};S:${ssid};P:${password};;`;

const qrOptions = {
  errorCorrectionLevel: 'H',
  margin: 1,
  width: 200,
  color: {
    dark: '#ffffff',
    light: '#115d75'
  }
};

// Generate QR code as data URL
QRCode.toDataURL(wifiString, qrOptions, function (err, url) {
  if (err) throw err;

  // Load the QR code into an image
  loadImage(url).then((qrImage) => {

    // Load the logo or icon to place in the center
    loadImage('logo.png').then((logoImage) => {
      const size = 288;

      // Canvas setup
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // Add background color
      ctx.fillStyle = '#115d75';
      ctx.fillRect(0, 0, size, size);

      // Add title to top of QR code
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Wi-Fi', size / 2, 50);

      // Add line below text
      ctx.beginPath();
      ctx.moveTo(size / 2 - 55, 60);
      ctx.lineTo(size / 2 + 55, 60);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Calculate center position for logo
      const logoSize = qrImage.width / 2; // Making logo size 1/5th of QR code size
      const logoPosition = (qrImage.width - logoSize) / 2;

      // Draw the QR code on the canvas
      ctx.drawImage(qrImage, (size - qrImage.width) / 2, 65);

      // Draw the logo on the canvas
      ctx.drawImage(logoImage, (size - logoSize) / 2, logoPosition + 65, logoSize, logoSize);

      // Save canvas to file
      let fs = require('fs');
      const out = fs.createWriteStream('wifi-qr.png');
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on('finish', () => console.log('QR code with logo generated and saved.'));
    });
  });
});
