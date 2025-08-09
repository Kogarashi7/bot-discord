const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { usage } = require('./nivel');

const filePath = path.join(__dirname, '../../../data/levels.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Muestra el ranking de niveles del servidor actual'),
    usage: '/top',  

  async execute(interaction) {
    const guildId = interaction.guild.id;

    let data = {};
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    const ranking = Object.entries(data)
      .filter(([k]) => k.startsWith(`${guildId}-`))
      .map(([k, v]) => ({
        userId: k.split('-')[1],
        level: v.level || 0,
        xp: v.xp || 0
      }))
      .sort((a, b) => b.level === a.level ? b.xp - a.xp : b.level - a.level)
      .slice(0, 10);

    if (ranking.length === 0) {
      return interaction.reply('❌ No hay datos de nivel en este servidor.');
    }

    const embed = new EmbedBuilder()
      .setTitle(`🏆 Ranking de ${interaction.guild.name}`)
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
