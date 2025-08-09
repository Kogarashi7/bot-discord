const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const categoryIcons = {
  moderacion: '🛠️',
  diversion: '🎉',
  utilidades: '📎',
  musica: '🎵',
  info: 'ℹ️',
  economia: '💰',
  juegos: '🎮',
};

const categoryDescriptions = {
  moderacion: 'Herramientas para mantener el orden.',
  diversion: 'Comandos divertidos para tu servidor.',
  utilidades: 'Utilidades prácticas para todos.',
  musica: '¡Reproduce música sin parar!',
  info: 'Obtén información relevante.',
  economia: 'Sistemas de monedas y tienda.',
  juegos: 'Juega y pasa el rato.',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Muestra la lista de comandos por categoría'),

  async execute(interaction) {
    const slashPath = path.join(__dirname, '../../slash');
    const categories = fs.readdirSync(slashPath).filter(folder => {
      const folderPath = path.join(slashPath, folder);
      return fs.lstatSync(folderPath).isDirectory();
    });

    // 🧩 Formatear las categorías tipo tabla
    const formatted = categories
      .map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)) // Capitaliza
      .sort()
      .reduce((rows, cat, i) => {
        const col = i % 3;
        if (!rows[col]) rows[col] = [];
        rows[col].push(cat.padEnd(15));
        return rows;
      }, [[], [], []]);

    const finalTable = '```' + '\n' +
      formatted[0].map((_, i) =>
        (formatted[0][i] || '').padEnd(15) +
        (formatted[1][i] || '').padEnd(15) +
        (formatted[2][i] || '')
      ).join('\n') +
      '\n```';

    const embed = new EmbedBuilder()
      .setTitle('📖 Comandos de Izumi')
      .addFields(
        { name: '» Menú de ayuda', value: `Tengo **${categories.length}** categorías para explorar.` },
        { name: '» Categorías', value: finalTable },
        { name: '» Enlaces útiles', value: '[Soporte](https://discord.gg/xvzYYBG2yW)' }
      )
      .setFooter({ text: 'Selecciona una categoría del menú para comenzar.' })
      .setColor('#3fe0e2');

    const selectMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('help_select_category')
        .setPlaceholder('📂 Elige una categoría')
        .addOptions([
          {
            label: 'Categorías',
            description: 'Mira la lista de categorías',
            value: 'categorias',
            emoji: '📖',
            default: true
          },
          ...categories.map(cat => ({
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
            description: categoryDescriptions[cat] || 'Comandos de esta categoría',
            value: cat,
            emoji: categoryIcons[cat] || '📁',
          }))
        ])
    );

    await interaction.reply({
      embeds: [embed],
      components: [selectMenu],
      ephemeral: false
    });
  }
};
