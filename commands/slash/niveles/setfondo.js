const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { usage } = require('./nivel');

const bgPath = path.join(__dirname, '../../../data/backgrounds.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setfondo')
    .setDescription('Establece o elimina tu fondo personalizado de nivel')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('URL de imagen PNG/JPG o déjalo vacío para eliminar el fondo')
        .setRequired(false)
    ),
    usage: '/setfondo https://example.com/imagen.png',

  async execute(interaction) {
    const key = `${interaction.guild.id}-${interaction.user.id}`;
    const url = interaction.options.getString('url');

    let backgrounds = {};
    if (fs.existsSync(bgPath)) {
      backgrounds = JSON.parse(fs.readFileSync(bgPath, 'utf8'));
    }

    // Eliminar fondo si no se proporcionó URL
    if (!url || url.trim() === '') {
      delete backgrounds[key];
      fs.writeFileSync(bgPath, JSON.stringify(backgrounds, null, 2));
      return interaction.reply('✅ Tu fondo personalizado ha sido eliminado.');
    }

    // Validar URL
    if (!url.match(/\.(jpg|jpeg|png)$/i)) {
      return interaction.reply({
        content: '❌ La URL debe terminar en `.jpg`, `.jpeg` o `.png`.',
        ephemeral: true
      });
    }

    // Guardar fondo personalizado
    backgrounds[key] = url;
    fs.writeFileSync(bgPath, JSON.stringify(backgrounds, null, 2));

    await interaction.reply('✅ ¡Fondo personalizado actualizado correctamente!');
  }
};
