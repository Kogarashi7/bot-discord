const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');
const { usage } = require('../informacion/help');

const levelPath = path.join(__dirname, '../../../data/levels.json');
const bgPath = path.join(__dirname, '../../../data/backgrounds.json');

// Registrar fuente personalizada (Orbitron)
Canvas.registerFont(path.join(__dirname, '../../../assets/fonts/Orbitron-Bold.ttf'), {
  family: 'Orbitron',
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nivel')
    .setDescription('Muestra tu tarjeta gráfica de nivel'),
    usage: '/nivel @usuario',

  async execute(interaction) {
    const key = `${interaction.guild.id}-${interaction.user.id}`;

    let data = {};
    if (fs.existsSync(levelPath)) {
      data = JSON.parse(fs.readFileSync(levelPath, 'utf8'));
    }

    const userData = data[key] || { xp: 0, level: 1 };
    const xp = userData.xp;
    const level = userData.level;
    const xpNeeded = level * 100;
    const percent = Math.min(xp / xpNeeded, 1);

    let backgrounds = {};
    if (fs.existsSync(bgPath)) {
      backgrounds = JSON.parse(fs.readFileSync(bgPath, 'utf8'));
    }

    const fondoURL = backgrounds[key];
    const canvas = Canvas.createCanvas(600, 200);
    const ctx = canvas.getContext('2d');

    // Fondo: imagen personalizada o color sólido
    if (fondoURL) {
      try {
        const fondo = await Canvas.loadImage(fondoURL);
        ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);
      } catch {
        ctx.fillStyle = '#1e1f22';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      ctx.fillStyle = '#1e1f22';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Avatar del usuario
    const avatarURL = interaction.user.displayAvatarURL({ extension: 'png', size: 128 });
    const avatar = await Canvas.loadImage(avatarURL);
    ctx.save();
    ctx.beginPath();
    ctx.arc(100, 100, 56, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 44, 44, 112, 112);
    ctx.restore();

    // Borde blanco al avatar
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(100, 100, 56, 0, Math.PI * 2);
    ctx.stroke();

    // Nombre del usuario
    ctx.font = '28px Orbitron';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(interaction.user.username, 180, 60);
    ctx.shadowBlur = 0;

    // Nivel y XP
    ctx.font = '22px Orbitron';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`Nivel: ${level}`, 180, 100);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(`XP: ${xp} / ${xpNeeded}`, 180, 130);

    // Barra de progreso
    const barX = 180;
    const barY = 150;
    const barWidth = 380;
    const barHeight = 24;

    // Fondo de la barra
    ctx.fillStyle = '#2c2f33';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Progreso
    ctx.fillStyle = '#3fe0e2'; // Tu color personalizado
    ctx.fillRect(barX, barY, barWidth * percent, barHeight);

    // Borde de la barra
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Marco exterior de la tarjeta
    ctx.strokeStyle = '#3fe0e2';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    

    // Enviar imagen
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'nivel.png' });
    await interaction.reply({ files: [attachment] });
  }
};
