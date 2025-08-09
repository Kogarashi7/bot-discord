const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { usage } = require('./nivel');

const filePath = path.join(__dirname, '../../../data/levels.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('topglobal')
    .setDescription('Muestra el ranking global de todos los servidores'),
    usage: '/topglobal',

  async execute(interaction) {
    let data = {};
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    // Agrupar por userId
    const globalMap = new Map();

    for (const [key, value] of Object.entries(data)) {
      const userId = key.split('-')[1];
      const prev = globalMap.get(userId) || { xp: 0, level: 0 };
      globalMap.set(userId, {
        xp: prev.xp + value.xp,
        level: Math.max(prev.level, value.level) // puedes usar suma si prefieres
      });
    }

    const ranking = Array.from(globalMap.entries())
      .map(([userId, stats]) => ({
        userId,
        ...stats
      }))
      .sort((a, b) => b.level === a.level ? b.xp - a.xp : b.level - a.level)
      .slice(0, 10);

    if (ranking.length === 0) {
      return interaction.reply('❌ No hay datos globales de nivel.');
    }

    const embed = new EmbedBuilder()
      .setTitle('🌍 Ranking Global')
      .setColor('#3fe0e2')
      .setFooter({ text: `Solicitado por ${interaction.user.username}` });

    for (let i = 0; i < ranking.length; i++) {
      const entry = ranking[i];
      let username = `Usuario (${entry.userId})`;

      try {
        const user = await interaction.client.users.fetch(entry.userId);
        username = user.username;
      } catch {}

      embed.addFields({
        name: `#${i + 1} — ${username}`,
        value: `Nivel: **${entry.level}** — XP: \`${entry.xp}\``,
        inline: false
      });
    }

    await interaction.reply({ embeds: [embed] });
  }
};
