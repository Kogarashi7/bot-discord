const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../data/levels.json');

module.exports = async (message) => {
  if (message.author.bot || !message.guild) return;

  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  const key = `${message.guild.id}-${message.author.id}`;

  if (!data[key]) {
    data[key] = { xp: 0, level: 1 };
  }

  // Añadir XP
  data[key].xp += 10;

  // Subir niveles en bucle si tiene suficiente XP
  let leveledUp = false;
  while (true) {
    const xpNeeded = data[key].level * 100;
    if (data[key].xp >= xpNeeded) {
      data[key].xp -= xpNeeded;
      data[key].level += 1;
      leveledUp = true;

      // Avisar del nivel subido
      const { EmbedBuilder } = require('discord.js');
      const embed = new EmbedBuilder()
        .setTitle('🎉 ¡Nivel alcanzado!')
        .setDescription(`🏅 ${message.author} ha subido al **nivel ${data[key].level}**. ¡Sigue así!`)
        .setColor('#3fe0e2')
        .setThumbnail(message.author.displayAvatarURL({ extension: 'png', size: 128 }));

      message.channel.send({ embeds: [embed] });

    } else {
      break; // No tiene más XP para subir otro nivel
    }
  }

  // Guardar datos
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  // Debug
  console.log(`${message.author.username} tiene ${data[key].xp} XP y nivel ${data[key].level}`);
};
