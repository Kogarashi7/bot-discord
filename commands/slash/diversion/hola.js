const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hola')
        .setDescription('Responde con un saludo')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario que deseas saludar')
                .setRequired(false)),
    async execute(interaction) {
        await interaction.reply('¡Hola! ' + (interaction.options.getUser('usuario').username + '!')); // Respuesta al comando
    },
};