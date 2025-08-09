const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('limpiar')
    .setDescription('Borra mensajes recientes de un usuario específico')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario al que se le borrarán los mensajes')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('cantidad')
        .setDescription('Cantidad de mensajes a revisar (máximo 100)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const amount = interaction.options.getInteger('cantidad');

    const channel = interaction.channel;

    // Verificar permisos
    if (!interaction.member.permissions.has('ManageMessages')) {
      return interaction.reply({ content: '❌ No tienes permiso para gestionar mensajes.', ephemeral: true });
    }

    // Buscar mensajes
    const messages = await channel.messages.fetch({ limit: 100 });
    const filtered = messages.filter(m => m.author.id === user.id).first(amount);

    if (filtered.length === 0) {
      return interaction.reply({ content: 'No se encontraron mensajes recientes de ese usuario.', ephemeral: true });
    }

    // Eliminar
    await channel.bulkDelete(filtered, true);

    return interaction.reply({
      content: `✅ Se eliminaron ${filtered.length} mensajes de **${user.tag}**.`,
      ephemeral: false
    });
  }
};
