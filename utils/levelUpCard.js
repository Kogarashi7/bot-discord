const Canvas = require('canvas');
const path = require('path');

// Registrar fuente personalizada
Canvas.registerFont(path.join(__dirname, '../assets/fonts/Orbitron-Bold.ttf'), {
  family: 'Orbitron'
});

async function generateLevelUpCard(user, level) {
  const canvas = Canvas.createCanvas(600, 150);
  const ctx = canvas.getContext('2d');

  // Fondo base
  ctx.fillStyle = '#1e1f22';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Avatar redondo
  const avatarURL = user.displayAvatarURL({ extension: 'png', size: 128 });
  const avatar = await Canvas.loadImage(avatarURL);

  ctx.save();
  ctx.beginPath();
  ctx.arc(75, 75, 50, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 25, 25, 100, 100);
  ctx.restore();

  // Borde del avatar
  ctx.strokeStyle = '#3fe0e2';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(75, 75, 50, 0, Math.PI * 2);
  ctx.stroke();

  // Texto principal
  ctx.font = '32px Orbitron';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#3fe0e2';
  ctx.shadowBlur = 12;
  ctx.fillText(`¡${user.username} subió a nivel ${level}!`, 150, 85);
  ctx.shadowBlur = 0;

  // Marco
  ctx.strokeStyle = '#3fe0e2';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  return canvas.toBuffer();
}

module.exports = { generateLevelUpCard };
